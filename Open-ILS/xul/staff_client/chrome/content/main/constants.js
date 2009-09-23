dump('Loading constants.js\n');

/* Get locale from preferences */
var LOCALE = '';
try {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	LOCALE = pref.getCharPref('general.useragent.locale');
} catch (E) {
	dump("Failed to fetch a locale from preferences: " + E + "\n");
}

/* Fall back to en-US if we didn't get a locale from the preferences */
if (!LOCALE) {
	LOCALE = 'en-US';
}

const MODE_RDONLY   = 0x01;
const MODE_WRONLY   = 0x02;
const MODE_CREATE   = 0x08;
const MODE_APPEND   = 0x10;
const MODE_TRUNCATE = 0x20;
const MODE_SYNC     = 0x40;
const MODE_EXCL     = 0x80;
const PERMS_FILE      = 0644;
const PERMS_DIR      = 0755;

const my_constants = {
	'magical_statuses' : {
		'1' : { 'disable_in_copy_editor' : true, 'block_mark_item_damaged' : false, 'block_mark_item_action' : true }, /* | Checked out    | t */
		'3' : { 'disable_in_copy_editor' : true, 'block_mark_item_damaged' : false, 'block_mark_item_action' : true }, /* | Lost           | f */
		'6' : { 'disable_in_copy_editor' : true, 'block_mark_item_damaged' : false, 'block_mark_item_action' : true }, /* | In transit     | t */
		'8' : { 'disable_in_copy_editor' : true, 'block_mark_item_damaged' : false, 'block_mark_item_action' : false } /* | On holds shelf | t */
	}
}

