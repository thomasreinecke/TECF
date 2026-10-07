<script>
	import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-svelte';

	export let title = '';
	export let sortKey = '';
	export let currentSortKey = '';
	export let currentSortDirection = 'asc';
	export let onSort = () => {};
</script>

<button on:click={() => onSort(sortKey)} class="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none transition-colors select-none font-medium text-left">
	<span>{title}</span>
	{#if currentSortKey === sortKey}
		{#if currentSortDirection === 'asc'}
			<ChevronUp size={14} class="text-blue-600 dark:text-blue-400" />
		{:else}
			<ChevronDown size={14} class="text-blue-600 dark:text-blue-400" />
		{/if}
	{:else}
		<ChevronsUpDown size={14} class="text-gray-300 dark:text-gray-600" />
	{/if}
</button>
