import { describe, expect, test } from 'bun:test';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import nextConfig from '../../next.config';
import {
	SCHEMA_CACHE_CONTROL,
	SCHEMA_DIALECT,
	SCHEMA_DIR,
	SCHEMAS,
} from './schemas';
import { SITE } from './site';

const REPO_ROOT = join(import.meta.dir, '..', '..');
const SCHEMA_PATH = join(REPO_ROOT, SCHEMA_DIR);

interface SchemaDocument {
	readonly $id?: unknown;
	readonly $schema?: unknown;
	readonly title?: unknown;
}

async function readSchema(file: string): Promise<SchemaDocument> {
	return (await Bun.file(join(SCHEMA_PATH, file)).json()) as SchemaDocument;
}

/*
 * `scripts/check-schemas.ts` answers "is this copy still the app repo's copy",
 * and it needs the network to do it. These answer the question that survives an
 * unplugged cable: whatever is in `public/schemas`, is the site serving it at
 * the address the file itself claims to live at.
 *
 * That is not a formality. The `$id` is the only thing making these URLs worth
 * hosting — a resolver handed `config.json` follows `$schema` to this domain and
 * expects the document it lands on to be the one that named it. Copy a schema
 * whose `$id` says something else and the site is serving a document under an
 * address it disowns, which is a subtler failure than a 404 and looks fine in a
 * browser.
 */
describe('published schemas', () => {
	test('every listed schema is on disk and parses', async () => {
		for (const schema of SCHEMAS) {
			const file = Bun.file(join(SCHEMA_PATH, schema.file));
			expect(await file.exists()).toBe(true);
			expect(await file.json()).toBeObject();
		}
	});

	test('each schema declares the $id this site serves it at', async () => {
		for (const schema of SCHEMAS) {
			expect(schema.id).toBe(`${SITE.url}${schema.path}`);
			expect((await readSchema(schema.file)).$id).toBe(schema.id);
		}
	});

	/*
	 * A schema that moved to a later draft would still parse, still serve, and
	 * still validate — differently, and silently. The page states the dialect in
	 * prose beside the download links, so this is also the check that keeps that
	 * sentence true.
	 */
	test('both schemas are the dialect the page says they are', async () => {
		for (const schema of SCHEMAS) {
			expect((await readSchema(schema.file)).$schema).toBe(SCHEMA_DIALECT);
		}
	});

	test('the manifest titles match the titles in the files', async () => {
		for (const schema of SCHEMAS) {
			expect((await readSchema(schema.file)).title).toBe(schema.title);
		}
	});

	/*
	 * The orphan case: a schema retired upstream, or one copied in under a name
	 * nobody added to the manifest. Either way the file is public, uncovered by
	 * the header rules below, and unwatched by the drift check — served, and
	 * nothing in this repo claims responsibility for it.
	 */
	test('nothing else is being served out of the schema directory', async () => {
		const onDisk = (await readdir(SCHEMA_PATH)).sort();
		const listed = SCHEMAS.map((schema) => schema.file).sort();

		expect(onDisk).toEqual(listed);
	});
});

/*
 * The copies are inert files under `public/`, so what turns them into a usable
 * schema endpoint is entirely the header block in `next.config.ts`. Without it
 * they still resolve — as `max-age=0` documents no browser tool can read
 * cross-origin, which is most of the audience for a published schema.
 */
describe('schema response headers', () => {
	test('every schema has its own header rule', async () => {
		const rules = (await nextConfig.headers?.()) ?? [];

		for (const schema of SCHEMAS) {
			const rule = rules.find((entry) => entry.source === schema.path);
			expect(rule).toBeDefined();

			const headers = new Map(
				rule?.headers.map(({ key, value }) => [key.toLowerCase(), value]),
			);

			// JSON, not the `text/plain` the raw GitHub copies are served as.
			expect(headers.get('content-type')).toBe(
				'application/json; charset=utf-8',
			);
			// A browser-side validator is a cross-origin reader by definition.
			expect(headers.get('access-control-allow-origin')).toBe('*');
			expect(headers.get('cache-control')).toBe(SCHEMA_CACHE_CONTROL);
			expect(headers.get('x-content-type-options')).toBe('nosniff');
		}
	});

	/*
	 * The rules are keyed to exact paths rather than `/schemas/:path*` on purpose:
	 * the human page at `/schemas` sits under the same prefix, and a wildcard
	 * would hand an HTML document a JSON content type.
	 */
	test('the header rules do not reach the page at /schemas', async () => {
		const rules = (await nextConfig.headers?.()) ?? [];
		const sources = rules.map((rule) => rule.source);

		expect(sources).not.toContain('/schemas');
		for (const source of sources) {
			expect(source).not.toInclude('*');
		}
	});
});
