<script>
	import CDMatrix from '$lib/components/CDMatrix.svelte';
	import { conditionDomains, framework } from '$lib/dataStore.js';
	import { AlertTriangle, ShieldAlert } from 'lucide-svelte';

	$: registers = $framework.registers || [];
	$: tensions = registers.filter(r => r.register_type === 'tension');
	$: antipatterns = registers.filter(r => r.register_type === 'antipattern');
</script>

<div class="space-y-8">
	<!-- Condition Domains Matrix -->
	<CDMatrix conditionDomains={$conditionDomains} />

	<!-- Tension & Antipattern Registers Section (Inline view, clean academic design) -->
	<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
		<div>
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
				Tension & Antipattern Registers
			</h2>
			<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
				Empirical tensions and implementation antipatterns observed during synthesis
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- Tensions -->
			<div class="space-y-3">
				<h3 class="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
					<AlertTriangle class="w-4 h-4" />
					Organizational & Architectural Tensions ({tensions.length})
				</h3>
				<div class="space-y-3">
					{#each tensions as tension}
						<div class="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
							<div class="flex items-center justify-between gap-2">
								<span class="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{tension.entry_code}</span>
								<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">Confirmed</span>
							</div>
							<div class="font-bold text-sm text-gray-900 dark:text-white">{tension.title}</div>
							<p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{tension.body}</p>
						</div>
					{/each}
				</div>
			</div>

			<!-- Antipatterns -->
			<div class="space-y-3">
				<h3 class="font-bold text-xs text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
					<ShieldAlert class="w-4 h-4" />
					Digital Transformation Antipatterns ({antipatterns.length})
				</h3>
				<div class="space-y-3">
					{#each antipatterns as ap}
						<div class="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
							<div class="flex items-center justify-between gap-2">
								<span class="text-xs font-mono font-bold text-red-600 dark:text-red-400">{ap.entry_code}</span>
								<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">Confirmed</span>
							</div>
							<div class="font-bold text-sm text-gray-900 dark:text-white">{ap.title}</div>
							<p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{ap.body}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
