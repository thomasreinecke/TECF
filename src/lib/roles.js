/**
 * Reader-facing names for the stored synthesis roles.
 *
 * The canonical layer stores the external role as `contingency`; every text a
 * reader sees calls it `contextual`, matching the thesis chapter. Route this
 * through one place so a view cannot leak the storage name by rendering the raw
 * column.
 */
const READER_FACING_ROLE = {
	core: 'core',
	supporting: 'supporting',
	operationalizing: 'operationalizing',
	contingency: 'contextual'
};

/** @param {string | null | undefined} role */
export function roleLabel(role) {
	if (!role) return '';
	return READER_FACING_ROLE[role] ?? role;
}
