<script>
	import { page } from '$app/stores';
	import { base } from '$app/paths';
</script>

<div class="p-8 text-center text-sm text-slate-500">
	Redirecting to publication detail...
	<a href="{base}/papers/{$page.params.id}" class="text-blue-600 underline font-semibold">Click here if not redirected</a>
</div>
