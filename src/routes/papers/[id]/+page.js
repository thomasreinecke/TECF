import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import corpus from '../../../../static/data/corpus.json';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	redirect(308, `${base}/papers/${params.id}/preview/1`);
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return corpus.map(p => ({ id: String(p.id) }));
}
