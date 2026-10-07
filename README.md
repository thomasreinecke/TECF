# TECF – Transformation-Enabling Conditions Framework

> **Live web application:** <https://thomasreinecke.github.io/TECF/>

## Overview

TECF is the companion web application of the master thesis
*Enterprise Transformation Readiness: A Design Science Study of Transformation-Enabling
Conditions Operationalised in an AI-Supported Governance Application*
(Thomas Reinecke, M.Sc. Artificial Intelligence, IU International University of Applied Sciences, 2026).

The application presents the framework that the thesis synthesises from a systematic literature review (RQ1) and lets a reader trace every Condition back to the Condition Findings and publications it rests on.

## Views

- **Framework:** the 60 Conditions arranged across nine Condition Domains (`CD1`–`CD9`).
- **Domains:** each Condition Domain with its Conditions and their findings.
- **Conditions:** each Condition with its definition, enabling statement, synthesis narrative, and Condition Findings.
- **Findings:** each Condition Finding with its readiness statement, mechanism, operationalisation hint, Evidence Role, and the core quotations of its audited source passages with section and line locators.
- **Sources:** the Scopus search queries that built the corpus and the bibliography of the 209 publications that contribute Condition Findings, each with a DOI link where available.

## Third-party content

TECF publishes no full texts or abstracts of the publications it draws on.
Evidence passages appear as core quotations of at most 40 words, selected automatically from the audited passage, with omitted text marked `[…]`.
Quotations inside finding statements follow the rule of the digital annex and are limited to 25 words.
Each quotation carries the section and line locator of its passage, and the publication is linked through its DOI.
The build verifies these limits before every release (`scripts/verify-published-data.mjs`).

The underlying RQ1 records, including the screening record and the source locators of all Condition Findings, are archived in the digital annex of the thesis: <https://github.com/thomasreinecke/master-thesis-digital-annex>.

## Data

The files in `static/data` are exported from the internal research record by the export script of the thesis environment. The export includes bibliographic fields only for the contributing publications and shortens every evidence passage to its core quotation.

## Local development

```bash
npm install
npm run dev       # development server
npm run build     # verify the published data, then build the static site
```

The site is built with SvelteKit, Tailwind CSS, and Lucide icons, and deployed as a static site on GitHub Pages.

## Licence

- Framework content and data: [CC BY-NC 4.0](LICENSE). Commercial use requires the author's prior written consent.
- Source code: [MIT](LICENSE-CODE).
- Quotations from third-party publications and their bibliographic details are not covered by these licences.
