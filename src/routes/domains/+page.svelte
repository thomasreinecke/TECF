<script>
	import { base } from '$app/paths';
	import FilterInput from '$lib/components/FilterInput.svelte';
	import RecordBadge from '$lib/components/RecordBadge.svelte';
	import { canonicalConditions, conditionFindings, conditionDomains } from '$lib/dataStore.js';
	import { Layers, ExternalLink } from 'lucide-svelte';

	let filterQuery = $state('');

	let allConditions = $derived($canonicalConditions || []);
	let allFindings = $derived($conditionFindings || []);
	let rawDomains = $derived($conditionDomains || []);

	// ---- Domain Definitions ----
	const DOMAIN_DEFINITIONS = [
		{ code: 'CD1', label: 'Strategy, Alignment & Value Logic' },
		{ code: 'CD2', label: 'Governance, Decision Rights & Accountability' },
		{ code: 'CD3', label: 'Enterprise Architecture Practice & Foundation' },
		{ code: 'CD4', label: 'Data, Technology & Platform Readiness' },
		{ code: 'CD5', label: 'Dynamic Capabilities & Organizational Agility' },
		{ code: 'CD6', label: 'Leadership, People & Collaboration' },
		{ code: 'CD7', label: 'Culture & Change Readiness' },
		{ code: 'CD8', label: 'Measurement, Maturity & Readiness Assessment' },
		{ code: 'CD9', label: 'Context, Ecosystem & Constraints' }
	];

	// ---- Map findings to conditions ----
	let findingsByCC = $derived((() => {
		/** @type {Record<string, any[]>} */
		const map = {};
		for (const f of allFindings) {
			const code = f.canonical_code || f.cluster_code;
			if (code) {
				if (!map[code]) map[code] = [];
				map[code].push(f);
			}
		}
		return map;
	})());

	// ---- Group conditions into domains ----
	let domainsData = $derived((() => {
		const source = rawDomains.length > 0 ? rawDomains : DOMAIN_DEFINITIONS;
		return source.map((dom) => {
			const ccs = dom.canonicalConditions || [];
			const conditionsWithFindings = ccs.map((c) => {
				const cFindings = findingsByCC[c.code] || [];
				const paperSet = new Set(cFindings.map((f) => f.corpus_id));
				return {
					...c,
					findings: cFindings,
					findingCount: cFindings.length,
					paperCount: paperSet.size
				};
			});
			const allDomainFindings = conditionsWithFindings.flatMap((c) => c.findings);
			const domainPaperSet = new Set(allDomainFindings.map((f) => f.corpus_id));

			return {
				domain_code: dom.code,
				domain_label: dom.label,
				conditions: conditionsWithFindings,
				findingsCount: allDomainFindings.length,
				papersCount: domainPaperSet.size
			};
		}).filter((d) => d.conditions.length > 0);
	})());

	// ---- Total Stats ----
	let confirmedFindings = $derived(domainsData.flatMap((d) => d.conditions.flatMap((c) => c.findings)));
	let totalConfirmedCount = $derived(allConditions.length);
	let totalFindingsCount = $derived(confirmedFindings.length);
	let totalPapersCount = $derived(new Set(confirmedFindings.map((f) => f.corpus_id)).size);

	// ---- Filtering & Search ----
	let normalizedQuery = $derived(filterQuery.trim().toLowerCase());

	/**
	 * @param {any} f
	 * @param {string} q
	 */
	function findingMatchesQuery(f, q) {
		return (
			(f.raw_condition_label || '') + ' ' +
			(f.readiness_statement || '') + ' ' +
			(f.paper_authors || f.authors || '') + ' ' +
			(f.paper_year || f.year || '') + ' ' +
			(f.stream || '') + ' ' +
			(f.evidence_role || '') + ' ' +
			(f.claim_provenance || '') + ' ' +
			`p${f.corpus_id}` + ' ' +
			`cf${f.cf_id || f.contribution_id}`
		).toLowerCase().includes(q);
	}

	/**
	 * @param {any} condition
	 * @param {string} q
	 * @param {boolean} [checkFindings]
	 */
	function conditionMatchesQuery(condition, q, checkFindings = true) {
		const condText = (
			condition.code + ' ' +
			condition.label + ' ' +
			(condition.definition || '') + ' ' +
			(condition.framework_role || '')
		).toLowerCase();

		if (condText.includes(q)) return true;
		if (checkFindings && condition.findings) {
			return condition.findings.some((f) => findingMatchesQuery(f, q));
		}
		return false;
	}

	/**
	 * @param {any} condition
	 * @param {any} domain
	 */
	function conditionVisibleAndMatches(condition, domain) {
		if (!normalizedQuery) return true;
		const domainMatches = (domain.domain_code + ' ' + domain.domain_label).toLowerCase().includes(normalizedQuery);
		if (domainMatches) return true;
		return conditionMatchesQuery(condition, normalizedQuery);
	}

	let visibleDomains = $derived(
		domainsData
			.map((domain) => ({
				...domain,
				conditions: domain.conditions.filter((c) => conditionVisibleAndMatches(c, domain))
			}))
			.filter((domain) => domain.conditions.length > 0)
	);

	let filteredConditionsCount = $derived(
		visibleDomains.reduce((sum, d) => sum + d.conditions.length, 0)
	);

	// ---- Expand / Collapse state (collapsed by default) ----
	let expandedDomains = $state(/** @type {Set<string>} */ (new Set()));
	let expandedConditions = $state(/** @type {Set<string>} */ (new Set()));

	let activeExpandedDomains = $derived.by(() => {
		if (!normalizedQuery) return expandedDomains;
		const set = new Set();
		for (const domain of domainsData) {
			const hasMatch = domain.conditions.some((c) => conditionVisibleAndMatches(c, domain));
			const domainMatches = (domain.domain_code + ' ' + domain.domain_label).toLowerCase().includes(normalizedQuery);
			if (domainMatches || hasMatch) set.add(domain.domain_code);
		}
		return set;
	});

	let activeExpandedConditions = $derived.by(() => {
		if (!normalizedQuery) return expandedConditions;
		const set = new Set();
		for (const domain of domainsData) {
			const domainMatches = (domain.domain_code + ' ' + domain.domain_label).toLowerCase().includes(normalizedQuery);
			for (const condition of domain.conditions) {
				const condMatches = conditionMatchesQuery(condition, normalizedQuery, false);
				const hasFindingMatch = condition.findings ? condition.findings.some((f) => findingMatchesQuery(f, normalizedQuery)) : false;
				if (domainMatches || condMatches || hasFindingMatch) set.add(condition.code);
			}
		}
		return set;
	});

	/** @param {string} code */
	function toggleDomain(code) {
		const next = new Set(expandedDomains);
		if (next.has(code)) next.delete(code);
		else next.add(code);
		expandedDomains = next;
	}

	/** @param {string} code */
	function toggleCondition(code) {
		const next = new Set(expandedConditions);
		if (next.has(code)) next.delete(code);
		else next.add(code);
		expandedConditions = next;
	}

	function expandAll() {
		expandedDomains = new Set(domainsData.map((d) => d.domain_code));
		expandedConditions = new Set(domainsData.flatMap((d) => d.conditions.map((c) => c.code)));
	}

	function collapseAll() {
		expandedDomains = new Set();
		expandedConditions = new Set();
	}

	// ---- Badges styling ----
	/** @param {string} role */
	function roleClass(role) {
		if (role === 'core') return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/25 dark:text-blue-300';
		if (role === 'supporting') return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/25 dark:text-purple-300';
		return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
	}

	/** @param {string} stream */
	function streamClass(stream) {
		if (stream === 'DT') return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/25 dark:text-blue-300';
		if (stream === 'EA') return 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/25 dark:text-purple-300';
		if (stream === 'BT') return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-300';
		if (stream === 'DC') return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-300';
		return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
	}

	/** @param {string} role */
	function evidenceClass(role) {
		if (role === 'support') return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/25 dark:text-sky-300';
		if (role === 'operationalization') return 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/25 dark:text-violet-300';
		if (role === 'boundary') return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300';
		return 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
	}
