/**
 * schema.org JSON-LD for the page, built from the same constants the visible
 * copy is built from.
 *
 * Every claim here has to be one the page already makes out loud. Structured
 * data that outruns the rendered page is the one SEO mistake that is actively
 * penalised rather than merely ignored — so there is no `aggregateRating` (no
 * ratings exist), no `screenshot` (the OG card is a title card, not a
 * screenshot), and the version, size and date come from the live release object
 * the download button renders, not from a literal that can drift away from it.
 *
 * Split from the components so the shapes can be asserted in `bun test` without
 * rendering React or reaching the network.
 */

import { FEATURE_GROUPS } from './features';
import { formatBytes, type Release } from './release';
import { REPO, REQUIREMENTS, SITE } from './site';

export type JsonLdNode = Record<string, unknown>;

/**
 * Stable `@id`s, so the nodes emitted by the layout and the ones emitted by the
 * page resolve to a single graph instead of four unrelated islands. Fragments
 * on the canonical URL is the convention consumers expect.
 */
export const SCHEMA_ID = {
	app: `${SITE.url}/#software`,
	organization: `${SITE.url}/#organization`,
	webpage: `${SITE.url}/#webpage`,
	website: `${SITE.url}/#website`,
} as const;

/** Absolute asset URLs: JSON-LD has no `metadataBase` to resolve against. */
const LOGO_URL = `${SITE.url}/icon.svg`;
const OG_IMAGE_URL = `${SITE.url}/opengraph-image`;
const DOWNLOAD_URL = `${SITE.url}/#download`;

/**
 * `JSON.stringify` escapes nothing for an HTML context, so a payload containing
 * `</script>` would close the tag and everything after it would be parsed as
 * markup. Escaping `<` and `>` removes that, and the JSON parser reads the
 * escapes back as the same characters.
 *
 * The two Unicode line separators go with them: both are legal inside a JSON
 * string but are line terminators to a JavaScript parser, which is enough to
 * break the block. They are derived from their code points rather than typed,
 * so this file stays pure ASCII — a literal separator in source is invisible in
 * every editor and survives exactly as long as the next copy-paste.
 */
const TAG_DELIMITERS = /[<>]/g;
const LINE_TERMINATORS = [0x2028, 0x2029].map((code) =>
	String.fromCharCode(code),
);

function toUnicodeEscape(char: string): string {
	return `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
}

export function serialiseJsonLd(node: JsonLdNode): string {
	const escaped = JSON.stringify(node).replace(TAG_DELIMITERS, toUnicodeEscape);

	return LINE_TERMINATORS.reduce(
		(json, char) => json.replaceAll(char, toUnicodeEscape(char)),
		escaped,
	);
}

/** Drops keys whose value is null/undefined so absent facts are simply absent. */
function compact(node: JsonLdNode): JsonLdNode {
	return Object.fromEntries(
		Object.entries(node).filter(
			([, value]) => value !== null && value !== undefined,
		),
	);
}

export function buildOrganization(): JsonLdNode {
	return {
		'@id': SCHEMA_ID.organization,
		'@type': 'Organization',
		description: SITE.description,
		logo: {
			'@type': 'ImageObject',
			height: 1024,
			url: LOGO_URL,
			width: 1024,
		},
		name: SITE.name,
		/* The GitHub org and the repository are the only two places this project
		 * exists off its own domain. Listing a profile it does not have would be
		 * an unresolvable `sameAs`, which is worse than a short list. */
		sameAs: [`https://github.com/${REPO.owner}`, REPO.url],
		url: SITE.url,
	};
}

export function buildWebSite(): JsonLdNode {
	return {
		'@id': SCHEMA_ID.website,
		'@type': 'WebSite',
		description: SITE.description,
		inLanguage: SITE.locale,
		name: SITE.name,
		/* No `potentialAction`/SearchAction: the site has one page and no search
		 * endpoint, and Google ignores a sitelinks searchbox it cannot execute. */
		publisher: { '@id': SCHEMA_ID.organization },
		url: SITE.url,
	};
}

