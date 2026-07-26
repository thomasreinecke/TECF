<script>
	import { 
		Search, 
		Filter, 
		FileText, 
		Tags, 
		Layers, 
		GitMerge, 
		Grid, 
		BookOpen,
		CheckCircle2
	} from 'lucide-svelte';

	export let activeSection = 'framework';
	export let onSelectSection = (sectionId) => {};

	const steps = [
		{ id: 'streams', label: '1. Streams & Search', icon: Search, badge: '4 Streams' },
		{ id: 'screening', label: '2. PRISMA Screening', icon: Filter, badge: '2,758 Hits' },
		{ id: 'paper-reader', label: '3. Full-Text Reader', icon: BookOpen, badge: '156 Papers' },
		{ id: 'cf-findings', label: '4. Condition Findings', icon: FileText, badge: '1,324 CFs' },
		{ id: 'cc-tree', label: '5. Canonical Conditions', icon: Tags, badge: '60 CCs' },
		{ id: 'cd-matrix', label: '6. Condition Domains', icon: Layers, badge: '9 CDs' },
		{ id: 'relationships', label: '7. Relationships', icon: GitMerge, badge: '256 Links' },
		{ id: 'framework', label: '8. Synthesis Framework', icon: Grid, badge: 'RQ1 Matrix' }
	];
</script>

<div class="bg-slate-900/90 border-b border-slate-800/80 sticky top-16 z-30 shadow-md">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar scroll-smooth">
			{#each steps as step}
				<button
					on:click={() => onSelectSection(step.id)}
					class={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
						activeSection === step.id
							? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold ring-1 ring-indigo-400/30'
							: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
					}`}
				>
					<svelte:component this={step.icon} class={`w-3.5 h-3.5 ${activeSection === step.id ? 'text-white' : 'text-slate-400'}`} />
					<span>{step.label}</span>
					<span class={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
						activeSection === step.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
					}`}>
						{step.badge}
					</span>
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
