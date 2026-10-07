import conditionFindings from '../../../../static/data/condition_findings.json';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	return { id: params.id };
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	const set = new Set();
	for (const f of conditionFindings) {
		const idNum = f.cf_id || f.contribution_id;
		if (idNum != null) {
			set.add(`CF${idNum}`);
			set.add(`cf${idNum}`);
			set.add(String(idNum));
		}
	}
	return Array.from(set).map((id) => ({ id }));
}
