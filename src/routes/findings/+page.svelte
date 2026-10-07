<script>
	import { base } from "$app/paths";
	import FilterInput from "$lib/components/FilterInput.svelte";
	import DataTable from "$lib/components/DataTable.svelte";
	import RecordBadge from "$lib/components/RecordBadge.svelte";
	import { conditionFindings, metadata } from "$lib/dataStore.js";
	import { FileText } from "lucide-svelte";

	let findingsFilter = $state("");
	let sortKey = $state("id");
	let sortDirection = $state("asc");
	let streamFilter = $state("all");

	const streamOptions = [
		{ id: "all", label: "All Streams" },
		{ id: "DT", label: "DT" },
		{ id: "EA", label: "EA" },
		{ id: "ITG", label: "ITG" },
	];

	function activeBtn(active) {
		return active
			? "bg-blue-600 text-white border-blue-600 z-10"
			: "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50";
	}

	let allFindings = $derived($conditionFindings || []);

	// Proportional column widths (sum = 100%) with Condition Finding allocated 34%
	const columns = [
		{
			key: "id",
			title: "ID",
			sortable: true,
			width: "70px",
			cellClass: "bg-purple-50/50 group-hover:bg-purple-100/60 dark:bg-purple-950/25 dark:group-hover:bg-purple-900/35",
		},
		{
			key: "raw_condition_label",
			title: "Finding",
			sortable: true,
			width: "46%",
			overflow: "wrap",
			cellClass: "bg-purple-50/50 group-hover:bg-purple-100/60 dark:bg-purple-950/25 dark:group-hover:bg-purple-900/35",
		},
		{
			key: "paper",
			title: "Paper",
			sortable: true,
			width: "42%",
			overflow: "wrap",
		},
		{ key: "stream", title: "Stream", sortable: true, width: "8%" },
	];

	function streamClass(stream) {
		if (stream === "DT")
			return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/25 dark:text-blue-300";
		if (stream === "EA")
			return "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/25 dark:text-purple-300";
		if (stream === "ITG")
			return "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/25 dark:text-teal-300";
		return "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300";
	}

	function splitText(text) {
		const str = (text || '').trim();
		const lastSpace = str.lastIndexOf(' ');
		if (lastSpace === -1) return { main: str, last: '' };
		return { main: str.slice(0, lastSpace + 1), last: str.slice(lastSpace + 1) };
	}

	let filteredFindings = $derived(
		(() => {
			const query = findingsFilter.trim().toLowerCase();
			let rows = allFindings;
			if (streamFilter !== "all") rows = rows.filter((r) => r.stream === streamFilter);
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
						row.stream,
						row.canonical_code || row.cluster_code,
						row.canonical_label || row.cluster_label,
					]
						.filter(Boolean)
						.join(" ")
						.toLowerCase()
						.includes(query),
				);
			}
			const direction = sortDirection === "asc" ? 1 : -1;
			return [...rows].sort((a, b) => {
				let aValue = a[sortKey];
				let bValue = b[sortKey];
				if (sortKey === "id") {
					aValue = a.cf_id || a.contribution_id || 0;
					bValue = b.cf_id || b.contribution_id || 0;
				} else if (sortKey === "paper") {
					aValue = a.paper_title || a.title || "";
					bValue = b.paper_title || b.title || "";
				}
				if (aValue == null) return 1;
				if (bValue == null) return -1;
				if (typeof aValue === "number" && typeof bValue === "number")
					return (aValue - bValue) * direction;
				return (
					String(aValue).localeCompare(String(bValue), undefined, {
						numeric: true,
					}) * direction
				);
			});
		})(),
	);

	function toggleSort(key) {
		if (sortKey === key)
			sortDirection = sortDirection === "asc" ? "desc" : "asc";
		else {
			sortKey = key;
			sortDirection = "asc";
		}
	}
</script>

<div class="space-y-6">
	<!-- Header Panel -->
	<div
		class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs"
	>
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div class="flex-1 min-w-0">
				<h2
					class="text-3xl font-extrabold text-gray-900 dark:text-white"
				>
					Findings
				</h2>
				<p
					class="mt-1.5 text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
				>
					<span class="block">The final evidence base of the framework: every Finding carried by one of the 60 retained Conditions,</span>
					<span class="block">with its Condition assignment. Each Finding is traceable to its publication and to core quotations of its audited source passages.</span>
				</p>
			</div>
			<div class="flex flex-wrap gap-2 items-center shrink-0">
				<span
					class="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-200"
				>
					{allFindings.length} findings in the evidence base
				</span>
			</div>
		</div>
	</div>

	<!-- Filters & Search -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3">
		<div class="flex items-center gap-3 flex-wrap">

			<div class="inline-flex rounded-md shadow-sm">
				{#each streamOptions as opt, i}
					<button
						type="button"
						onclick={() => streamFilter = opt.id}
						class="px-3 py-2 text-sm font-medium border transition-colors
							{i === 0 ? 'rounded-l-md' : ''}
							{i === streamOptions.length - 1 ? 'rounded-r-md border-r' : 'border-r-0'}
							border-gray-300 dark:border-gray-800
							{activeBtn(streamFilter === opt.id)}"
					>
						{opt.label}
					</button>
				{/each}
			</div>
		</div>
		<div class="flex items-center gap-3 w-full sm:w-auto justify-end">
			<div class="relative shrink-0">
				<FilterInput
					bind:value={findingsFilter}
					totalCount={allFindings.length}
					filteredCount={filteredFindings.length}
					placeholder="Search..."
					class="w-72"
				/>
			</div>
		</div>
	</div>

	<DataTable
		items={filteredFindings}
		{columns}
		{sortKey}
		{sortDirection}
		onSort={toggleSort}
	>
		{#snippet cell(item, col)}
			{#if col.key === "id"}
				<a
					href="{base}/findings/CF{item.cf_id ||
						item.contribution_id}"
					class="inline-block hover:opacity-80 transition-opacity"
				>
					<RecordBadge
						id={`CF${item.cf_id || item.contribution_id}`}
						variant="finding"
					/>
				</a>

			{:else if col.key === "raw_condition_label"}
				<a
					href="{base}/findings/CF{item.cf_id ||
						item.contribution_id}"
					class="font-semibold text-blue-600 dark:text-blue-400 text-base leading-snug break-words"
				>
					{item.raw_condition_label}
				</a>
				{#if item.cf_reconciliation_status === "reconciled"}
					<div class="mt-1 flex flex-wrap items-center gap-1.5">
						<span
							class="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-300"
						>
							reconciled
						</span>
					</div>
				{/if}
			{:else if col.key === "paper"}
				<a
					href="{base}/sources/{item.corpus_id}"
					class="block font-semibold text-blue-600 dark:text-blue-400 text-base leading-snug"
				>
					{item.paper_title || item.title}
				</a>
				<div
					class="mt-1 text-[15px] text-slate-600 dark:text-slate-300 font-normal"
				>
					{item.paper_authors || item.authors} ({item.paper_year ||
						item.year})
				</div>
			{:else if col.key === "stream"}
				<span
					class="rounded-full border px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap {streamClass(
						item.stream,
					)}">{item.stream || "—"}</span
				>
			{:else}
				{item[col.key] ?? "—"}
			{/if}
		{/snippet}
	</DataTable>
</div>
