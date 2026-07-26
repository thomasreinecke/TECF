<script>
	import { base } from '$app/paths';
	import DataTable from '$lib/components/DataTable.svelte';
	import FilterInput from '$lib/components/FilterInput.svelte';
	import { corpus } from '$lib/dataStore.js';
	import { FileText } from 'lucide-svelte';

	let searchInput = $state('');
	let sortKey = $state('id');
	let sortDirection = $state('asc');
	let typeFilter = $state('all');

	let papers = $derived($corpus || []);

	// Exactly the 9 specified columns: ID, Type, Title, Authors, Year, Cites, Refs, Pages, Words
	const columns = [
		{ key: 'id', title: 'ID', width: '70px', sortable: true },
		{ key: 'item_type', title: 'Type', width: '92px', sortable: true },
		{ key: 'title', title: 'Title', width: 'auto', sortable: true, overflow: 'wrap' },
		{ key: 'authors', title: 'Authors', width: '220px', sortable: true, overflow: 'wrap' },
		{ key: 'year', title: 'Year', width: '76px', sortable: true },
		{ key: 'citation_count', title: 'Cites', width: '86px', sortable: true },
		{ key: 'reference_count', title: 'Refs', width: '86px', sortable: true },
		{ key: 'page_count', title: 'Pages', width: '86px', sortable: true },
		{ key: 'word_count', title: 'Words', width: '96px', sortable: true }
	];

	let typeFilters = $derived([
		{ id: 'all', label: 'All' },
		...[...new Set((papers || []).map((item) => item.typeLabel || item.item_type).filter(Boolean))]
			.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
			.map((type) => ({ id: type, label: type }))
	]);

	function activeBtn(active) {
		return active
			? 'bg-blue-600 text-white border-blue-600 z-10'
			: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50';
	}

	function handleSort(key) {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'asc';
		}
	}

	function sortValue(item, key) {
		if (key === 'id') return item.id;
		if (key === 'item_type') return item.typeLabel || item.item_type || '';
		if (key === 'citation_count') return item.cites ?? -1;
		if (key === 'reference_count') return item.refs ?? -1;
		if (key === 'page_count') return item.pages ?? -1;
		if (key === 'word_count') return item.words ?? -1;
		return item[key] ?? '';
	}

	let filteredItems = $derived((() => {
		const query = searchInput.trim().toLowerCase();
		return papers.filter((item) => {
			if (typeFilter !== 'all' && (item.typeLabel || '') !== typeFilter && (item.item_type || '') !== typeFilter) return false;
			if (query) {
				const haystack = [
					`p${item.id}`,
					item.id,
					item.typeLabel,
					item.item_type,
					item.title,
					item.authors,
					item.year,
					item.cites,
					item.refs,
					item.journal,
					item.doi
				].filter(Boolean).join(' ').toLowerCase();
				if (!haystack.includes(query)) return false;
			}
			return true;
		}).sort((a, b) => {
			const aVal = sortValue(a, sortKey);
			const bVal = sortValue(b, sortKey);
			const dir = sortDirection === 'desc' ? -1 : 1;
			if (typeof aVal === 'number' && typeof bVal === 'number') {
				return (aVal - bVal) * dir;
			}
			return String(aVal).localeCompare(String(bVal), undefined, { numeric: true }) * dir;
		});
	})());
</script>

<div class="space-y-6">

	<!-- Header Panel -->
	<div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
					Confirmed Included SLR Papers
				</h2>
				<p class="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
					Confirmed SLR literature review papers with citation and reference metrics, page and word length statistics, and item type filters.
				</p>
			</div>
			<div class="flex flex-wrap gap-2 items-center">
				<span class="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-200">
					{papers.length} confirmed papers
				</span>
			</div>
		</div>
	</div>

	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3">
		<div class="flex items-center gap-3 flex-wrap">
			<div class="inline-flex rounded-md shadow-sm">
				{#each typeFilters as filter, i}
					<button
						type="button"
						onclick={() => typeFilter = filter.id}
						class="px-3 py-2 text-sm font-medium border transition-colors
							{i === 0 ? 'rounded-l-md' : ''}
							{i === typeFilters.length - 1 ? 'rounded-r-md border-r' : 'border-r-0'}
							border-gray-300 dark:border-gray-800
							{activeBtn(typeFilter === filter.id)}"
					>
						{filter.label}
					</button>
				{/each}
			</div>
		</div>

		<div class="flex items-center gap-3 w-full sm:w-auto justify-end">
			<div class="relative shrink-0">
				<FilterInput
					bind:value={searchInput}
					totalCount={papers.length}
					filteredCount={filteredItems.length}
					placeholder="Search included papers..."
					class="w-72"
				/>
			</div>
		</div>
	</div>

	<!-- DataTable matching _app 1:1 with exact requested 9 columns -->
	<DataTable
		items={filteredItems}
		{columns}
		{sortKey}
		{sortDirection}
		onSort={handleSort}
	>
		{#snippet cell(item, col)}
			{#if col.key === 'id'}
				<span class="font-mono text-gray-400 dark:text-gray-500 text-sm">P{item.id}</span>

			{:else if col.key === 'item_type'}
				<span class="text-gray-600 dark:text-gray-400 text-sm">
					{item.typeLabel || item.item_type || 'Journal'}
				</span>

			{:else if col.key === 'title'}
				<a
					href="{base}/papers/{item.id}"
					class="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline underline-offset-2 break-words text-sm"
					title={item.title}
				>
					{item.title}
				</a>

			{:else if col.key === 'authors'}
				<div class="text-gray-500 dark:text-gray-400 line-clamp-2 text-sm" title={item.authors}>
					{item.authors || '-'}
				</div>

			{:else if col.key === 'year'}
				<span class="text-gray-500 dark:text-gray-400 text-sm">{item.year || '-'}</span>

			{:else if col.key === 'citation_count'}
				<span class="font-mono text-sm {item.cites != null && item.cites !== 0 ? 'text-slate-700 dark:text-gray-300' : 'text-slate-300 dark:text-gray-700'}">
					{item.cites != null && item.cites !== 0 ? item.cites : '–'}
				</span>

			{:else if col.key === 'reference_count'}
				<span class="font-mono text-sm text-slate-700 dark:text-gray-300">
					{item.refs != null && item.refs !== 0 ? item.refs.toLocaleString() : '–'}
				</span>

			{:else if col.key === 'page_count'}
				<span class="font-mono text-sm text-slate-700 dark:text-gray-300">
					{item.pages != null && item.pages !== 0 ? item.pages : '–'}
				</span>

			{:else if col.key === 'word_count'}
				<span class="font-mono text-sm text-slate-700 dark:text-gray-300 font-medium">
					{item.words != null && item.words !== 0 ? item.words.toLocaleString() : '–'}
				</span>

			{:else}
				{item[col.key] || '-'}
			{/if}
		{/snippet}
	</DataTable>

</div>
