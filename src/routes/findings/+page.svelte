<script>
	import { base } from '$app/paths';
	import FilterInput from '$lib/components/FilterInput.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { conditionFindings } from '$lib/dataStore.js';
	import { FileText } from 'lucide-svelte';

	let findingsFilter = $state('');
	let sortKey = $state('id');
	let sortDirection = $state('asc');

	let allFindings = $derived($conditionFindings || []);

	// Proportional column widths (sum = 100%) with Condition Finding restricted to 28%
	const columns = [
		{ key: 'id', title: 'ID', sortable: true, width: '6%' },
		{ key: 'raw_condition_label', title: 'Condition Finding', sortable: true, width: '28%', overflow: 'wrap' },
		{ key: 'paper', title: 'Paper', sortable: true, width: '34%', overflow: 'wrap' },
		{ key: 'stream', title: 'Stream', sortable: true, width: '8%' },
		{ key: 'evidence_role', title: 'Evidence Role', sortable: true, width: '11%' },
		{ key: 'claim_provenance', title: 'Provenance', sortable: true, width: '13%' }
	];

	function formatLabel(val) {
		if (!val) return '—';
		if (val === 'source_attributed') return 'Paper Argument';
		if (val === 'empirical_case') return 'Empirical Case';
		return val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, ' ');
	}

	function streamClass(stream) {
		if (stream === 'DT') return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/25 dark:text-blue-300';
		if (stream === 'EA') return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/25 dark:text-purple-300';
		if (stream === 'BT') return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-300';
		if (stream === 'DC') return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-300';
		return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
	}

	function roleClass(role) {
		if (role === 'support') return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/25 dark:text-sky-300';
		if (role === 'operationalization') return 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/25 dark:text-violet-300';
		if (role === 'boundary') return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
		return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
	}

	function provenanceClass() {
		return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
	}

	let filteredFindings = $derived((() => {
		const query = findingsFilter.trim().toLowerCase();
		let rows = allFindings;
		if (query) {
			rows = rows.filter((row) =>
				[
					`cf${row.cf_id || row.contribution_id}`,
					`p${row.corpus_id}`,
					row.raw_condition_label,
					row.paper_title || row.title,
					row.paper_authors || row.authors,
					row.readiness_statement,
					row.mechanism,
					row.synthesis_note,
					row.stream,
					row.canonical_code || row.cluster_code,
					row.canonical_label || row.cluster_label,
					row.evidence_role,
					row.claim_provenance
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
			if (sortKey === 'id') {
				aValue = a.cf_id || a.contribution_id || 0;
				bValue = b.cf_id || b.contribution_id || 0;
			} else if (sortKey === 'paper') {
				aValue = a.paper_title || a.title || '';
				bValue = b.paper_title || b.title || '';
			}
			if (aValue == null) return 1;
			if (bValue == null) return -1;
			if (typeof aValue === 'number' && typeof bValue === 'number') return (aValue - bValue) * direction;
			return String(aValue).localeCompare(String(bValue), undefined, { numeric: true }) * direction;
		});
	})());

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
				<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
					Condition Findings Inventory
				</h2>
				<p class="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
					Source-traceable empirical evidence statements extracted from confirmed SLR literature papers, classified by evidence role, condition assignment, and provenance.
				</p>
			</div>
			<div class="flex flex-wrap gap-2 items-center">
				<span class="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-200">
					{allFindings.length} confirmed findings
				</span>
			</div>
		</div>
	</div>

	<!-- Search & Controls -->
	<div class="flex flex-wrap items-center justify-between gap-4 pt-3">
		<div class="max-w-3xl text-sm text-gray-500 dark:text-gray-400">
			Source-attributed empirical evidence statements extracted across the SLR corpus.
		</div>
		<div class="shrink-0">
			<FilterInput
				bind:value={findingsFilter}
				totalCount={allFindings.length}
				filteredCount={filteredFindings.length}
				placeholder="Search condition findings..."
				class="w-72"
			/>
		</div>
	</div>

	<DataTable items={filteredFindings} {columns} {sortKey} {sortDirection} onSort={toggleSort}>
		{#snippet cell(item, col)}
			{#if col.key === 'id'}
				<span class="font-mono text-gray-400 dark:text-gray-500 text-sm">CF{item.cf_id || item.contribution_id}</span>

			{:else if col.key === 'raw_condition_label'}
				<a href="{base}/papers/{item.corpus_id}?cf={item.cf_id || item.contribution_id}" class="block font-medium text-blue-600 hover:underline dark:text-blue-400 text-sm leading-snug break-words whitespace-normal" title={item.raw_condition_label}>
					{item.raw_condition_label}
				</a>
				{#if item.cf_reconciliation_status === 'reconciled'}
					<span class="mt-1 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-300">
						reconciled
					</span>
				{/if}

			{:else if col.key === 'paper'}
				<a href="{base}/papers/{item.corpus_id}" class="block font-medium text-blue-600 hover:underline dark:text-blue-400 text-sm leading-snug" title={item.paper_title || item.title}>
					{item.paper_title || item.title}
				</a>
				<div class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{item.paper_authors || item.authors} ({item.paper_year || item.year})</div>

			{:else if col.key === 'stream'}
				<span class="rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap {streamClass(item.stream)}">{item.stream || '—'}</span>

			{:else if col.key === 'evidence_role'}
				{#if item.evidence_role}
					<span class="rounded-full border px-2 py-0.5 text-xs font-semibold capitalize whitespace-nowrap {roleClass(item.evidence_role)}">{formatLabel(item.evidence_role)}</span>
				{:else}
					<span class="text-xs text-gray-400">—</span>
				{/if}

			{:else if col.key === 'claim_provenance'}
				{#if item.claim_provenance}
					<span class="rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap {provenanceClass()}">{formatLabel(item.claim_provenance)}</span>
				{:else}
					<span class="text-xs text-gray-400">—</span>
				{/if}

			{:else}
				{item[col.key] ?? '—'}
			{/if}
		{/snippet}
	</DataTable>
</div>
