<script>
	/**
	 * @typedef {Object} Props
	 * @property {string} [id] - The record ID or code to display
	 * @property {'default' | 'paper' | 'condition' | 'domain' | 'finding' | 'relationship'} [variant] - Optional semantic variant
	 * @property {string} [class] - Additional CSS classes
	 * @property {import('svelte').Snippet} [children] - Optional slot content
	 */

	/** @type {Props} */
	let {
		id = '',
		variant = 'default',
		class: className = '',
		children
	} = $props();
</script>

<span
	class="inline-flex items-center justify-center rounded-md border border-slate-200/90 bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold tracking-tight text-slate-800 shadow-2xs transition-colors shrink-0 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-100 {className}"
>
	{#if children}
		{@render children()}
	{:else}
		{id}
	{/if}
</span>
