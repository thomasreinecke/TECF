import { redirect } from '@sveltejs/kit';
import { building } from '$app/environment';
import corpus from '../../../../../../static/data/corpus.json';

/** @type {import('./$types').PageLoad} */
export function load({ params, url }) {
	const query = building ? '' : url.search;
	throw redirect(308, `/papers/${params.id}${query}`);
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	/** @type {Array<{id: string, tab: string, page?: string}>} */
	const result = [];
	for (const p of corpus) {
		result.push({ id: String(p.id), tab: 'overview' });
		result.push({ id: String(p.id), tab: 'preview', page: '1' });
	}
	return result;
}
