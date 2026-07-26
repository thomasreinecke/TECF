import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
	redirect(308, `/papers/${params.id}/preview/1`);
}