</script>

<div class="space-y-6">

	<!-- Overview Header Panel -->
	<div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 shadow-xs">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h2 class="text-2xl font-bold text-gray-900 dark:text-white">
					Condition Domains Inventory
				</h2>
				<p class="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
					The evidence-facing canonical layer — confirmed capability constructs grouped into strategic Condition Domains, with each construct's re-homed empirical findings.
				</p>
			</div>
			<div class="flex flex-wrap gap-2 items-center">
				<span class="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/25 dark:text-emerald-200">
					{domainsData.length} condition domains
				</span>
			</div>
		</div>
	</div>

	<!-- Controls Toolbar -->
	<div class="flex flex-wrap items-center justify-between gap-4 pt-3">
		<div class="inline-flex rounded-md shadow-xs shrink-0">
			<button
				type="button"
				onclick={expandAll}
				class="rounded-l-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
			>
				Expand All
			</button>
			<button
				type="button"
				onclick={collapseAll}
				class="rounded-r-md border border-l-0 border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
			>
				Collapse All
			</button>
		</div>

		<FilterInput
			bind:value={filterQuery}
			totalCount={allConditions.length}
			filteredCount={filteredConditionsCount}
			placeholder="Search CD, CC, or CF..."
			class="w-full sm:w-72"
		/>
	</div>

	<!-- Grouped Inventory View -->
	<div class="space-y-4">
		{#each visibleDomains as domain (domain.domain_code)}
			{@const isDomExpanded = activeExpandedDomains.has(domain.domain_code)}
			<section class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-xs">
				
				<!-- Domain Header -->
				<button
					type="button"
					onclick={() => toggleDomain(domain.domain_code)}
					class="flex w-full items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/80 px-5 py-3 text-left transition-colors hover:bg-gray-100/80 dark:border-gray-800 dark:bg-gray-950/40 dark:hover:bg-gray-950/60"
				>
					<span class="flex items-center gap-3">
						<RecordBadge id={domain.domain_code} variant="domain" />
						<span class="font-bold text-gray-900 dark:text-white text-sm">
							{domain.domain_label}
						</span>
					</span>
					<span class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
						<span>{domain.papersCount} papers · {domain.findingsCount} findings · {domain.conditions.length} conditions</span>
						<span class="font-bold text-base leading-none text-gray-400">{isDomExpanded ? '−' : '+'}</span>
					</span>
				</button>

				<!-- Domain Conditions List -->
				{#if isDomExpanded}
					<ul class="divide-y divide-gray-100 dark:divide-gray-800">
						{#each domain.conditions as condition (condition.code)}
							{@const isCondExpanded = activeExpandedConditions.has(condition.code)}
							<li>
								<!-- Condition Row Button -->
								<button
									type="button"
									onclick={() => toggleCondition(condition.code)}
									class="flex w-full items-start justify-between gap-4 px-5 py-3 text-left hover:bg-blue-50/30 dark:hover:bg-gray-800/30 transition-colors"
								>
									<div class="min-w-0 flex-1">
										<div class="flex flex-wrap items-center gap-2">
											<a href="{base}/conditions/{condition.code}" onclick={(e) => e.stopPropagation()} class="hover:opacity-80 transition-opacity">
												<RecordBadge id={`${domain.domain_code}-${condition.code}`} />
											</a>
											<a href="{base}/conditions/{condition.code}" onclick={(e) => e.stopPropagation()} class="font-bold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 text-base hover:underline">
												{condition.label}
											</a>
											{#if condition.framework_role}
												<span class="rounded border px-2 py-0.5 text-[11px] font-semibold capitalize {roleClass(condition.framework_role)}">
													{condition.framework_role}
												</span>
											{/if}
										</div>
										{#if condition.definition}
											<p class="mt-1.5 text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
												{condition.definition}
											</p>
										{/if}
									</div>

									<div class="flex items-center gap-3 shrink-0 text-[13px] text-slate-600 dark:text-slate-300 pt-0.5">
										<span>{condition.paperCount} papers · {condition.findingCount} findings</span>
										<span class="font-bold text-base leading-none text-slate-400">{isCondExpanded ? '−' : '+'}</span>
									</div>
								</button>

								<!-- Expanded Findings Drawer -->
								{#if isCondExpanded}
									<div class="border-t border-gray-100 bg-gray-50/60 px-5 py-4 dark:border-gray-800 dark:bg-gray-950/30">
										<div class="mb-3 flex items-center justify-between">
											<span class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
												Condition Findings ({condition.findings.length})
											</span>
											<a
												href="{base}/findings?q={condition.code}"
												class="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
											>
												Open in Findings table <ExternalLink size={12} />
											</a>
										</div>

										{#if condition.findings.length === 0}
											<p class="text-xs text-gray-400 italic">No direct findings linked to this condition.</p>
										{:else}
											<ul class="space-y-2">
												{#each condition.findings as finding (finding.cf_id || finding.contribution_id)}
													<li class="rounded-lg border border-gray-200 bg-white p-3 text-xs dark:border-gray-800 dark:bg-gray-900 shadow-2xs space-y-1.5">
														<div class="flex flex-wrap items-center justify-between gap-2">
															<div class="flex flex-wrap items-center gap-2">
																<RecordBadge id={`CF${finding.cf_id || finding.contribution_id}`} variant="finding" />
																{#if finding.stream}
																	<span class="rounded-full border px-2 py-0.5 text-[10px] font-semibold {streamClass(finding.stream)}">
																		{finding.stream}
																	</span>
																{/if}
																{#if finding.evidence_role}
																	<span class="rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize {evidenceClass(finding.evidence_role)}">
																		{finding.evidence_role}
																	</span>
																{/if}
															</div>
															<a
																href="{base}/papers/{finding.corpus_id}?cf={finding.cf_id || finding.contribution_id}"
																class="font-medium text-blue-600 hover:underline dark:text-blue-400 text-xs flex items-center gap-1"
															>
																{finding.paper_authors || finding.authors || 'Author'} ({finding.paper_year || finding.year}) · <RecordBadge id={`P${finding.corpus_id}`} variant="paper" />
																<ExternalLink size={10} />
															</a>
														</div>
														<p class="text-gray-800 dark:text-gray-200 font-medium leading-snug">
															{finding.readiness_statement || finding.raw_condition_label}
														</p>
													</li>
												{/each}
											</ul>
										{/if}
									</div>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		{/each}

		{#if visibleDomains.length === 0}
			<div class="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
				No condition domains or findings match "{filterQuery}".
			</div>
		{/if}
	</div>

</div>
