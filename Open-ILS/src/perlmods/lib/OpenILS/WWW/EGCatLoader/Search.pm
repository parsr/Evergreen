package OpenILS::WWW::EGCatLoader;
use strict; use warnings;
use Apache2::Const -compile => qw(OK DECLINED FORBIDDEN HTTP_INTERNAL_SERVER_ERROR REDIRECT HTTP_BAD_REQUEST);
use OpenSRF::Utils::Logger qw/$logger/;
use OpenILS::Utils::CStoreEditor qw/:funcs/;
use OpenILS::Utils::Fieldmapper;
use OpenILS::Application::AppUtils;
use OpenSRF::Utils::JSON;
use Data::Dumper;
$Data::Dumper::Indent = 0;
my $U = 'OpenILS::Application::AppUtils';


sub _prepare_biblio_search_basics {
    my ($cgi) = @_;

    return $cgi->param('query') unless $cgi->param('qtype');

    my %parts;
    my @part_names = qw/qtype contains query bool/;
    $parts{$_} = [ $cgi->param($_) ] for (@part_names);

    my $full_query = '';
    for (my $i = 0; $i < scalar @{$parts{'qtype'}}; $i++) {
        my ($qtype, $contains, $query, $bool) = map { $parts{$_}->[$i] } @part_names;

        next unless $query =~ /\S/;

        # This stuff probably will need refined or rethought to better handle
        # the weird things Real Users will surely type in.
        $contains = "" unless defined $contains; # silence warning
        if ($contains eq 'nocontains') {
            $query =~ s/"//g;
            $query = ('"' . $query . '"') if index $query, ' ';
            $query = '-' . $query;
        } elsif ($contains eq 'phrase') {
            $query =~ s/"//g;
            $query = ('"' . $query . '"') if index $query, ' ';
        } elsif ($contains eq 'exact') {
            $query =~ s/[\^\$]//g;
            $query = '^' . $query . '$';
        }
        $query = "$qtype:$query" unless $qtype eq 'keyword' and $i == 0;

        $bool = ($bool and $bool eq 'or') ? '||' : '&&';
        $full_query = $full_query ? "($full_query $bool $query)" : $query;
    }

    return $full_query;
}

sub _prepare_biblio_search {
    my ($cgi, $ctx) = @_;

    my $query = _prepare_biblio_search_basics($cgi) || '';

    foreach ($cgi->param('modifier')) {
        # The unless bit is to avoid stacking modifiers.
        $query = ('#' . $_ . ' ' . $query) unless $query =~ qr/\#\Q$_/;
    }

    # filters
    foreach (grep /^fi:/, $cgi->param) {
        /:(-?\w+)$/ or next;
        my $term = join(",", $cgi->param($_));
        $query .= " $1($term)" if length $term;
    }

    # sort is treated specially, even though it's actually a filter
    if ($cgi->param('sort')) {
        $query =~ s/sort\([^\)]*\)//g;  # override existing sort(). no stacking.
        my ($axis, $desc) = split /\./, $cgi->param('sort');
        $query .= " sort($axis)";
        if ($desc and not $query =~ /\#descending/) {
            $query .= '#descending';
        } elsif (not $desc) {
            $query =~ s/\#descending//;
        }
    }

    if ($cgi->param('pubdate') && $cgi->param('date1')) {
        if ($cgi->param('pubdate') eq 'between') {
            $query .= ' between(' . $cgi->param('date1');
            $query .= ',' .  $cgi->param('date2') if $cgi->param('date2');
            $query .= ')';
        } elsif ($cgi->param('pubdate') eq 'is') {
            $query .= ' between(' . $cgi->param('date1') .
                ',' .  $cgi->param('date1') . ')';  # sic, date1 twice
        } else {
            $query .= ' ' . $cgi->param('pubdate') .
                '(' . $cgi->param('date1') . ')';
        }
    }

    my $site;
    my $org = $cgi->param('loc');
    if (defined($org) and $org ne '' and ($org ne $ctx->{aou_tree}->()->id) and not $query =~ /site\(\S+\)/) {
        $site = $ctx->{get_aou}->($org)->shortname;
        $query .= " site($site)";
    }

    if(!$site) {
        ($site) = ($query =~ /site\(([^\)]+)\)/);
        $site ||= $ctx->{aou_tree}->()->shortname;
    }


    my $depth;
    if (defined($cgi->param('depth')) and not $query =~ /depth\(\d+\)/) {
        $depth = defined $cgi->param('depth') ?
            $cgi->param('depth') : $ctx->{get_aou}->($site)->ou_type->depth;
        $query .= " depth($depth)";
    }

    return ($query, $site, $depth);
}

