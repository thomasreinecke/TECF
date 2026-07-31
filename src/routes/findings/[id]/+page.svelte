<script>
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import RecordBadge from '$lib/components/RecordBadge.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { conditionFindings, canonicalConditions, conditionDomains, corpus } from '$lib/dataStore.js';
	import { roleLabel } from '$lib/roles.js';
	import {
		ArrowLeft,
		BookOpen,
		FileText,
		Layers,
		Sparkles,
		ShieldCheck,
		HelpCircle,
		CheckCircle,
		ExternalLink,
		Bookmark,
		Compass,
		Cpu
	} from 'lucide-svelte';

	let rawId = $derived(($page.params.id || '').replace(/^CF/i, ''));
	let findingId = $derived(Number(rawId) || 0);

	let finding = $derived(
		($conditionFindings || []).find((f) => (f.cf_id || f.contribution_id) === findingId) || null
	);

	let parentCc = $derived(
		finding && (finding.canonical_code || finding.cluster_code)
			? ($canonicalConditions || []).find(
					(c) => c.code.toUpperCase() === (finding.canonical_code || finding.cluster_code).toUpperCase()
				) || null
			: null
	);

	let parentDomain = $derived(
		parentCc && parentCc.framework_axis
			? ($conditionDomains || []).find(
					(d) => d.code.toUpperCase() === parentCc.framework_axis.toUpperCase()
				) || null
			: null
	);

	let paper = $derived(
		finding && finding.corpus_id
			? ($corpus || []).find((p) => p.id === finding.corpus_id) || null
			: null
	);

	let siblings = $derived(
		(() => {
			if (!finding || !(finding.canonical_code || finding.cluster_code)) return [];
			const targetCode = (finding.canonical_code || finding.cluster_code).toUpperCase();
			return ($conditionFindings || []).filter(
				(f) =>
					(f.canonical_code || f.cluster_code || '').toUpperCase() === targetCode &&
					(f.cf_id || f.contribution_id) !== findingId
			);
		})()
	);

	function formatLabel(val) {
		if (!val) return '—';
		if (val === 'source_attributed') return 'Source Attributed';
		if (val === 'paper_argument') return 'Paper Argument';
		if (val === 'empirical_case') return 'Empirical Case';
		return val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, ' ');
	}

	function streamClass(stream) {
		if (stream === 'DT')
			return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/25 dark:text-blue-300';
		if (stream === 'EA')
			return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/25 dark:text-purple-300';
		if (stream === 'BT')
			return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-300';
		if (stream === 'DC')
			return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-300';
		return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
	}

	function roleClass(role) {
		if (role === 'support')
			return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/25 dark:text-sky-300';
		if (role === 'operationalization')
			return 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/25 dark:text-violet-300';
		if (role === 'boundary')
			return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
		return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
	}

	const siblingColumns = [
		{ key: 'id', title: 'ID', sortable: true, width: '8%' },
		{ key: 'raw_condition_label', title: 'Condition Finding', sortable: true, width: '32%', overflow: 'wrap' },
		{ key: 'paper', title: 'Paper', sortable: true, width: '36%', overflow: 'wrap' },
		{ key: 'stream', title: 'Stream', sortable: true, width: '10%' },
		{ key: 'evidence_role', title: 'Role', sortable: true, width: '14%' }
	];

	let siblingSortKey = $state('id');
	let siblingSortDirection = $state('asc');

	function toggleSiblingSort(key) {
		if (siblingSortKey === key) siblingSortDirection = siblingSortDirection === 'asc' ? 'desc' : 'asc';
		else {
			siblingSortKey = key;
			siblingSortDirection = 'asc';
		}
	}

	let sortedSiblings = $derived(
		(() => {
			const direction = siblingSortDirection === 'asc' ? 1 : -1;
			return [...siblings].sort((a, b) => {
				let aValue = a[siblingSortKey];
				let bValue = b[siblingSortKey];
				if (siblingSortKey === 'id') {
					aValue = a.cf_id || a.contribution_id || 0;
					bValue = b.cf_id || b.contribution_id || 0;
				} else if (siblingSortKey === 'paper') {
					aValue = a.paper_title || a.title || '';
					bValue = b.paper_title || b.title || '';
				}
				if (aValue == null) return 1;
				if (bValue == null) return -1;
				if (typeof aValue === 'number' && typeof bValue === 'number') return (aValue - bValue) * direction;
				return String(aValue).localeCompare(String(bValue), undefined, { numeric: true }) * direction;
			});
		})()
	);
</script>

<svelte:head>
	<title>{finding ? `CF${findingId} · ${finding.raw_condition_label} | TECF` : 'Condition Finding Detail | TECF'}</title>
</svelte:head>

