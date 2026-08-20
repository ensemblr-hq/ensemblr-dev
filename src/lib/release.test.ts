import { describe, expect, test } from 'bun:test';

import {
	FALLBACK_NIGHTLY,
	FALLBACK_RELEASE,
	FOUNDED_YEAR,
	findAsset,
	formatBytes,
	formatReleaseDate,
	NIGHTLY_TAG,
	releaseYear,
	selectNightly,
	selectStableRelease,
	toRelease,
	toSha256,
} from './release';

describe('toSha256', () => {
	const HEX =
		'ac8310695cd5719ccb1b2eb2cf7d0f3ec96fca5ade0c1f52599333fbebcebc93';

	test('strips the prefix GitHub writes', () => {
		expect(toSha256(`sha256:${HEX}`)).toBe(HEX);
	});

	test('accepts a bare digest', () => {
		expect(toSha256(HEX)).toBe(HEX);
	});

	test.each([
		['absent', undefined],
		['null', null],
		['empty', ''],
	])('returns null when %s', (_label, digest) => {
		expect(toSha256(digest)).toBeNull();
	});

	/*
	 * The whole point of the function. A digest the visitor cannot verify is
	 * worse than none: it invites them to run `shasum` and then fail, on the one
	 * page whose argument is that its claims are checkable. Anything not exactly
	 * 64 lowercase hex characters is dropped rather than rendered.
	 */
	test.each([
		['too short', 'abc123'],
		['too long', `${HEX}00`],
		['uppercase', HEX.toUpperCase()],
		['non-hex characters', HEX.replace('a', 'z')],
		['another algorithm', `sha512:${HEX}`],
	])('rejects a digest that is %s', (_label, digest) => {
		expect(toSha256(digest)).toBeNull();
	});
});

describe('findAsset', () => {
	const assets = [
		{
			name: 'Ensemblr-0.1.0-arm64.DMG',
			browser_download_url: 'https://example.test/app.dmg',
			size: 148_568_812,
			digest: `sha256:${'a'.repeat(64)}`,
		},
		{
			name: 'checksums.txt',
			browser_download_url: 'https://example.test/checksums.txt',
			size: 128,
			digest: null,
		},
	];

	test('matches the extension regardless of case', () => {
		expect(findAsset(assets, '.dmg', 'Apple silicon .dmg')).toEqual({
			label: 'Apple silicon .dmg',
			sha256: 'a'.repeat(64),
			sizeBytes: 148_568_812,
			url: 'https://example.test/app.dmg',
		});
	});

	test('returns null when the platform has no artifact', () => {
		expect(findAsset(assets, '.zip', 'Apple silicon .zip')).toBeNull();
	});

	test('keeps the asset but drops an unusable digest', () => {
		const found = findAsset(assets, '.txt', 'Checksums');
		expect(found?.url).toBe('https://example.test/checksums.txt');
		expect(found?.sha256).toBeNull();
	});
});

describe('toRelease', () => {
	const raw = {
		tag_name: 'v0.1.0-beta.2',
		name: 'Beta 2',
		draft: false,
		prerelease: true,
		published_at: '2026-08-12T19:29:46Z',
		html_url: 'https://example.test/releases/tag/v0.1.0-beta.2',
		assets: [
			{
				name: 'Ensemblr-arm64.dmg',
				browser_download_url: 'https://example.test/app.dmg',
				size: 1,
				digest: null,
			},
		],
	};

	test('drops the leading v for the display version', () => {
		expect(toRelease(raw).version).toBe('0.1.0-beta.2');
		expect(toRelease(raw).tag).toBe('v0.1.0-beta.2');
	});

	test('leaves a tag without a v prefix alone', () => {
		expect(toRelease({ ...raw, tag_name: '1.0.0' }).version).toBe('1.0.0');
	});

	test('strips only the first v, not every one', () => {
		expect(toRelease({ ...raw, tag_name: 'vv1.0.0' }).version).toBe('v1.0.0');
	});

	test('reports a missing platform artifact as null rather than throwing', () => {
		expect(toRelease({ ...raw, assets: [] }).dmg).toBeNull();
		expect(toRelease({ ...raw, assets: [] }).zip).toBeNull();
	});
});