sub _get_search_limit {
    my $self = shift;

    # param takes precedence
    my $limit = $self->cgi->param('limit');
    return $limit if $limit;

    if($self->editor->requestor) {
        # See if the user has a hit count preference
        my $lset = $self->editor->search_actor_user_setting({
            usr => $self->editor->requestor->id, 
            name => 'opac.hits_per_page'
        })->[0];
        return OpenSRF::Utils::JSON->JSON2perl($lset->value) if $lset;
    }

    return 10; # default
}

# context additions: 
#   page_size
#   hit_count
#   records : list of bre's and copy-count objects
sub load_rresults {
    my $self = shift;
    my $cgi = $self->cgi;
    my $ctx = $self->ctx;
    my $e = $self->editor;

    $ctx->{page} = 'rresult';

    # Special alternative searches here.  This could all stand to be cleaner.
    if ($cgi->param("_special")) {
        return $self->marc_expert_search if scalar($cgi->param("tag"));
        return $self->item_barcode_shortcut if (
            $cgi->param("qtype") and ($cgi->param("qtype") eq "item_barcode")
        );
        return $self->call_number_browse_standalone if (
            $cgi->param("qtype") and ($cgi->param("qtype") eq "cnbrowse")
        );
    }

    my $page = $cgi->param('page') || 0;
    my $facet = $cgi->param('facet');
    my $limit = $self->_get_search_limit;
    my $loc = $cgi->param('loc') || $ctx->{aou_tree}->()->id;
    my $offset = $page * $limit;
    my $metarecord = $cgi->param('metarecord');
    my $results; 

    my ($query, $site, $depth) = _prepare_biblio_search($cgi, $ctx);

    if ($metarecord) {

        # TODO: other limits, like SVF/format, etc.
        $results = $U->simplereq(
            'open-ils.search', 
            'open-ils.search.biblio.metarecord_to_records',
            $metarecord, {org => $loc, depth => $depth}
        );

        # force the metarecord result blob to match the format of regular search results
        $results->{ids} = [map { [$_] } @{$results->{ids}}]; 

    } else {

        return $self->generic_redirect unless $query;

        # Limit and offset will stay here. Everything else should be part of
        # the query string, not special args.
        my $args = {'limit' => $limit, 'offset' => $offset};

        # Stuff these into the TT context so that templates can use them in redrawing forms
        $ctx->{processed_search_query} = $query;

        $query = "$query $facet" if $facet; # TODO

        $logger->activity("EGWeb: [search] $query");

        try {

            my $method = 'open-ils.search.biblio.multiclass.query';
            $method .= '.staff' if $ctx->{is_staff};
            $results = $U->simplereq('open-ils.search', $method, $args, $query, 1);

        } catch Error with {
            my $err = shift;
            $logger->error("multiclass search error: $err");
            $results = {count => 0, ids => []};
        };
    }

    my $rec_ids = [map { $_->[0] } @{$results->{ids}}];

    $ctx->{records} = [];
    $ctx->{search_facets} = {};
    $ctx->{page_size} = $limit;
    $ctx->{hit_count} = $results->{count};
    $ctx->{parsed_query} = $results->{parsed_query};

    return Apache2::Const::OK if @$rec_ids == 0;

    my ($facets, @data) = $self->get_records_and_facets(
        $rec_ids, $results->{facet_key}, 
        {
            flesh => '{holdings_xml,mra,acp}',
            site => $site,
            depth => $depth
        }
    );

    # shove recs into context in search results order
    for my $rec_id (@$rec_ids) {
        push(
            @{$ctx->{records}},
            grep { $_->{id} == $rec_id } @data
        );
    }

    $ctx->{search_facets} = $facets;

    return Apache2::Const::OK;
}

