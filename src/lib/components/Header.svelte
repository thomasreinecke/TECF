<script>
	import { base } from '$app/paths';
	import { 
		Search, 
		Layers, 
		Share2, 
		BookOpen, 
		GitPullRequest, 
		CheckCircle2, 
		FileText, 
		Sparkles,
		Sliders
	} from 'lucide-svelte';

	export let searchQuery = '';
	export let activeSection = 'framework';
	export let onSearchSelect = (item) => {};
	export let onOpenShare = () => {};
	export let stats = {};

	let isSearchFocused = false;
</script>

<header class="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
		
		<!-- Brand & Logo -->
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
				<Layers class="w-5 h-5 text-white" />
			</div>
			<div>
				<div class="flex items-center gap-2">
					<span class="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
						TECF
					</span>
					<span class="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
						SLR Transparency
					</span>
				</div>
				<p class="text-xs text-slate-400 font-medium hidden sm:block">
					Transformation-Enabling Conditions Framework
				</p>
			</div>
		</div>

		<!-- Quick Search Input -->
		<div class="flex-1 max-w-md relative">
			<div class="relative flex items-center">
				<Search class="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
				<input
					type="text"
					bind:value={searchQuery}
					on:focus={() => isSearchFocused = true}
					on:blur={() => setTimeout(() => isSearchFocused = false, 200)}
					placeholder="Search 209 papers, 586 findings, CCs, or CDs..."
					class="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-400 pl-9 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
				/>
			</div>
		</div>

		<!-- Right Actions -->
		<div class="flex items-center gap-2">
			<!-- Quick Stats Pills -->
			<div class="hidden lg:flex items-center gap-3 text-xs text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
				<div class="flex items-center gap-1.5">
					<BookOpen class="w-3.5 h-3.5 text-indigo-400" />
					<span class="font-semibold text-white">{stats.includedPapers ?? ''}</span> Papers
				</div>
				<div class="h-3 w-px bg-slate-700"></div>
				<div class="flex items-center gap-1.5">
					<FileText class="w-3.5 h-3.5 text-amber-400" />
					<span class="font-semibold text-white">{stats.conditionFindingsCount ?? ''}</span> CFs
				</div>
				<div class="h-3 w-px bg-slate-700"></div>
				<div class="flex items-center gap-1.5">
					<Layers class="w-3.5 h-3.5 text-emerald-400" />
					<span class="font-semibold text-white">{stats.conditionDomainsCount ?? 9}</span> CDs / <span class="font-semibold text-white">{stats.canonicalConditionsCount ?? 60}</span> CCs
				</div>
			</div>

			<!-- Share / Permalink Button -->
			<button
				on:click={onOpenShare}
				class="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-500/20 transition active:scale-95"
			>
				<Share2 class="w-3.5 h-3.5" />
				<span class="hidden sm:inline">Share Review Link</span>
			</button>
		</div>

	</div>
</header>