<div class="space-y-6">

	{#if finding}
		<!-- Plain Record Header -->
		<div class="flex flex-wrap items-start justify-between gap-4 pt-0.5 pb-2">
			<div class="min-w-0 flex-1 space-y-1.5">
				<h1 class="text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
					{finding.raw_condition_label}
				</h1>
				<p class="text-base text-slate-650 dark:text-slate-400">
					Extracted from
					<a
						href="{base}/papers/{finding.corpus_id}"
						class="font-semibold text-blue-600 hover:underline dark:text-blue-400 text-base"
					>
						{finding.paper_title || finding.title}</a> | {finding.paper_authors || finding.authors} ({finding.paper_year || finding.year})
				</p>
			</div>

			<div class="shrink-0 pt-1">
				<a
					href="{base}/papers/{finding.corpus_id}?cf={finding.cf_id || finding.contribution_id}"
					class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
				>
					<BookOpen class="w-4 h-4" />
					View in Paper Reader
				</a>
			</div>
		</div>

		<!-- 3-Column Provenance & Hierarchy Cards (Source Location -> Condition -> Domain) -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- Card 1: Source Location (Clickable) -->
			<a
				href="{base}/papers/{finding.corpus_id}?cf={finding.cf_id || finding.contribution_id}"
				class="group rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-blue-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500 space-y-2 flex flex-col justify-between"
			>
				<div>
					<div class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
						Source Location
					</div>
					<div class="text-base font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 leading-snug mt-1.5 line-clamp-2">
						{finding.page_or_section || 'Findings Section'}
					</div>
				</div>
				<div class="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline pt-1">
					View in Paper Reader →
				</div>
			</a>

			<!-- Card 2: Canonical Condition (Clickable) -->
			<a
				href="{base}/conditions/{finding.canonical_code || finding.cluster_code}"
				class="group rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-blue-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500 space-y-2 flex flex-col justify-between"
			>
				<div>
					<div class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
						Canonical Condition
					</div>
					<div class="flex items-center gap-2 mt-1.5">
						<RecordBadge id={finding.canonical_code || finding.cluster_code} variant="condition" class="text-xs px-2 py-0.5 shrink-0" />
						<span class="text-base font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 leading-snug line-clamp-2">
							{finding.canonical_label || finding.cluster_label}
						</span>
					</div>
				</div>
				<div class="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline pt-1">
					View Condition Detail Page →
				</div>
			</a>

			<!-- Card 3: Condition Domain (Clickable) -->
			<a
				href="{base}/domains"
				class="group rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-blue-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500 space-y-2 flex flex-col justify-between"
			>
				<div>
					<div class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
						Condition Domain
					</div>
					<div class="flex items-center gap-2 mt-1.5">
						{#if parentCc?.framework_axis}
							<span class="rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 font-mono text-xs font-bold shrink-0">
								{parentCc.framework_axis}
							</span>
						{/if}
						<span class="text-base font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 leading-snug line-clamp-2">
							{parentDomain ? parentDomain.label : (parentCc?.framework_axis || 'Condition Domain')}
						</span>
					</div>
				</div>
				<div class="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline pt-1">
					View Domains Page →
				</div>
			</a>
		</div>

		<!-- Section: Classifications -->
		<div class="space-y-4 pt-2">
			<div>
				<h3 class="text-2xl font-extrabold text-slate-900 dark:text-white">
					Classifications
				</h3>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Synthesis readiness statement, underlying transformation mechanism, and operationalization guidelines.
				</p>
			</div>

			<!-- 3-Column Synthesis Dimensions (Readiness Statement, Underlying Mechanism, Operationalization & Hint) -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<!-- Column 1: Readiness Statement (Pastel Sky/Blue) -->
				<div class="rounded-xl border border-sky-200/80 bg-sky-50/70 p-4 shadow-xs dark:border-sky-900/50 dark:bg-sky-950/20 space-y-2 flex flex-col justify-between">
					<div>
						<div class="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
							Readiness Statement
						</div>
						<p class="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal mt-1.5">
							{finding.readiness_statement || 'No explicit readiness statement defined.'}
						</p>
					</div>
				</div>

				<!-- Column 2: Underlying Mechanism (Pastel Violet/Purple) -->
				<div class="rounded-xl border border-violet-200/80 bg-violet-50/70 p-4 shadow-xs dark:border-violet-900/50 dark:bg-violet-950/20 space-y-2 flex flex-col justify-between">
					<div>
						<div class="text-xs font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300">
							Underlying Mechanism
						</div>
						<p class="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal mt-1.5">
							{finding.mechanism || 'No underlying mechanism specified.'}
						</p>
					</div>
				</div>

				<!-- Column 3: Operationalization & Measurement Hint (Pastel Emerald/Teal) -->
				<div class="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-4 shadow-xs dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-2 flex flex-col justify-between">
					<div>
						<div class="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
							Operationalization & Measurement Hint
						</div>
						<p class="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal mt-1.5">
							{finding.operationalization_hint || 'No operationalization hint provided.'}
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Extracted Text Spans (Relevant Passages Only) -->
		<div class="space-y-4 pt-2">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center">
						Extracted Source Passages
						<span class="ml-2.5 inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono">
							{finding.spans ? finding.spans.length : 0}
						</span>
					</h3>
					<p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
						The exact textual passages extracted from the paper supporting this finding (only the relevant passages are shown here).
					</p>
				</div>
				{#if finding.spans && finding.spans.length > 0}
					<a
						href="{base}/papers/{finding.corpus_id}?cf={finding.cf_id || finding.contribution_id}"
						class="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center gap-1"
					>
						Highlight all passages in full paper reader →
					</a>
				{/if}
			</div>

			{#if finding.spans && finding.spans.length > 0}
				<div class="space-y-4">
					{#each finding.spans as span}
						<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
							<div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/80">
								<div class="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
									<span class="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
										Span {span.span_order}
									</span>
									{#if span.source_locator}
										<span class="font-medium text-slate-900 dark:text-white">
											{span.source_locator}
										</span>
									{/if}
								</div>
								{#if span.source_line_start}
									<div class="flex items-center gap-3">
										<span class="font-mono text-xs text-slate-500 dark:text-slate-400">
											Lines {span.source_line_start}–{span.source_line_end}
										</span>
										<a
											href="{base}/papers/{finding.corpus_id}?cf={finding.cf_id || finding.contribution_id}&line={span.source_line_start}"
											class="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center gap-1"
										>
											Jump to line →
										</a>
									</div>
								{/if}
							</div>

							<blockquote class="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200 whitespace-pre-wrap">
								{span.source_excerpt}
							</blockquote>
						</div>
					{/each}
				</div>
			{:else}
				<div class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
					No text span excerpts attached to this finding record.
				</div>
			{/if}
		</div>

		<!-- Audit Rationale Dedicated Card -->
		<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-1">
			<div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
				Audit Rationale
			</div>
			<p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
				{finding.rationale || 'Source-verified during condition validity audit.'}
			</p>
		</div>

		<!-- Sibling Findings in Parent Condition -->
		{#if siblings.length > 0}
			<div class="space-y-4 pt-4">
				<div>
					<h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
						<span>Sibling Findings in Condition</span>
						<a
							href="{base}/conditions/{finding.canonical_code || finding.cluster_code}"
							class="text-blue-600 hover:underline dark:text-blue-400"
						>
							{finding.canonical_code || finding.cluster_code}
						</a>
						<span class="ml-1 inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono">
							{siblings.length}
						</span>
					</h3>
					<p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
						Other condition findings mapped to the same canonical condition.
					</p>
				</div>

				<DataTable items={sortedSiblings} columns={siblingColumns} sortKey={siblingSortKey} sortDirection={siblingSortDirection} onSort={toggleSiblingSort}>
					{#snippet cell(item, col)}
						{#if col.key === 'id'}
							<a href="{base}/findings/{item.cf_id || item.contribution_id}" class="inline-block hover:opacity-80 transition-opacity">
								<RecordBadge id={`CF${item.cf_id || item.contribution_id}`} variant="finding" />
							</a>

						{:else if col.key === 'raw_condition_label'}
							<a
								href="{base}/findings/{item.cf_id || item.contribution_id}"
								class="block font-semibold text-blue-600 hover:underline dark:text-blue-400 text-[15px] leading-snug break-words whitespace-normal"
								title={item.raw_condition_label}
							>
								{item.raw_condition_label}
							</a>
							{#if item.readiness_statement}
								<p class="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
									{item.readiness_statement}
								</p>
							{/if}

						{:else if col.key === 'paper'}
							<a
								href="{base}/papers/{item.corpus_id}"
								class="block font-semibold text-blue-600 hover:underline dark:text-blue-400 text-[15px] leading-snug"
								title={item.paper_title || item.title}
							>
								{item.paper_title || item.title}
							</a>
							<div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-normal">
								{item.paper_authors || item.authors} ({item.paper_year || item.year})
							</div>

						{:else if col.key === 'stream'}
							<span class="rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap {streamClass(item.stream)}">
								{item.stream || '—'}
							</span>

						{:else if col.key === 'evidence_role'}
							{#if item.evidence_role}
								<span class="rounded-full border px-2 py-0.5 text-xs font-semibold capitalize whitespace-nowrap {roleClass(item.evidence_role)}">
									{formatLabel(item.evidence_role)}
								</span>
							{:else}
								<span class="text-xs text-slate-400">—</span>
							{/if}

						{:else}
							{item[col.key] ?? '—'}
						{/if}
					{/snippet}
				</DataTable>
			</div>
		{/if}

	{:else}
		<div class="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
			<HelpCircle class="w-10 h-10 text-slate-400 mx-auto" />
			<h2 class="text-xl font-bold text-slate-900 dark:text-white">Condition Finding Not Found</h2>
			<p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
				No condition finding record matches ID CF{findingId}.
			</p>
			<a
				href="{base}/findings"
				class="inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mt-2"
			>
				Back to Condition Findings List
			</a>
		</div>
	{/if}

</div>
