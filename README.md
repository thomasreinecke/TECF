# TECF — Transformation-Enabling Conditions Framework

> **Live Web Application**: [https://thomasreinecke.github.io/TECF/](https://thomasreinecke.github.io/TECF/)

## Overview

The **Transformation-Enabling Conditions Framework (TECF)** is an interactive, evidence-grounded web application designed to display the synthesis steps, empirical findings, and final results leading to the Framework — including capability constructs, source evidence, and structural relationship propositions derived from systematic literature review (SLR) research.

## Key Features

- **Framework Matrix**: Visual grid mapping 60 confirmed capability constructs across 9 strategic Condition Domains (`CD1`–`CD9`).
- **Canonical Conditions**: Searchable catalog detailing each capability construct's definition, strategic domain assignment, and evidence finding counts.
- **Condition Domains**: Strategic domain groupings containing canonical capability constructs and their associated empirical evidence.
- **Condition Findings Inventory**: Source-traceable database of empirical evidence statements extracted from SLR literature papers.
- **Pairwise Relationships**: Interactive evaluation table of pairwise directional and structural relationship propositions between capability constructs.
- **SLR Literature Corpus**: Comprehensive index of included SLR review papers with citation metrics, word counts, and page length statistics.

## Technology Stack

- **Frontend**: [SvelteKit](https://kit.svelte.dev/) & Svelte 5
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide Svelte](https://lucide.dev/)
- **Deployment**: Static Site Generation via `@sveltejs/adapter-static` on GitHub Pages

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build static production bundle
npm run build
```