export function buildWebPage(release: Release): JsonLdNode {
	return compact({
		'@id': SCHEMA_ID.webpage,
		'@type': 'WebPage',
		about: { '@id': SCHEMA_ID.app },
		/* The page's content *is* the release: version, size and digest all change
		 * with it and nothing else on the page does. */
		dateModified: release.publishedAt,
		datePublished: release.publishedAt,
		description: SITE.description,
		inLanguage: SITE.locale,
		isPartOf: { '@id': SCHEMA_ID.website },
		name: `${SITE.name} — ${SITE.tagline}`,
		primaryImageOfPage: {
			'@type': 'ImageObject',
			height: 630,
			url: OG_IMAGE_URL,
			width: 1200,
		},
		url: SITE.url,
	});
}

/** Every long-tail capability the page lists, flattened for `featureList`. */
function featureList(): readonly string[] {
	return FEATURE_GROUPS.flatMap((group) => group.items);
}

/**
 * The hard gates from the Download section, as one `softwareRequirements`.
 *
 * Semicolons, not commas: one of the gates is "GitHub CLI (gh), authenticated",
 * so a comma-joined list reads as six requirements of which two are nonsense.
 */
function softwareRequirements(): string {
	return REQUIREMENTS.filter((requirement) => requirement.required)
		.map((requirement) => requirement.name)
		.join('; ');
}

export function buildSoftwareApplication(release: Release): JsonLdNode {
	const download = release.dmg ?? release.zip;

	return compact({
		'@id': SCHEMA_ID.app,
		'@type': 'SoftwareApplication',
		applicationCategory: 'DeveloperApplication',
		author: { '@id': SCHEMA_ID.organization },
		datePublished: release.publishedAt,
		description: SITE.description,
		downloadUrl: download?.url,
		featureList: featureList(),
		fileSize: download ? formatBytes(download.sizeBytes) : undefined,
		image: OG_IMAGE_URL,
		installUrl: DOWNLOAD_URL,
		isAccessibleForFree: true,
		/*
		 * No `license`, deliberately.
		 *
		 * This node carries `softwareVersion` and `downloadUrl`, so everything on
		 * it is a claim about one specific build — and the relicence to Apache 2.0
		 * is not retroactive. v0.1.0-beta.4 and every release before it shipped
		 * under MIT, so a `license` pointing at the repository's current LICENSE
		 * would assert, in machine-readable form, an Apache grant over an artefact
		 * that never carried one.
		 *
		 * The licence is still stated on the site: the footer links `REPO.license`
		 * at `REPO.licenseUrl`, where it describes the source rather than a tag.
		 * A claim about the repository does not belong on a node about a build.
		 */
		maintainer: { '@id': SCHEMA_ID.organization },
		name: SITE.name,
		/* Google shows a SoftwareApplication rich result only with `offers` or
		 * `aggregateRating`. There are no ratings, and the app genuinely is free,
		 * so the free offer is both the honest node and the qualifying one. */
		offers: {
			'@type': 'Offer',
			availability: 'https://schema.org/InStock',
			price: '0',
			priceCurrency: 'USD',
			url: DOWNLOAD_URL,
		},
		operatingSystem: 'macOS',
		processorRequirements: 'Apple silicon (arm64)',
		releaseNotes: release.notesUrl,
		sameAs: [REPO.url],
		softwareRequirements: softwareRequirements(),
		softwareVersion: release.version,
		url: SITE.url,
	});
}

/** Site-wide nodes. Emitted from the layout, so they survive new routes. */
export function buildSiteGraph(): JsonLdNode {
	return {
		'@context': 'https://schema.org',
		'@graph': [buildOrganization(), buildWebSite()],
	};
}

/** Page-specific nodes, which need the release the page itself renders. */
export function buildHomeGraph(release: Release): JsonLdNode {
	return {
		'@context': 'https://schema.org',
		'@graph': [buildWebPage(release), buildSoftwareApplication(release)],
	};
}
