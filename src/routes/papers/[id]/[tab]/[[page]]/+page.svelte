<script>
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { corpus, conditionFindings } from '$lib/dataStore.js';
	import RecordBadge from '$lib/components/RecordBadge.svelte';
	import { FileText, Maximize, Minimize, ExternalLink } from 'lucide-svelte';

	let paperId = $derived(Number($page.params.id));
	
	let paper = $derived(($corpus || []).find(p => Number(p.id) === paperId) || null);
	let paperFindings = $derived(($conditionFindings || []).filter(cf => Number(cf.corpus_id) === paperId));

	let activeTab = $derived($page.params.tab || 'preview');
	let isFullscreen = $state(false);
	let currentPage = $derived(Number($page.params.page) || 1);
	let selectedCfId = $state(null);
	let txtContent = $state('');
	let loadingTxt = $state(true);
	/** @type {HTMLDivElement | null} */
	let textScrollContainer = $state(null);
	let isProgrammaticScrolling = false;
	// Fetch txt file content dynamically based on txt_path basename
	$effect(() => {
		if (paper) {
			const filename = paper.txt_path ? paper.txt_path.split('/').pop() : null;
			if (filename) {
				loadingTxt = true;
				fetch(`${base}/docs/txt/${encodeURIComponent(filename)}`)
					.then(res => res.ok ? res.text() : '')
					.then(text => {
						txtContent = text;
						loadingTxt = false;
					})
					.catch(() => {
						loadingTxt = false;
					});
			} else {
				loadingTxt = false;
			}
		}
	});

	// Select first finding or target URL cf param
	$effect(() => {
		const targetCfParam = $page.url.searchParams.get('cf');
		if (targetCfParam) {
			selectedCfId = Number(targetCfParam);
		} else if (paperFindings.length && !selectedCfId) {
			selectedCfId = paperFindings[0].cf_id || paperFindings[0].contribution_id;
		}
	});

	let selectedFinding = $derived(
		paperFindings.find(f => (f.cf_id || f.contribution_id) === selectedCfId) || paperFindings[0] || null
	);

	let pages = $derived((() => {
		if (!txtContent) return [];
		const lines = txtContent.split(/\r?\n/);
		/** @type {Array<{pageNum: number, lines: Array<{number: number, text: string}>}>} */
		const parsedPages = [];
		let curPage = { pageNum: 1, lines: [] };

		for (let index = 0; index < lines.length; index += 1) {
			const pageMarker = lines[index].match(/^---\s*PAGE\s+(\d+)\s*---\s*$/i);
			if (pageMarker) {
				if (curPage.lines.length) parsedPages.push(curPage);
				curPage = { pageNum: Number.parseInt(pageMarker[1], 10), lines: [] };
			} else {
				curPage.lines.push({ number: index + 1, text: lines[index] });
			}
		}
		if (curPage.lines.length || parsedPages.length === 0) parsedPages.push(curPage);
		return parsedPages;
	})());

	/** @param {number} lineNum */
	function isEvidenceLine(lineNum) {
		if (!selectedFinding) return false;
		const start = selectedFinding.first_span_line_start;
		const end = selectedFinding.first_span_line_end || start;
		if (!start) return false;
		return lineNum >= start && lineNum <= end;
	}

	/** @param {number} lineNumber */
	function scrollToLine(lineNumber) {
		if (!lineNumber || !textScrollContainer) return;
		const el = document.getElementById(`txt-line-${lineNumber}`);
		if (el) {
			isProgrammaticScrolling = true;
			const top = el.offsetTop - (el.clientHeight * 2);
			textScrollContainer.scrollTo({ top, behavior: 'auto' });
			setTimeout(() => { isProgrammaticScrolling = false; }, 50);
		}
	}

	/** 
	 * @param {any} finding 
	 * @param {number|null} targetLine 
	 */
	function selectFinding(finding, targetLine = null) {
		selectedCfId = finding.cf_id || finding.contribution_id;
		const lineToScroll = targetLine || finding.first_span_line_start;
		if (lineToScroll) {
			setTimeout(() => scrollToLine(lineToScroll), 100);
		}
	}

	/** @param {Event & { target: HTMLInputElement }} e */
	function handleSliderInput(e) {
		const val = Number(e.target.value);
		const searchParams = $page.url.searchParams.toString();
		const query = searchParams ? `?${searchParams}` : '';
		goto(`${base}/papers/${paperId}/${activeTab}/${val}${query}`, { replaceState: true, noScroll: true, keepFocus: true });
		
		isProgrammaticScrolling = true;
		setTimeout(() => {
			const pageBlock = document.getElementById(`page-block-${val}`);
			if (pageBlock && textScrollContainer) {
				textScrollContainer.scrollTo({
					top: pageBlock.offsetTop,
					behavior: 'auto'
				});
			}
			setTimeout(() => { isProgrammaticScrolling = false; }, 50);
		}, 10);
	}

	function handleTxtScroll() {
		if (isProgrammaticScrolling || !textScrollContainer || pages.length === 0) return;
		const containerTop = textScrollContainer.scrollTop;
		let closestPage = pages[0].pageNum;
		let closestDistance = Number.POSITIVE_INFINITY;
		for (const page of pages) {
			const element = document.getElementById(`page-block-${page.pageNum}`);
			if (!element) continue;
			const distance = Math.abs(element.offsetTop - textScrollContainer.offsetTop - containerTop);
			if (distance < closestDistance) {
				closestDistance = distance;
				closestPage = page.pageNum;
			}
		}
		if (currentPage !== closestPage) {
			const searchParams = $page.url.searchParams.toString();
			const query = searchParams ? `?${searchParams}` : '';
			goto(`${base}/papers/${paperId}/${activeTab}/${closestPage}${query}`, { replaceState: true, noScroll: true, keepFocus: true });
		}
	}

	function toggleFullscreen() {
		isFullscreen = !isFullscreen;
	}

	/** @param {string} type */
	function typeLabel(type) {
		/** @type {Record<string, string>} */
		const labels = { JOUR: 'Journal', CONF: 'Conference', BOOK: 'Book', CHAP: 'Chapter', RPRT: 'Report', THES: 'Thesis' };
		return labels[type] || type || 'Paper';
	}

	/** @param {string} val */
	function formatLabel(val) {
		if (!val) return '—';
		if (val === 'source_attributed') return 'Paper Argument';
		if (val === 'empirical_case') return 'Empirical Case';
		return val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, ' ');
	}

	/** @param {string} stream */
	function streamClass(stream) {
		if (stream === 'DT') return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/25 dark:text-blue-300';
		if (stream === 'EA') return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/25 dark:text-purple-300';
		if (stream === 'BT') return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-300';
		if (stream === 'DC') return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-300';
		return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
	}

	const AUDIT_COLORS = [
		{
			card: 'border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/25',
			marker: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:ring-blue-900',
			line: 'bg-blue-100/90 dark:bg-blue-950/45'
		},
		{
			card: 'border-violet-200 bg-violet-50/70 dark:border-violet-900 dark:bg-violet-950/25',
			marker: 'bg-violet-100 text-violet-800 ring-1 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-200 dark:ring-violet-900',
			line: 'bg-violet-100/90 dark:bg-violet-950/45'
		},
		{
			card: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/25',
			marker: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-900',
			line: 'bg-emerald-100/90 dark:bg-emerald-950/45'
		},
		{
			card: 'border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/25',
			marker: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900',
			line: 'bg-amber-100/90 dark:bg-amber-950/45'
		}
	];

	/** @param {string|number} cfId */
	function auditColor(cfId) {
		return AUDIT_COLORS[Math.abs(Number(cfId)) % AUDIT_COLORS.length];
	}
