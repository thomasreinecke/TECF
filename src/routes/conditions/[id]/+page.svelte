<script>
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import RecordBadge from '$lib/components/RecordBadge.svelte';
	import FilterInput from '$lib/components/FilterInput.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import { canonicalConditions, conditionDomains, conditionFindings } from '$lib/dataStore.js';
	import { roleLabel } from '$lib/roles.js';
	import { ArrowLeft, FileText, Layers, ShieldCheck, Sparkles } from 'lucide-svelte';

	let ccId = $derived(($page.params.id || '').toUpperCase());

	let condition = $derived(($canonicalConditions || []).find(c => c.code.toUpperCase() === ccId) || null);

	let domain = $derived((() => {
		if (!condition) return null;
		const doms = $conditionDomains || [];
		return doms.find(d => d.code === condition.framework_axis || (d.canonicalConditions || []).some(c => c.code === condition.code)) || null;
	})());

	let findings = $derived((() => {
		if (!condition) return [];
		return ($conditionFindings || []).filter(f => f.canonical_code === condition.code || f.cluster_code === condition.code);
	})());

	let papersCount = $derived(new Set(findings.map(f => f.corpus_id)).size);

	function roleClass(role) {
		if (role === 'support') return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/25 dark:text-sky-300';
		if (role === 'operationalization') return 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/25 dark:text-violet-300';
		if (role === 'boundary') return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
		if (role === 'core') return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200';
		if (role === 'supporting') return 'border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-200';
		return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
	}

	function formatLabel(val) {
		if (!val) return '—';
		if (val === 'source_attributed') return 'Paper Argument';
		if (val === 'empirical_case') return 'Empirical Case';
		return val.charAt(0).toUpperCase() + val.slice(1).replace(/_/g, ' ');
	}

	function streamClass(stream) {
		if (stream === 'Strategic Agility' || stream === 'SA') return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300';
		if (stream === 'Enterprise Architecture' || stream === 'EA') return 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300';
		if (stream === 'Digital Transformation' || stream === 'DT') return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300';
		return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300';
	}

	let showCitations = $state(true);

	// ---- Findings Table State & Filtering ----
	let findingsFilter = $state('');
	let findingsSortKey = $state('id');
	let findingsSortDirection = $state('asc');

	const findingColumns = [
		{ key: 'id', title: 'ID', sortable: true, width: '6%' },
		{ key: 'raw_condition_label', title: 'Extracted Condition / Empirical Finding', sortable: true, width: '36%', overflow: 'wrap' },
		{ key: 'paper', title: 'Paper', sortable: true, width: '26%', overflow: 'wrap' },
		{ key: 'stream', title: 'Stream', sortable: true, width: '8%' },
		{ key: 'evidence_role', title: 'Evidence Role', sortable: true, width: '11%' },
		{ key: 'claim_provenance', title: 'Provenance', sortable: true, width: '13%' }
	];

	let filteredFindings = $derived((() => {
		const query = findingsFilter.trim().toLowerCase();
		let rows = findings;
		if (query) {
			rows = rows.filter(r =>
				[
					`CF${r.cf_id || r.contribution_id}`,
					r.raw_condition_label,
					r.readiness_statement,
					r.paper_title || r.title,
					r.paper_authors || r.authors,
					r.stream,
					r.evidence_role,
					r.claim_provenance
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase()
					.includes(query)
			);
		}

		const dir = findingsSortDirection === 'asc' ? 1 : -1;
		return [...rows].sort((a, b) => {
			let aVal = a[findingsSortKey];
			let bVal = b[findingsSortKey];
			if (findingsSortKey === 'id') {
				aVal = a.cf_id || a.contribution_id || 0;
				bVal = b.cf_id || b.contribution_id || 0;
			} else if (findingsSortKey === 'paper') {
				aVal = a.paper_title || a.title || '';
				bVal = b.paper_title || b.title || '';
			}
			if (aVal == null) return 1;
			if (bVal == null) return -1;
			if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
			return String(aVal).localeCompare(String(bVal), undefined, { numeric: true }) * dir;
		});
	})());

	function toggleFindingsSort(key) {
		if (findingsSortKey === key) findingsSortDirection = findingsSortDirection === 'asc' ? 'desc' : 'asc';
		else {
			findingsSortKey = key;
			findingsSortDirection = 'asc';
		}
	}
</script>

<svelte:head>
	<title>{condition ? `${condition.code} — ${condition.label} | TECF` : 'Canonical Condition Detail | TECF'}</title>
</svelte:head>

<div class="space-y-6">

	{#if condition}
		<!-- Header Panel -->
		<div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div class="flex-1 min-w-0">
					<h1 class="text-3xl font-extrabold text-gray-900 dark:text-white flex flex-wrap items-center gap-3">
						<RecordBadge id={condition.code} variant="condition" class="text-sm px-2.5 py-1" />
						<span>{condition.label}</span>
					</h1>
					<p class="mt-1.5 w-full text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
						{condition.definition || 'No explicit definition recorded.'}
					</p>
				</div>
				<div class="flex flex-wrap gap-2 items-center">
					<span class="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-200">
						Findings: {findings.length}
					</span>
				</div>
			</div>
		</div>

		<!-- Key Review Metrics Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-1">
				<div class="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Condition Domain</div>
				{#if domain}
					<a
						href="{base}/domains"
						class="text-xl font-bold text-blue-600 hover:underline dark:text-blue-400 block leading-snug"
						title="View domain in Domains list"
					>
						{domain.code} {domain.label}
					</a>
				{:else}
					<div class="text-xl font-bold text-slate-900 dark:text-white leading-snug">Domain Unassigned</div>
				{/if}
				<div class="text-sm text-slate-500 dark:text-slate-400">RQ1 Domain Scope</div>
			</div>

			<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-1">
				<div class="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Synthesis Role</div>
				<div class="text-xl font-bold text-slate-900 dark:text-white capitalize leading-snug">
					{roleLabel(condition.framework_role) || 'core'} Condition
				</div>
				<div class="text-sm text-slate-500 dark:text-slate-400">Condition Role Tier</div>
			</div>

			<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-1">
				<div class="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Evidence Base</div>
				<div class="text-xl font-bold text-slate-900 dark:text-white leading-snug">
					{findings.length} Findings / {papersCount} Papers
				</div>
				<div class="text-sm text-slate-500 dark:text-slate-400">Ground-truth Extractions</div>
			</div>
		</div>

		<!-- Narrative Section (if present) -->
		{#if condition.narrative && condition.narrative.sentences && condition.narrative.sentences.length > 0}
			<div class="rounded-2xl border border-indigo-200/80 bg-indigo-50/60 p-6 shadow-sm dark:border-indigo-900/40 dark:bg-indigo-950/30">
				<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
					<div class="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
						Narrative
					</div>
					<button
						type="button"
						onclick={() => (showCitations = !showCitations)}
						class="rounded-lg border border-indigo-200/80 bg-white/80 px-2.5 py-1 text-xs font-semibold text-indigo-800 transition-colors hover:bg-white dark:border-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-900/60"
					>
						{showCitations ? 'Hide citations' : 'Show citations'}
					</button>
				</div>

				<!-- Punctuation and spacing go through expressions: Svelte trims literal
				     whitespace around tags, which would glue citations onto the sentence. -->
				<p class="text-base sm:text-[17px] leading-8 text-slate-900 dark:text-slate-100">
					{#each condition.narrative.sentences as sentence, index}{index > 0 ? ' ' : ''}{showCitations && sentence.cites.length > 0
							? sentence.text.replace(/\.$/, '')
							: sentence.text}{#if showCitations && sentence.cites.length > 0}<span
								class="text-indigo-900/60 dark:text-indigo-300/60">{' ('}</span
							>{#each sentence.cites as cite, position}<span class="text-indigo-900/60 dark:text-indigo-300/60"
									>{position > 0 ? '; ' : ''}</span
								><a
									href="{base}/papers/{cite.corpus_id}"
									class="text-blue-600 hover:underline dark:text-blue-400 font-semibold">{cite.label}</a
								>{/each}<span class="text-indigo-900/60 dark:text-indigo-300/60">{').'}</span>{/if}{/each}
				</p>
				<p class="mt-4 text-xs italic text-indigo-900/70 dark:text-indigo-300/70 leading-relaxed">
					Synthesized from this condition's Condition Findings below — adds no evidence beyond them and asserts no causal relations.
				</p>
			</div>
		{/if}

		<!-- Positively-Worded Enabling Statement Callout Box (if present) -->
		{#if condition.enabling_statement}
			<div class="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-1.5">
				<div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
					<Sparkles class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
					Positively-Worded Enabling Statement (Canonical Condition)
				</div>
				<p class="text-base sm:text-lg leading-relaxed text-slate-900 dark:text-slate-100 font-normal">
					{condition.enabling_statement}
				</p>
			</div>
		{/if}

		<hr class="border-slate-200 dark:border-slate-800 my-6" />

		<!-- Retained condition findings DataTable -->
		<div class="space-y-4">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
						<span>Condition Findings</span>
						<span class="inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono">
							{filteredFindings.length}
						</span>
					</h3>
				</div>
				<div class="shrink-0">
					<FilterInput
						bind:value={findingsFilter}
						placeholder="Filter findings..."
						class="w-64"
					/>
				</div>
			</div>

			<DataTable
				items={filteredFindings}
				columns={findingColumns}
				sortKey={findingsSortKey}
				sortDirection={findingsSortDirection}
				onSort={toggleFindingsSort}
			>
				{#snippet cell(item, col)}
					{#if col.key === 'id'}
						<RecordBadge id={`CF${item.cf_id || item.contribution_id}`} variant="finding" />

					{:else if col.key === 'raw_condition_label'}
						<a
							href="{base}/papers/{item.corpus_id}?cf={item.cf_id || item.contribution_id}"
							class="block font-semibold text-blue-600 hover:underline dark:text-blue-400 text-[15px] leading-snug break-words whitespace-normal"
							title={item.raw_condition_label}
						>
							{item.raw_condition_label}
						</a>
						{#if item.readiness_statement}
							<div class="mt-1 text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 leading-relaxed">
								"{item.readiness_statement}"
							</div>
						{/if}

					{:else if col.key === 'paper'}
						<a
							href="{base}/papers/{item.corpus_id}"
							class="block font-semibold text-blue-600 hover:underline dark:text-blue-400 text-[15px] leading-snug"
							title={item.paper_title || item.title}
						>
							{item.paper_title || item.title}
						</a>
						<div class="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
							{item.paper_authors || item.authors} ({item.paper_year || item.year})
						</div>

					{:else if col.key === 'stream'}
						{#if item.stream}
							<span class="rounded-full border px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap {streamClass(item.stream)}">
								{item.stream}
							</span>
						{:else}
							<span class="text-sm text-slate-400">—</span>
						{/if}

					{:else if col.key === 'evidence_role'}
						{#if item.evidence_role}
							<span class="rounded-full border px-2.5 py-0.5 text-[13px] font-semibold capitalize whitespace-nowrap {roleClass(item.evidence_role)}">
								{formatLabel(item.evidence_role)}
							</span>
						{:else}
							<span class="text-sm text-slate-400">—</span>
						{/if}

					{:else if col.key === 'claim_provenance'}
						{#if item.claim_provenance}
							<span class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[13px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 whitespace-nowrap">
								{formatLabel(item.claim_provenance)}
							</span>
						{:else}
							<span class="text-sm text-slate-400">—</span>
						{/if}

					{:else}
						{item[col.key] ?? '—'}
					{/if}
				{/snippet}
			</DataTable>
		</div>

	{:else}
		<!-- Not found state -->
		<div class="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
			<div class="text-4xl">🔍</div>
			<h2 class="text-2xl font-bold text-slate-900 dark:text-white">Canonical Condition Not Found</h2>
			<p class="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
				No canonical condition matching code <code class="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{ccId}</code> was found.
			</p>
			<a
				href="{base}/conditions"
				class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
			>
				<ArrowLeft class="w-4 h-4" />
				Return to Canonical Conditions Table
			</a>
		</div>
	{/if}

</div>
