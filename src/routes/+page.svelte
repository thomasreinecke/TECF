<script>
	import { base } from '$app/paths';
	import { 
		BookOpen, 
		FileText, 
		Tags, 
		Layers, 
		Grid, 
		ArrowRight
	} from 'lucide-svelte';
	import { corpus, conditionFindings, canonicalConditions, conditionDomains } from '$lib/dataStore.js';

	let paperCount = $derived(($corpus || []).length);
	let cfCount = $derived(($conditionFindings || []).length);
	let ccCount = $derived(($canonicalConditions || []).length);
	let cdCount = $derived(($conditionDomains || []).length);

	const navigationCards = $derived([
		{
			title: 'Included SLR Papers',
			href: `${base}/papers`,
			count: `${paperCount} Papers`,
			description: 'Full catalog of confirmed SLR literature papers, citation metadata, and full-text extractions.',
			icon: BookOpen,
			badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
		},
		{
			title: 'Condition Findings',
			href: `${base}/findings`,
			count: `${cfCount} Findings`,
			description: 'Source-traceable literature findings retained from the systematic review corpus.',
			icon: FileText,
			badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
		},
		{
			title: 'Canonical Conditions',
			href: `${base}/conditions`,
			count: `${ccCount} Constructs`,
			description: '60 author-confirmed capability constructs (CC01–CC67) with authoritative synthesis definitions and roles.',
			icon: Tags,
			badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
		},
		{
			title: 'Condition Domains',
			href: `${base}/domains`,
			count: `${cdCount} Domains`,
			description: 'Strategic domain groupings (CD1–CD9) organizing all canonical conditions into core capability areas.',
			icon: Layers,
			badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
		},
		{
			title: 'Synthesis Framework',
			href: `${base}/framework`,
			count: 'RQ1 Matrix',
			description: 'High-level synthesis matrix detailing strategic condition domains, tension registers, and constructs.',
			icon: Grid,
			badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
		}
	]);
</script>

<div class="space-y-8 pb-8">
	
	<!-- 100% Full Width Leadspace with Gradient directly connected to Header -->
	<div class="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-white shadow-lg border-b border-indigo-900/50 relative overflow-hidden">
		<!-- Decorative subtle glow accents -->
		<div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
		<div class="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

		<div class="relative z-10 max-w-screen-2xl mx-auto space-y-3">
			<h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight flex flex-wrap items-center gap-3">
				<span>Transformation-Enabling Conditions Framework</span>
				<span class="inline-flex items-center px-3 py-1 rounded-xl bg-blue-600 text-white font-extrabold text-2xl sm:text-3xl tracking-wide shadow-md shrink-0">
					TECF
				</span>
			</h1>
			<p class="text-base sm:text-lg text-slate-300 leading-relaxed max-w-4xl">
				Welcome to the evidence exploration platform for the Master Thesis. Browse canonical capability constructs, source-traceable literature findings, and strategic condition domains.
			</p>
		</div>
	</div>

	<!-- Simple Navigation Cards Grid in Normal App Width -->
	<div class="max-w-screen-2xl mx-auto px-4 w-full">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each navigationCards as card}
				<a 
					href={card.href}
					class="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 sm:p-7 dark:border-slate-800 dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200"
				>
					<div class="space-y-3">
						<div class="flex items-start justify-between gap-3">
							<h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
								{card.title}
							</h2>
							<span class="shrink-0 px-3 py-1 rounded-full border text-xs sm:text-sm font-mono font-bold {card.badgeColor}">
								{card.count}
							</span>
						</div>

						<p class="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
							{card.description}
						</p>
					</div>

					<div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-semibold text-blue-600 dark:text-blue-400">
						<span>Explore {card.title}</span>
						<ArrowRight class="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
					</div>
				</a>
			{/each}
		</div>
	</div>

</div>
