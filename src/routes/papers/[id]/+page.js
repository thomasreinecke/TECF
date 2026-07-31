import corpus from '../../../../static/data/corpus.json';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	return { id: params.id };
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return corpus.map((p) => ({ id: String(p.id) }));
}
