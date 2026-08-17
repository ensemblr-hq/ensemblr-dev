import { describe, expect, test } from 'bun:test';

import { FALLBACK_RELEASE, type Release } from './release';
import { SCHEMA_DIALECT, SCHEMAS, SCHEMAS_PAGE } from './schemas';
import { REQUIREMENTS, SITE } from './site';
import {
	buildHomeGraph,
	buildSchemasGraph,
	buildSchemasPage,
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

describe('buildSchemasPage', () => {
	/* Two page nodes sharing one `@id` would collapse into a single node
	 * describing whichever document a consumer read last. */
	test('is a different node from the home page', () => {
		expect(buildSchemasPage()['@id']).not.toBe(SCHEMA_ID.webpage);
		expect(buildSchemasPage()['@id']).toBe(`${SCHEMAS_PAGE.url}#webpage`);
	});

	test('joins the site and the application by id', () => {
		const node = buildSchemasPage();

		expect(node.isPartOf).toEqual({ '@id': SCHEMA_ID.website });
		expect(node.about).toEqual({ '@id': SCHEMA_ID.app });
		expect(node.inLanguage).toBe(SITE.locale);
		expect(node.url).toBe(SCHEMAS_PAGE.url);
	});

	/*
	 * The page changes when the app repo changes its schemas and nothing here
	 * knows when that was — the same reason `sitemap.ts` omits `lastModified` for
	 * this route. A date invented to fill the field is the one failure this whole
	 * module is written to avoid.
	 */
	test('asserts no date it cannot know', () => {
		const node = buildSchemasPage();

		expect(node).not.toHaveProperty('datePublished');
		expect(node).not.toHaveProperty('dateModified');
	});

	test('describes every schema the manifest publishes, in order', () => {
		const list = buildSchemasPage().mainEntity as Record<string, unknown>;
		const items = list.itemListElement as Record<string, unknown>[];

		expect(list.numberOfItems).toBe(SCHEMAS.length);
		expect(items).toHaveLength(SCHEMAS.length);
		expect(items.map((entry) => entry.position)).toEqual(
			SCHEMAS.map((_, index) => index + 1),
		);
		expect(
			items.map((entry) => (entry.item as Record<string, unknown>)['@id']),
		).toEqual(SCHEMAS.map((schema) => schema.id));
	});

	/*
	 * `encodingFormat` has to be what `next.config.ts` actually sends, not the
	 * registered `application/schema+json` that reads better — a header the
	 * response contradicts is a claim, not a description. The format itself is
	 * stated as `conformsTo`.
	 */
	test('states the media type the site really serves', () => {
		const items = (
			buildSchemasPage().mainEntity as {
				itemListElement: Record<string, unknown>[];
			}
		).itemListElement;

		for (const entry of items) {
			const item = entry.item as Record<string, unknown>;

			expect(item.encodingFormat).toBe('application/json');
			expect(item.conformsTo).toBe(SCHEMA_DIALECT);
			expect(item.contentUrl).toBe(item['@id']);
		}
	});
});

describe('buildSchemasGraph', () => {
	test('carries the page node under the shared context', () => {
		const graph = buildSchemasGraph();

		expect(graph['@context']).toBe('https://schema.org');
		expect(
			(graph['@graph'] as Record<string, unknown>[]).map((n) => n['@id']),
		).toEqual([SCHEMA_ID.schemasPage]);
	});
});
