import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	redirect(308, `${base}/papers/${params.id}/preview/1`);
}
