<script>
	import { base } from '$app/paths';
	import DataTable from '$lib/components/DataTable.svelte';
	import FilterInput from '$lib/components/FilterInput.svelte';
	import RecordBadge from '$lib/components/RecordBadge.svelte';
	import { corpus, conditionFindings } from '$lib/dataStore.js';
	import { EVIDENCE_FAMILY_LABELS } from '$lib/evidenceFamilies.js';
	import { ExternalLink, Search } from 'lucide-svelte';

	// The Scopus record list may not be redistributed, so TECF publishes the search
	// expressions instead (thesis Section 3.2, Step 1, and Table 3.2). The text
	// matches search/search-queries.md in the digital annex.
	const SEARCH_DATE = '6 July 2026';
	const SEARCH_FILTERS = 'OA ( ALL ) · PUBYEAR > 2016 · LIMIT-TO ( LANGUAGE , "English" )';
	const searchQueries = [
		{
			id: 'TQ1',
			stream: 'DT',
			label: 'Digital transformation',
			expression: 'TITLE ("digital transformation") AND TITLE-ABS-KEY (readiness OR "enabling condition*" OR "dynamic capabilit*" OR "digital maturity")',
			records: 743
		},
		{
			id: 'TQ2',
			stream: 'EA',
			label: 'Enterprise architecture',
			expression: 'TITLE-ABS-KEY ("enterprise architecture" AND (transformation OR governance OR "decision right*" OR alignment OR maturity OR readiness))',
			records: 391
		},
		{
			id: 'TQ3',
			stream: 'ITG',
			label: 'IT governance',
			expression: 'TITLE-ABS-KEY (("IT governance" OR "information technology governance" OR "enterprise governance of IT") AND ("decision right*" OR alignment OR "business-IT alignment" OR maturity OR "governance mechanism*" OR "value delivery"))',
			records: 147
		}
	];

	let searchInput = $state('');
	let sortKey = $state('id');
	let sortDirection = $state('asc');
	let streamFilter = $state('all');

	let findingsByPaper = $derived(
		(() => {
			const map = new Map();
			for (const finding of $conditionFindings || []) {
				const entry = map.get(finding.corpus_id) || { count: 0, conditions: new Set() };
				entry.count += 1;
				const code = finding.canonical_code || finding.cluster_code;
				if (code) entry.conditions.add(code);
				map.set(finding.corpus_id, entry);
			}
			return map;
		})()
	);

	let publications = $derived(
		($corpus || []).map((item) => {
			const entry = findingsByPaper.get(item.id);
			return {
				...item,
				familyLabel: EVIDENCE_FAMILY_LABELS[item.evidence_family] || '—',
				findingCount: entry ? entry.count : 0,
				conditionCodes: entry ? [...entry.conditions].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : []
			};
		})
	);

	const columns = [
		{ key: 'id', title: 'ID', width: '70px', sortable: true, cellClass: 'bg-purple-50/50 group-hover:bg-purple-100/60 dark:bg-purple-950/25 dark:group-hover:bg-purple-900/35' },
		{ key: 'title', title: 'Publication', width: 'auto', sortable: true, overflow: 'wrap', cellClass: 'bg-purple-50/50 group-hover:bg-purple-100/60 dark:bg-purple-950/25 dark:group-hover:bg-purple-900/35' },
		{ key: 'year', title: 'Year', width: '72px', sortable: true },
		{ key: 'journal', title: 'Venue', width: '200px', sortable: true, overflow: 'wrap' },
		{ key: 'stream', title: 'Stream', width: '80px', sortable: true },
		{ key: 'evidence_family', title: 'Evidence', width: '150px', sortable: true, overflow: 'wrap' },
		{ key: 'findingCount', title: 'Findings', width: '92px', sortable: true },
		{ key: 'doi', title: 'DOI', width: '72px', sortable: false }
	];

	function streamClass(stream) {
		if (stream === 'DT')
			return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/25 dark:text-blue-300';
		if (stream === 'EA')
			return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/25 dark:text-purple-300';
		if (stream === 'ITG')
			return 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/25 dark:text-teal-300';
		return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
	}

	const streamFilters = [
		{ id: 'all', label: 'All Streams' },
		{ id: 'DT', label: 'DT' },
		{ id: 'EA', label: 'EA' },
		{ id: 'ITG', label: 'ITG' }
	];

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
		if (key === 'evidence_family') return item.familyLabel;
		return item[key] ?? '';
	}

	let filteredItems = $derived((() => {
		const query = searchInput.trim().toLowerCase();
		return publications.filter((item) => {
			if (streamFilter !== 'all' && item.stream !== streamFilter) return false;
			if (query) {
				const haystack = [
					`p${item.id}`,
					item.title,
					item.authors,
					item.year,
					item.journal,
					item.doi,
					item.stream,
					item.familyLabel,
					...item.conditionCodes
				].filter(Boolean).join(' ').toLowerCase();
				if (!haystack.includes(query)) return false;
			}
			return true;
		}).sort((a, b) => {
			const aVal = sortValue(a, sortKey);
			const bVal = sortValue(b, sortKey);
			const dir = sortDirection === 'desc' ? -1 : 1;
			if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
			return String(aVal).localeCompare(String(bVal), undefined, { numeric: true }) * dir;
		});
	})());
</script>

<svelte:head>
	<title>Sources | TECF</title>
</svelte:head>

