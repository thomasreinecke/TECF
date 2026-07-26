<script>
	import { base } from '$app/paths';
	import { 
		Library, 
		BookOpen, 
		FileText, 
		Tags, 
		Layers, 
		GitMerge, 
		Grid, 
		Filter,
		ShieldCheck,
		ArrowRight
	} from 'lucide-svelte';
	import { corpus, conditionFindings, canonicalConditions, conditionDomains, relationships } from '$lib/dataStore.js';

	$: paperCount = $corpus.length || 156;
	$: cfCount = $conditionFindings.length || 1324;
	$: ccCount = $canonicalConditions.length || 60;
	$: cdCount = $conditionDomains.length || 9;
	$: relCount = ($relationships.retainedPropositions || []).length || 256;
</script>

<div class="space-y-8">
	
	<!-- Header / Welcome Section -->
	<div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 md:p-8 space-y-4">
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div>
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-800 mb-2">
					<ShieldCheck class="w-3.5 h-3.5" />
					Master Thesis Literature Review Transparency Platform
				</div>
				<h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
					Technology-Enabled Capability Framework (TECF)
				</h1>
				<p class="text-base text-gray-600 dark:text-gray-300 mt-2 max-w-4xl leading-relaxed">
					This interactive application provides 100% methodology transparency and data traceability for the Master Thesis. Explore the systematic literature review process from literature streams and PRISMA screening down to full-text quote extractions, 60 Canonical Conditions, and the 9 Condition Domains.
				</p>
			</div>

			<!-- Quick Status Pill -->
			<div class="shrink-0 bg-gray-50 dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
				<div class="text-xs text-gray-500 dark:text-gray-400 font-mono">RQ1 Core Answer</div>
				<div class="text-lg font-bold text-blue-600 dark:text-blue-400 font-sans mt-0.5">9 Condition Domains</div>
				<div class="text-[11px] text-gray-500 dark:text-gray-400 font-mono">60 Canonical Conditions</div>
			</div>
		</div>
	</div>

	<!-- Dashboard High-Level Metrics (matching _app card UX) -->
	<div class="space-y-3">
		<h2 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
			<Library class="w-5 h-5 text-blue-600 dark:text-blue-400" />
			Key Review Metrics & Data Scope
		</h2>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
			
			<!-- Included Papers -->
			<a href="{base}/papers" class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-800 transition-colors group">
				<div>
					<p class="text-xs font-mono font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Included SLR Corpus</p>
					<p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{paperCount}</p>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Full-text read & extracted papers</p>
				</div>
				<div class="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
					<span>Browse Full Text Reader</span>
					<div class="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
						<BookOpen class="w-4 h-4" />
					</div>
				</div>
			</a>

			<!-- Condition Findings -->
			<a href="{base}/findings" class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-800 transition-colors group">
				<div>
					<p class="text-xs font-mono font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Condition Findings (CF)</p>
					<p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{cfCount}</p>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Extracted empirical findings & quotes</p>
				</div>
				<div class="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-xs font-medium text-amber-600 dark:text-amber-400 group-hover:underline">
					<span>View Condition Findings</span>
					<div class="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
						<FileText class="w-4 h-4" />
					</div>
				</div>
			</a>

			<!-- Canonical Conditions -->
			<a href="{base}/conditions" class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800 transition-colors group">
				<div>
					<p class="text-xs font-mono font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Canonical Conditions (CC)</p>
					<p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{ccCount}</p>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Distilled capability constructs (CC01–CC60)</p>
				</div>
				<div class="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-xs font-medium text-purple-600 dark:text-purple-400 group-hover:underline">
					<span>Inspect 60 Constructs</span>
					<div class="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center">
						<Tags class="w-4 h-4" />
					</div>
				</div>
			</a>

			<!-- Condition Domains Framework -->
			<a href="{base}/framework" class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors group">
				<div>
					<p class="text-xs font-mono font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Condition Domains (CD)</p>
					<p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{cdCount} Domains</p>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">9 Condition Domains CD1–CD9</p>
				</div>
				<div class="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-xs font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline">
					<span>View RQ1 Framework Matrix</span>
					<div class="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
						<Grid class="w-4 h-4" />
					</div>
				</div>
			</a>

			<!-- Included Papers -->
			<a href="{base}/papers" class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors group">
				<div>
					<p class="text-xs font-mono font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Included Papers</p>
					<p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{paperCount}</p>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Confirmed SLR papers</p>
				</div>
				<div class="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
					<span>View Included Papers</span>
					<div class="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
						<Filter class="w-4 h-4" />
					</div>
				</div>
			</a>

			<!-- Pairwise Relationships -->
			<a href="{base}/relationships" class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:border-cyan-300 dark:hover:border-cyan-800 transition-colors group">
				<div>
					<p class="text-xs font-mono font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pairwise Relationships</p>
					<p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">{relCount} Links</p>
					<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Dual-model consensus (κ = 0.408)</p>
				</div>
				<div class="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-xs font-medium text-cyan-600 dark:text-cyan-400 group-hover:underline">
					<span>Inspect Network & Gate</span>
					<div class="h-8 w-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center">
						<GitMerge class="w-4 h-4" />
					</div>
				</div>
			</a>

		</div>
	</div>

	<!-- High Level Orientation Guide -->
	<div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-6">
		<h2 class="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
			<Layers class="w-5 h-5 text-blue-600 dark:text-blue-400" />
			Methodological Navigation & Thesis Verification Guide
		</h2>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			
			<div class="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-2">
				<div class="flex items-center gap-2">
					<span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">1. Papers</span>
					<h3 class="font-bold text-gray-900 dark:text-white text-sm">Confirmed Included SLR Papers</h3>
				</div>
				<p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
					Table view of all 227 confirmed SLR papers with type filters, metrics (cites, refs, pages, words), and quick filtering.
				</p>
				<a href="{base}/papers" class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1">
					Go to Papers <ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>

			<div class="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-2">
				<div class="flex items-center gap-2">
					<span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">2. Extraction</span>
					<h3 class="font-bold text-gray-900 dark:text-white text-sm">Corpus Catalog & Text Document Reader</h3>
				</div>
				<p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
					Provides access to all 156 included SLR papers and their full-text text representation, alongside inline extracted findings and quote locators.
				</p>
				<a href="{base}/extraction" class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1">
					Go to Extraction <ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>

			<div class="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-2">
				<div class="flex items-center gap-2">
					<span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">3. Conditions</span>
					<h3 class="font-bold text-gray-900 dark:text-white text-sm">60 Canonical Conditions (CC01–CC60)</h3>
				</div>
				<p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
					Table view of all 60 capability constructs, their definitions, finding frequencies, and domain cluster assignments.
				</p>
				<a href="{base}/conditions" class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1">
					Go to Conditions <ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>

			<div class="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-2">
				<div class="flex items-center gap-2">
					<span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">4. Domains</span>
					<h3 class="font-bold text-gray-900 dark:text-white text-sm">9 Condition Domains (CD1–CD9)</h3>
				</div>
				<p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
					Domain inventory view grouping all 60 capability constructs into 9 strategic domains with expandable condition findings drawers.
				</p>
				<a href="{base}/domains" class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1">
					Go to Domains <ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>

			<div class="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-2">
				<div class="flex items-center gap-2">
					<span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">5. Framework</span>
					<h3 class="font-bold text-gray-900 dark:text-white text-sm">9 Condition Domains & Tension Registers</h3>
				</div>
				<p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
					Presents the primary RQ1 framework matrix across 9 Strategic Condition Domains (CD1–CD9), together with tension and antipattern registers.
				</p>
				<a href="{base}/framework" class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1">
					Go to Framework <ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>

		</div>
	</div>

</div>
