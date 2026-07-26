<script>
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { BookOpen, FileText, Search, ExternalLink, Quote } from 'lucide-svelte';
	import { onMount } from 'svelte';

	export let corpus = [];
	export let conditionFindings = [];
	export let selectedPaperId = null;

	let filterStream = 'ALL';
	let filterQuery = '';
	let activeTab = 'txt';
	let documentText = '';
	let isLoadingDoc = false;

	onMount(() => {
		const param = $page.url.searchParams.get('paper');
		if (param) selectedPaperId = parseInt(param, 10);
	});

	$: filteredCorpus = corpus.filter(p => {
		if (filterStream !== 'ALL' && p.stream !== filterStream) return false;
		if (filterQuery) {
			const q = filterQuery.toLowerCase();
			const titleMatch = (p.title || '').toLowerCase().includes(q);
			const authorMatch = (p.authors || '').toLowerCase().includes(q);
			return titleMatch || authorMatch;
		}
		return true;
	});

	$: selectedPaper = corpus.find(p => p.id === selectedPaperId) || corpus[0];
	$: paperFindings = conditionFindings.filter(cf => cf.corpus_id === (selectedPaper ? selectedPaper.id : null));

	$: if (selectedPaper && selectedPaper.txtFileName) {
		loadDocumentText(selectedPaper.txtFileName);
	} else {
		documentText = 'No text representation file available for this paper.';
	}

	async function loadDocumentText(filename) {
		isLoadingDoc = true;
		documentText = 'Loading document text representation...';
		try {
			const res = await fetch(`${base}/docs/txt/${filename}`);
			if (res.ok) {
				documentText = await res.text();
			} else {
				documentText = `Full text representation file could not be loaded (${res.status}).`;
			}
		} catch (e) {
			documentText = `Error loading document text: ${e.message}`;
		} finally {
			isLoadingDoc = false;
		}
	}
</script>

<div class="space-y-6">
	<!-- Section Header -->
	<div class="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-2">
		<div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider">
			<BookOpen class="w-4 h-4" />
			Methodology Step 4
		</div>
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
			Corpus Paper Reader & Full-Text Document Inspector
		</h2>
		<p class="text-sm text-gray-600 dark:text-gray-300 max-w-3xl">
			Browse the 156 included SLR papers, view their full text representation, and trace extracted Condition Findings (CF) back to source text quotes.
		</p>
	</div>

	<!-- Split View Container -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		
		<!-- Left Column: Paper Catalog Browser (4 cols) -->
		<div class="lg:col-span-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 max-h-[750px] flex flex-col">
			<!-- Filters -->
			<div class="space-y-2">
				<div class="relative">
					<Search class="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
					<input
						type="text"
						bind:value={filterQuery}
						placeholder="Filter title or author..."
						class="w-full bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500"
					/>
				</div>

				<!-- Stream Filter Pills -->
				<div class="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
					{#each ['ALL', 'EA', 'DT', 'BT', 'DC'] as st}
						<button
							on:click={() => filterStream = st}
							class={`px-2.5 py-1 rounded font-mono font-medium transition ${
								filterStream === st ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
							}`}
						>
							{st}
						</button>
					{/each}
				</div>
			</div>

			<!-- Paper List -->
			<div class="flex-1 overflow-y-auto space-y-2 pr-1">
				{#each filteredCorpus as paper}
					<button
						on:click={() => selectedPaperId = paper.id}
						class={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1.5 ${
							selectedPaper && selectedPaper.id === paper.id
								? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 ring-1 ring-blue-400/30'
								: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
						}`}
					>
						<div class="flex items-center justify-between gap-2 text-[10px] font-mono">
							<span class="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold">
								{paper.stream || 'EA'}
							</span>
							<span class="text-gray-500 dark:text-gray-400">ID #{paper.id} • {paper.year}</span>
						</div>
						<div class="font-bold text-xs text-gray-900 dark:text-white line-clamp-2 leading-snug">
							{paper.title}
						</div>
						<div class="text-[11px] text-gray-500 dark:text-gray-400 truncate">
							{paper.authors}
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Right Column: Document & Finding Viewer (8 cols) -->
		<div class="lg:col-span-8 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 max-h-[750px] flex flex-col">
			{#if selectedPaper}
				<!-- Paper Meta Header -->
				<div class="pb-4 border-b border-gray-200 dark:border-gray-800 space-y-2">
					<div class="flex items-center justify-between gap-2">
						<span class="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">
							Stream: {selectedPaper.stream || 'EA'}
						</span>
						{#if selectedPaper.doi}
							<a
								href={`https://doi.org/${selectedPaper.doi}`}
								target="_blank"
								rel="noopener"
								class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono"
							>
								DOI: {selectedPaper.doi}
								<ExternalLink class="w-3 h-3" />
							</a>
						{/if}
					</div>
					<h3 class="font-bold text-lg text-gray-900 dark:text-white leading-snug">
						{selectedPaper.title}
					</h3>
					<div class="text-xs text-gray-600 dark:text-gray-300 font-medium">
						{selectedPaper.authors} ({selectedPaper.year}) — <span class="italic text-gray-500 dark:text-gray-400">{selectedPaper.journal || 'Journal Publication'}</span>
					</div>
				</div>

				<!-- View Mode Tabs -->
				<div class="flex items-center justify-between bg-gray-50 dark:bg-gray-800/80 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
					<div class="flex items-center gap-1">
						<button
							on:click={() => activeTab = 'txt'}
							class={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
								activeTab === 'txt' ? 'bg-blue-600 text-white font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
							}`}
						>
							<FileText class="w-3.5 h-3.5" />
							Full-Text TXT Representation
						</button>
						<button
							on:click={() => activeTab = 'findings'}
							class={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
								activeTab === 'findings' ? 'bg-blue-600 text-white font-semibold' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
							}`}
						>
							<Quote class="w-3.5 h-3.5 text-amber-500" />
							Extracted Condition Findings ({paperFindings.length})
						</button>
					</div>
				</div>

				<!-- Content Area -->
				<div class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 font-mono text-xs text-gray-800 dark:text-gray-300 space-y-4">
					{#if activeTab === 'txt'}
						<pre class="whitespace-pre-wrap font-mono leading-relaxed text-xs">
{documentText}
						</pre>
					{:else}
						<!-- Findings Tab -->
						<div class="space-y-4 font-sans">
							{#if paperFindings.length === 0}
								<div class="text-center py-8 text-gray-500 text-xs font-mono">
									No specific Condition Findings extracted for this paper yet.
								</div>
							{:else}
								{#each paperFindings as cf}
									<div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
										<div class="flex items-center justify-between gap-2">
											<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
												CF #{cf.cf_id} • Type: {cf.contribution_type || 'P'}
											</span>
											<span class="text-[10px] font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
												Canonical: {cf.canonical_code || 'CC'}
											</span>
										</div>
										<div class="font-bold text-sm text-gray-900 dark:text-white">
											{cf.raw_condition_label || cf.readiness_statement}
										</div>
										{#if cf.quote_text}
											<blockquote class="border-l-2 border-blue-500 pl-3 italic text-xs text-gray-700 dark:text-gray-300 py-1 bg-blue-50/50 dark:bg-blue-950/30 rounded-r">
												"{cf.quote_text}"
											</blockquote>
										{/if}
										<div class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
											{cf.synthesis_note || cf.mechanism}
										</div>
									</div>
								{/each}
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		</div>

	</div>
</div>
