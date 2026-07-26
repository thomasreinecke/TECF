<script>
	import { Tags, Search } from 'lucide-svelte';

	export let canonicalConditions = [];

	let searchQuery = '';
	let expandedCC = null;

	$: filteredCCs = canonicalConditions.filter(cc => {
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			const codeMatch = (cc.code || '').toLowerCase().includes(q);
			const labelMatch = (cc.label || '').toLowerCase().includes(q);
			const defMatch = (cc.definition || '').toLowerCase().includes(q);
			return codeMatch || labelMatch || defMatch;
		}
		return true;
	});
</script>

<div class="space-y-6">
	<!-- Section Header -->
	<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
		<div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider">
			<Tags class="w-4 h-4" />
			Methodology Step 6
		</div>
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
			The 60 Distilled Canonical Conditions (CC01 – CC60)
		</h2>
		<p class="text-sm text-gray-600 dark:text-gray-300 max-w-3xl">
			Condition Findings across all included papers were mapped into 60 distinct Canonical Conditions (CCs), serving as the foundational building blocks of the framework.
		</p>
	</div>

	<!-- Search Bar -->
	<div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4">
		<div class="relative w-full max-w-md">
			<Search class="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search 60 Canonical Conditions by code or keyword..."
				class="w-full bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500"
			/>
		</div>
		<span class="text-xs font-mono text-gray-500 dark:text-gray-400">Total: {canonicalConditions.length || 60} Canonical Conditions</span>
	</div>

	<!-- Cards Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each filteredCCs as cc}
			<button 
				type="button"
				class={`text-left p-5 rounded-xl border flex flex-col justify-between space-y-3 transition shadow-sm ${
					expandedCC === cc.id 
						? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500/30' 
						: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
				}`}
				on:click={() => expandedCC = expandedCC === cc.id ? null : cc.id}
			>
				<div class="space-y-2 w-full">
					<div class="flex items-center justify-between gap-2 font-mono text-xs">
						<span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
							{cc.code || 'CC'}
						</span>
						<span class="text-[11px] text-gray-500 dark:text-gray-400">
							{cc.finding_count || 0} findings
						</span>
					</div>

					<h3 class="font-bold text-sm text-gray-900 dark:text-white leading-snug">
						{cc.label}
					</h3>

					<p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
						{cc.definition || 'Standardized Canonical Condition construct.'}
					</p>
				</div>

				{#if expandedCC === cc.id}
					<div class="pt-3 border-t border-gray-200 dark:border-gray-800 space-y-2 text-xs text-gray-600 dark:text-gray-300 w-full">
						<div class="font-mono text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold">Framework Role & Context</div>
						<div class="text-[11px] text-gray-500 dark:text-gray-400">
							Axis: <span class="text-gray-900 dark:text-white font-mono">{cc.axis || cc.framework_axis || 'A1'}</span>
						</div>
					</div>
				{/if}
			</button>
		{/each}
	</div>
</div>
