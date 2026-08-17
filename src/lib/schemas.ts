/**
 * The two JSON Schemas this site publishes on the app's behalf, and everything
 * about them the rest of the repo needs to agree on.
 *
 * These schemas are not ours. They are written in the app repo, at
 * `schemas/*.schema.json`, and each one declares a canonical `$id` under *this*
 * domain — which is a promise the app repo cannot keep on its own. Serving those
 * two URLs is the whole of this module's reason to exist: a `$id` that 404s is a
 * `$id` no strict resolver will follow, and the fallback everyone was told to
 * use instead, `raw.githubusercontent.com`, answers with `text/plain` under a
 * `nosniff` header that stricter tooling refuses outright.
 *
 * Deliberately free of Next imports. `next.config.ts` reads this file to build
 * the response headers for each schema, `scripts/check-schemas.ts` reads it to
 * know what to compare against the app repo, and `schemas.test.ts` reads it
 * outside a render — none of which can afford to drag the framework in.
 */

import { REPO, SITE } from './site';

/** Where the copies live, relative to the repository root. */
export const SCHEMA_DIR = 'public/schemas';

/**
 * The dialect both schemas declare. Asserted rather than assumed: a schema that
 * silently moved to a later draft would still parse, still serve, and still
 * validate — differently.
 */
export const SCHEMA_DIALECT = 'https://json-schema.org/draft/2020-12/schema';

/**
 * An hour in the browser, a week of stale-while-revalidate behind it.
 *
 * The default for anything under `public/` is `max-age=0, must-revalidate`,
 * which asks an editor to re-check a 24 KB document on every completion popup.
 * These files change when the app ships a new config key — weeks apart, not
 * minutes — so an hour costs nothing a reader would notice, and the revalidate
 * window means a schema keeps resolving through a deploy or an outage.
 */
export const SCHEMA_CACHE_CONTROL =
	'public, max-age=3600, stale-while-revalidate=604800';

/**
 * The route that presents the two schemas to a reader, as opposed to the two
 * documents a resolver fetches.
 *
 * Here rather than in the page because three files have to agree on it and only
 * one of them renders: the page builds its `<title>`, canonical and OG card from
 * these, `structured-data.ts` builds the `WebPage` node from the same strings so
 * the machine-readable copy cannot drift from the visible one, and `sitemap.ts`
 * needs the URL. Restated per file, the agreement is a coincidence — which is
 * the same reason `id` below is derived from `SITE.url` rather than typed out.
 */
export const SCHEMAS_PAGE = {
	description:
		'JSON Schemas for Ensemblr’s two configuration files, published at the URLs they name themselves, so an editor can complete and validate a config without Ensemblr running.',
	path: '/schemas',
	title: 'Config schemas',
	url: `${SITE.url}/schemas`,
} as const;

export interface PublishedSchema {
	/** File name, identical here and in the app repo. */
	readonly file: string;
	/** Path this site serves it at. */
	readonly path: string;
	/** The `$id` the file itself declares, and must keep declaring. */
	readonly id: string;
	/** Where the original lives in the app repo, for the drift check. */
	readonly sourcePath: string;
	/** The `title` the file itself declares. */
	readonly title: string;
	/** The config file this schema describes, as a reader names it. */
	readonly describes: string;
	/** One sentence on what that file is for. */
	readonly summary: string;
	/** What the snippet below actually does, in the editor. */
	readonly wiringLabel: string;
	/** Copy-paste, with this site's URL rather than a raw GitHub one. */
	readonly wiring: string;
	/** Syntax of the snippet, for the `lang-` hint on the code block. */
	readonly wiringLanguage: 'json' | 'toml';
	readonly guideLabel: string;
	readonly guideUrl: string;
}

const GUIDE = `${REPO.url}/blob/master/docs/guide`;

/*
 * `id` is built from `SITE.url` rather than typed out, so the manifest cannot
 * disagree with the canonical host the rest of the site uses. It still has to be
 * checked against the file — `schemas.test.ts` does exactly that, and it is the
 * one test here that would catch the app repo re-homing its schemas.
 */
export const SCHEMAS: readonly PublishedSchema[] = [
	{
		file: 'config.schema.json',
		path: '/schemas/config.schema.json',
		id: `${SITE.url}/schemas/config.schema.json`,
		sourcePath: 'schemas/config.schema.json',
		title: 'Ensemblr user config',
		describes: '~/.config/ensemblr/config.json',
		summary:
			'User-scope app settings and declarative configuration. Ensemblr watches the file, so an external edit applies immediately, and every field falls back to its own default — one bad value costs that value rather than the file.',
		wiringLabel:
			'Add the key. Ensemblr writes it into the config it creates on first launch, so only an older file needs it by hand.',
		wiring: `{
	"$schema": "${SITE.url}/schemas/config.schema.json",
	"schemaVersion": 1,
	"app": {}
}`,
		wiringLanguage: 'json',
		guideLabel: 'App settings',
		guideUrl: `${GUIDE}/11-app-settings.md`,
	},
	{
		file: 'settings.schema.json',
		path: '/schemas/settings.schema.json',
		id: `${SITE.url}/schemas/settings.schema.json`,
		sourcePath: 'schemas/settings.schema.json',
		title: 'Ensemblr repository settings',
		describes: '.ensemblr/settings.toml',
		summary:
			'A repository’s committed per-repository settings, checked in and reviewed like code. It outranks every reader’s personal settings for that repository, and an unrecognised key becomes a warning naming its exact path rather than failing the file.',
		wiringLabel:
			'Taplo’s directive, as the first line. A save from Repo settings → Scripts re-serialises the file and drops its comments, but reads this one back and restores it.',
		wiring: `#:schema ${SITE.url}/schemas/settings.schema.json`,
		wiringLanguage: 'toml',
		guideLabel: 'Repository settings',
		guideUrl: `${GUIDE}/12-repository-settings.md`,
	},
];
