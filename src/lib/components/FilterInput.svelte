<script>
	// trigger vite watcher for tailwind compilation
	import { Search, X } from 'lucide-svelte';

	let { 
		value = $bindable(''), 
		totalCount = 0, 
		filteredCount = 0, 
		placeholder = 'Filter records...',
		onClear = () => {},
		class: className = 'w-64'
	} = $props();

	function clear() {
		value = '';
		onClear();
	}
</script>

<div class="relative flex items-center {className}">
	<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
		<Search size={16} />
	</div>
	<input
		type="text"
		{placeholder}
		bind:value={value}
		class="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 sm:text-sm transition-all"
	/>
	{#if value}
		<button
			type="button"
			onclick={clear}
			class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
		>
			<X size={16} />
		</button>
	{/if}
	{#if totalCount > 0}
		<span class="absolute right-0 bottom-full mb-1 text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100/80 dark:bg-gray-800/80 px-2 py-0.5 rounded-full whitespace-nowrap">
			Showing {filteredCount} of {totalCount}
		</span>
	{/if}
</div>
