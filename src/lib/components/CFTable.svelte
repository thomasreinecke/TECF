<script>
	import { FileText, Search, Filter, ShieldCheck, Tag } from 'lucide-svelte';

	export let conditionFindings = [];
	export let onSelectPaper = (paperId) => {};

	let searchFilter = '';
	let typeFilter = 'ALL';
	let strengthFilter = 'ALL';

	$: filteredCFs = conditionFindings.filter(cf => {
		if (typeFilter !== 'ALL' && cf.contribution_type !== typeFilter) return false;
		if (strengthFilter !== 'ALL' && cf.evidence_strength !== strengthFilter) return false;
		if (searchFilter) {
			const q = searchFilter.toLowerCase();
			const labelMatch = (cf.raw_condition_label || '').toLowerCase().includes(q);
			const stmtMatch = (cf.readiness_statement || '').toLowerCase().includes(q);
			const paperMatch = (cf.paper_title || '').toLowerCase().includes(q);
			const codeMatch = (cf.canonical_code || '').toLowerCase().includes(q);
			return labelMatch || stmtMatch || paperMatch || codeMatch;
		}
		return true;
	});
</script>

<div class="space-y-6">
	<!-- Section Header -->
	<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
		<div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider">
			<FileText class="w-4 h-4" />
			Methodology Step 5
		</div>
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
			Condition Findings (CF) Quality Audit Explorer
		</h2>
		<p class="text-sm text-gray-600 dark:text-gray-300 max-w-3xl">
			Browse all {conditionFindings.length || 1324} extracted Condition Findings (CF) from included papers, categorized by contribution role (P Primary, S Supporting, O Outcome, C Contextual) and evidence strength.
		</p>
	</div>

	<!-- Filter Bar -->
	<div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
		<!-- Search input -->
		<div class="relative w-full md:w-80">
			<Search class="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
			<input
				type="text"
				bind:value={searchFilter}
				placeholder="Search findings, statements, paper..."
				class="w-full bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500"
			/>
		</div>

		<!-- Filter Pills -->
		<div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
			<div class="flex items-center gap-1 text-xs">
				<span class="text-gray-500 text-[11px] font-mono mr-1">Role:</span>
				{#each ['ALL', 'P', 'S', 'O', 'C'] as t}
					<button
						on:click={() => typeFilter = t}
						class={`px-2 py-1 rounded text-[11px] font-mono font-bold transition ${
							typeFilter === t ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
						}`}
					>
						{t}
					</button>
				{/each}
			</div>

			<div class="h-4 w-px bg-gray-200 dark:bg-gray-800 hidden md:block"></div>

			<div class="flex items-center gap-1 text-xs">
				<span class="text-gray-500 text-[11px] font-mono mr-1">Evidence:</span>
				{#each ['ALL', 'strong', 'moderate', 'weak-contextual'] as s}
					<button
						on:click={() => strengthFilter = s}
						class={`px-2 py-1 rounded text-[11px] font-mono transition ${
							strengthFilter === s ? 'bg-blue-600 text-white font-bold' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
						}`}
					>
						{s === 'ALL' ? 'ALL' : s}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Table View -->
	<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
		<div class="flex items-center justify-between text-xs font-mono text-gray-500 dark:text-gray-400">
			<span>Showing {filteredCFs.length} Condition Findings</span>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs text-gray-700 dark:text-gray-300">
				<thead class="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-gray-700">
					<tr>
						<th class="py-3 px-4">CF ID & Role</th>
						<th class="py-3 px-4">Condition Finding Label & Readiness Statement</th>
						<th class="py-3 px-4">Canonical Code</th>
						<th class="py-3 px-4">Source Paper</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 dark:divide-gray-800 font-sans">
					{#each filteredCFs.slice(0, 15) as cf}
						<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
							<td class="py-3 px-4 font-mono">
								<div class="flex items-center gap-1.5">
									<span class="font-bold text-blue-600 dark:text-blue-400">#CF-{cf.cf_id}</span>
									<span class={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
										cf.contribution_type === 'P' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
									}`}>
										{cf.contribution_type || 'P'}
									</span>
								</div>
							</td>
							<td class="py-3 px-4 max-w-lg space-y-1">
								<div class="font-bold text-gray-900 dark:text-white">
									{cf.raw_condition_label || 'Condition Finding'}
								</div>
								<div class="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
									{cf.readiness_statement || cf.synthesis_note || 'N/A'}
								</div>
							</td>
							<td class="py-3 px-4 font-mono">
								{#if cf.canonical_code}
									<span class="px-2 py-0.5 rounded bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800">
										{cf.canonical_code}
									</span>
								{:else}
									<span class="text-gray-400 text-[11px]">Unmapped</span>
								{/if}
							</td>
							<td class="py-3 px-4 max-w-xs">
								<button
									on:click={() => onSelectPaper(cf.corpus_id)}
									class="text-left group flex flex-col hover:text-blue-600 dark:hover:text-blue-400 transition"
								>
									<span class="font-medium text-gray-800 dark:text-gray-200 group-hover:underline truncate text-xs">
										{cf.paper_title || `Corpus #${cf.corpus_id}`}
									</span>
									<span class="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
										{cf.paper_authors ? cf.paper_authors.split(',')[0] : ''} ({cf.paper_year || 'N/A'})
									</span>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
