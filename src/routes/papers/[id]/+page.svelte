<script>
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { corpus, conditionFindings } from '$lib/dataStore.js';
	import RecordBadge from '$lib/components/RecordBadge.svelte';
	import {
		FileText,
		Maximize,
		Minimize,
		ExternalLink,
		BookOpen,
		ArrowLeft,
		Layers,
		Sparkles
	} from 'lucide-svelte';

	let paperId = $derived(Number($page.params.id));
	let paper = $derived(($corpus || []).find((p) => Number(p.id) === paperId) || null);
	let paperFindings = $derived(
		($conditionFindings || []).filter((cf) => Number(cf.corpus_id) === paperId)
	);

	let isFullscreen = $state(false);
	let currentPage = $state(1);
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
					.then((res) => (res.ok ? res.text() : ''))
					.then((text) => {
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

	let lastHandledCfKey = $state('');

	// Select target URL cf & line params
	$effect(() => {
		const targetCfParam = $page.url.searchParams.get('cf');
		const targetLineParam = $page.url.searchParams.get('line');
		const currentCfKey = `${targetCfParam || ''}:${targetLineParam || ''}`;

		if (targetCfParam) {
			const parsed = Number(targetCfParam);
			selectedCfId = isNaN(parsed) ? targetCfParam : parsed;
		} else {
			selectedCfId = null;
		}

		if (textScrollContainer && !loadingTxt && txtContent) {
			if (lastHandledCfKey !== currentCfKey) {
				lastHandledCfKey = currentCfKey;
				const lineToScroll = targetLineParam
					? Number(targetLineParam)
					: targetCfParam
						? selectedFinding?.spans?.[0]?.source_line_start
						: null;
				if (lineToScroll) {
					scrollToLine(lineToScroll);
				}
			}
		}
	});

	let selectedFinding = $derived(
		selectedCfId != null
			? paperFindings.find(
					(f) => String(f.cf_id || f.contribution_id) === String(selectedCfId)
				) || null
			: null
	);

	let pages = $derived(
		(() => {
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
		})()
	);

	function isEvidenceLine(lineNum) {
		if (!selectedFinding?.spans?.length) return false;
		return selectedFinding.spans.some(
			(span) => lineNum >= span.source_line_start && lineNum <= span.source_line_end
		);
	}

	function scrollToLine(lineNumber) {
		if (!lineNumber || !textScrollContainer) return;
		const el = document.getElementById(`txt-line-${lineNumber}`);
		if (el) {
			isProgrammaticScrolling = true;
			const top = el.offsetTop - textScrollContainer.offsetTop - 72;
			textScrollContainer.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
			setTimeout(() => {
				isProgrammaticScrolling = false;
			}, 50);
		}
	}

	function selectFinding(finding, targetLine = null) {
		const newCfId = finding.cf_id || finding.contribution_id;
		selectedCfId = newCfId;
		const lineToScroll = targetLine || finding.spans?.[0]?.source_line_start;

		const searchParams = new URLSearchParams($page.url.searchParams);
		searchParams.set('cf', String(newCfId));
		if (targetLine) {
			searchParams.set('line', String(targetLine));
		} else {
			searchParams.delete('line');
		}

		const newCfKey = `${newCfId}:${targetLine || ''}`;
		lastHandledCfKey = newCfKey;

		const newPath = `${base}/papers/${paperId}?${searchParams.toString()}`;
		goto(newPath, { replaceState: true, noScroll: true, keepFocus: true });

		if (lineToScroll) {
			scrollToLine(lineToScroll);
		}
	}

	function handleSliderInput(e) {
		const val = Number(e.target.value);
		currentPage = val;
		isProgrammaticScrolling = true;
		setTimeout(() => {
			const pageBlock = document.getElementById(`page-block-${val}`);
			if (pageBlock && textScrollContainer) {
				textScrollContainer.scrollTo({
					top: pageBlock.offsetTop,
					behavior: 'auto'
				});
			}
			setTimeout(() => {
				isProgrammaticScrolling = false;
			}, 50);
		}, 0);
	}

	function handleTxtScroll() {
		if (isProgrammaticScrolling || !pages.length || !textScrollContainer) return;
		const containerTop = textScrollContainer.scrollTop;
		let closestPage = 1;
		let minDistance = Infinity;

		for (const pageItem of pages) {
			const el = document.getElementById(`page-block-${pageItem.pageNum}`);
			if (el) {
				const distance = Math.abs(el.offsetTop - containerTop);
				if (distance < minDistance) {
					minDistance = distance;
					closestPage = pageItem.pageNum;
				}
			}
		}

		if (closestPage !== currentPage) {
			currentPage = closestPage;
		}
	}

	function toggleFullscreen() {
		isFullscreen = !isFullscreen;
	}

	function typeLabel(val) {
		if (!val) return '—';
		return val.charAt(0).toUpperCase() + val.slice(1);
	}

	function streamClass(stream) {
		if (stream === 'DT')
			return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/25 dark:text-blue-300';
		if (stream === 'EA')
			return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/25 dark:text-purple-300';
		if (stream === 'ITG')
			return 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/25 dark:text-teal-300';
		return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
	}

	function formatLabel(val) {
		if (!val) return '—';
		if (val === 'source_attributed') return 'Source Attributed';
		if (val === 'paper_argument') return 'Paper Argument';
		if (val === 'empirical_case') return 'Empirical Case';
		return val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, ' ');
	}

	const AUDIT_COLORS = [
		{
			card: 'border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/25',
			marker: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:ring-blue-900',
			line: 'bg-blue-100/90 dark:bg-blue-950/45'
		},
		{
			card: 'border-purple-200 bg-purple-50/70 dark:border-purple-900 dark:bg-purple-950/25',
			marker: 'bg-purple-100 text-purple-800 ring-1 ring-purple-200 dark:bg-purple-950/50 dark:text-purple-200 dark:ring-purple-900',
			line: 'bg-purple-100/90 dark:bg-purple-950/45'
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

	function auditColor(cfId) {
		return AUDIT_COLORS[Math.abs(Number(cfId)) % AUDIT_COLORS.length];
	}
</script>

<svelte:head>
	<title>{paper ? `${paper.title} | TECF Corpus` : 'Publication Detail | TECF'}</title>
</svelte:head>

{#if paper}
	<div class="space-y-6 pb-12 pt-2">
		<!-- Plain Header Area (matches /findings/<id> layout: flex row with action button right) -->
		<div class="flex flex-wrap items-start justify-between gap-4 pt-0.5 pb-6 border-b border-slate-200/80 dark:border-slate-800">
			<div class="min-w-0 flex-1 space-y-1.5">
				<h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
					{paper.title}
				</h1>
				<p class="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
					Published in <span class="font-semibold text-slate-900 dark:text-white">{paper.journal || 'Journal / Source'}</span>
					<span class="text-slate-500 dark:text-slate-400">| {paper.authors}{#if paper.year} ({paper.year}){/if}</span>
				</p>
			</div>
			{#if paper.doi}
				<div class="shrink-0 pt-1">
					<a
						href="https://doi.org/{paper.doi}"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
					>
						<ExternalLink class="w-4 h-4" />
						View on DOI
					</a>
				</div>
			{/if}
		</div>

		<!-- 3-Column High-Impact Provenance & Bibliographic Cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- Card 1: Research Stream & Item Type -->
			<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2 flex flex-col justify-between">
				<div>
					<div class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
						Research Stream & Type
					</div>
					<div class="flex flex-wrap items-center gap-2 mt-2">
						{#if paper.stream}
							<span class="rounded-full border px-2.5 py-0.5 text-xs font-bold {streamClass(paper.stream)}">
								{paper.stream} Stream
							</span>
						{/if}
						<span class="rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
							{typeLabel(paper.item_type)}
						</span>
					</div>
				</div>
				<div class="text-sm text-slate-400 dark:text-slate-500 pt-1">
					Classified literature stream in systematic review
				</div>
			</div>

			<!-- Card 2: Corpus Evidence (Condition Findings Count) -->
			<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2 flex flex-col justify-between">
				<div>
					<div class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
						Corpus Evidence
					</div>
					<div class="flex items-center gap-2 mt-1.5">
						<span class="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300 font-mono">
							{paperFindings.length}
						</span>
						<span class="text-base font-bold text-slate-900 dark:text-white">
							Condition Findings Extracted
						</span>
					</div>
				</div>
				<div class="text-sm text-slate-400 dark:text-slate-500 pt-1">
					Source-traceable findings mapped to TECF
				</div>
			</div>

			<!-- Card 3: Bibliographic Metrics & DOI -->
			<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2 flex flex-col justify-between">
				<div>
					<div class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
						Bibliographic Metrics
					</div>
					<div class="text-sm text-slate-700 dark:text-slate-300 mt-1.5 space-y-1 font-medium">
						<div>Words: <span class="font-mono font-semibold text-slate-900 dark:text-white">{paper.words ? paper.words.toLocaleString() : '—'}</span> · Pages: <span class="font-mono font-semibold text-slate-900 dark:text-white">{paper.pages ?? '—'}</span></div>
						<div>References: <span class="font-mono font-semibold text-slate-900 dark:text-white">{paper.refs ?? '—'}</span></div>
					</div>
				</div>
				{#if paper.doi}
					<div class="pt-1">
						<a
							href="https://doi.org/{paper.doi}"
							target="_blank"
							rel="noopener noreferrer"
							class="text-xs font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1"
						>
							DOI: {paper.doi}
							<ExternalLink class="w-3 h-3" />
						</a>
					</div>
				{/if}
			</div>
		</div>

		<!-- Abstract Card (Dedicated elevated presentation) -->
		{#if paper.abstract}
			<div class="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
				<div class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
					Abstract
				</div>
				<p class="text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
					{paper.abstract}
				</p>
			</div>
		{/if}

		<!-- Integrated Full-Text Reader & Condition Findings Section -->
		<div class="space-y-4 pt-4">
			<!-- Section Header -->
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
						<span>Full Text & Condition Findings</span>
						<span class="inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono">
							{paperFindings.length} Findings
						</span>
					</h2>
					<p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
						Select a finding from the sidebar to highlight its exact TXT evidence lines, or jump directly to line numbers.
					</p>
				</div>
			</div>

			<!-- Main Integrated Reader Area -->
			<div
				class="w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex flex-col {isFullscreen ? 'fixed inset-0 z-50 p-4 bg-white dark:bg-slate-900' : 'h-[720px]'}"
			>
				<!-- Toolbar -->
				<div class="border-b border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-950/60 shrink-0 flex flex-wrap items-center justify-between gap-4">
					{#if pages.length > 0}
						<div class="flex items-center gap-3 select-none min-w-0">
							<span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono tracking-wider w-16 text-right">PAGE {currentPage}</span>
							<input
								type="range"
								min="1"
								max={pages.length}
								value={currentPage}
								oninput={handleSliderInput}
								class="w-44 sm:w-64 md:w-80 cursor-pointer"
							/>
							<span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono tracking-wider w-16">OF {pages.length}</span>
						</div>
					{:else}
						<div class="text-xs text-slate-400">Full Text Document</div>
					{/if}

					<div class="flex items-center gap-2">
						<button
							onclick={toggleFullscreen}
							class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
							title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
						>
							{#if isFullscreen}
								<Minimize class="w-4 h-4" />
							{:else}
								<Maximize class="w-4 h-4" />
							{/if}
						</button>
					</div>
				</div>

				<!-- Reader Container: Left TXT View + Right Condition Findings Sidebar -->
				<div class="flex-1 min-h-0 flex min-w-0 bg-white dark:bg-slate-900">
					{#if loadingTxt}
						<div class="flex flex-col items-center justify-center w-full h-full text-slate-400">
							<div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
							<span class="mt-3 text-sm">Loading full-text document...</span>
						</div>
					{:else if txtContent}
						<!-- Left TXT Document Reader -->
						<div
							bind:this={textScrollContainer}
							onscroll={handleTxtScroll}
							class="relative min-w-0 flex-1 overflow-y-auto p-4 select-text"
						>
							<div class="w-full space-y-6 pb-12">
								{#each pages as pageItem}
									<div id="page-block-{pageItem.pageNum}" class="space-y-4">
										<div class="relative flex pt-8 pb-3 items-center select-none">
											<div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
											<span class="flex-shrink mx-4 text-[10px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
												Page {pageItem.pageNum}
											</span>
											<div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
										</div>

										<div class="font-mono text-xs sm:text-sm leading-relaxed space-y-1">
											{#each pageItem.lines as line}
												{@const isHighlighted = isEvidenceLine(line.number)}
												<div
													id="txt-line-{line.number}"
													class="flex items-start gap-4 px-2 py-0.5 rounded transition-colors {isHighlighted ? (selectedFinding ? auditColor(selectedFinding.cf_id || selectedFinding.contribution_id).line : 'bg-blue-50 dark:bg-blue-950/40') : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}"
												>
													<span class="w-10 shrink-0 text-right text-[11px] font-mono text-slate-400 select-none pt-0.5">
														{line.number}
													</span>
													<span class="flex-1 text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
														{line.text}
													</span>
												</div>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						</div>

						<!-- Right Condition Findings Sidebar -->
						{#if paperFindings.length}
							<aside class="hidden lg:block w-96 shrink-0 overflow-y-auto border-l border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-4">
								<div class="mb-4">
									<h3 class="text-sm font-bold text-slate-900 dark:text-white">Condition Findings</h3>
									<p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Select a finding to highlight its exact TXT evidence lines.</p>
								</div>
								<div class="space-y-3">
									{#each paperFindings as finding}
										{@const isSelected = selectedFinding && (selectedFinding.cf_id || selectedFinding.contribution_id) === (finding.cf_id || finding.contribution_id)}
										<div
											role="button"
											tabindex="0"
											onclick={() => selectFinding(finding)}
											onkeydown={(e) => e.key === 'Enter' && selectFinding(finding)}
											class="w-full cursor-pointer rounded-xl border p-4 text-left transition-all hover:shadow-sm {auditColor(finding.cf_id || finding.contribution_id).card} {isSelected ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-slate-900' : ''}"
										>
											<div class="flex items-start justify-between gap-2">
												<a
													href="{base}/findings/CF{finding.cf_id || finding.contribution_id}"
													onclick={(e) => e.stopPropagation()}
													class="rounded px-1.5 py-0.5 font-mono text-xs font-bold {auditColor(finding.cf_id || finding.contribution_id).marker}"
												>
													CF{finding.cf_id || finding.contribution_id}
												</a>
												{#if finding.audit_outcome}
													<span class="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-300">
														{finding.audit_outcome.toUpperCase()}
													</span>
												{/if}
											</div>

											<p class="mt-2.5 text-sm font-semibold leading-snug">
												<a
													href="{base}/findings/CF{finding.cf_id || finding.contribution_id}"
													onclick={(e) => e.stopPropagation()}
													class="text-slate-900 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
												>
													{finding.raw_condition_label}
												</a>
											</p>

											<p class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
												{formatLabel(finding.evidence_role)} · {formatLabel(finding.claim_provenance)}
											</p>

											{#if finding.rationale || finding.readiness_statement}
												<p class="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
													{finding.rationale || finding.readiness_statement}
												</p>
											{/if}

											{#if finding.spans && finding.spans.length}
												<div class="mt-3 flex flex-wrap gap-1.5">
													{#each finding.spans as span}
														<button
															type="button"
															onclick={(e) => { e.stopPropagation(); selectFinding(finding, span.source_line_start); }}
															class="inline-flex items-center gap-1 rounded px-2.5 py-1 font-mono text-xs font-semibold transition-opacity hover:opacity-75 {auditColor(finding.cf_id || finding.contribution_id).marker}"
														>
															Lines {span.source_line_start}–{span.source_line_end}
														</button>
													{/each}
												</div>
												{@const locators = finding.spans.map((s) => s.source_locator).filter(Boolean)}
												{#if locators.length}
													<p class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{locators.join(' · ')}</p>
												{/if}
											{:else}
												<p class="mt-3 text-xs italic text-slate-500 dark:text-slate-400">
													No exact TXT span is available for this finding.
												</p>
											{/if}
										</div>
									{/each}
								</div>
							</aside>
						{/if}
					{:else}
						<div class="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
							Full-text document source is not available for this publication record.
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="py-16 text-center space-y-4">
		<h1 class="text-2xl font-bold text-slate-900 dark:text-white">Publication Not Found</h1>
		<p class="text-sm text-slate-500 dark:text-slate-400">
			The publication record P{paperId} could not be located in the TECF literature corpus.
		</p>
		<a
			href="{base}/papers"
			class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
		>
			<ArrowLeft class="w-4 h-4" />
			Back to Literature Corpus
		</a>
	</div>
{/if}
