<script>
	import './layout.css';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { Sun, Moon, ArrowRight } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { loadStaticData } from '$lib/dataStore.js';

	let isDark = false;
	let y = 0;

	onMount(() => {
		loadStaticData();
		isDark = document.documentElement.classList.contains('dark');
	});

	function toggleTheme() {
		isDark = !isDark;
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}

	$: currentPath = $page.url.pathname;
	$: isPreviewPage = currentPath.includes('/preview');
	$: isFrameworkPage = currentPath.endsWith('/framework') || currentPath === `${base}/` || currentPath === base;
	$: isScrolled = y > 10;

	$: breadcrumbs = (() => {
		const crumbs = [{ name: "Framework", href: `${base}/framework` }];
		const cleanPath = currentPath.replace(base, '');
		const pathParts = cleanPath.split("/").filter(Boolean);
		if (pathParts.length >= 1) {
			const section = pathParts[0];
			let name = section.charAt(0).toUpperCase() + section.slice(1);
			if (section === 'papers') name = 'Papers';
			else if (section === 'findings') name = 'Findings';
			else if (section === 'extraction') name = 'Extraction';
			else if (section === 'conditions') name = 'Conditions';
			else if (section === 'domains') name = 'Domains';
			else if (section === 'framework') name = 'Framework';
			crumbs.push({ name, href: `${base}/${section}` });
		}
		return crumbs;
	})();
</script>

<svelte:window bind:scrollY={y} />

<svelte:head>
	<title>TECF - Transformation-Enabling Conditions Framework</title>
</svelte:head>

<div class="flex flex-col bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-gray-100 antialiased font-sans transition-colors duration-200 {isPreviewPage ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'}">
	<!-- Sticky Header Navigation Bar -->
	<header class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 sticky top-0 z-50 transition-all text-white relative shrink-0 {isFrameworkPage && !isScrolled ? 'border-b-0 shadow-none' : 'border-b border-indigo-900/50 shadow-md'}">
		{#if isFrameworkPage}
			<!-- Bleed strip: repaints with the header on every scroll frame, masking the sub-pixel seam that sticky positioning can otherwise flicker against the masthead below -->
			<div
				class="pointer-events-none absolute inset-x-0 top-full h-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950"
				aria-hidden="true"
			></div>
		{/if}
		<!-- Navigation Row -->
		<div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 flex items-center justify-between gap-4 relative z-10">
			<!-- Logo Box -->
			<a href="{base}/framework" class="flex items-center gap-3 hover:opacity-90 transition-opacity shrink-0" title="TECF Framework">
				<div class="h-8 px-2.5 rounded-lg bg-blue-600 text-white font-extrabold text-sm tracking-wide flex items-center justify-center shadow-xs shrink-0">
					TECF
				</div>
			</a>

			<!-- Navigation Tabs with Pipeline Arrows -->
			<div class="flex items-center gap-6 shrink-0 overflow-x-auto">
				<nav class="flex items-center gap-2 sm:gap-3 text-sm font-medium h-full shrink-0">
					<a 
						href="{base}/papers" 
						class="relative py-5 border-b-2 transition-colors {currentPath.includes('/papers') ? 'border-blue-400 text-white font-semibold' : 'border-transparent text-slate-300 hover:text-white'}"
					>
						Papers
					</a>

					<ArrowRight class="w-3.5 h-3.5 text-slate-400/80 shrink-0" />

					<a 
						href="{base}/findings" 
						class="relative py-5 border-b-2 transition-colors {currentPath.includes('/findings') ? 'border-blue-400 text-white font-semibold' : 'border-transparent text-slate-300 hover:text-white'}"
					>
						Findings
					</a>

					<ArrowRight class="w-3.5 h-3.5 text-slate-400/80 shrink-0" />

					<a 
						href="{base}/conditions" 
						class="relative py-5 border-b-2 transition-colors {currentPath.includes('/conditions') ? 'border-blue-400 text-white font-semibold' : 'border-transparent text-slate-300 hover:text-white'}"
					>
						Conditions
					</a>

					<ArrowRight class="w-3.5 h-3.5 text-slate-400/80 shrink-0" />

					<a 
						href="{base}/domains" 
						class="relative py-5 border-b-2 transition-colors {currentPath.includes('/domains') ? 'border-blue-400 text-white font-semibold' : 'border-transparent text-slate-300 hover:text-white'}"
					>
						Domains
					</a>

					<ArrowRight class="w-3.5 h-3.5 text-slate-400/80 shrink-0" />

					<a 
						href="{base}/framework" 
						class="relative py-5 border-b-2 transition-colors {currentPath.includes('/framework') ? 'border-blue-400 text-white font-semibold' : 'border-transparent text-slate-300 hover:text-white'}"
					>
						Framework
					</a>
				</nav>

				<!-- Theme Toggle -->
				<button
					on:click={toggleTheme}
					class="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
					title="Toggle theme"
					aria-label="Toggle theme"
				>
					{#if isDark}
						<Sun class="w-4 h-4" />
					{:else}
						<Moon class="w-4 h-4" />
					{/if}
				</button>
			</div>
		</div>
	</header>

	<!-- Integrated Hero Masthead Row (identical gradient to header, no overlays, so the two read as one continuous block; scrolls out naturally since it isn't sticky) -->
	{#if isFrameworkPage}
		<div class="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-b border-indigo-900/50 shadow-md shrink-0 -mt-px">
			<div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 pt-2 space-y-3">
				<h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
					Transformation-Enabling Conditions Framework
				</h1>
				<p class="text-base sm:text-lg text-slate-300 leading-relaxed max-w-4xl">
					An evidence-based synthesis of 60 transformation-enabling Conditions across nine Domains
				</p>
			</div>
		</div>
	{/if}

	<!-- Main Body Container -->
	<main class="flex-1 flex flex-col min-h-0 w-full">
		{#if currentPath !== `${base}/` && currentPath !== `${base}` && currentPath !== `${base}/framework`}
			<div class="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2 shrink-0">
				<Breadcrumb crumbs={breadcrumbs} />
			</div>
			<div class="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-6 flex-1 flex flex-col min-h-0 gap-4">
				<slot />
			</div>
		{:else}
			<slot />
		{/if}
	</main>
</div>
