import { describe, expect, test } from 'bun:test';

import { FALLBACK_RELEASE, type Release } from './release';
import { REQUIREMENTS, SITE } from './site';
import {
	buildHomeGraph,
	buildSiteGraph,
	buildSoftwareApplication,
	buildWebPage,
	SCHEMA_ID,
	serialiseJsonLd,
} from './structured-data';

/** A release with nothing GitHub is allowed to omit, to prove the nulls drop. */
const BARE_RELEASE: Release = {
	dmg: null,
	isFallback: true,
	isPrerelease: true,
	notesUrl: FALLBACK_RELEASE.notesUrl,
	publishedAt: null,
	tag: 'v0.0.0',
	version: '0.0.0',
	zip: null,
};

describe('serialiseJsonLd', () => {
	/*
	 * The whole reason this function exists. A `</script>` anywhere in the graph
	 * — a description, a feature line, a release tag — would close the tag and
	 * hand the rest of the payload to the HTML parser as markup.
	 */
	test('escapes angle brackets so the script tag cannot be closed', () => {
		const serialised = serialiseJsonLd({ name: '</script><img onerror=x>' });

		expect(serialised).not.toContain('<');
		expect(serialised).not.toContain('>');
		expect(serialised).toContain('\\u003c');
		expect(serialised).toContain('\\u003e');
	});

	test('escapes the JavaScript line terminators', () => {
		const serialised = serialiseJsonLd({
			name: `a${String.fromCharCode(0x2028)}b${String.fromCharCode(0x2029)}c`,
		});

		expect(serialised).toContain('\\u2028');
		expect(serialised).toContain('\\u2029');
	});

	test('round-trips to the same object it was given', () => {
		const node = { name: 'Ensemblr <workbench>', nested: { count: 2 } };

		expect(JSON.parse(serialiseJsonLd(node))).toEqual(node);
	});
});

describe('buildSiteGraph', () => {
	test('emits the organisation and the site under one context', () => {
		const graph = buildSiteGraph();

		expect(graph['@context']).toBe('https://schema.org');
		expect(graph['@graph']).toHaveLength(2);
	});

	test('the site points at the organisation by id', () => {
		const [organisation, website] = buildSiteGraph()['@graph'] as [
			Record<string, unknown>,
			Record<string, unknown>,
		];

		expect(organisation['@id']).toBe(SCHEMA_ID.organization);
		expect(website.publisher).toEqual({ '@id': SCHEMA_ID.organization });
	});
});

describe('buildSoftwareApplication', () => {
	test('describes the release the download button serves', () => {
		const node = buildSoftwareApplication(FALLBACK_RELEASE);

		expect(node.softwareVersion).toBe(FALLBACK_RELEASE.version);
		expect(node.downloadUrl).toBe(FALLBACK_RELEASE.dmg?.url);
		expect(node.releaseNotes).toBe(FALLBACK_RELEASE.notesUrl);
		expect(node.datePublished).toBe(FALLBACK_RELEASE.publishedAt);
	});

	/*
	 * Google shows a SoftwareApplication rich result only when `offers` or
	 * `aggregateRating` is present. There are no ratings to report, so the free
	 * offer is the node carrying the result — losing it is a silent regression.
	 */
	test('carries a free offer', () => {
		const offers = buildSoftwareApplication(FALLBACK_RELEASE).offers as Record<
			string,
			unknown
		>;

		expect(offers.price).toBe('0');
		expect(offers.availability).toBe('https://schema.org/InStock');
	});

	test('states the platform the builds actually run on', () => {
		const node = buildSoftwareApplication(FALLBACK_RELEASE);

		expect(node.operatingSystem).toBe('macOS');
		expect(node.processorRequirements).toContain('arm64');
		expect(node.softwareRequirements).toContain('git');
	});

	/*
	 * One of the requirement names contains a comma of its own, so a
	 * comma-separated join silently turns four gates into six.
	 */
	test('separates requirements on a delimiter none of them contains', () => {
		const requirements = buildSoftwareApplication(FALLBACK_RELEASE)
			.softwareRequirements as string;

		expect(requirements.split('; ')).toHaveLength(
			REQUIREMENTS.filter((requirement) => requirement.required).length,
		);
	});

	/* Structured data that outruns the page is worse than none. A release with no
	 * asset and no date must omit those keys rather than assert empty ones. */
	test('omits facts the release does not carry', () => {
		const node = buildSoftwareApplication(BARE_RELEASE);

		expect(node).not.toHaveProperty('downloadUrl');
		expect(node).not.toHaveProperty('fileSize');
		expect(node).not.toHaveProperty('datePublished');
	});

	test('falls back to the zip when there is no dmg', () => {
		const node = buildSoftwareApplication({
			...FALLBACK_RELEASE,
			dmg: null,
		});

		expect(node.downloadUrl).toBe(FALLBACK_RELEASE.zip?.url);
	});
});

describe('buildWebPage', () => {
	test('joins the page to the site and the application', () => {
		const node = buildWebPage(FALLBACK_RELEASE);

		expect(node.isPartOf).toEqual({ '@id': SCHEMA_ID.website });
		expect(node.about).toEqual({ '@id': SCHEMA_ID.app });
		expect(node.inLanguage).toBe(SITE.locale);
	});
});

describe('buildHomeGraph', () => {
	test('every node is addressable and no id is reused', () => {
		const nodes = buildHomeGraph(FALLBACK_RELEASE)['@graph'] as Record<
			string,
			unknown
		>[];
		const ids = nodes.map((node) => node['@id']);

		expect(ids).toEqual([SCHEMA_ID.webpage, SCHEMA_ID.app]);
		expect(new Set(ids).size).toBe(ids.length);
	});
});
