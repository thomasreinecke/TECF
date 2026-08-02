<script>
	import { base } from "$app/paths";
	import {
		canonicalConditions,
		conditionDomains,
		conditionFindings,
		framework,
		metadata,
	} from "$lib/dataStore.js";
	import { roleLabel } from "$lib/roles.js";
	import {
		ArrowRight,
		BookOpen,
		ChevronDown,
		Layers,
		Library,
		ShieldCheck,
		CheckCircle2,
		AlertCircle,
		Scale,
		ShieldAlert,
	} from "lucide-svelte";

	let expanded = $state(new Set());

	const DOMAIN_ACCENT = {
		CD1: "#00897B",
		CD2: "#1A237E",
		CD3: "#546E7A",
		CD4: "#039BE5",
		CD5: "#D84315",
		CD6: "#C88700",
		CD7: "#E67E00",
		CD8: "#F57C00",
		CD9: "#607D8B",
	};

	const ROLE_STYLE = {
		core: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300",
		supporting:
			"border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
		operationalizing:
			"border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
		contingency:
			"border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
	};

	function toggleCondition(code) {
		const next = new Set(expanded);
		if (next.has(code)) next.delete(code);
		else next.add(code);
		expanded = next;
	}

	let paperCountsByCode = $derived(
		(() => {
			const map = new Map();
			for (const f of $conditionFindings || []) {
				const code = f.canonical_code || f.cluster_code;
				if (!code) continue;
				if (!map.has(code)) map.set(code, new Set());
				if (f.corpus_id) map.get(code).add(f.corpus_id);
			}
			return map;
		})(),
	);

	let findingCountsByCode = $derived(
		(() => {
			const map = new Map();
			for (const f of $conditionFindings || []) {
				const code = f.canonical_code || f.cluster_code;
				if (!code) continue;
				map.set(code, (map.get(code) || 0) + 1);
			}
			return map;
		})(),
	);

	let domains = $derived(
		(() => {
			const ccs = $canonicalConditions || [];
			const rawDoms = $conditionDomains || [];

			return rawDoms.map((dom) => {
				const domCCs = ccs.filter(
					(c) =>
						c.framework_axis === dom.code || c.domain === dom.code,
				);
				const conditions = domCCs.map((c) => {
					const paperSet = paperCountsByCode.get(c.code);
					const paperCount = paperSet ? paperSet.size : 0;
					const findingCount =
						findingCountsByCode.get(c.code) || c.finding_count || 0;
					return {
						...c,
						id: c.id,
						code: c.code,
						label: c.label,
						definition: c.definition,
						domain: c.framework_axis || c.domain,
						role: c.framework_role || c.role,
						findingCount,
						paperCount,
					};
				});

				return {
					code: dom.code,
					label: dom.label,
					kind:
						dom.kind ||
						(dom.code === "CD9" ? "external" : "internal"),
					logic: dom.definition || "",
					conditionCount: conditions.length,
					coreCount: conditions.filter(
						(c) => (c.role || c.framework_role) === "core",
					).length,
					conditions,
				};
			});
		})(),
	);

	let stats = $derived(
		(() => {
			const ccs = $canonicalConditions || [];
			const metaStats = $metadata?.stats || {};

			return {
				confirmed: ccs.length || metaStats.retainedConditionsCount,
				core: ccs.filter((c) => (c.framework_role || c.role) === "core")
					.length,
				supporting: ccs.filter(
					(c) => (c.framework_role || c.role) === "supporting",
				).length,
				operationalizing: ccs.filter(
					(c) => (c.framework_role || c.role) === "operationalizing",
				).length,
				contingency: ccs.filter(
					(c) => (c.framework_role || c.role) === "contingency",
				).length,
				internal: domains.filter((d) => d.kind === "internal").length,
				external: domains.filter((d) => d.kind === "external").length,
				// No numeric literals as fallbacks: a stale constant that silently
				// replaces a missing value is indistinguishable from a correct one.
				// Both figures come from metadata.json, which the exporter writes
				// from SQLite and guards against count drift; the finding count
				// falls back only to the payload actually loaded on this page.
				findings:
					metaStats.frameworkFindingsCount ??
					($conditionFindings || []).length,
				papers: metaStats.includedPapers ?? null,
			};
		})(),
	);

	/** @param {any} entry */
	function withRelatedCodes(entry) {
		return {
			...entry,
			relatedCodes: String(entry.related_cluster_codes || "")
				.split(",")
				.map((code) => code.trim())
				.filter(Boolean),
		};
	}

	/** @type {any[]} */
	let registerEntries = $derived($framework?.registers || []);
	let tensions = $derived(
		registerEntries
			.filter((entry) => entry.register_type === "tension")
			.map(withRelatedCodes),
	);
	let antipatterns = $derived(
		registerEntries
			.filter((entry) => entry.register_type === "antipattern")
			.map(withRelatedCodes),
	);

	let ready = $derived(
		($canonicalConditions || []).length > 0 ||
			($conditionDomains || []).length > 0,
	);
