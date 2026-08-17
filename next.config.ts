import type { NextConfig } from 'next';

// Relative, not `@/lib/schemas`: the `@/*` alias is a tsconfig path, and this
// file is loaded by Next's own config loader rather than compiled with the app.
import { SCHEMA_CACHE_CONTROL, SCHEMAS } from './src/lib/schemas';

const nextConfig: NextConfig = {
	/*
	 * The page is a static shell except for the live GitHub release lookup in
	 * `src/lib/github-release.ts`. Cache Components lets that one function opt
	 * into `use cache` while everything around it prerenders.
	 */
	cacheComponents: true,

	/**
	 * What makes two files under `public/` into published JSON Schemas.
	 *
	 * Each schema declares a canonical `$id` on this domain, so a resolver
	 * following `$schema` out of somebody's `config.json` lands here. It arrives
	 * as a script rather than a browser, and the defaults serve it badly:
	 * `public/` assets go out `max-age=0, must-revalidate` with no CORS at all,
	 * which is a re-fetch on every keystroke for a local editor and a hard stop
	 * for anything running in a page.
	 *
	 * One rule per file, keyed to the exact path. `/schemas/:path*` would be
	 * shorter and would also swallow `/schemas` — the human page — and serve an
	 * HTML document as `application/json`.
	 */
	async headers() {
		return SCHEMAS.map((schema) => ({
			source: schema.path,
			headers: [
				// Next infers this from the extension already. Stated anyway: it is
				// the one header these URLs exist to correct, since the copies they
				// replace are served as `text/plain` from raw.githubusercontent.com.
				{ key: 'Content-Type', value: 'application/json; charset=utf-8' },
				{ key: 'Cache-Control', value: SCHEMA_CACHE_CONTROL },
				{ key: 'Access-Control-Allow-Origin', value: '*' },
				{ key: 'X-Content-Type-Options', value: 'nosniff' },
			],
		}));
	},
};

export default nextConfig;
