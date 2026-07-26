<script>
	import { GitMerge, ShieldCheck, ArrowRight } from 'lucide-svelte';

	export let relationshipsData = {};

	$: stats = relationshipsData.stats || {};
	$: retained = relationshipsData.retainedPropositions || [];
</script>

<div class="space-y-6">
	<!-- Section Header -->
	<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
		<div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider">
			<GitMerge class="w-4 h-4" />
			Methodology Step 8 & Dual-Model Consensus
		</div>
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
			Pairwise Relationship Classification & Consensus Network
		</h2>
		<p class="text-sm text-gray-600 dark:text-gray-300 max-w-3xl">
			Exploratory secondary analysis: 3,540 directed condition pairs were independently classified by dual LLM reviewers under a strict evidence gate. Only propositions where both models agreed on sign (+1) and cited valid evidence were retained.
		</p>
	</div>

	<!-- Reliability Metrics Bar -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm text-center space-y-1">
			<div class="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Directions Evaluated</div>
			<div class="text-2xl font-bold text-gray-900 dark:text-white">3,540</div>
			<div class="text-[11px] text-gray-500 dark:text-gray-400">All pairwise CC combinations</div>
		</div>

		<div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm text-center space-y-1">
			<div class="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400">Dual-Model Agreement</div>
			<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">83.4%</div>
			<div class="text-[11px] text-gray-500 dark:text-gray-400">Cohen's κ = 0.408</div>
		</div>

		<div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm text-center space-y-1">
			<div class="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Positive Agreement (P+)</div>
			<div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">50.6%</div>
			<div class="text-[11px] text-gray-500 dark:text-gray-400">P+ formula baseline</div>
		</div>

		<div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm text-center space-y-1">
			<div class="text-[10px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400">Retained Consensus Propositions</div>
			<div class="text-2xl font-bold text-purple-600 dark:text-purple-400">256</div>
			<div class="text-[11px] text-gray-500 dark:text-gray-400">Evidence-grounded links (+2 mitigations)</div>
		</div>
	</div>

	<!-- Retained Propositions Table -->
	<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
				<ShieldCheck class="w-5 h-5 text-blue-600 dark:text-blue-400" />
				Sample Evidence-Grounded Retained Consensus Propositions
			</h3>
			<span class="text-xs font-mono text-gray-500 dark:text-gray-400">Showing retained propositions</span>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs text-gray-700 dark:text-gray-300">
				<thead class="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-gray-700">
					<tr>
						<th class="py-3 px-4">Source Canonical Condition</th>
						<th class="py-3 px-4 text-center">Direction</th>
						<th class="py-3 px-4">Target Canonical Condition</th>
						<th class="py-3 px-4 text-center">Dual Model Sign</th>
						<th class="py-3 px-4">Rationale & Evidence</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 dark:divide-gray-800 font-sans">
					{#each retained.slice(0, 10) as rel}
						<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
							<td class="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
								{rel.code_a || rel.condition_a_id} ({rel.label_a || 'CC'})
							</td>
							<td class="py-3 px-4 text-center text-gray-400">
								<ArrowRight class="w-4 h-4 mx-auto text-blue-500" />
							</td>
							<td class="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
								{rel.code_b || rel.condition_b_id} ({rel.label_b || 'CC'})
							</td>
							<td class="py-3 px-4 text-center">
								<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
									+1 / +1 Agreed
								</span>
							</td>
							<td class="py-3 px-4 text-gray-600 dark:text-gray-300 text-xs max-w-sm">
								{rel.final_a_to_b_rationale || 'Dual model consensus evidence grounded proposition.'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
