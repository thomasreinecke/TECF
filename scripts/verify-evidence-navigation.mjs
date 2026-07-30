#!/usr/bin/env node
/**
 * Verifies the reader-facing evidence navigation against the published artifacts.
 *
 * The published TXT files and condition_findings.json are what a reader actually
 * gets, so this checks those rather than the database: every finding must carry
 * exact spans, each span must quote the text at its own line bounds, and the
 * highlight must never widen to the gaps between spans.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'static', 'data');
const DOCS_DIR = path.join(ROOT, 'static', 'docs', 'txt');

const EXPECTED_FINDINGS = 586;
const EXPECTED_SPANS = 1225;

// Both fixtures are findings whose coordinates were corrected in the audit
// repair, so they guard that correction and the multi-span highlight at once.
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

/** Split exactly like the TXT viewer does, so line numbers mean the same thing. */
const sourceCache = new Map();
function sourceLines(fileName) {
	if (!sourceCache.has(fileName)) {
		const file = path.join(DOCS_DIR, fileName);
		sourceCache.set(fileName, fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/) : null);
	}
	return sourceCache.get(fileName);
}

const normalize = (text) => (text ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

const papersById = new Map(corpus.map((paper) => [paper.id, paper]));

check(findings.length === EXPECTED_FINDINGS, `expected ${EXPECTED_FINDINGS} published findings, found ${findings.length}`);

let spanTotal = 0;
let overReachAvoided = 0;

for (const finding of findings) {
	const id = `CF${finding.cf_id}`;
	const paper = papersById.get(finding.corpus_id);

	// 1. Every ?cf= link must resolve to a paper that has a readable TXT.
	if (!paper) {
		failures.push(`${id} points at corpus ${finding.corpus_id}, which is not published`);
		continue;
	}
	const lines = paper.txtFileName ? sourceLines(paper.txtFileName) : null;
	if (!lines) {
		failures.push(`${id} references missing TXT document "${paper.txtFileName}"`);
		continue;
	}

	// 2. Every published finding must carry at least one exact span.
	const spans = finding.spans ?? [];
	if (spans.length === 0) {
		failures.push(`${id} has no evidence span, so its highlight would be empty`);
		continue;
	}
	spanTotal += spans.length;

	for (const span of spans) {
		const { source_line_start: start, source_line_end: end } = span;
		const where = `${id}/span${span.span_order}`;
		if (!(Number.isInteger(start) && Number.isInteger(end) && start >= 1 && end >= start)) {
			failures.push(`${where} has invalid bounds ${start}-${end}`);
			continue;
		}
		if (end > lines.length) {
			failures.push(`${where} ends at line ${end}, past the ${lines.length}-line document`);
			continue;
		}
		// 3. The quoted excerpt must be the text at those bounds — this is what
		//    makes the highlight an evidence claim rather than a guess.
		const actual = normalize(lines.slice(start - 1, end).join('\n'));
		if (actual !== normalize(span.source_excerpt)) {
			failures.push(`${where} excerpt does not match ${paper.txtFileName} lines ${start}-${end}`);
		}
	}

	// 4. The highlight is the union of the spans, never first-start to last-end.
	//    Assert that at least one gap line between two spans stays unhighlighted.
	if (spans.length > 1) {
		const covered = new Set();
		for (const span of spans) {
			for (let line = span.source_line_start; line <= span.source_line_end; line += 1) covered.add(line);
		}
		const first = Math.min(...spans.map((span) => span.source_line_start));
		const last = Math.max(...spans.map((span) => span.source_line_end));
		let gap = 0;
		for (let line = first; line <= last; line += 1) if (!covered.has(line)) gap += 1;
		if (gap > 0) overReachAvoided += 1;
		check(covered.size <= last - first + 1, `${id} covers more lines than its own span range`);
	}
}

check(spanTotal === EXPECTED_SPANS, `expected ${EXPECTED_SPANS} published spans, found ${spanTotal}`);

// 5. Pinned regression cases.
for (const testCase of REGRESSION_CASES) {
	const finding = findings.find((row) => row.cf_id === testCase.cfId);
	if (!finding) {
		failures.push(`${testCase.label} fixture CF${testCase.cfId} is no longer published`);
		continue;
	}
	check(
		finding.corpus_id === testCase.corpusId,
		`${testCase.label} fixture CF${testCase.cfId} moved to corpus ${finding.corpus_id}`
	);
	const actual = (finding.spans ?? []).map((span) => [span.source_line_start, span.source_line_end]);
	check(
		JSON.stringify(actual) === JSON.stringify(testCase.spans),
		`${testCase.label} fixture CF${testCase.cfId} spans changed: ${JSON.stringify(actual)} != ${JSON.stringify(testCase.spans)}`
	);
}

// 6. The redirect must carry ?cf= through; dropping it was the original defect.
const redirectSource = fs.readFileSync(path.join(ROOT, 'src', 'routes', 'papers', '[id]', '+page.js'), 'utf8');
check(
	/url\.search/.test(redirectSource),
	'papers/[id]/+page.js redirects without carrying the query string, so ?cf= links lose their finding'
);

if (failures.length > 0) {
	console.error(`Evidence-navigation verification failed (${failures.length} problems):`);
	for (const failure of failures.slice(0, 25)) console.error(`  - ${failure}`);
	if (failures.length > 25) console.error(`  ... and ${failures.length - 25} more`);
	process.exit(1);
}

console.log(
	`Evidence navigation verified: ${findings.length} findings, ${spanTotal} exact spans quoted from ` +
	`${sourceCache.size} published documents; ${overReachAvoided} multi-span findings keep their gaps unhighlighted.`
);