<div class="space-y-6">

	<!-- Header Panel -->
	<div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">
					Sources
				</h2>
				<p class="mt-1.5 max-w-3xl text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
					The search that built the literature corpus and the bibliography of the publications that contribute Condition Findings to the framework.
				</p>
			</div>
			<div class="flex flex-wrap gap-2 items-center">
				<span class="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-200">
					{publications.length} contributing publications
				</span>
			</div>
		</div>
	</div>

	<!-- Search Queries -->
	<div class="space-y-3">
		<div>
			<h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
				<Search class="w-5 h-5 text-slate-500" />
				Search Queries
			</h3>
			<p class="mt-0.5 max-w-4xl text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
				The formal search ran in Scopus on {SEARCH_DATE}. Anyone with Scopus access can rebuild it from the expressions below. Scopus changes continuously, so a later run returns a similar, not an identical, set.
				Filters applied to every query: <span class="font-mono text-xs">{SEARCH_FILTERS}</span>
			</p>
		</div>

		<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
			<table class="w-full text-left text-sm">
				<thead class="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
					<tr>
						<th class="px-4 py-3 w-20">Query</th>
						<th class="px-4 py-3 w-56">Literature Stream</th>
						<th class="px-4 py-3">Scopus Search Expression</th>
						<th class="px-4 py-3 w-32 text-right">Records</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
					{#each searchQueries as query}
						<tr>
							<td class="px-4 py-3 font-mono font-semibold text-slate-800 dark:text-slate-200">{query.id}</td>
							<td class="px-4 py-3">
								<span class="rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap {streamClass(query.stream)}">{query.stream}</span>
								<span class="ml-1.5 text-slate-700 dark:text-slate-300">{query.label}</span>
							</td>
							<td class="px-4 py-3 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 break-words">{query.expression}</td>
							<td class="px-4 py-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">{query.records.toLocaleString('en-US')}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<ul class="max-w-4xl list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-1">
			<li>Six mandatory anchor publications named in the research proposal and 29 purposive foundational selections raised the identified set from 1,281 to 1,316 records.</li>
			<li>After duplicate removal, 1,295 unique records entered title-and-abstract screening.</li>
			<li>The coverage audit added three foundational publications through the purposive channel after screening. The author decided these three records without model screening.</li>
		</ul>
	</div>

	<hr class="border-slate-200 dark:border-slate-800" />

	<!-- Bibliography -->
	<div class="space-y-3">
		<div>
			<h3 class="text-xl font-bold text-slate-900 dark:text-white">
				Contributing Publications
			</h3>
			<p class="mt-0.5 max-w-4xl text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
				Every publication that contributes at least one Condition Finding, with its literature stream, evidence family, and the number of its findings. The DOI link leads to the publisher's version.
			</p>
		</div>

		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
			<div class="inline-flex rounded-md shadow-sm">
				{#each streamFilters as filter, i}
					<button
						type="button"
						onclick={() => streamFilter = filter.id}
						class="px-3 py-2 text-sm font-medium border transition-colors
							{i === 0 ? 'rounded-l-md' : ''}
							{i === streamFilters.length - 1 ? 'rounded-r-md border-r' : 'border-r-0'}
							border-gray-300 dark:border-gray-800
							{activeBtn(streamFilter === filter.id)}"
					>
						{filter.label}
					</button>
				{/each}
			</div>
			<div class="flex items-center gap-3 w-full sm:w-auto justify-end">
				<FilterInput
					bind:value={searchInput}
					totalCount={publications.length}
					filteredCount={filteredItems.length}
					placeholder="Search..."
					class="w-72"
				/>
			</div>
		</div>

		<DataTable
			items={filteredItems}
			{columns}
			{sortKey}
			{sortDirection}
			onSort={handleSort}
		>
			{#snippet cell(item, col)}
				{#if col.key === 'id'}
					<a href="{base}/sources/{item.id}" class="inline-block hover:opacity-80 transition-opacity">
						<RecordBadge id={`P${item.id}`} variant="paper" />
					</a>

				{:else if col.key === 'title'}
					<a
						href="{base}/sources/{item.id}"
						class="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-base leading-snug break-words"
					>
						{item.title}
					</a>
					<div class="mt-0.5 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-snug">
						{item.authors || '—'}
					</div>

				{:else if col.key === 'year'}
					<span class="text-gray-700 dark:text-gray-300 font-medium text-[15px]">{item.year || '—'}</span>

				{:else if col.key === 'journal'}
					<span class="text-sm text-slate-600 dark:text-slate-300 leading-snug">{item.journal || '—'}</span>

				{:else if col.key === 'stream'}
					<span class="rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap {streamClass(item.stream)}">
						{item.stream || '—'}
					</span>

				{:else if col.key === 'evidence_family'}
					<span class="text-sm text-slate-700 dark:text-slate-300">{item.familyLabel}</span>

				{:else if col.key === 'findingCount'}
					<span class="font-mono text-sm font-semibold text-slate-800 dark:text-gray-200">{item.findingCount}</span>

				{:else if col.key === 'doi'}
					{#if item.doi}
						<a
							href="https://doi.org/{item.doi}"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400"
							title={item.doi}
						>
							DOI <ExternalLink class="w-3 h-3" />
						</a>
					{:else}
						<span class="text-slate-400">—</span>
					{/if}

				{:else}
					{item[col.key] ?? '—'}
				{/if}
			{/snippet}
		</DataTable>
	</div>

</div>
