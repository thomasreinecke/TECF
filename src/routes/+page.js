import { redirect } from '@sveltejs/kit';
import { building } from '$app/environment';

/** @type {import('./$types').PageLoad} */
export function load({ url }) {
	const query = building ? '' : url.search;
	throw redirect(308, `/framework${query}`);
}
