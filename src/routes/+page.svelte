<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	onMount(() => {
		goto(`${base}/framework`, { replaceState: true });
	});
</script>

<svelte:head>
	<title>Synthesis Framework | TECF</title>
</svelte:head>

<div class="flex items-center justify-center p-12 text-slate-500 text-sm font-medium">
	Redirecting to Synthesis Framework...
</div>
