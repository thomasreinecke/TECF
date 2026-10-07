import { writable } from 'svelte/store';
import { base } from '$app/paths';

/**
 * metadata.json as written by _app/scripts/extract_tecf_data.js. The stats block
 * is the single source of the published counts, so it is typed loosely on
 * purpose: consumers read named keys from it instead of restating the numbers.
 * @type {import('svelte/store').Writable<{ stats: Record<string, number> } & Record<string, any>>}
 */
export const metadata = writable({ stats: {} });
export const corpus = writable([]);
export const conditionFindings = writable([]);
export const canonicalConditions = writable([]);
export const conditionDomains = writable([]);
export const framework = writable({ registers: [], saturation: [] });

const PRIMARY_STREAMS = new Set(['DT', 'EA', 'ITG']);

function assertPrimaryStreams(items, label) {
	const invalid = [...new Set(items.map((item) => item.stream).filter((stream) => !PRIMARY_STREAMS.has(stream)))];
	if (invalid.length) {
		throw new Error(`${label} contains invalid primary literature stream(s): ${invalid.join(', ')}`);
	}
}

export async function loadStaticData() {
	try {
		const [
			metaRes,
			corpusRes,
			cfRes,
			ccRes,
			cdRes,
			fwRes
		] = await Promise.all([
			fetch(`${base}/data/metadata.json`),
			fetch(`${base}/data/corpus.json`),
			fetch(`${base}/data/condition_findings.json`),
			fetch(`${base}/data/canonical_conditions.json`),
			fetch(`${base}/data/condition_domains.json`),
			fetch(`${base}/data/framework.json`)
		]);

		if (metaRes.ok) metadata.set(await metaRes.json());
		if (corpusRes.ok) {
			const corpusData = await corpusRes.json();
			assertPrimaryStreams(corpusData, 'corpus.json');
			corpus.set(corpusData);
		}
		if (cfRes.ok) {
			const findingData = await cfRes.json();
			assertPrimaryStreams(findingData, 'condition_findings.json');
			conditionFindings.set(findingData);
		}
		if (ccRes.ok) canonicalConditions.set(await ccRes.json());
		if (cdRes.ok) {
			const cdData = await cdRes.json();
			conditionDomains.set(Array.isArray(cdData) ? cdData : cdData.conditionDomains || []);
		}
		if (fwRes.ok) framework.set(await fwRes.json());
	} catch (e) {
		console.error('Error loading static data:', e);
	}
}