</script>

<div class="space-y-4">
	{#if paper}
		<!-- Paper Header -->
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-3">
					<RecordBadge id={`P${paper.id || paperId}`} variant="paper" />
					<h1 class="text-3xl font-bold text-gray-800 dark:text-white leading-tight">{paper.title}</h1>
					{#if paper.stream}
						<span class="rounded-full border px-2.5 py-0.5 text-xs font-semibold {streamClass(paper.stream)}">
							{paper.stream}
						</span>
					{/if}
				</div>
				<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
					{[paper.authors, paper.year, typeLabel(paper.item_type)].filter(Boolean).join(' — ')}
				</p>
			</div>
		</div>

		<!-- Sub-navigation Tabs -->
		<div class="border-b border-gray-200 dark:border-gray-800">
			<nav class="-mb-px flex space-x-8" aria-label="Document tabs">
				<a
					href="{base}/papers/{paperId}/overview"
					class="inline-flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'overview' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
				>
					Overview
				</a>
				<a
					href="{base}/papers/{paperId}/preview/1"
					class="inline-flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'preview' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}"
				>
					Preview
					{#if paperFindings.length}
						<span class="rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-xs font-bold">
							{paperFindings.length}
						</span>
					{/if}
				</a>
			</nav>
		</div>

		<!-- Tab Content Container -->
		<div
			class="overflow-hidden flex flex-col {isFullscreen && activeTab === 'preview' ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4' : 'w-full'}"
			style={isFullscreen && activeTab === 'preview' ? 'height: 100vh; width: 100vw;' : activeTab === 'preview' ? 'height: calc(100vh - 14rem); min-height: 560px;' : 'height: auto;'}
		>
			{#if activeTab === 'overview'}
				<!-- Overview Tab -->
				<div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-6">
					<div>
						<h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 pb-2 mb-4 border-b border-gray-100 dark:border-gray-800">
							Bibliographic Details
						</h2>
						<dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							<div>
								<dt class="text-xs font-semibold text-gray-400">ID</dt>
								<dd class="mt-1 font-mono text-sm text-gray-900 dark:text-white">P{paper.id}</dd>
							</div>
							<div>
								<dt class="text-xs font-semibold text-gray-400">Item Type</dt>
								<dd class="mt-1 text-sm text-gray-900 dark:text-white">{typeLabel(paper.item_type)}</dd>
							</div>
							<div>
								<dt class="text-xs font-semibold text-gray-400">Year</dt>
								<dd class="mt-1 text-sm text-gray-900 dark:text-white">{paper.year || '—'}</dd>
							</div>
							<div>
								<dt class="text-xs font-semibold text-gray-400">Journal / Source</dt>
								<dd class="mt-1 text-sm text-gray-900 dark:text-white">{paper.journal || '—'}</dd>
							</div>
							<div>
								<dt class="text-xs font-semibold text-gray-400">Citations</dt>
								<dd class="mt-1 text-sm text-gray-900 dark:text-white">{paper.cites ?? '—'}</dd>
							</div>
							<div>
								<dt class="text-xs font-semibold text-gray-400">References</dt>
								<dd class="mt-1 text-sm text-gray-900 dark:text-white">{paper.refs ?? '—'}</dd>
							</div>
							<div>
								<dt class="text-xs font-semibold text-gray-400">Pages</dt>
								<dd class="mt-1 text-sm text-gray-900 dark:text-white">{paper.pages ?? '—'}</dd>
							</div>
							<div>
								<dt class="text-xs font-semibold text-gray-400">Words</dt>
								<dd class="mt-1 text-sm text-gray-900 dark:text-white">{paper.words ? paper.words.toLocaleString() : '—'}</dd>
							</div>
							{#if paper.doi}
								<div class="sm:col-span-2">
									<dt class="text-xs font-semibold text-gray-400">DOI</dt>
									<dd class="mt-1 text-sm text-blue-600 dark:text-blue-400 break-all">
										<a href="https://doi.org/{paper.doi}" target="_blank" class="hover:underline flex items-center gap-1">
											{paper.doi} <ExternalLink size={12} />
										</a>
									</dd>
								</div>
							{/if}
						</dl>
					</div>

					{#if paper.abstract}
						<div class="pt-4 border-t border-gray-100 dark:border-gray-800">
							<h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 pb-2 mb-3">Abstract</h2>
							<p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{paper.abstract}</p>
						</div>
					{/if}
				</div>

			{:else if activeTab === 'preview'}
				<!-- Preview Tab: Header toolbar with Page slider & Fullscreen toggle -->
				<div class="border border-gray-200 dark:border-gray-800 rounded-t-xl px-4 py-3 bg-white dark:bg-gray-900 shrink-0">
					<div class="flex flex-wrap items-center justify-between gap-4">
						{#if pages.length > 0}
							<div class="flex items-center gap-4 select-none min-w-0">
								<span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-mono tracking-wider w-16 text-right">PAGE {currentPage}</span>
								<input
									type="range"
									min="1"
									max={pages.length}
									value={currentPage}
									oninput={handleSliderInput}
									class="w-48 sm:w-72 md:w-96 lg:w-[32rem] cursor-pointer"
								/>
								<span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-mono tracking-wider w-16">OF {pages.length}</span>
							</div>
						{:else}
							<div class="text-xs text-gray-400">Full Text Preview</div>
						{/if}

						<div class="flex items-center gap-2">
							<button
								onclick={toggleFullscreen}
								class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors shadow-xs"
								title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
							>
								{#if isFullscreen}
									<Minimize size={16} />
								{:else}
									<Maximize size={16} />
								{/if}
							</button>
						</div>
					</div>
				</div>

				<!-- Main Document Reader area: Left TXT View + Right Condition Findings Sidebar -->
				<div class="flex-1 min-h-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-t-0 rounded-b-xl overflow-hidden">
					{#if loadingTxt}
						<div class="flex flex-col items-center justify-center h-full text-gray-400">
							<div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
							<span class="mt-3 text-sm">Loading full-text document...</span>
						</div>
					{:else if txtContent}
						<div class="flex h-full min-w-0 bg-white dark:bg-gray-900">
							<!-- Left TXT Document Reader -->
							<div
								bind:this={textScrollContainer}
								onscroll={handleTxtScroll}
								class="relative min-w-0 flex-1 overflow-y-auto p-2 md:p-4 select-text"
							>
								<div class="w-full space-y-6 pb-12">
									{#each pages as page}
										<div id="page-block-{page.pageNum}" class="space-y-4">
											<div class="relative flex pt-10 pb-4 items-center select-none">
												<div class="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
												<span class="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-950 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 shadow-xs">
													Page {page.pageNum}
												</span>
												<div class="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
											</div>
											<div class="w-full space-y-0.5 font-mono text-[11px] leading-relaxed text-gray-800 dark:text-gray-200">
												{#each page.lines as line}
													<div
														id="txt-line-{line.number}"
														class="grid grid-cols-[3rem_1fr] gap-2 rounded px-1 {isEvidenceLine(line.number) ? auditColor(selectedFinding?.cf_id || selectedFinding?.contribution_id).line : ''}"
													>
														<span class="select-none text-right text-[10px] leading-6 text-gray-400 dark:text-gray-600 font-mono">{line.number}</span>
														<span class="whitespace-pre-wrap break-words">{line.text || ' '}</span>
													</div>
												{/each}
											</div>
										</div>
									{/each}
								</div>
							</div>

							<!-- Right Condition Findings Sidebar -->
							{#if paperFindings.length}
								<aside class="hidden lg:block w-96 shrink-0 overflow-y-auto border-l border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/30 p-4">
									<div class="mb-4">
										<h2 class="text-base font-bold text-gray-900 dark:text-white">Condition Findings</h2>
										<p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Select a finding to highlight its exact TXT evidence lines.</p>
									</div>
									<div class="space-y-3">
										{#each paperFindings as finding}
											{@const isSelected = selectedFinding && (selectedFinding.cf_id || selectedFinding.contribution_id) === (finding.cf_id || finding.contribution_id)}
											<div
												role="button"
												tabindex="0"
												onclick={() => selectFinding(finding)}
												onkeydown={(e) => e.key === 'Enter' && selectFinding(finding)}
												class="w-full cursor-pointer rounded-xl border p-4 text-left transition-shadow hover:shadow-sm {auditColor(finding.cf_id || finding.contribution_id).card} {isSelected ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-900' : ''}"
											>
												<div class="flex items-start justify-between gap-2">
													<span class="rounded px-1.5 py-0.5 font-mono text-xs font-bold {auditColor(finding.cf_id || finding.contribution_id).marker}">
														CF{finding.cf_id || finding.contribution_id}
													</span>
													{#if finding.audit_outcome}
														<span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-300">
															{formatLabel(finding.audit_outcome)}
														</span>
													{/if}
												</div>

												<p class="mt-2.5 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
													{finding.raw_condition_label}
												</p>

												<p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
													{formatLabel(finding.evidence_role)} · {formatLabel(finding.claim_provenance)}
												</p>

												{#if finding.readiness_statement}
													<p class="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
														{finding.readiness_statement}
													</p>
												{/if}

												{#if finding.first_span_line_start}
													<div class="mt-3">
														<button
															type="button"
															onclick={(e) => { e.stopPropagation(); selectFinding(finding, finding.first_span_line_start); }}
															class="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-xs font-bold {auditColor(finding.cf_id || finding.contribution_id).marker} hover:opacity-80 transition-opacity"
														>
															Lines {finding.first_span_line_start}–{finding.first_span_line_end || finding.first_span_line_start}
														</button>
													</div>
												{/if}
											</div>
										{/each}
									</div>
								</aside>
							{/if}
						</div>
					{:else}
						<div class="flex flex-col items-center justify-center h-full text-gray-400">
							<FileText size={48} class="text-gray-300 dark:text-gray-600 mb-3" />
							<p class="text-base font-medium text-gray-800 dark:text-white">No Text Document Found</p>
							<p class="text-xs text-gray-500 max-w-sm mt-1 text-center">The full text representation for this paper could not be loaded.</p>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{:else}
		<div class="p-12 text-center text-gray-500">
			<p class="text-lg font-semibold text-gray-800 dark:text-white">Paper Not Found</p>
			<a href="{base}/papers" class="mt-4 inline-block text-sm text-blue-600 hover:underline">Return to Papers</a>
		</div>
	{/if}
</div>
