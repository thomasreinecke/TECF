<script>
	import { AlertTriangle, ShieldAlert, X, CheckCircle2 } from 'lucide-svelte';

	export let isOpen = false;
	export let registers = [];
	export let onClose = () => {};

	$: tensions = registers.filter(r => r.register_type === 'tension');
	$: antipatterns = registers.filter(r => r.register_type === 'antipattern');
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
		<div class="glass-panel w-full max-w-3xl max-h-[85vh] rounded-2xl border border-slate-800 flex flex-col shadow-2xl overflow-hidden">
			
			<!-- Header -->
			<div class="p-6 border-b border-slate-800 flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400">
						<AlertTriangle class="w-5 h-5" />
					</div>
					<div>
						<h3 class="font-heading font-bold text-xl text-white">
							Tension & Antipattern Registers
						</h3>
						<p class="text-xs text-slate-400">
							Observed empirical tensions and antipatterns across literature synthesis
						</p>
					</div>
				</div>
				<button on:click={onClose} class="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800">
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Body -->
			<div class="p-6 overflow-y-auto space-y-6">
				<!-- Tensions -->
				<div class="space-y-3">
					<h4 class="font-heading font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
						<AlertTriangle class="w-4 h-4" />
						Organizational & Architectural Tensions ({tensions.length})
					</h4>
					<div class="space-y-3">
						{#each tensions as tension}
							<div class="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
								<div class="flex items-center justify-between gap-2">
									<span class="text-xs font-mono font-bold text-amber-400">{tension.entry_code}</span>
									<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Confirmed</span>
								</div>
								<div class="font-heading font-bold text-sm text-white">{tension.title}</div>
								<p class="text-xs text-slate-300 leading-relaxed">{tension.body}</p>
							</div>
						{/each}
					</div>
				</div>

				<!-- Antipatterns -->
				<div class="space-y-3">
					<h4 class="font-heading font-bold text-sm text-rose-400 uppercase tracking-wider flex items-center gap-2">
						<ShieldAlert class="w-4 h-4" />
						Digital Transformation Antipatterns ({antipatterns.length})
					</h4>
					<div class="space-y-3">
						{#each antipatterns as ap}
							<div class="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
								<div class="flex items-center justify-between gap-2">
									<span class="text-xs font-mono font-bold text-rose-400">{ap.entry_code}</span>
									<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Confirmed</span>
								</div>
								<div class="font-heading font-bold text-sm text-white">{ap.title}</div>
								<p class="text-xs text-slate-300 leading-relaxed">{ap.body}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>

		</div>
	</div>
{/if}
