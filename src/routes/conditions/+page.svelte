<script>
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import FilterInput from '$lib/components/FilterInput.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import RecordBadge from '$lib/components/RecordBadge.svelte';
	import { canonicalConditions } from '$lib/dataStore.js';

	let conditionsFilter = $state('');
	let sortKey = $state('code');
	let sortDirection = $state('asc');

	let allConditions = $derived($canonicalConditions || []);

	// ---- Total Stats ----
	let totalConfirmedCount = $derived(allConditions.length);

	const columns = [
		{ key: 'code', title: 'ID', sortable: true, width: '80px', cellClass: 'bg-purple-50/50 group-hover:bg-purple-100/60 dark:bg-purple-950/25 dark:group-hover:bg-purple-900/35' },
		{ key: 'label', title: 'Condition', sortable: true, width: '30%', overflow: 'wrap', cellClass: 'bg-purple-50/50 group-hover:bg-purple-100/60 dark:bg-purple-950/25 dark:group-hover:bg-purple-900/35' },
		{ key: 'finding_count', title: 'Findings', sortable: true, width: '6%' },
		{ key: 'definition', title: 'Definition', sortable: false, width: '62%', overflow: 'wrap' }
	];

	let filteredConditions = $derived((() => {
		const query = conditionsFilter.trim().toLowerCase();
		let rows = allConditions;
		if (query) {
			rows = rows.filter((row) =>
				[
					row.code,
					row.label,
					row.definition
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase()
					.includes(query)
			);
		}
		const direction = sortDirection === 'asc' ? 1 : -1;
		return [...rows].sort((a, b) => {
			let aValue = a[sortKey];
			let bValue = b[sortKey];
			if (aValue == null) return 1;
			if (bValue == null) return -1;
			if (typeof aValue === 'number' && typeof bValue === 'number') return (aValue - bValue) * direction;
			return String(aValue).localeCompare(String(bValue), undefined, { numeric: true }) * direction;
		});
	})());

	/** @param {string} key */
	function toggleSort(key) {
		if (sortKey === key) sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		else {
			sortKey = key;
			sortDirection = 'asc';
		}
	}
</script>

<div class="space-y-6">

	<!-- Header Panel -->
	<div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">
					Conditions
				</h2>
				<p class="mt-1.5 max-w-3xl text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
					Confirmed canonical conditions synthesised across the SLR corpus, with domain assignments, definitions, and evidence counts.
				</p>
			</div>
			<div class="flex flex-wrap gap-2 items-center">
				<span class="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-200">
					{totalConfirmedCount} confirmed conditions
				</span>
			</div>
		</div>
	</div>

	<!-- Filters & Search -->
	<div class="flex justify-end pt-3">
		<div class="flex items-center gap-3 w-full sm:w-auto justify-end">
			<div class="relative shrink-0">
				<FilterInput
					bind:value={conditionsFilter}
					totalCount={allConditions.length}
					filteredCount={filteredConditions.length}
					placeholder="Search..."
					class="w-72"
				/>
			</div>
		</div>
	</div>

	<!-- DataTable -->
	<DataTable items={filteredConditions} {columns} {sortKey} {sortDirection} onSort={toggleSort} rowClick={(item) => goto(`${base}/conditions/${item.code}`)}>
		{#snippet cell(item, col)}
			{#if col.key === 'code'}
				<a href="{base}/conditions/{item.code}" class="inline-block hover:opacity-80 transition-opacity">
					<RecordBadge id={item.code} variant="condition" />
				</a>

			{:else if col.key === 'label'}
				<a href="{base}/conditions/{item.code}" class="font-semibold text-blue-600 dark:text-blue-400 text-base leading-snug break-words">
					{item.label}
				</a>

			{:else if col.key === 'finding_count'}
				<a href="{base}/findings?q={item.code}" class="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-[13px] font-mono font-bold text-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300 transition-colors">
					{item.finding_count ?? 0}
				</a>

			{:else if col.key === 'definition'}
				<span class="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed block break-words whitespace-normal">{item.definition || '—'}</span>

			{:else}
				{item[col.key] ?? '—'}
			{/if}
		{/snippet}
	</DataTable>
</div>
