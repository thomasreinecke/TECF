<script>
	import { Share2, Copy, Check, X, ExternalLink, Linkedin, BookOpen } from 'lucide-svelte';

	export let isOpen = false;
	export let activeSection = 'framework';
	export let onClose = () => {};

	let copied = false;
	$: currentUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#${activeSection}` : '';

	function copyToClipboard() {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(currentUrl);
			copied = true;
			setTimeout(() => copied = false, 2000);
		}
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
		<div class="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 flex flex-col shadow-2xl overflow-hidden p-6 space-y-6">
			
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
						<Share2 class="w-5 h-5" />
					</div>
					<div>
						<h3 class="font-heading font-bold text-lg text-white">Share Review Permalink</h3>
						<p class="text-xs text-slate-400">Generates direct deep-links for thesis defense or LinkedIn posts</p>
					</div>
				</div>
				<button on:click={onClose} class="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800">
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- URL Box -->
			<div class="space-y-2">
				<label class="text-xs font-mono uppercase tracking-wider text-slate-400">Direct Section Permalink</label>
				<div class="flex items-center gap-2">
					<input
						type="text"
						readonly
						value={currentUrl}
						class="w-full bg-slate-900 text-xs font-mono text-indigo-300 px-3 py-2.5 rounded-xl border border-slate-800 select-all"
					/>
					<button
						on:click={copyToClipboard}
						class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-indigo-500/20"
					>
						{#if copied}
							<Check class="w-4 h-4 text-emerald-300" />
							<span>Copied!</span>
						{:else}
							<Copy class="w-4 h-4" />
							<span>Copy</span>
						{/if}
					</button>
				</div>
			</div>

			<!-- Preset LinkedIn Share Snippet -->
			<div class="space-y-2">
				<label class="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
					<Linkedin class="w-3.5 h-3.5 text-blue-400" />
					LinkedIn / Social Media Share Snippet
				</label>
				<div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono space-y-2 leading-relaxed">
					<p>"Presenting TECF: Technology-Enabled Capability Framework — an interactive SLR transparency platform analyzing 156 papers, 1,300+ findings, 60 Canonical Conditions, and 9 Condition Domains."</p>
					<div class="text-indigo-400 font-bold">{currentUrl}</div>
				</div>
			</div>

		</div>
	</div>
{/if}