const api = {
    'PCRUD_XACT_BEGIN' : { 'app' : 'open-ils.pcrud', 'method' : 'open-ils.pcrud.transaction.begin' },
    'PCRUD_XACT_COMMIT' : { 'app' : 'open-ils.pcrud', 'method' : 'open-ils.pcrud.transaction.commit' },
    'PCRUD_XACT_ROLLBACK' : { 'app' : 'open-ils.pcrud', 'method' : 'open-ils.pcrud.transaction.rollback' },
	'TEST_SECURE' : { 'app' : 'open-ils.actor', 'method' : 'opensrf.system.time' },
	'TEST_UNSECURE' : { 'app' : 'open-ils.actor', 'method' : 'opensrf.system.time', 'secure' : false },
	'AUTH_INIT' : { 'app' : 'open-ils.auth', 'method' : 'open-ils.auth.authenticate.init' },
	'AUTH_COMPLETE' : { 'app' : 'open-ils.auth', 'method' : 'open-ils.auth.authenticate.complete' },
	'AUTH_DELETE' : { 'app' : 'open-ils.auth', 'method' : 'open-ils.auth.session.delete' },
	'AUTH_WORKSTATION' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.workstation.register' },
	'AUTH_VERIFY_CREDENTIALS' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.verify_user_password' },
	'BILL_PAY' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.money.payment' },
	'BLOB_AU_PARTS_RETRIEVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.retrieve.parts', 'cacheable' : true, 'ttl' : 120000 },
	'BLOB_MARC_CALLNUMBERS_RETRIEVE' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.biblio.record.marc_cn.retrieve', 'secure' : false },
	'BLOB_MOBTS_CIRC_MVR_HAVING_BALANCE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.have_balance.fleshed' },
	'BLOB_MOBTS_CIRC_MVR_OPEN' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.fleshed' },
	'BUCKET_CREATE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.container.create' },
	'BUCKET_FLESH' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.container.flesh' },
	'BUCKET_DELETE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.container.full_delete' },
	'BUCKET_RETRIEVE_VIA_USER' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.container.all.retrieve_by_user' },
	'BUCKET_ITEM_CREATE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.container.item.create' },
	'BUCKET_ITEM_DELETE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.container.item.delete' },
	'CAPTURE_COPY_FOR_HOLD_VIA_BARCODE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.hold.capture_copy.barcode' },
	'CHECKIN_VIA_BARCODE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.checkin' },
	'CHECKOUT' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.checkout' },
	'CHECKOUT_FULL' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.checkout.full' },
	'CHECKOUT_PERMIT' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.checkout.permit' },
	'CHECKOUT_RENEW' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.renew' },
	'CIRC_MODIFIER_LIST' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.circ_modifier.retrieve.all' },
	'FM_ACN_RETRIEVE' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.callnumber.retrieve', 'secure' : false },
	'FM_ACN_RETRIEVE.authoritative' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.callnumber.retrieve.authoritative', 'secure' : false },
	'FM_ACN_TREE_UPDATE' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.asset.volume.fleshed.batch.update' },
	'FM_ACN_TREE_LIST_RETRIEVE_VIA_RECORD_ID_AND_ORG_IDS' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.asset.copy_tree.retrieve', 'secure' : false },
	'FM_ACN_TREE_LIST_RETRIEVE_VIA_RECORD_ID_AND_ORG_IDS.authoritative' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.asset.copy_tree.retrieve.authoritative', 'secure' : false },
	'FM_ACN_TRANSFER' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.asset.volume.batch.transfer' },
	'FM_ACN_FIND_OR_CREATE' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.call_number.find_or_create', 'secure' : false },
	'FM_ACP_DETAILS' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.copy_details.retrieve' },
	'FM_ACP_DETAILS_VIA_BARCODE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.copy_details.retrieve.barcode' },
	'FM_ACP_DETAILS_VIA_BARCODE.authoritative' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.copy_details.retrieve.barcode.authoritative' },
	//'FM_ACP_RETRIEVE' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.asset.copy.fleshed.retrieve' },
	'FM_ACP_RETRIEVE' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.asset.copy.fleshed2.retrieve', 'secure' : false },
	//'FM_ACP_RETRIEVE_VIA_BARCODE' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.asset.copy.find_by_barcode' },
	'FM_ACP_RETRIEVE_VIA_BARCODE' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.asset.copy.fleshed2.find_by_barcode', 'secure' : false },
	'FM_ACP_RETRIEVE_VIA_BARCODE.authoritative' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.asset.copy.fleshed2.find_by_barcode.authoritative', 'secure' : false },
	'FM_ACP_FLESHED_BATCH_RETRIEVE' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.asset.copy.fleshed.batch.retrieve', 'secure' : false },
	'FM_ACP_FLESHED_BATCH_RETRIEVE.authoritative' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.asset.copy.fleshed.batch.retrieve.authoritative', 'secure' : false },
	'FM_ACP_FLESHED_BATCH_UPDATE' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.asset.copy.fleshed.batch.update' },
	'FM_ACP_COUNT' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.biblio.record.copy_count.staff', 'secure' : false },
	'FM_ACP_COUNT.authoritative' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.biblio.record.copy_count.staff.authoritative', 'secure' : false },
	'FM_ACPL_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.copy_location.retrieve.all', 'secure' : false },
	'FM_ACPL_RETRIEVE_VIA_ID' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.copy_location.retrieve', 'secure' : false },
	'FM_ACPL_RETRIEVE_VIA_ID.authoritative' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.copy_location.retrieve.authoritative', 'secure' : false },
	'FM_ACPN_RETRIEVE_ALL' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.copy_note.retrieve.all', 'secure' : false },
	'FM_ACPN_CREATE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.copy_note.create' },
	'FM_ACPN_DELETE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.copy_note.delete', 'secure' : false },
	'FM_ACTSC_RETRIEVE_BATCH' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.stat_cat.actor.retrieve.batch', 'secure' : false },
	'FM_ACTSC_RETRIEVE_VIA_AOU' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.stat_cat.actor.retrieve.all', 'secure' : false },
	'FM_AHN_CREATE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.hold_notification.create' },
	'FM_AHN_RETRIEVE_VIA_AHR' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.hold_notification.retrieve_by_hold' },
	'FM_AHR_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.holds.retrieve_by_id' },
	'FM_AHR_BLOB_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.hold.details.retrieve' },
	'FM_AHR_BLOB_RETRIEVE.authoritative' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.hold.details.retrieve.authoritative' },
	'FM_AHR_RETRIEVE_VIA_AU' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.holds.retrieve' },
	'FM_AHR_ID_LIST_RETRIEVE_VIA_AU' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.holds.id_list.retrieve' },
	'FM_AHR_ID_LIST_RETRIEVE_VIA_AU.authoritative' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.holds.id_list.retrieve.authoritative' },
	'FM_AHR_RETRIEVE_VIA_BRE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.open_holds.retrieve' },
	'FM_AHR_RETRIEVE_ALL_VIA_BRE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.holds.retrieve_all_from_title' },
	'FM_AHR_RETRIEVE_VIA_PICKUP_AOU' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.holds.retrieve_by_pickup_lib' },
	'FM_AHR_ID_LIST_RETRIEVE_VIA_PICKUP_AOU' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.holds.id_list.retrieve_by_pickup_lib' },
	'FM_AHR_PULL_LIST' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.hold_pull_list.retrieve' },
	'FM_AHR_ID_LIST_PULL_LIST' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.hold_pull_list.id_list.retrieve', 'secure' : false },
	'FM_AHR_ONSHELF_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.captured_holds.on_shelf.retrieve' },
	'FM_AHR_ID_LIST_ONSHELF_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.captured_holds.id_list.on_shelf.retrieve', 'secure' : false },
	'FM_AHR_COUNT_RETRIEVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.hold_requests.count', 'cacheable' : true, 'ttl' : 60000  },
	'FM_AHR_COUNT_RETRIEVE.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.hold_requests.count.authoritative', 'cacheable' : true, 'ttl' : 60000  },
	'FM_AHR_CANCEL' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.hold.cancel' },
	'FM_AHR_UNCANCEL' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.hold.uncancel' },
	'FM_AHR_UPDATE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.hold.update' },
	'FM_AHR_RESET' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.hold.reset' },
	'FM_AHR_STATUS' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.hold.status.retrieve' },
    'FM_AHRCC_PCRUD_SEARCH' : { 'app' : 'open-ils.pcrud', 'method' : 'open-ils.pcrud.search.ahrcc.atomic', 'secure' : false },
	'FM_AIHU_CREATE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.in_house_use.create' },
	'FM_ANCC_RETRIEVE_VIA_ID' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.non_cataloged_circulation.retrieve' },
	'FM_ANCC_RETRIEVE_VIA_USER' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.open_non_cataloged_circulation.user' },
	'FM_ANCC_RETRIEVE_VIA_USER.authoritative' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.open_non_cataloged_circulation.user.authoritative' },
	'FM_ANCIHU_CREATE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.non_cat_in_house_use.create' },
	'FM_AOA_RETRIEVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.org_unit.address.retrieve', 'secure' : false },
	'FM_AOU_RETRIEVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.org_tree.retrieve', 'secure' : false },
	'FM_AOU_DESCENDANTS_RETRIEVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.org_tree.descendants.retrieve', 'secure' : false },
	'FM_AOU_RETRIEVE_RELATED_VIA_SESSION' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.org_unit.full_path.retrieve' },
	'FM_AOU_IDS_RETRIEVE_VIA_RECORD_ID' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.actor.org_unit.retrieve_by_title', 'secure' : false },
	'FM_AOU_IDS_RETRIEVE_VIA_RECORD_ID.authoritative' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.actor.org_unit.retrieve_by_title.authoritative', 'secure' : false },
    'FM_AOUS_RETRIEVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.org_unit_setting.values.ranged.retrieve' },
	'FM_AOUT_RETRIEVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.org_types.retrieve', 'secure' : false },
	'FM_ASC_BATCH_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.stat_cat.asset.retrieve.batch', 'secure' : false },
	'FM_ASC_RETRIEVE_VIA_AOU' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.stat_cat.asset.retrieve.all', 'secure' : false },
	'FM_ASV_CREATE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.survey.create' },
	'FM_ASV_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.survey.retrieve.all', 'secure' : false },
	'FM_ASV_RETRIEVE_REQUIRED' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.survey.retrieve.required' },
	'FM_ASVR_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.survey.response.retrieve' },
	'FM_ATC_VOID' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.transit.abort' },
	'FM_ATC_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.transit.retrieve', 'secure' : false },
	'FM_ATC_RETRIEVE_VIA_AOU' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.transit.retrieve_by_lib', 'secure' : false },
    'FM_AU_ID_RETRIEVE_VIA_BARCODE_OR_USERNAME' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.retrieve_id_by_barcode_or_username' },
	'FM_AU_IDS_RETRIEVE_VIA_HASH' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.patron.search.advanced' },
	'FM_AU_LIST_RETRIEVE_VIA_GROUP' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.usergroup.members.retrieve' },
	'FM_AU_LIST_RETRIEVE_VIA_GROUP.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.usergroup.members.retrieve.authoritative' },
	'FM_AU_RETRIEVE_VIA_SESSION' : { 'app' : 'open-ils.auth', 'method' : 'open-ils.auth.session.retrieve' },
	'FM_AU_RETRIEVE_VIA_BARCODE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.fleshed.retrieve_by_barcode', 'cacheable' : true, 'ttl' : 60000 },
	'FM_AU_RETRIEVE_VIA_BARCODE.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.fleshed.retrieve_by_barcode.authoritative', 'cacheable' : true, 'ttl' : 60000 },
	'FM_AU_RETRIEVE_VIA_ID' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.retrieve', 'cacheable' : true, 'ttl' : 60000 },
	'FM_AU_RETRIEVE_VIA_ID.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.retrieve.authoritative', 'cacheable' : true, 'ttl' : 60000 },
	'FM_AU_FLESHED_RETRIEVE_VIA_ID' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.fleshed.retrieve', 'cacheable' : true, 'ttl' : 60000 },
	'FM_AU_FLESHED_RETRIEVE_VIA_ID.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.fleshed.retrieve.authoritative', 'cacheable' : true, 'ttl' : 60000 },
    'FM_AU_MERGE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.merge' },
	'FM_AU_NEW_USERGROUP' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.usergroup.new' },
	'FM_AU_UPDATE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.patron.update' },
	'FM_AU_DELETE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.delete' },
	'FM_AUN_RETRIEVE_ALL' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.note.retrieve.all', 'cacheable' : false, 'ttl' : 60000 },
	'FM_AUN_RETRIEVE_ALL.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.note.retrieve.all.authoritative', 'cacheable' : false, 'ttl' : 60000 },
	'FM_AUN_CREATE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.note.create' },
	'FM_AUN_DELETE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.note.delete' },
	'FM_AUS_RETRIEVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.patron.settings.retrieve' },
	'FM_AUS_UPDATE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.patron.settings.update' },
	'FM_AUSP_APPLY' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.penalty.apply' },
	'FM_AUSP_REMOVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.penalty.remove' },
    'FM_AUSP_PCRUD_UPDATE' : { 'app' : 'open-ils.pcrud', 'method' : 'open-ils.pcrud.update.ausp', 'secure' : false },
	'FM_AUSP_UPDATE_NOTE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.penalty.note.update' },
	'FM_BRE_RETRIEVE_VIA_ID' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.biblio.record.metadata.retrieve', 'secure' : false },
	'FM_BRE_RETRIEVE_VIA_ID.authoritative' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.biblio.record.metadata.retrieve.authoritative', 'secure' : false },
	'FM_BRE_ID_SEARCH_VIA_BARCODE' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.biblio.find_by_barcode', 'secure' : false },
    'FM_BRE_ID_SEARCH_VIA_MULTICLASS_QUERY' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.biblio.multiclass.query.staff' },
	'FM_BRE_ID_SEARCH_VIA_TCN' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.biblio.tcn', 'secure' : false },
	'FM_BRE_DELETE' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.biblio.record_entry.delete', 'secure' : false },
	'FM_BRE_UNDELETE' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.biblio.record_entry.undelete', 'secure' : false },
	'FM_BRN_FROM_MARCXML' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.z3950.marcxml_to_brn', 'secure' : false },
	'FM_CBT_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.billing_type.ranged.retrieve.all', 'secure' : false },
	'FM_CCS_RETRIEVE' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.config.copy_status.retrieve.all', 'secure' : false },
	'FM_CIRC_DETAILS' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.fleshed.retrieve' },
	'FM_CIRC_DETAILS.authoritative' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.fleshed.retrieve.authoritative' },
	'FM_CIRC_RETRIEVE_VIA_ID' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.retrieve' },
	/*'FM_CIRC_RETRIEVE_VIA_USER' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.actor.user.checked_out.slim' },*/
	'FM_CIRC_IN_WITH_FINES_VIA_USER' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.checked_in_with_fines' },
	'FM_CIRC_IN_WITH_FINES_VIA_USER.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.checked_in_with_fines.authoritative' },
	'FM_CIRC_RETRIEVE_VIA_USER' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.checked_out' },
	'FM_CIRC_RETRIEVE_VIA_USER.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.checked_out.authoritative' },
	'FM_CIRC_RETRIEVE_VIA_COPY' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.copy_checkout_history.retrieve' },
	/*'FM_CIRC_COUNT_RETRIEVE_VIA_USER' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.checked_out.count' },*/
	'FM_CIRC_COUNT_RETRIEVE_VIA_USER' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.checked_out.count', 'cacheable' : true, 'ttl' : 60000 },
	'FM_CIRC_COUNT_RETRIEVE_VIA_USER.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.checked_out.count.authoritative', 'cacheable' : true, 'ttl' : 60000 },
	'FM_CIRC_COUNT_RETRIEVE_VIA_COPY' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.circulation.count' },
	'FM_CIRC_EDIT_DUE_DATE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.circulation.due_date.update' },
	'FM_CIT_RETRIEVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.ident_types.retrieve', 'secure' : false },
	'FM_CITM_RETRIEVE' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.biblio.item_type_map.retrieve.all', 'secure' : false },
	'FM_CNAL_RETRIEVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.net_access_level.retrieve.all', 'secure' : false },
	'FM_CNCT_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.non_cat_types.retrieve.all', 'secure' : false },
	'FM_CRAHP_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.config.rules.age_hold_protect.retrieve.all', 'secure' : false },
    'FM_CSP_PCRUD_SEARCH' : { 'app' : 'open-ils.pcrud', 'method' : 'open-ils.pcrud.search.csp.atomic', 'secure' : false },
	'FM_CST_RETRIEVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.standings.retrieve', 'secure' : false },
	'FM_MB_CREATE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.money.billing.create' },
	'FM_MB_RETRIEVE_VIA_MBTS_ID' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.money.billing.retrieve.all' },
	'FM_MB_RETRIEVE_VIA_MBTS_ID.authoritative' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.money.billing.retrieve.all.authoritative' },
	'FM_MB_VOID' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.money.billing.void' },
	'FM_MBTS_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.money.billable_xact_summary.retrieve' },
	'FM_MBTS_RETRIEVE.authoritative' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.money.billable_xact_summary.retrieve.authoritative' },
	'FM_MBTS_IDS_RETRIEVE_ALL' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.history' },
	'FM_MBTS_IDS_RETRIEVE_ALL_HAVING_CHARGE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.history.have_charge' },
	'FM_MBTS_IDS_RETRIEVE_ALL_HAVING_BALANCE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.history.have_balance' },
	'FM_MBTS_IDS_RETRIEVE_ALL_HAVING_BALANCE.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.history.have_balance.authoritative' },
	'FM_MBTS_IDS_RETRIEVE_ALL_STILL_OPEN' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.history.still_open' },
	'FM_MBTS_IDS_RETRIEVE_ALL_HAVING_BILL' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.history.have_bill' },
	'FM_MBTS_IDS_RETRIEVE_ALL_HAVING_BILL.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.history.have_bill.authoritative' },
	'FM_MBTS_IDS_RETRIEVE_FOR_HISTORY' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.history.have_bill' },
	'FM_MBTS_IDS_RETRIEVE_FOR_HISTORY.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.history.have_bill.authoritative' },
	'FM_MP_RETRIEVE_VIA_MBTS_ID' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.money.payment.retrieve.all' },
	'FM_MP_RETRIEVE_VIA_MBTS_ID.authoritative' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.money.payment.retrieve.all.authoritative' },
	'FM_MG_CREATE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.money.grocery.create' },
	'FM_MG_RETRIEVE' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.money.grocery.retrieve' },
	'FM_MOBTS_HAVING_BALANCE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.have_balance' },
	'FM_MOBTS_HAVING_BALANCE.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.have_balance.authoritative' },
	'FM_MOBTS_TOTAL_HAVING_BALANCE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.have_balance.total' },
	'FM_MOBTS_COUNT_HAVING_BALANCE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.have_balance.count' },
	'FM_MOBTS_OPEN' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions' },
	'FM_MOBTS_TOTAL_OPEN' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.total' },
	'FM_MOBTS_COUNT_OPEN' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.transactions.count' },
	'FM_MOUS_RETRIEVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.fines.summary', 'cacheable' : true, 'ttl' : 60000 },
	'FM_MOUS_RETRIEVE.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.fines.summary.authoritative', 'cacheable' : true, 'ttl' : 60000 },
	'FM_PGT_RETRIEVE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.groups.tree.retrieve', 'secure' : false },
	'MARC_HTML_RETRIEVE' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.biblio.record.html', 'secure' : false },
	'FM_BLOB_RETRIEVE_VIA_Z3950_SEARCH' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.z3950.search_class' },
	'FM_BLOB_RETRIEVE_VIA_Z3950_RAW_SEARCH' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.z3950.search_service' },
	'RETRIEVE_Z3950_SERVICES' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.z3950.retrieve_services', 'secure' : false },
	'MARK_ITEM_DAMAGED' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.mark_item_damaged' },
	'MARK_ITEM_MISSING' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.mark_item_missing' },
	'MARK_ITEM_LOST' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.circulation.set_lost' },
	'MARK_ITEM_CLAIM_RETURNED' : { 'app' : 'open-ils.circ', 'method' : 'open-ils.circ.circulation.set_claims_returned' },
	'MODS_SLIM_METARECORD_RETRIEVE' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.biblio.metarecord.mods_slim.retrieve', 'secure' : false },
	'MODS_SLIM_RECORD_RETRIEVE' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.biblio.record.mods_slim.retrieve', 'secure' : false },
	'MODS_SLIM_RECORD_RETRIEVE.authoritative' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.biblio.record.mods_slim.retrieve.authoritative', 'secure' : false },
	'MODS_SLIM_RECORD_RETRIEVE_VIA_COPY' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.biblio.mods_from_copy', 'secure' : false },
	'MODS_SLIM_RECORD_RETRIEVE_VIA_COPY.authoritative' : { 'app' : 'open-ils.search', 'method' : 'open-ils.search.biblio.mods_from_copy', 'secure' : false },
	'PERM_CHECK' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.perm.check' },
	'PERM_MULTI_ORG_CHECK' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.perm.check.multi_org' },
	'PERM_RETRIEVE_HIGHEST_ORG' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.perm.highest_org' },
	'PERM_RETRIEVE_WORK_OU' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.has_work_perm_at' },
	'BATCH_PERM_RETRIEVE_WORK_OU' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.has_work_perm_at.batch' },
	'MARC_XML_RECORD_CREATE' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.biblio.record.xml.create' },
	'MARC_XML_RECORD_IMPORT' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.biblio.record.xml.import' },
	'MARC_XML_RECORD_REPLACE' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.biblio.record.marc.replace' },
	'MARC_XML_RECORD_UPDATE' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.biblio.record.xml.update' },
	'MARC_XML_TEMPLATE_RETRIEVE' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.biblio.marc_template.retrieve', 'secure' : false },
	'MARC_XML_TEMPLATE_LIST' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.marc_template.types.retrieve', 'secure' : false },
	'MERGE_RECORDS' : { 'app' : 'open-ils.cat', 'method' : 'open-ils.cat.biblio.records.merge' },
	'PATRON_BARCODE_EXISTS' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.barcode.exists' },
	'PATRON_BARCODE_EXISTS.authoritative' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.barcode.exists.authoritative' },
	'RECALCULATE_STANDING_PENALTIES' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.penalties.update' },
    'USER_ORG_UNIT_OPT_IN_FEATURE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.org_unit_opt_in.enabled' },
    'USER_ORG_UNIT_OPT_IN_CHECK' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.org_unit_opt_in.check' },
    'USER_ORG_UNIT_OPT_IN_CREATE' : { 'app' : 'open-ils.actor', 'method' : 'open-ils.actor.user.org_unit_opt_in.create' }
}

