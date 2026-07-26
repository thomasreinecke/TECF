<script>
	import { CheckCircle2 } from 'lucide-svelte';
	import RecordBadge from './RecordBadge.svelte';

	export let conditionDomains = [];
</script>

<div class="space-y-6">
	<!-- Section Header -->
	<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
		<div class="text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider">
			Methodology Step 7 & Primary RQ1 Answer
		</div>
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
			The 9 Strategic Condition Domains (CD1 – CD9) Matrix
		</h2>
		<p class="text-sm text-gray-600 dark:text-gray-300 max-w-3xl">
			The primary answer to RQ1: Nine Strategic Condition Domains synthesizing 60 confirmed capability constructs across the SLR corpus.
		</p>
	</div>

	<!-- Domains Matrix Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each conditionDomains as domain}
			<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition flex flex-col justify-between space-y-4">
				<div class="space-y-3">
					<div class="flex items-center justify-between gap-2">
						<RecordBadge id={`Domain ${domain.code}`} variant="domain" />
					</div>

					<h3 class="font-bold text-lg text-gray-900 dark:text-white leading-snug">
						{domain.label}
					</h3>

					<p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
						{domain.definition}
					</p>

					<!-- Canonical Conditions under domain -->
					{#if domain.canonicalConditions && domain.canonicalConditions.length > 0}
						<div class="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
							<div class="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between">
								<span>Constituent Canonical Conditions</span>
								<span class="text-blue-600 dark:text-blue-400 font-bold">{domain.canonicalConditions.length} CCs</span>
							</div>

							<div class="flex flex-wrap gap-1.5">
								{#each domain.canonicalConditions.slice(0, 6) as cc}
									<RecordBadge id={cc.code || cc.label} variant="condition" class="text-[11px]" />
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-mono text-gray-500 dark:text-gray-400">
					<span>Coverage: Multi-Stream</span>
					<span class="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
						RQ1 Core Domain
						<CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
					</span>
				</div>
			</div>
		{/each}
	</div>
</div>
