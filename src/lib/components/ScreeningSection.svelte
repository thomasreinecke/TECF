<script>
	import { Filter, CheckCircle2, ShieldCheck, Users } from 'lucide-svelte';

	export let screeningData = [];
</script>

<div class="space-y-6">
	<!-- Section Header -->
	<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
		<div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider">
			<Filter class="w-4 h-4" />
			Methodology Step 2 & 3
		</div>
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
			PRISMA 2020 Flow & Dual-Screener Consensus
		</h2>
		<p class="text-sm text-gray-600 dark:text-gray-300 max-w-3xl">
			All 2,758 initial hits were deduplicated and evaluated by dual screeners (Run A vs Run B) with formal author resolution on disagreements.
		</p>
	</div>

	<!-- PRISMA Flow Diagram -->
	<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
		<h3 class="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
			<ShieldCheck class="w-5 h-5 text-blue-600 dark:text-blue-400" />
			PRISMA 2020 Flow Funnel
		</h3>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center space-y-2">
				<div class="text-xs uppercase font-mono tracking-wider text-blue-600 dark:text-blue-400 font-semibold">1. Identification</div>
				<div class="text-3xl font-extrabold text-gray-900 dark:text-white">2,758</div>
				<div class="text-xs text-gray-500 dark:text-gray-400">Hits across 5 databases</div>
				<div class="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 py-1 px-2 rounded border border-amber-200 dark:border-amber-800">
					- 384 Duplicates
				</div>
			</div>

			<div class="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center space-y-2">
				<div class="text-xs uppercase font-mono tracking-wider text-blue-600 dark:text-blue-400 font-semibold">2. Title/Abstract Screening</div>
				<div class="text-3xl font-extrabold text-gray-900 dark:text-white">2,374</div>
				<div class="text-xs text-gray-500 dark:text-gray-400">Dual-screener evaluation</div>
				<div class="text-[10px] text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 py-1 px-2 rounded border border-red-200 dark:border-red-800">
					- 2,074 Excluded
				</div>
			</div>

			<div class="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center space-y-2">
				<div class="text-xs uppercase font-mono tracking-wider text-blue-600 dark:text-blue-400 font-semibold">3. Full-Text Assessment</div>
				<div class="text-3xl font-extrabold text-gray-900 dark:text-white">300</div>
				<div class="text-xs text-gray-500 dark:text-gray-400">Reports retrieved & assessed</div>
				<div class="text-[10px] text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 py-1 px-2 rounded border border-red-200 dark:border-red-800">
					- 144 Excluded
				</div>
			</div>

			<div class="bg-blue-50 dark:bg-blue-950/60 p-4 rounded-xl border border-blue-200 dark:border-blue-800 text-center space-y-2">
				<div class="text-xs uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">4. Included Corpus</div>
				<div class="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">156</div>
				<div class="text-xs text-gray-700 dark:text-gray-300 font-medium">Included papers in SLR</div>
				<div class="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 py-1 px-2 rounded border border-emerald-300 dark:border-emerald-800 font-semibold">
					100% Extraction Complete
				</div>
			</div>
		</div>
	</div>

	<!-- Screening Consensus Table -->
	<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
				<Users class="w-5 h-5 text-blue-600 dark:text-blue-400" />
				Dual-Screener Consensus Sample
			</h3>
			<span class="text-xs font-mono text-gray-500 dark:text-gray-400">Showing sample records</span>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs text-gray-700 dark:text-gray-300">
				<thead class="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-gray-700">
					<tr>
						<th class="py-3 px-4">Paper ID & Title</th>
						<th class="py-3 px-4 text-center">Run A Decision</th>
						<th class="py-3 px-4 text-center">Run B Decision</th>
						<th class="py-3 px-4 text-center">Consensus Decision</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 dark:divide-gray-800 font-sans">
					{#each screeningData.slice(0, 8) as row}
						<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
							<td class="py-3 px-4 max-w-md">
								<div class="font-semibold text-gray-900 dark:text-white truncate">{row.title}</div>
								<div class="text-[11px] text-gray-500 dark:text-gray-400">{row.authors} ({row.year})</div>
							</td>
							<td class="py-3 px-4 text-center">
								<span class={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
									row.decision_a === 'INCLUDE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
								}`}>
									{row.decision_a || 'EXCLUDE'}
								</span>
							</td>
							<td class="py-3 px-4 text-center">
								<span class={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
									row.decision_b === 'INCLUDE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
								}`}>
									{row.decision_b || 'EXCLUDE'}
								</span>
							</td>
							<td class="py-3 px-4 text-center">
								<span class={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
									row.human_decision === 'INCLUDE' || (!row.human_decision && row.decision_a === 'INCLUDE' && row.decision_b === 'INCLUDE')
										? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800' 
										: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
								}`}>
									{row.human_decision || (row.decision_a === 'INCLUDE' && row.decision_b === 'INCLUDE' ? 'INCLUDE (Auto)' : 'EXCLUDE')}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
