<script>
	let {
		title,
		count = null,
		subheading = '',
		children = null,
		titleExtra = null
	} = $props();

	const subheadingAsSnippet = $derived(/** @type {any} */ (subheading));
	const titleExtraAsSnippet = $derived(/** @type {any} */ (titleExtra));
</script>

<div class="space-y-2">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="min-w-0">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white flex flex-wrap items-center gap-3 leading-tight">
				<span>{title}</span>
				{#if count !== null && count !== undefined}
					<span class="text-base font-semibold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full">
						{count}
					</span>
				{/if}
				{#if titleExtra}
					{@render titleExtraAsSnippet()}
				{/if}
			</h1>
			{#if subheading}
				<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
					{#if typeof subheading === 'function'}
						{@render subheadingAsSnippet()}
					{:else}
						{subheading}
					{/if}
				</p>
			{/if}
		</div>

		{#if children}
			<div class="shrink-0">
				{@render children()}
			</div>
		{/if}
	</div>
</div>
