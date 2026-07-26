<script>
	import './layout.css';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { Sun, Moon, Home } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { loadStaticData } from '$lib/dataStore.js';

	let isDark = false;

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

	$: breadcrumbs = (() => {
		const crumbs = [{ name: "Home", href: `${base}/` }];
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
			else if (section === 'relationships') name = 'Relationships';
			else if (section === 'framework') name = 'Framework';
			crumbs.push({ name, href: `${base}/${section}` });
		}
		return crumbs;
	})();
</script>

<svelte:head>
	<title>TECF - Transformation-Enabling Conditions Framework</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-gray-100 antialiased font-sans transition-colors duration-200">
	<!-- Header matching _app -->
	<header class="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-50 transition-colors">
		<div class="max-w-screen-2xl mx-auto px-4 min-h-16 flex items-center justify-between gap-4">
			
			<!-- Logo Box & Title -->
			<a href="{base}/" class="flex items-center gap-3.5 hover:opacity-90 transition-opacity shrink-0">
				<div class="flex flex-col">
					<span class="font-bold text-xl tracking-tight dark:text-white leading-none">Transformation-Enabling Conditions Framework</span>
					<span class="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">An evidence-based synthesis for strategic agility, enterprise architecture, and digital transformation success</span>
				</div>
			</a>

			<!-- Navigation Tabs -->
			<div class="flex items-center gap-6 shrink-0 overflow-x-auto">
				<nav class="flex items-center text-sm font-medium h-full shrink-0">
					<a 
						href="{base}/" 
						class="relative px-3 py-5 border-b-2 flex items-center transition-colors {currentPath === `${base}/` || currentPath === base ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}"
						title="Home"
						aria-label="Home"
					>
						<Home class="w-4 h-4" />
					</a>
					<a 
						href="{base}/papers" 
						class="relative px-3 py-5 border-b-2 transition-colors {currentPath.includes('/papers') ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}"
					>
						Papers
					</a>
					<a 
						href="{base}/findings" 
						class="relative px-3 py-5 border-b-2 transition-colors {currentPath.includes('/findings') ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}"
					>
						Findings
					</a>
					<a 
						href="{base}/conditions" 
						class="relative px-3 py-5 border-b-2 transition-colors {currentPath.includes('/conditions') ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}"
					>
						Conditions
					</a>
					<a 
						href="{base}/domains" 
						class="relative px-3 py-5 border-b-2 transition-colors {currentPath.includes('/domains') ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}"
					>
						Domains
					</a>
					<a 
						href="{base}/relationships" 
						class="relative px-3 py-5 border-b-2 transition-colors {currentPath.includes('/relationships') ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}"
					>
						Relationships
					</a>
					<a 
						href="{base}/framework" 
						class="relative px-3 py-5 border-b-2 transition-colors {currentPath.includes('/framework') ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 font-semibold' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}"
					>
						Framework
					</a>
				</nav>

				<!-- Theme Toggle -->
				<button
					on:click={toggleTheme}
					class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
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

	<!-- Main Body Container -->
	<main class="flex-1 flex flex-col min-h-0 w-full">
		{#if currentPath !== `${base}/` && currentPath !== `${base}`}
			<div class="max-w-screen-2xl mx-auto w-full px-4 pt-6 pb-2">
				<Breadcrumb crumbs={breadcrumbs} />
			</div>
			<div class="max-w-screen-2xl mx-auto w-full px-4 pb-6 flex-1 flex flex-col gap-4">
				<slot />
			</div>
		{:else}
			<slot />
		{/if}
	</main>
</div>
