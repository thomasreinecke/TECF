<script>
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import RecordBadge from '$lib/components/RecordBadge.svelte';
	import { corpus, conditionFindings } from '$lib/dataStore.js';
	import { EVIDENCE_FAMILY_LABELS } from '$lib/evidenceFamilies.js';
	import { ExternalLink, HelpCircle } from 'lucide-svelte';

	let paperId = $derived(Number(($page.params.id || '').replace(/^P/i, '')) || 0);

	let publication = $derived(($corpus || []).find((p) => p.id === paperId) || null);

	let findings = $derived(
		($conditionFindings || [])
			.filter((f) => f.corpus_id === paperId)
			.sort((a, b) => (a.cf_id || a.contribution_id) - (b.cf_id || b.contribution_id))
	);

	let conditions = $derived(
		(() => {
			const map = new Map();
			for (const f of findings) {
				const code = f.canonical_code || f.cluster_code;
				if (code && !map.has(code)) map.set(code, f.canonical_label || f.cluster_label);
			}
			return [...map.entries()]
				.map(([code, label]) => ({ code, label }))
				.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
		})()
	);

	function streamClass(stream) {
		if (stream === 'DT')
			return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/25 dark:text-blue-300';
		if (stream === 'EA')
			return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/25 dark:text-purple-300';
		if (stream === 'ITG')
			return 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/50 dark:bg-teal-950/25 dark:text-teal-300';
		return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
	}

</script>

<svelte:head>
	<title>{publication ? `P${paperId} · ${publication.title} | TECF` : 'Source | TECF'}</title>
</svelte:head>

<div class="space-y-6">
	{#if publication}
		<!-- Bibliographic Record -->
		<div class="flex flex-wrap items-start justify-between gap-4 pt-0.5 pb-2">
			<div class="min-w-0 flex-1 space-y-2">
				<div class="flex flex-wrap items-center gap-2">
					<RecordBadge id={`P${publication.id}`} variant="paper" />
					{#if publication.stream}
						<span class="rounded-full border px-2.5 py-0.5 text-xs font-semibold {streamClass(publication.stream)}">
							{publication.stream}
						</span>
					{/if}
					{#if publication.typeLabel}
						<span class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
							{publication.typeLabel}
						</span>
					{/if}
					{#if publication.evidence_family}
						<span class="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-300">
							{EVIDENCE_FAMILY_LABELS[publication.evidence_family] || publication.evidence_family}
						</span>
					{/if}
				</div>
				<h1 class="text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
					{publication.title}
				</h1>
				<p class="text-base text-slate-600 dark:text-slate-400">
					{publication.authors || '—'} ({publication.year || 'n.d.'}){#if publication.journal}. <em>{publication.journal}</em>{/if}
				</p>
				{#if publication.doi}
					<p class="font-mono text-sm text-slate-500 dark:text-slate-400">doi:{publication.doi}</p>
				{/if}
			</div>

			{#if publication.doi}
				<div class="shrink-0 pt-1">
					<a
						href="https://doi.org/{publication.doi}"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
					>
						<ExternalLink class="w-4 h-4" />
						Open Publication (DOI)
					</a>
				</div>
			{/if}
		</div>

		<!-- Contributed Conditions -->
		{#if conditions.length > 0}
			<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
				<div class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
					Contributes to {conditions.length} {conditions.length === 1 ? 'Condition' : 'Conditions'}
				</div>
				<div class="flex flex-wrap gap-2">
					{#each conditions as condition}
						<a
							href="{base}/conditions/{condition.code}"
							class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-500"
						>
							<RecordBadge id={condition.code} variant="condition" class="text-xs px-2 py-0.5" />
							<span class="font-semibold text-slate-800 dark:text-slate-200">{condition.label}</span>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Condition Findings with Core Quotations -->
		<div class="space-y-4 pt-2">
			<div>
				<h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center">
					Condition Findings
					<span class="ml-2.5 inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono">
						{findings.length}
					</span>
				</h3>
				<p class="mt-0.5 max-w-4xl text-xs text-slate-500 dark:text-slate-400">
					Each finding is shown with the core quotations of its audited source passages, at most 40 words each, and their section and line locators. Omitted text is marked […]. The quotations remain with their authors and publishers. The full text is available from the publisher through the DOI.
				</p>
			</div>

			{#each findings as finding}
				<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<div class="flex flex-wrap items-center gap-2">
							<a href="{base}/findings/{finding.cf_id || finding.contribution_id}" class="hover:opacity-80 transition-opacity">
								<RecordBadge id={`CF${finding.cf_id || finding.contribution_id}`} variant="finding" />
							</a>
							<a
								href="{base}/findings/{finding.cf_id || finding.contribution_id}"
								class="font-semibold text-blue-600 dark:text-blue-400 text-base leading-snug"
							>
								{finding.raw_condition_label}
							</a>
						</div>
						<div class="flex flex-wrap items-center gap-2">
							{#if finding.canonical_code || finding.cluster_code}
								<a href="{base}/conditions/{finding.canonical_code || finding.cluster_code}" class="hover:opacity-80 transition-opacity">
									<RecordBadge id={finding.canonical_code || finding.cluster_code} variant="condition" class="text-xs px-2 py-0.5" />
								</a>
							{/if}
						</div>
					</div>

					{#if finding.readiness_statement}
						<p class="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed">
							{finding.readiness_statement}
						</p>
					{/if}

					{#each finding.spans || [] as span}
						<div class="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/40 space-y-1.5">
							<div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
								<span class="font-medium text-slate-700 dark:text-slate-300">{span.source_locator || 'Source passage'}</span>
								{#if span.source_line_start}
									<span class="font-mono">Lines {span.source_line_start}–{span.source_line_end}</span>
								{/if}
							</div>
							<blockquote class="text-sm leading-relaxed text-slate-800 dark:text-slate-200 italic">
								“{span.source_excerpt}”
							</blockquote>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
			<HelpCircle class="w-10 h-10 text-slate-400 mx-auto" />
			<h2 class="text-xl font-bold text-slate-900 dark:text-white">Source Not Found</h2>
			<p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
				No contributing publication matches ID P{paperId}.
			</p>
			<a
				href="{base}/sources"
				class="inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-2"
			>
				Back to Sources
			</a>
		</div>
	{/if}
</div>
