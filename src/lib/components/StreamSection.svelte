<script>
	import { Database, Search, CheckCircle2, FileText, Globe, Layers } from 'lucide-svelte';

	export let streams = [];
</script>

<div class="space-y-6">
	<!-- Section Header -->
	<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider">
				<Search class="w-4 h-4" />
				Methodology Step 1
			</div>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
				Literature Streams & Search Strategy
			</h2>
			<p class="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-3xl">
				Four distinct literature streams were systematically searched across major academic databases to cover all aspects of technology-enabled capabilities.
			</p>
		</div>

		<!-- Aggregate Stats -->
		<div class="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/80 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
			<div class="text-center">
				<div class="text-xl font-bold text-gray-900 dark:text-white">2,758</div>
				<div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hits</div>
			</div>
			<div class="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
			<div class="text-center">
				<div class="text-xl font-bold text-blue-600 dark:text-blue-400">4</div>
				<div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Streams</div>
			</div>
			<div class="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
			<div class="text-center">
				<div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">156</div>
				<div class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">Included</div>
			</div>
		</div>
	</div>

	<!-- Stream Cards Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		{#each streams as stream}
			<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition flex flex-col justify-between space-y-4">
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
								Stream {stream.code}
							</span>
							<h3 class="font-bold text-lg text-gray-900 dark:text-white">
								{stream.name}
							</h3>
						</div>
					</div>

					<p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
						{stream.description}
					</p>

					<!-- Query Box -->
					<div class="bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-200 dark:border-gray-800 space-y-1">
						<div class="text-[10px] text-gray-500 dark:text-gray-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
							<Search class="w-3 h-3 text-blue-500" />
							Search Query String
						</div>
						<div class="text-xs font-mono text-blue-700 dark:text-blue-300 break-words leading-tight">
							{stream.query}
						</div>
					</div>
				</div>

				<!-- Bottom Metrics -->
				<div class="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div class="flex flex-wrap items-center gap-1.5">
						{#each stream.databases as dbName}
							<span class="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
								{dbName}
							</span>
						{/each}
					</div>

					<div class="flex items-center gap-3 text-xs font-mono">
						<span class="text-gray-500 dark:text-gray-400">{stream.hitsIdentified} hits</span>
						<span class="text-gray-400">→</span>
						<span class="text-emerald-600 dark:text-emerald-400 font-bold">{stream.included} included</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
