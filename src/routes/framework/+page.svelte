<script>
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { canonicalConditions, conditionDomains, conditionFindings, metadata } from '$lib/dataStore.js';
	import { roleLabel } from '$lib/roles.js';
	import { ArrowRight, BookOpen, ChevronDown, Layers3, Library, ShieldCheck } from 'lucide-svelte';

	let expanded = $state(new Set());

	const DOMAIN_ACCENT = {
		CD1: '#00897B',
		CD2: '#1A237E',
		CD3: '#546E7A',
		CD4: '#039BE5',
		CD5: '#D84315',
		CD6: '#C88700',
		CD7: '#E67E00',
		CD8: '#F57C00',
		CD9: '#607D8B'
	};

	// Which domains carry which enabling function is the synthesis reading; the
	// domain names themselves are canonical data and are resolved at render time,
	// so a renamed domain cannot leave a stale name behind in this table.
	const FUNCTIONS = [
		{
			name: 'Coherent',
			codes: ['CD1'],
			question: 'Does transformation retain an explicit purpose, value logic, and continuous connection to execution?'
		},
		{
			name: 'Governable',
			codes: ['CD2'],
			question: 'Are authority, ownership, priorities, incentives, and trade-off mechanisms explicit?'
		},
		{
			name: 'Grounded',
			codes: ['CD3', 'CD4'],
			question: 'Are decisions grounded in visible dependencies, usable architecture, reliable data, and feasible platforms?'
		},
		{
			name: 'Executable and adaptable',
			codes: ['CD5', 'CD6', 'CD7'],
			question: 'Can the organization mobilize people, sense and seize opportunities, transform, learn, and reconfigure?'
		},
		{
			name: 'Correctable',
			codes: ['CD8'],
			question: 'Can the state of the enabling system be assessed credibly and converted into action and reassessment?'
		},
		{
			name: 'Calibrated to context',
			codes: ['CD9'],
			question: 'How do enterprise scale and sectoral, regional, regulatory, and institutional conditions change what is feasible?'
		}
	];

	const ROLE_STYLE = {
		core: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300',
		supporting: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
		operationalizing: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
		contingency: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300'
	};

	/** Name the domains a function is carried by, using their canonical labels. */
	function carriedBy(codes) {
		return codes
			.map((code) => `${code} · ${domains.find((d) => d.code === code)?.label ?? code}`)
			.join(' + ');
	}

	function toggleCondition(code) {
		const next = new Set(expanded);
		if (next.has(code)) next.delete(code);
		else next.add(code);
		expanded = next;
	}

	let paperCountsByCode = $derived((() => {
		const map = new Map();
		for (const f of $conditionFindings || []) {
			const code = f.canonical_code || f.cluster_code;
			if (!code) continue;
			if (!map.has(code)) map.set(code, new Set());
			if (f.corpus_id) map.get(code).add(f.corpus_id);
		}
		return map;
	})());

	let findingCountsByCode = $derived((() => {
		const map = new Map();
		for (const f of $conditionFindings || []) {
			const code = f.canonical_code || f.cluster_code;
			if (!code) continue;
			map.set(code, (map.get(code) || 0) + 1);
		}
		return map;
	})());

	let domains = $derived((() => {
		const ccs = $canonicalConditions || [];
		const rawDoms = $conditionDomains || [];

		return rawDoms.map(dom => {
			const domCCs = ccs.filter(c => c.framework_axis === dom.code || c.domain === dom.code);
			const conditions = domCCs.map(c => {
				const paperSet = paperCountsByCode.get(c.code);
				const paperCount = paperSet ? paperSet.size : 0;
				const findingCount = findingCountsByCode.get(c.code) || c.finding_count || 0;
				return {
					...c,
					id: c.id,
					code: c.code,
					label: c.label,
					definition: c.definition,
					domain: c.framework_axis || c.domain,
					role: c.framework_role || c.role,
					findingCount,
					paperCount
				};
			});

			return {
				code: dom.code,
				label: dom.label,
				kind: dom.kind || (dom.code === 'CD9' ? 'external' : 'internal'),
				logic: dom.definition || '',
				conditionCount: conditions.length,
				coreCount: conditions.filter(c => (c.role || c.framework_role) === 'core').length,
				conditions
			};
		});
	})());

	let stats = $derived((() => {
		const ccs = $canonicalConditions || [];
		const metaStats = $metadata?.stats || {};

		return {
			confirmed: ccs.length || metaStats.retainedConditionsCount || 60,
			core: ccs.filter(c => (c.framework_role || c.role) === 'core').length,
			supporting: ccs.filter(c => (c.framework_role || c.role) === 'supporting').length,
			operationalizing: ccs.filter(c => (c.framework_role || c.role) === 'operationalizing').length,
			contingency: ccs.filter(c => (c.framework_role || c.role) === 'contingency').length,
			internal: domains.filter(d => d.kind === 'internal').length,
			external: domains.filter(d => d.kind === 'external').length,
			findings: metaStats.frameworkFindingsCount || ($conditionFindings || []).length || 586,
			papers: metaStats.includedPapers || 209
		};
	})());

	let ready = $derived(($canonicalConditions || []).length > 0 || ($conditionDomains || []).length > 0);