# Searching by barcode is a special search that does /not/ respect any other
# of the usual search parameters, not even the ones for sorting and paging!
sub item_barcode_shortcut {
    my ($self) = @_;

    my $method = "open-ils.search.multi_home.bib_ids.by_barcode";
    if (my $search = create OpenSRF::AppSession("open-ils.search")) {
        my $rec_ids = $search->request(
            $method, $self->cgi->param("query")
        )->gather(1);
        $search->kill_me;

        if (ref $rec_ids ne 'ARRAY') {

            if($U->event_equals($rec_ids, 'ASSET_COPY_NOT_FOUND')) {
                $rec_ids = [];

            } else {
                if (defined $U->event_code($rec_ids)) {
                    $self->apache->log->warn(
                        "$method returned event: " . $U->event_code($rec_ids)
                    );
                } else {
                    $self->apache->log->warn(
                        "$method returned something unexpected: $rec_ids"
                    );
                }
                return Apache2::Const::HTTP_INTERNAL_SERVER_ERROR;
            }
        }

        my ($facets, @data) = $self->get_records_and_facets(
            $rec_ids, undef, {flesh => "{holdings_xml,mra}"}
        );

        $self->ctx->{records} = [@data];
        $self->ctx->{search_facets} = {};
        $self->ctx->{hit_count} = scalar @data;
        $self->ctx->{page_size} = $self->ctx->{hit_count};

        return Apache2::Const::OK;
    } {
        $self->apache->log->warn("couldn't connect to open-ils.search");
        return Apache2::Const::HTTP_INTERNAL_SERVER_ERROR;
    }
}

# like item_barcode_search, this can't take all the usual search params, but
# this one will at least do site, limit and page
sub marc_expert_search {
    my ($self) = @_;

    my @tags = $self->cgi->param("tag");
    my @subfields = $self->cgi->param("subfield");
    my @terms = $self->cgi->param("term");

    my $query = [];
    for (my $i = 0; $i < scalar @tags; $i++) {
        next if ($tags[$i] eq "" || $terms[$i] eq "");
        $subfields[$i] = '_' unless $subfields[$i];
        push @$query, {
            "term" => $terms[$i],
            "restrict" => [{"tag" => $tags[$i], "subfield" => $subfields[$i]}]
        };
    }

    $logger->info("query for expert search: " . Dumper($query));

    # loc, limit and offset
    my $page = $self->cgi->param("page") || 0;
    my $limit = $self->_get_search_limit;
    my $org_unit = $self->cgi->param("loc") || $self->ctx->{aou_tree}->()->id;
    my $offset = $page * $limit;

    $self->ctx->{records} = [];
    $self->ctx->{search_facets} = {};
    $self->ctx->{page_size} = $limit;
    $self->ctx->{hit_count} = 0;
        
    # nothing to do
    return Apache2::Const::OK if @$query == 0;

    my $results = $U->simplereq(
        'open-ils.search', 
        'open-ils.search.biblio.marc',
        {searches => $query, org_unit => $org_unit}, $limit, $offset);

    if (defined $U->event_code($results)) {
        $self->apache->log->warn(
            "open-ils.search.biblio.marc returned event: " .
            $U->event_code($results)
        );
        return Apache2::Const::HTTP_INTERNAL_SERVER_ERROR;
    }

    my ($facets, @data) = $self->get_records_and_facets(
        # filter out nulls that will turn up here
        [ grep { $_ } @{$results->{ids}} ],
        undef, {flesh => "{holdings_xml,mra}"}
    );

    $self->ctx->{records} = [@data];
    $self->ctx->{page_size} = $limit;
    $self->ctx->{hit_count} = $results->{count};

    return Apache2::Const::OK;
}

sub call_number_browse_standalone {
    my ($self) = @_;

    if (my $cnfrag = $self->cgi->param("query")) {
        my $url = sprintf(
            'http%s://%s%s/cnbrowse?cn=%s',
            $self->cgi->https ? "s" : "",
            $self->apache->hostname,
            $self->ctx->{opac_root},
            $cnfrag # XXX some kind of escaping needed here?
        );
        return $self->generic_redirect($url);
    } else {
        return $self->generic_redirect; # return to search page
    }
}

sub load_cnbrowse {
    my ($self) = @_;

    $self->prepare_browse_call_numbers();

    return Apache2::Const::OK;
}

1;