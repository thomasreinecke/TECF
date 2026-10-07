#!/usr/bin/env node
/**
 * Verifies the published TECF data before every build.
 *
 * TECF is public, so the check covers two things. First, the evidence record stays
 * complete: every finding resolves to a published publication and carries its audited
 * spans with valid line locators. Second, the data respect third-party rights: no full
 * texts or abstracts are shipped, publications carry bibliographic fields only, and
 * every quotation stays within the published length limits.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'static', 'data');

const EXPECTED_FINDINGS = 586;
const EXPECTED_SPANS = 1225;
const QUOTE_MAX_WORDS = 40;
const STATEMENT_QUOTE_MAX = 25;

// Bibliographic fields only. Abstracts, citation counts, page and word counts, and file
// paths of the internal record must not reach the published corpus.
const CORPUS_FIELDS = new Set(['id', 'title', 'authors', 'year', 'journal', 'doi', 'item_type', 'typeLabel', 'stream', 'evidence_family']);
// The corpus whitelist covers the count fields. The deep scan looks for text and file
// fields in every data file ("cites" stays allowed there, as the citation list of a
// synthesis sentence).
const FORBIDDEN_KEYS = ['abstract', 'full_text', 'txt_path', 'pdf_path', 'txtFileName', 'has_pdf', 'pdf_status', 'human_decision'];

// Both fixtures are findings whose locators were corrected in the audit repair.
const REGRESSION_CASES = [
	{ label: 'multi-span', cfId: 243, corpusId: 523, spans: [[574, 617], [707, 714], [822, 824]] },
	{ label: 'single-span', cfId: 244, corpusId: 523, spans: [[697, 702]] }
];

const failures = [];
function check(condition, message) {
	if (!condition) failures.push(message);
}

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), 'utf8'));
const findings = readJson('condition_findings.json');
const corpus = readJson('corpus.json');

const wordCount = (text) => (text ?? '').replace(/\[…\]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
const MARKED_QUOTE = /"([^"]+)"|“([^”]+)”/g;

// 1. No full texts or other documents are shipped next to the data.
for (const entry of fs.readdirSync(path.join(ROOT, 'static'))) {
	check(['data', 'favicon.png', 'favicon.svg', 'robots.txt', '.nojekyll'].includes(entry), `static/${entry} is not part of the published data set`);
}

// 2. Publications carry bibliographic fields only.
for (const paper of corpus) {
	for (const key of Object.keys(paper)) {
		check(CORPUS_FIELDS.has(key), `corpus P${paper.id} carries the unpublished field "${key}"`);
	}
}

// 3. No data file carries a forbidden key at any depth.
function scanKeys(value, file, trail) {
	if (Array.isArray(value)) {
		value.forEach((item, index) => scanKeys(item, file, `${trail}[${index}]`));
	} else if (value && typeof value === 'object') {
		for (const [key, child] of Object.entries(value)) {
			check(!FORBIDDEN_KEYS.includes(key), `${file}${trail}.${key} is a forbidden field`);
			scanKeys(child, file, `${trail}.${key}`);
		}
	}
}
for (const file of fs.readdirSync(DATA_DIR).filter((name) => name.endsWith('.json'))) {
	scanKeys(readJson(file), file, '');
}

// 4. Findings resolve to publications and carry valid, short evidence quotations.
const papersById = new Map(corpus.map((paper) => [paper.id, paper]));
check(findings.length === EXPECTED_FINDINGS, `expected ${EXPECTED_FINDINGS} published findings, found ${findings.length}`);

let spanTotal = 0;
for (const finding of findings) {
	const id = `CF${finding.cf_id}`;
	check(papersById.has(finding.corpus_id), `${id} points at corpus ${finding.corpus_id}, which is not published`);

	for (const field of ['readiness_statement', 'mechanism', 'operationalization_hint', 'rationale']) {
		for (const match of (finding[field] ?? '').matchAll(MARKED_QUOTE)) {
			const words = wordCount(match[1] ?? match[2]);
			check(words <= STATEMENT_QUOTE_MAX, `${id}.${field} quotes ${words} words, above ${STATEMENT_QUOTE_MAX}`);
		}
	}

	const spans = finding.spans ?? [];
	check(spans.length > 0, `${id} has no evidence span`);
	spanTotal += spans.length;
	for (const span of spans) {
		const where = `${id}/span${span.span_order}`;
		const { source_line_start: start, source_line_end: end } = span;
		check(Number.isInteger(start) && Number.isInteger(end) && start >= 1 && end >= start, `${where} has invalid bounds ${start}-${end}`);
		check(Boolean(span.source_excerpt?.trim()), `${where} has no quotation`);
		const words = wordCount(span.source_excerpt);
		check(words <= QUOTE_MAX_WORDS, `${where} quotes ${words} words, above ${QUOTE_MAX_WORDS}`);
	}
}
check(spanTotal === EXPECTED_SPANS, `expected ${EXPECTED_SPANS} published spans, found ${spanTotal}`);

// 5. Pinned regression cases for the corrected locators.
for (const testCase of REGRESSION_CASES) {
	const finding = findings.find((row) => row.cf_id === testCase.cfId);
	if (!finding) {
		failures.push(`${testCase.label} fixture CF${testCase.cfId} is no longer published`);
		continue;
	}
	check(finding.corpus_id === testCase.corpusId, `${testCase.label} fixture CF${testCase.cfId} moved to corpus ${finding.corpus_id}`);
	const actual = (finding.spans ?? []).map((span) => [span.source_line_start, span.source_line_end]);
	check(
		JSON.stringify(actual) === JSON.stringify(testCase.spans),
		`${testCase.label} fixture CF${testCase.cfId} spans changed: ${JSON.stringify(actual)} != ${JSON.stringify(testCase.spans)}`
	);
}

// 6. No route links to the removed paper reader.
function sourceFiles(dir) {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(dir, entry.name);
		return entry.isDirectory() ? sourceFiles(full) : [full];
	});
}
for (const file of sourceFiles(path.join(ROOT, 'src'))) {
	check(!/\/papers[/"`]/.test(fs.readFileSync(file, 'utf8')), `${path.relative(ROOT, file)} still links to the removed /papers routes`);
}

if (failures.length > 0) {
	console.error(`Published-data verification failed (${failures.length} problems):`);
	for (const failure of failures.slice(0, 25)) console.error(`  - ${failure}`);
	if (failures.length > 25) console.error(`  ... and ${failures.length - 25} more`);
	process.exit(1);
}

console.log(
	`Published data verified: ${corpus.length} publications with bibliographic fields only, ` +
	`${findings.length} findings, ${spanTotal} quotations of at most ${QUOTE_MAX_WORDS} words, no full texts.`
);