describe('formatBytes', () => {
	test.each([
		[148_568_812, '149 MB'],
		[150_463_794, '150 MB'],
		[0, '0 MB'],
		[499_999, '0 MB'],
	])('%d bytes reads as %s', (bytes, expected) => {
		expect(formatBytes(bytes)).toBe(expected);
	});
});

describe('formatReleaseDate', () => {
	test('prints a UTC date in the site voice', () => {
		expect(formatReleaseDate('2026-08-12T19:29:46Z')).toBe('12 Aug 2026');
	});

	/*
	 * Fixed to UTC rather than the runtime's zone. A build machine in UTC-7 would
	 * otherwise render the 12th as the 11th, and the date under the button would
	 * disagree with the one on the GitHub release it links to.
	 */
	test('does not drift with the build machine timezone', () => {
		expect(formatReleaseDate('2026-08-12T02:00:00Z')).toBe('12 Aug 2026');
		expect(formatReleaseDate('2026-08-12T23:00:00Z')).toBe('12 Aug 2026');
	});

	test.each([
		['null', null],
		['unparseable', 'not-a-date'],
	])('returns null for %s input rather than Invalid Date', (_label, iso) => {
		expect(formatReleaseDate(iso)).toBeNull();
	});
});

describe('releaseYear', () => {
	test('reads the year off the release', () => {
		expect(releaseYear('2026-08-12T19:29:46Z')).toBe(2026);
		expect(releaseYear('2028-01-01T00:00:00Z')).toBe(2028);
	});

	test('takes UTC, so a New Year release does not fall back a year', () => {
		expect(releaseYear('2027-01-01T00:30:00Z')).toBe(2027);
	});

	test.each([
		['null', null],
		['unparseable', 'not-a-date'],
	])('falls back to the founding year for %s', (_label, iso) => {
		expect(releaseYear(iso)).toBe(FOUNDED_YEAR);
	});
});

/*
 * The pinned release ships to real visitors whenever GitHub is unreachable, and
 * renders indistinguishably from a live one, so it is held to the same standard
 * as a live one. `scripts/check-pinned-release` covers the half that needs the
 * network — whether it has gone stale.
 */
describe('FALLBACK_RELEASE', () => {
	test('carries a macOS artifact — a fallback without one is not one', () => {
		expect(FALLBACK_RELEASE.dmg).not.toBeNull();
	});

	test.each(['dmg', 'zip'] as const)(
		'the pinned %s digest is one a reader can actually check',
		(kind) => {
			const digest = FALLBACK_RELEASE[kind]?.sha256;
			expect(digest).not.toBeNull();
			expect(toSha256(digest)).toBe(digest ?? null);
		},
	);

	test('version and tag agree', () => {
		expect(FALLBACK_RELEASE.tag).toBe(`v${FALLBACK_RELEASE.version}`);
	});

	test('the pinned download urls carry the pinned tag', () => {
		for (const download of [FALLBACK_RELEASE.dmg, FALLBACK_RELEASE.zip]) {
			expect(download?.url).toContain(FALLBACK_RELEASE.tag);
		}
	});

	test('is a release tag, not the nightly', () => {
		expect(FALLBACK_RELEASE.tag).not.toBe(NIGHTLY_TAG);
	});
});

describe('FALLBACK_NIGHTLY', () => {
	test('points at the rolling tag rather than a version', () => {
		expect(FALLBACK_NIGHTLY.tag).toBe(NIGHTLY_TAG);
		expect(FALLBACK_NIGHTLY.dmg.url).toContain(`/download/${NIGHTLY_TAG}/`);
	});

	/*
	 * The asset name is what makes this pin safe to hold forever: the canary
	 * artifacts are renamed to fixed filenames before upload precisely so the
	 * rolling tag's download URLs never move. A versioned name here would mean
	 * the pin rots overnight.
	 */
	test('names an asset with no version in it', () => {
		expect(FALLBACK_NIGHTLY.dmg.url).toEndWith('Ensemblr-Canary-arm64.dmg');
		expect(FALLBACK_NIGHTLY.dmg.url).not.toContain(FALLBACK_RELEASE.version);
	});
});