const urls = {

	'opac' : '/opac/' + LOCALE + '/skin/default/xml/advanced.xml?nps=1',
	'opac_rdetail' : '/opac/' + LOCALE + '/skin/default/xml/rdetail.xml',
	'opac_rresult' : '/opac/' + LOCALE + '/skin/default/xml/rresult.xml',
	'org_tree' : '/opac/common/js/' + LOCALE + '/OrgTree.js',
	'browser' : '/opac/' + LOCALE + '/skin/default/xml/advanced.xml?nps=1',
	'fieldmapper' : '/opac/common/js/fmall.js',
	'isodate_lib_remote' : '/opac/common/js/DP_DateExtensions.js',
	'isodate_lib_local' : 'chrome://open_ils_staff_client/content/OpenILS/util/DP_DateExtensions.js',
	'xsl_marc2html' : '/opac/extras/xsl/oilsMARC21slim2HTML.xsl',

	'AUDIO_GOOD_SOUND' : '/xul/server/skin/media/audio/bonus.wav',
	'AUDIO_BAD_SOUND' : '/xul/server/skin/media/audio/question.wav',
	'AUDIO_HORRIBLE_SOUND' : '/xul/server/skin/media/audio/redalert.wav',
	'AUDIO_CIRC_GOOD_SOUND' : '/xul/server/skin/media/audio/toggled.wav',
	'AUDIO_CIRC_BAD_SOUND' : '/xul/server/skin/media/audio/question.wav',

	'XUL_AUTH_SIMPLE' : '/xul/server/main/simple_auth.xul',
	'XUL_BIB_BRIEF' : '/xul/server/cat/bib_brief.xul',
	'XUL_BROWSER' : 'chrome://open_ils_staff_client/content/util/browser.xul',
	'XUL_CHECKIN' : '/xul/server/circ/checkin.xul',
	'XUL_RENEW' : '/xul/server/circ/renew.xul',
	'XUL_CHECKOUT' : '/xul/server/circ/checkout.xul',
	'XUL_CIRC_BRIEF' : '/xul/server/circ/circ_brief.xul',
	'XUL_CIRC_SUMMARY' : '/xul/server/circ/circ_summary.xul',
	'XUL_COPY_BUCKETS_QUICK' : '/xul/server/cat/copy_buckets_quick.xul',
	'XUL_COPY_BUCKETS' : '/xul/server/cat/copy_buckets.xul',
	'XUL_COPY_DETAILS' : '/xul/server/circ/copy_details.xul',
	'XUL_COPY_EDITOR' : '/xul/server/cat/copy_editor.xul',
	'XUL_COPY_LOCATION_EDIT' : '/xul/server/admin/copy_locations.xhtml',
	'XUL_COPY_NOTES' : '/xul/server/cat/copy_notes.xul',
	'XUL_COPY_STATUS' : '/xul/server/circ/copy_status.xul',
	'XUL_COPY_SUMMARY' : '/xul/server/cat/copy_summary.xul',
	'XUL_COPY_VOLUME_BROWSE' : '/xul/server/cat/copy_browser.xul',
	'XUL_DEBUG_CONSOLE' : 'chrome://global/content/console.xul',
	'XUL_DEBUG_FIELDMAPPER' : '/xul/server/util/fm_view.xul',
	'XUL_DEBUG_FILTER_CONSOLE' : '/xul/server/util/filter_console.xul',
	'XUL_DEBUG_SHELL' : '/xul/server/util/shell.html',
	'XUL_DEBUG_XULEDITOR' : '/xul/server/util/xuledit.xul',
	'XUL_FANCY_PROMPT' : '/xul/server/util/fancy_prompt.xul',
	'XUL_HOLD_CAPTURE' : '/xul/server/circ/hold_capture.xul',
	'XUL_HOLD_PULL_LIST' : '/xul/server/admin/hold_pull_list.xhtml',
	'XUL_HOLDS_BROWSER' : '/xul/server/patron/holds.xul',
	'XUL_HOLD_DETAILS' : '/xul/server/patron/hold_details.xul',
	'XUL_HOLD_CANCEL' : '/xul/server/patron/hold_cancel.xul',
	'XUL_IN_HOUSE_USE' : '/xul/server/circ/in_house_use.xul',
	'XUL_LIST_CLIPBOARD' : '/xul/server/util/list_clipboard.xul',
	'XUL_LOCAL_ADMIN' : '/xul/server/admin/index.xhtml',
	'XUL_MARC_NEW' : '/xul/server/cat/marc_new.xul',
	'XUL_MARC_EDIT' : '/xul/server/cat/marcedit.xul',
	'XUL_MARC_VIEW' : '/xul/server/cat/marc_view.xul',
	'XUL_MENU_FRAME' : 'chrome://open_ils_staff_client/content/main/menu_frame.xul',
	'XUL_NON_CAT_LABEL_EDIT' : '/xul/server/admin/non_cat_types.xhtml',
	'XUL_OFFLINE_UPLOAD_XACTS' : '/xul/server/admin/upload_xacts.xhtml',
	'XUL_OFFLINE_MANAGE_XACTS' : '/xul/server/admin/offline_manage_xacts.xul',
	'XUL_OFFLINE_MANAGE_XACTS_CGI' : '/cgi-bin/offline/offline.pl',
	'XUL_OFFLINE_GENERATE_WIDGETS' : '/xul/server/main/gen_offline_widgets.xul',
	'XUL_REMOTE_OPAC_WRAPPER' : '/xul/server/cat/opac.xul',
	'XUL_OPAC_WRAPPER' : 'chrome://open_ils_staff_client/content/cat/opac.xul',
	'XUL_PATRON_BARCODE_ENTRY' : '/xul/server/patron/barcode_entry.xul',
	'XUL_PATRON_BILLS' : '/xul/server/patron/bills.xul',
	'XUL_PATRON_BILL_CC_INFO' : '/xul/server/patron/bill_cc_info.xul',
	'XUL_PATRON_BILL_CHECK_INFO' : '/xul/server/patron/bill_check_info.xul',
	'XUL_PATRON_BILL_DETAILS' : '/xul/server/patron/bill_details.xul',
	'XUL_PATRON_BILL_HISTORY' : '/xul/server/patron/bill_history.xul',
	'XUL_PATRON_BILL_WIZARD' : '/xul/server/patron/bill_wizard.xul',
	'XUL_PATRON_DISPLAY' : '/xul/server/patron/display.xul',
	'XUL_PATRON_HORIZ_DISPLAY' : '/xul/server/patron/display_horiz.xul',
	'XUL_PATRON_EDIT' : '/eg/actor/user/register',
	'XUL_USER_PERM_EDITOR' : '/xul/server/patron/user_edit.xhtml',
	'XUL_PATRON_HOLDS' : '/xul/server/patron/holds.xul',
	'XUL_PATRON_INFO_NOTES' : '/xul/server/patron/info_notes.xul',
	'XUL_PATRON_INFO_STAT_CATS' : '/xul/server/patron/info_stat_cats.xul',
	'XUL_PATRON_INFO_SURVEYS' : '/xul/server/patron/info_surveys.xul',
	'XUL_PATRON_INFO_GROUP' : '/xul/server/patron/info_group.xul',
	'XUL_PATRON_ITEMS' : '/xul/server/patron/items.xul',
	'XUL_PATRON_SEARCH_FORM' : '/xul/server/patron/search_form.xul',
	'XUL_PATRON_HORIZONTAL_SEARCH_FORM' : '/xul/server/patron/search_form_horiz.xul',
	'XUL_PATRON_SEARCH_RESULT' : '/xul/server/patron/search_result.xul',
	'XUL_PATRON_SUMMARY' : '/xul/server/patron/summary.xul',
	'XUL_PRE_CAT' : '/xul/server/circ/pre_cat_fields.xul',
	'XUL_PRINT_LIST_TEMPLATE_EDITOR' : '/xul/server/circ/print_list_template_editor.xul',
	'XUL_RECORD_BUCKETS' : '/xul/server/cat/record_buckets.xul',
	'XUL_RECORD_BUCKETS_QUICK' : '/xul/server/cat/record_buckets_quick.xul',
	'XUL_REMOTE_BROWSER' : '/xul/server/util/rbrowser.xul',
	'XUL_SPINE_LABEL' : '/xul/server/cat/spine_labels.xul',
	'XUL_STANDALONE' : 'chrome://open_ils_staff_client/content/circ/offline.xul',
	'XUL_STANDING_PENALTIES' : '/xul/server/patron/standing_penalties.xul',
	'XUL_NEW_STANDING_PENALTY' : '/xul/server/patron/new_standing_penalty.xul',
	'XUL_EDIT_STANDING_PENALTY' : '/xul/server/patron/edit_standing_penalty.xul',
	'XUL_STAT_CAT_EDIT' : '/xul/server/admin/stat_cat_editor.xhtml',
	'XUL_SURVEY_WIZARD' : 'chrome://open_ils_staff_client/content/admin/survey_wizard.xul',
	'XUL_USER_BUCKETS' : '/xul/server/patron/user_buckets.xul',
	'XUL_VERIFY_CREDENTIALS' : '/xul/server/main/verify_credentials.xul',
	'XUL_VOLUME_BUCKETS' : '/xul/server/cat/volume_buckets.xul',
	'XUL_VOLUME_COPY_CREATOR' : '/xul/server/cat/volume_copy_creator.xul',
	'XUL_VOLUME_EDITOR' : '/xul/server/cat/volume_editor.xul',
    'XUL_WORK_LOG' : '/xul/server/admin/work_log.xul',
	'XUL_Z3950_IMPORT' : '/xul/server/cat/z3950.xul',
	'TEST_HTML' : '/xul/server/main/test.html',
	'TEST_XUL' : '/xul/server/main/test.xul',
    'CONIFY' : '/conify/' + LOCALE + '/global',
    'EG_WEB_BASE' : '/eg',
    'XUL_LOCAL_ADMIN_BASE' : '/xul/server/admin',
    'XUL_REPORTS' : '/reports/oils_rpt.xhtml'
}