</script>

<svelte:head>
	<title>Synthesis Framework | TECF</title>
</svelte:head>

<div class="space-y-8 pb-12 pt-6">
	<!-- Main Body Container -->
	<div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-10">
		{#if !ready}
			<div
				class="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-200"
			>
				The final framework is not available.
			</div>
		{:else}
			<!-- 4 High-Impact Evidence Flow Cards -->
			<section
				class="flex flex-col items-stretch gap-3 xl:flex-row xl:items-center"
				aria-label="Evidence distilled into the TECF framework"
			>
				{#each [{ label: "Contributing SLR Publications", value: stats.papers, icon: ShieldCheck, href: `${base}/papers`, subtitle: "Confirmed literature corpus" }, { label: "Retained Condition Findings", value: stats.findings, icon: BookOpen, href: `${base}/findings`, subtitle: "Source-traceable passages" }, { label: "Canonical Conditions", value: stats.confirmed, icon: Layers, href: `${base}/conditions`, subtitle: "Author-confirmed synthesis" }, { label: "Condition Domains", value: domains.length, icon: Library, href: `${base}/domains`, subtitle: "Strategic capability groupings" }] as metric, index}
					<a
						href={metric.href}
						class="group min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-blue-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500 cursor-pointer"
					>
						<div class="flex items-center justify-between gap-3">
							<div>
								<div
									class="text-3xl font-extrabold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 font-mono tracking-tight"
								>
									{metric.value || 0}
								</div>
								<div
									class="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
								>
									{metric.label}
								</div>
								<div
									class="text-xs text-slate-400 dark:text-slate-500 mt-0.5"
								>
									{metric.subtitle}
								</div>
							</div>
							<div
								class="rounded-xl bg-blue-50 p-3 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/40 dark:text-blue-300 dark:group-hover:bg-blue-600 dark:group-hover:text-white shrink-0"
							>
								<metric.icon class="w-6 h-6" />
							</div>
						</div>
					</a>
					{#if index < 3}
						<div
							class="flex shrink-0 items-center justify-center px-1 text-slate-400 dark:text-slate-600"
							aria-hidden="true"
						>
							<ArrowRight class="w-5 h-5 rotate-90 xl:rotate-0" />
						</div>
					{/if}
				{/each}
			</section>

			<!-- Framework Synthesis Overview Card -->
			<section
				class="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-50 p-6 sm:p-8 dark:border-blue-900/60 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900 shadow-sm relative overflow-hidden"
			>
				<div class="flex items-center gap-2">
					<span
						class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-xs"
					>
						<BookOpen class="w-3.5 h-3.5" />
						Synthesis Overview
					</span>
				</div>
				<p
					class="mt-4 text-base sm:text-lg leading-relaxed text-slate-900 dark:text-slate-100 font-medium max-w-5xl"
				>
					The concept-centric review synthesizes <strong
						>60 retained canonical conditions</strong
					>
					organized into <strong>nine Condition Domains</strong>.
					Fifty-eight represent positive internal
					transformation-enabling conditions and mechanisms; two
					contextual conditions delimit how those internal conditions
					can be configured and transferred. Together they provide an
					evidence-traceable framework for architecture-led,
					technology-driven enterprise transformation.
				</p>
			</section>

			<!-- Nine Condition Domains Grid Section -->
			<section class="space-y-6 pt-4">
				<div
					class="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4"
				>
					<div>
						<h2
							class="text-3xl font-extrabold text-slate-900 dark:text-white"
						>
							Nine Condition Domains
						</h2>
						<p
							class="mt-1.5 text-lg text-slate-600 dark:text-slate-400"
						>
							Eight internal domains describe what an enterprise
							can build or enact; CD9 calibrates application.
						</p>
					</div>
					<div
						class="flex flex-wrap items-center gap-2.5 text-sm font-semibold"
					>
						<span
							class="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
							>{stats.core} Core</span
						>
						<span
							class="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
							>{stats.supporting} Supporting</span
						>
						<span
							class="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
							>{stats.operationalizing} Operationalizing</span
						>
						<span
							class="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
							>{stats.contingency} Contextual</span
						>
					</div>
				</div>

				<div class="columns-1 gap-6 lg:columns-2">
					{#each domains as domain}
						<div class="mb-6 break-inside-avoid">
							<article
								class="overflow-hidden rounded-2xl border bg-white shadow-xs dark:bg-slate-900 transition-all hover:shadow-md"
								style={`border-color:${DOMAIN_ACCENT[domain.code]}55`}
							>
								<!-- Domain Header -->
								<header
									class="border-b px-5 py-4"
									style={`border-color:${DOMAIN_ACCENT[domain.code]}30;background:${DOMAIN_ACCENT[domain.code]}0D`}
								>
									<div
										class="flex items-start justify-between gap-3"
									>
										<div class="min-w-0">
											<div
												class="flex flex-wrap items-center gap-2"
											>
												<span
													class="rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-white shadow-xs"
													style={`background:${DOMAIN_ACCENT[domain.code]}`}
												>
													{domain.code}
												</span>
												<h3
													class="text-xl font-bold text-slate-900 dark:text-white"
												>
													{domain.label}
												</h3>
												{#if domain.kind === "external"}
													<span
														class="rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 uppercase tracking-wider"
													>
														External Context
													</span>
												{/if}
											</div>
											<p
												class="mt-2 text-base text-slate-600 dark:text-slate-400 leading-relaxed"
											>
												{domain.logic}
											</p>
										</div>
										<span
											class="shrink-0 rounded-lg border px-2.5 py-1 text-xs font-mono font-bold"
											style={`border-color:${DOMAIN_ACCENT[domain.code]}45;background:${DOMAIN_ACCENT[domain.code]}12;color:${DOMAIN_ACCENT[domain.code]}`}
										>
											{domain.conditionCount} CCs{#if domain.coreCount}
												· {domain.coreCount} core{/if}
										</span>
									</div>
								</header>

								<!-- Canonical Conditions List -->
								<div
									class="divide-y divide-slate-100 dark:divide-slate-800/80"
								>
									{#each domain.conditions as condition}
										<div
											class={condition.role === "core"
												? "bg-blue-50/20 dark:bg-blue-950/10"
												: ""}
										>
											<div
												class="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
											>
												<a
													href={`${base}/conditions/${condition.code}`}
													class="flex min-w-0 flex-1 items-center gap-2.5 text-base font-semibold text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
												>
													<span
														class="shrink-0 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
													>
														{condition.code}
													</span>
													<span class="truncate"
														>{condition.label}</span
													>
													<span
														class="shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider {ROLE_STYLE[
															condition.role
														] ||
															ROLE_STYLE.supporting}"
													>
														{roleLabel(
															condition.role,
														)}
													</span>
												</a>

												<div
													class="flex shrink-0 items-center gap-1.5 font-mono text-xs"
												>
													<span
														class="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold"
													>
														{condition.paperCount} P
													</span>
													<span
														class="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold"
													>
														{condition.findingCount} CF
													</span>
													<button
														type="button"
														class="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-100"
														aria-label={`${expanded.has(condition.code) ? "Hide" : "Show"} definition for ${condition.code}`}
														aria-expanded={expanded.has(
															condition.code,
														)}
														onclick={() =>
															toggleCondition(
																condition.code,
															)}
													>
														<ChevronDown
															class="w-4 h-4 transition-transform {expanded.has(
																condition.code,
															)
																? 'rotate-180'
																: ''}"
														/>
													</button>
												</div>
											</div>

											{#if expanded.has(condition.code)}
												<div
													class="border-t border-slate-100 px-5 py-3 text-[15px] leading-relaxed text-slate-700 dark:border-slate-800 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/30"
												>
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

			<!-- Design Tensions & Anti-Patterns Section -->
			<section class="space-y-6 pt-4">
				<div>
					<h2
						class="text-3xl font-extrabold text-slate-900 dark:text-white"
					>
						Design Tensions &amp; Anti-Patterns
					</h2>
					<p
						class="mt-1.5 max-w-4xl text-lg leading-relaxed text-slate-600 dark:text-slate-400"
					>
						Author-confirmed boundary material, not additional framework
						constructs. Tensions record pairs of evidence-backed but
						competing prescriptions that require a context-specific
						design choice, not a universal answer. Anti-patterns record
						recurring failure modes the evidence documents when a
						condition is ignored or misapplied.
					</p>
				</div>

				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div
						class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
					>
						<h3
							class="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white"
						>
							<Scale class="w-5 h-5 text-amber-500" /> Tensions ({tensions.length})
						</h3>
						<div class="mt-4 space-y-3">
							{#each tensions as entry (entry.id)}
								<div
									class="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/30"
								>
									<div class="font-bold text-slate-900 dark:text-white">
										{entry.entry_code} — {entry.title}
									</div>
									<p
										class="mt-1.5 text-base leading-relaxed text-slate-600 dark:text-slate-300"
									>
										{entry.body}
									</p>
									<div class="mt-2.5 flex flex-wrap gap-1.5">
										{#each entry.relatedCodes as code}
											<a
												href={`${base}/conditions/${code}`}
												class="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
											>
												{code}
											</a>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
					<div
						class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
					>
						<h3
							class="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white"
						>
							<ShieldAlert class="w-5 h-5 text-rose-500" /> Anti-Patterns ({antipatterns.length})
						</h3>
						<div class="mt-4 space-y-3">
							{#each antipatterns as entry (entry.id)}
								<div
									class="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/30"
								>
									<div class="font-bold text-slate-900 dark:text-white">
										{entry.entry_code} — {entry.title}
									</div>
									<p
										class="mt-1.5 text-base leading-relaxed text-slate-600 dark:text-slate-300"
									>
										{entry.body}
									</p>
									<div class="mt-2.5 flex flex-wrap gap-1.5">
										{#each entry.relatedCodes as code}
											<a
												href={`${base}/conditions/${code}`}
												class="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
											>
												{code}
											</a>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</section>

			<!-- Claim Boundary Section -->
			<section
				class="rounded-2xl border border-slate-200 bg-slate-100/60 p-6 dark:border-slate-800 dark:bg-slate-900/60 space-y-3"
			>
				<div
					class="flex items-center gap-2 text-slate-900 dark:text-white font-bold"
				>
					<AlertCircle class="w-4 h-4 text-amber-500" />
					<h2 class="text-xl font-bold">Framework Claim Boundary</h2>
				</div>
				<ul
					class="list-disc space-y-1.5 pl-5 text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300"
				>
					<li>
						The domains are evidence-informed synthesis categories,
						not statistically derived factors or sequential maturity
						stages.
					</li>
					<li>
						Core, supporting, operationalizing, and contextual are
						narrative roles, not evidence grades or importance
						weights.
					</li>
					<li>
						The framework identifies what should be considered; it
						does not supply measures, weights, thresholds, costs, or
						a universal action order.
					</li>
					<li>
						Company-specific measurement and prioritization are
						contextual design tasks for practical adoption.
					</li>
				</ul>
			</section>
		{/if}
	</div>
</div>