/*
 * Selection is by tag, never by list position — see `selectStableRelease`. The
 * fixtures below are therefore deliberately in the *wrong* order: GitHub sorts
 * `/releases` by `created_at`, the nightly's tag is force-moved rather than
 * recreated so its `created_at` never advances, and the two can tie outright.
 * Any test that passes only because the fixture is well-ordered is testing the
 * fixture.
 */
describe('selectStableRelease and selectNightly', () => {
	function entry(
		tag: string,
		overrides: { draft?: boolean; assets?: string[] } = {},
	) {
		const assets = overrides.assets ?? [`Ensemblr-${tag}-arm64.dmg`, 'app.zip'];
		return {
			tag_name: tag,
			name: tag,
			draft: overrides.draft ?? false,
			prerelease: true,
			published_at: '2026-08-18T13:07:24Z',
			html_url: `https://example.test/releases/tag/${tag}`,
			assets: assets.map((name) => ({
				name,
				browser_download_url: `https://example.test/download/${tag}/${name}`,
				size: 1,
				digest: null,
			})),
		};
	}

	test('picks the newest v* release however the list is ordered', () => {
		const list = [
			entry('v0.1.0-beta.6'),
			entry('v0.1.0-beta.7'),
			entry('v0.1.0-beta.5'),
		];
		expect(selectStableRelease(list)?.tag).toBe('v0.1.0-beta.7');
		expect(selectStableRelease([...list].reverse())?.tag).toBe('v0.1.0-beta.7');
	});

	/* The trap the whole selector exists for, three releases out from today. */
	test('prefers beta.10 to beta.9, where a string sort would not', () => {
		const list = [entry('v0.1.0-beta.9'), entry('v0.1.0-beta.10')];
		expect(selectStableRelease(list)?.tag).toBe('v0.1.0-beta.10');
	});

	test('never serves the nightly as the stable download', () => {
		const list = [entry(NIGHTLY_TAG), entry('v0.1.0-beta.7')];
		expect(selectStableRelease(list)?.tag).toBe('v0.1.0-beta.7');
		expect(selectStableRelease([entry(NIGHTLY_TAG)])).toBeNull();
	});

	test('ignores drafts and tags that are not v<semver>', () => {
		const list = [
			entry('v0.2.0', { draft: true }),
			entry('latest'),
			entry('v0.1.0-beta.7'),
		];
		expect(selectStableRelease(list)?.tag).toBe('v0.1.0-beta.7');
	});

	/*
	 * A failed artifact upload costs the visitor the previous release — live,
	 * checkable — rather than the pin, which may be older still.
	 */
	test('skips a release whose .dmg never uploaded', () => {
		const list = [
			entry('v0.1.0-beta.7', { assets: ['app.zip'] }),
			entry('v0.1.0-beta.6'),
		];
		expect(selectStableRelease(list)?.tag).toBe('v0.1.0-beta.6');
	});

	test('finds the nightly by its literal tag', () => {
		const nightly = selectNightly([entry('v0.1.0-beta.7'), entry(NIGHTLY_TAG)]);
		expect(nightly?.tag).toBe(NIGHTLY_TAG);
		expect(nightly?.dmg.url).toContain(`/download/${NIGHTLY_TAG}/`);
	});

	test('reports a missing nightly as absent rather than guessing at one', () => {
		expect(selectNightly([entry('v0.1.0-beta.7')])).toBeNull();
		expect(selectNightly([entry(NIGHTLY_TAG, { draft: true })])).toBeNull();
	});

	/*
	 * Exact match, not a prefix or a case fold. `isReservedTag()` was a skip rule
	 * where over-matching was harmless; this is a lookup, and over-matching would
	 * put some other build on the page under the word "nightly".
	 */
	test.each(['Nightly', 'nightly-20260818', 'v1.0.0-nightly'])(
		'does not treat %s as the nightly',
		(tag) => {
			expect(selectNightly([entry(tag)])).toBeNull();
		},
	);

	test('the nightly carries no size or digest to print', () => {
		const nightly = selectNightly([entry(NIGHTLY_TAG)]);
		expect(nightly?.dmg).toEqual({
			label: 'Apple silicon .dmg',
			url: `https://example.test/download/nightly/Ensemblr-${NIGHTLY_TAG}-arm64.dmg`,
		});
	});
});
