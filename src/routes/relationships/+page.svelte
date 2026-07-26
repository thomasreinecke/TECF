<script>
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import FilterInput from '$lib/components/FilterInput.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import RecordBadge from '$lib/components/RecordBadge.svelte';
	import { relationships } from '$lib/dataStore.js';
	import { GitMerge } from 'lucide-svelte';

	let searchInput = $state('');
	let scopeFilter = $state('all');
	let sortKey = $state('key');
	let sortDirection = $state('asc');

	onMount(() => {
		try {
			const savedKey = localStorage.getItem('tecf_rel_sort_key');
			const savedDir = localStorage.getItem('tecf_rel_sort_dir');
			if (savedKey) sortKey = savedKey;
			if (savedDir) sortDirection = savedDir;
		} catch (e) {}
	});

	$effect(() => {
		try {
			if (sortKey) localStorage.setItem('tecf_rel_sort_key', sortKey);
			if (sortDirection) localStorage.setItem('tecf_rel_sort_dir', sortDirection);
		} catch (e) {}
	});

	let relData = $derived($relationships || {});
	let allPairs = $derived(relData.retainedPropositions || []);
	let stats = $derived(relData.stats || {});

	const columns = [
		{ key: 'key', title: 'Relationship Key', sortable: true, width: '16%' },
		{ key: 'condition_a', title: 'Condition A (Source)', sortable: true, width: '36%', overflow: 'wrap' },
		{ key: 'scope', title: 'Scope', sortable: true, width: '12%' },
		{ key: 'condition_b', title: 'Condition B (Target)', sortable: true, width: '36%', overflow: 'wrap' }
	];

	let filteredItems = $derived((() => {
		let list = allPairs;
		if (scopeFilter !== 'all') {
			list = list.filter((item) => item.scope === scopeFilter);
		}
		const q = searchInput.trim().toLowerCase();
		if (q) {
			list = list.filter((item) =>
				[
					item.relationship_key,
					item.code_a,
					item.label_a,
					item.domain_a,
					item.code_b,
					item.label_b,
					item.domain_b,
					item.scope,
					item.final_status,
					item.rationale_a_to_b,
					item.rationale_b_to_a
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase()
					.includes(q)
			);
		}

		const dir = sortDirection === 'asc' ? 1 : -1;
		return [...list].sort((a, b) => {
			let valA = '';
			let valB = '';
			if (sortKey === 'key') {
				valA = a.relationship_key || '';
				valB = b.relationship_key || '';
			} else if (sortKey === 'condition_a') {
				valA = a.code_a || '';
				valB = b.code_a || '';
			} else if (sortKey === 'condition_b') {
				valA = a.code_b || '';
				valB = b.code_b || '';
			} else if (sortKey === 'domain_a') {
				valA = a.domain_a || '';
				valB = b.domain_a || '';
			} else if (sortKey === 'domain_b') {
				valA = a.domain_b || '';
				valB = b.domain_b || '';
			} else if (sortKey === 'scope') {
				valA = a.scope || '';
				valB = b.scope || '';
			} else if (sortKey === 'status') {
				valA = a.final_status || '';
				valB = b.final_status || '';
			} else {
				valA = a[sortKey] ?? '';
				valB = b[sortKey] ?? '';
			}

			if (valA == null) return 1;
			if (valB == null) return -1;
			return String(valA).localeCompare(String(valB), undefined, { numeric: true }) * dir;
		});
	})());

	/** @param {string} key */
	function handleSort(key) {
		if (sortKey === key) sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		else {
			sortKey = key;
			sortDirection = 'asc';
		}
	}

	/** @param {boolean} active */
	function activeBtn(active) {
		return active
			? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-600'
			: 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800';
	}
</script>

<div class="space-y-6">

	<!-- Header Panel -->
	<div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
					Canonical Condition Relationships
				</h2>
				<p class="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
					Directional relationship propositions between the retained capability constructs. The unit is the <em>direction</em>: each pair is judged twice, A→B and B→A, so one pair can carry one or two retained propositions. Each row below is a pair; the arrows show which of its directions were retained.
				</p>
			</div>
			<div class="flex flex-wrap gap-2 items-center">
				<span class="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-200">
					{stats.retainedDirectedPropositions ?? '—'} propositions across {allPairs.length} pairs
				</span>
			</div>
		</div>
	</div>

	{#if stats.isInProgress}
		<div class="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/30 p-4 flex items-center gap-3 text-sm text-amber-900 dark:text-amber-200">
			<div class="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0"></div>
			<div>
				<span class="font-bold">Synthesis Run In Progress:</span> Dual-model classification & reconciliation is actively running ({stats.reconciledPairsCount ?? '—'} of {stats.totalEvaluatedPairs ?? '—'} pairs evaluated). Displaying {stats.retainedDirectedPropositions ?? '—'} retained propositions across {allPairs.length} pairs identified so far.
			</div>
		</div>
	{/if}

	<!-- Controls & Filters -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3">
		<div class="flex items-center gap-3 flex-wrap">
			<div class="inline-flex rounded-md shadow-xs">
				<button
					type="button"
					onclick={() => scopeFilter = 'all'}
					class="px-3 py-2 text-sm font-medium border rounded-l-md border-r-0 border-gray-300 dark:border-gray-800 transition-colors {activeBtn(scopeFilter === 'all')}"
				>
					All Scopes
				</button>
				<button
					type="button"
					onclick={() => scopeFilter = 'in_domain'}
					class="px-3 py-2 text-sm font-medium border border-r-0 border-gray-300 dark:border-gray-800 transition-colors {activeBtn(scopeFilter === 'in_domain')}"
				>
					In-Domain
				</button>
				<button
					type="button"
					onclick={() => scopeFilter = 'cross_domain'}
					class="px-3 py-2 text-sm font-medium border rounded-r-md border-gray-300 dark:border-gray-800 transition-colors {activeBtn(scopeFilter === 'cross_domain')}"
				>
					Cross-Domain
				</button>
			</div>
		</div>

		<div class="flex items-center gap-3 w-full sm:w-auto justify-end">
			<FilterInput
				bind:value={searchInput}
				totalCount={allPairs.length}
				filteredCount={filteredItems.length}
				placeholder="Search pair key, condition, domain..."
				class="w-72"
			/>
		</div>
	</div>

	<!-- DataTable -->
	<DataTable items={filteredItems} {columns} {sortKey} {sortDirection} onSort={handleSort}>
		{#snippet cell(item, col)}
			{#if col.key === 'key'}
				<RecordBadge id={item.relationship_key} />

			{:else if col.key === 'condition_a'}
				<div class="flex items-center gap-2">
					<a href="{base}/conditions/{item.code_a}" class="hover:opacity-80 transition-opacity shrink-0">
						<RecordBadge id={item.domain_a ? `${item.domain_a}-${item.code_a}` : item.code_a} />
					</a>
					<a href="{base}/conditions/{item.code_a}" class="font-semibold text-blue-600 hover:underline dark:text-blue-400 text-[15px] leading-snug break-words whitespace-normal" title="Inspect {item.code_a} condition detail">
						{item.label_a}
					</a>
				</div>

			{:else if col.key === 'scope'}
				{#if item.scope === 'in_domain'}
					<span class="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[13px] font-semibold text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/25 dark:text-sky-300 whitespace-nowrap">In-Domain</span>
				{:else}
					<span class="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[13px] font-semibold text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/25 dark:text-purple-300 whitespace-nowrap">Cross-Domain</span>
				{/if}

			{:else if col.key === 'condition_b'}
				<div class="flex items-center gap-2">
					<a href="{base}/conditions/{item.code_b}" class="hover:opacity-80 transition-opacity shrink-0">
						<RecordBadge id={item.domain_b ? `${item.domain_b}-${item.code_b}` : item.code_b} />
					</a>
					<a href="{base}/conditions/{item.code_b}" class="font-semibold text-blue-600 hover:underline dark:text-blue-400 text-[15px] leading-snug break-words whitespace-normal" title="Inspect {item.code_b} condition detail">
						{item.label_b}
					</a>
				</div>

			{:else}
				{item[col.key] ?? '—'}
			{/if}
		{/snippet}
	</DataTable>
</div>
