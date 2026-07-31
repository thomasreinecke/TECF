import { redirect } from '@sveltejs/kit';
import { building } from '$app/environment';
import { base } from '$app/paths';
import corpus from '../../../../static/data/corpus.json';

/** @type {import('./$types').PageLoad} */
export function load({ params, url }) {
	// Evidence links arrive as /papers/<id>?cf=<cf_id>[&line=<n>]. Carry the query
	// through, otherwise the redirect drops the requested finding and the reader
	// lands on page 1 with nothing selected. The layout is ssr:false, so this load
	// only ever runs in the browser; the guard keeps it safe if SSR is turned on.
	const query = building ? '' : url.search;
	if (query.includes('cf=')) {
		throw redirect(308, `/papers/${params.id}/preview/1${query}`);
	}
	throw redirect(308, `/papers/${params.id}/overview${query}`);
}

/** @type {import('./$types').EntryGenerator} */
export function entries() {
	return corpus.map(p => ({ id: String(p.id) }));
}
