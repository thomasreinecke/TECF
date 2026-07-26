<script>
	export let crumbs = [];
</script>

{#if crumbs && crumbs.length}
	<nav class="text-sm text-slate-500 dark:text-gray-400 mb-2 shrink-0 select-none flex items-center">
		{#each crumbs as crumb}
			<a href={crumb.href} class="hover:underline text-blue-600 dark:text-blue-400 font-medium">
				{crumb.name}
			</a>
			<span class="mx-2 text-slate-400 dark:text-gray-600">/</span>
		{/each}
	</nav>
{/if}
