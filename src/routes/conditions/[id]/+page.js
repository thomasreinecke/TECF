import canonicalConditions from '../../../../static/data/canonical_conditions.json';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	return { id: params.id };
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	const set = new Set();
	for (const c of canonicalConditions) {
		if (c.code) set.add(c.code);
		if (c.code) set.add(c.code.toLowerCase());
	}
	return Array.from(set).map(id => ({ id }));
}