</script>

<div class="space-y-8">
	<PageHeader
		title="Transformation-Enabling Conditions Framework"
		count={stats.confirmed || 0}
		subheading="The author-confirmed answer to RQ1: 60 transformation-enabling constructs organized in nine Condition Domains and grounded in 586 retained Condition Findings."
	/>

	{#if !ready}
		<div class="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-200">
			The final framework is not available.
		</div>
	{:else}
		<section class="flex flex-col items-stretch gap-2 xl:flex-row xl:items-center" aria-label="Evidence distilled into the RQ1 framework">
			{#each [
				{ label: 'Contributing publications', value: stats.papers, icon: ShieldCheck, href: `${base}/papers` },
				{ label: 'Framework findings', value: stats.findings, icon: BookOpen, href: `${base}/findings` },
				{ label: 'Retained constructs', value: stats.confirmed, icon: Layers3, href: `${base}/conditions` },
				{ label: 'Condition Domains', value: domains.length, icon: Library, href: `${base}/domains` }
			] as metric, index}
				<a
					href={metric.href}
					class="group min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-xs transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700 cursor-pointer"
				>
					<div class="flex items-center justify-between gap-3">
						<div>
							<div class="text-2xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">{metric.value || 0}</div>
							<div class="mt-1 text-xs font-medium text-gray-500 transition-colors group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400">{metric.label}</div>
						</div>
						<div class="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:group-hover:bg-blue-900/60">
							<metric.icon size={18} />
						</div>
					</div>
				</a>
				{#if index < 3}
					<div class="flex shrink-0 items-center justify-center px-2 py-1 text-blue-500 dark:text-blue-400" aria-hidden="true">
						<ArrowRight size={22} strokeWidth={2.25} class="rotate-90 xl:rotate-0" />
					</div>
				{/if}
			{/each}
		</section>

		<section class="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 dark:border-blue-900/60 dark:bg-blue-950/20">
			<p class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">Direct answer to RQ1</p>
			<p class="mt-3 max-w-5xl text-base leading-7 text-blue-950 dark:text-blue-100">
				The concept-centric review synthesizes 60 retained framework constructs in nine Condition Domains.
				Fifty-eight are positive internal transformation-enabling conditions and mechanisms; two contextual
				conditions delimit how those internal conditions can be configured and transferred. Together they
				provide an evidence-traceable framework for architecture-led, technology-driven enterprise transformation.
				They neither constitute a universal checklist nor guarantee transformation success.
			</p>
		</section>

		<section class="space-y-4">
			<div>
				<h2 class="text-xl font-bold text-gray-900 dark:text-white">The AHA: one system, five functions, calibrated to context.</h2>
				<p class="mt-2 max-w-5xl text-sm leading-6 text-gray-600 dark:text-gray-400">
					The nine domains are the taxonomy. The functions below are a reader-facing synthesis of the
					author-confirmed domain meanings, not another classification, a causal model, or a prescribed sequence.
					They provide the conceptual bridge from the RQ1 knowledge base to later RQ2 operationalization.
				</p>
			</div>

			<div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
				<table class="w-full min-w-[760px] text-left text-sm">
					<thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-950/40 dark:text-gray-400">
						<tr>
							<th class="px-4 py-3">Enabling function</th>
							<th class="px-4 py-3">Carried by</th>
							<th class="px-4 py-3">Practical question</th>
						</tr>
					</thead>
					<tbody>
						{#each FUNCTIONS as item}
							<tr class="border-t border-gray-100 align-top dark:border-gray-800">
								<td class="px-4 py-3 font-bold text-gray-900 dark:text-white">{item.name}</td>
								<td class="px-4 py-3 text-gray-600 dark:text-gray-300">{carriedBy(item.codes)}</td>
								<td class="px-4 py-3 leading-6 text-gray-600 dark:text-gray-400">{item.question}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p class="text-sm font-semibold text-gray-700 dark:text-gray-300">
				Are the conditions present for transformation to remain coherent, governable, grounded,
				executable and adaptable, and correctable in this context?
			</p>
		</section>

		<section class="space-y-4">
			<div class="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h2 class="text-xl font-bold text-gray-900 dark:text-white">Nine Condition Domains</h2>
					<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Eight internal domains describe what an enterprise can build or enact; CD9 calibrates application.
					</p>
				</div>
				<div class="text-xs text-gray-500 dark:text-gray-400">
					Roles: {stats.core} core · {stats.supporting} supporting · {stats.operationalizing} operationalizing · {stats.contingency} contextual
				</div>
			</div>

			<div class="columns-1 gap-4 lg:columns-2">
				{#each domains as domain}
					<div class="mb-4 break-inside-avoid">
						<article
							class="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-gray-900"
							style={`border-color:${DOMAIN_ACCENT[domain.code]}55`}
						>
							<header
								class="border-b px-4 py-3"
								style={`border-color:${DOMAIN_ACCENT[domain.code]}30;background:${DOMAIN_ACCENT[domain.code]}0D`}
							>
								<div class="flex items-start justify-between gap-3">
									<div class="min-w-0">
										<div class="flex flex-wrap items-center gap-2">
											<span
												class="rounded px-2 py-0.5 text-xs font-bold text-white"
												style={`background:${DOMAIN_ACCENT[domain.code]}`}
											>
												{domain.code}
											</span>
											<h3 class="text-sm font-semibold text-gray-900 dark:text-white">{domain.label}</h3>
											{#if domain.kind === 'external'}
												<span class="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
													external
												</span>
											{/if}
										</div>
										<p class="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{domain.logic}</p>
									</div>
									<span
										class="shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold"
										style={`border-color:${DOMAIN_ACCENT[domain.code]}45;background:${DOMAIN_ACCENT[domain.code]}12;color:${DOMAIN_ACCENT[domain.code]}`}
									>
										{domain.conditionCount} CCs{domain.coreCount ? ` · ${domain.coreCount} core` : ''}
									</span>
								</div>
							</header>

							<div class="divide-y divide-gray-100 dark:divide-gray-800">
								{#each domain.conditions as condition}
									<div class="{condition.role === 'core' ? 'bg-indigo-50/25 dark:bg-indigo-950/10' : ''}">
										<div class="flex items-center gap-2 px-4 py-2">
											<a
												href={`${base}/conditions/${condition.code}`}
												class="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
											>
												<span class="shrink-0 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[10px] text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
													{condition.code}
												</span>
												<span class="truncate">{condition.label}</span>
												<span class="shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium {ROLE_STYLE[condition.role] || ROLE_STYLE.supporting}">
													{roleLabel(condition.role)}
												</span>
											</a>
											<div class="flex shrink-0 items-center gap-1 font-mono text-[10px] text-gray-500 dark:text-gray-400">
												<span class="min-w-7 rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-center dark:border-gray-700 dark:bg-gray-800" title="Publications">
													{condition.paperCount}
												</span>
												<span class="min-w-7 rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-center dark:border-gray-700 dark:bg-gray-800" title="Findings">
													{condition.findingCount}
												</span>
												<button
													type="button"
													class="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
													aria-label={`${expanded.has(condition.code) ? 'Hide' : 'Show'} definition for ${condition.code}`}
													aria-expanded={expanded.has(condition.code)}
													onclick={() => toggleCondition(condition.code)}
												>
													<ChevronDown size={14} class="transition-transform {expanded.has(condition.code) ? 'rotate-180' : ''}" />
												</button>
											</div>
										</div>
										{#if expanded.has(condition.code)}
											<div class="border-t border-gray-100 px-4 py-2 text-xs leading-5 text-gray-600 dark:border-gray-800 dark:text-gray-300">
												{condition.definition}
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</article>
					</div>
				{/each}
			</div>
		</section>

		<section class="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/60">
			<h2 class="font-bold text-gray-900 dark:text-white">Claim boundary</h2>
			<ul class="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-600 dark:text-gray-400">
				<li>The domains are evidence-informed synthesis categories, not statistically derived factors or sequential maturity stages.</li>
				<li>Core, supporting, operationalizing, and contextual are narrative roles, not evidence grades or importance weights.</li>
				<li>The framework identifies what should be considered; it does not supply measures, weights, thresholds, costs, or a universal action order.</li>
				<li>Company-specific measurement and prioritization are design tasks for RQ2.</li>
			</ul>
		</section>
	{/if}
</div>
