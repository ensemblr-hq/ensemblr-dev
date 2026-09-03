import { describe, expect, test } from 'bun:test';

import {
	FALLBACK_NIGHTLY,
	FALLBACK_RELEASE,
	FOUNDED_YEAR,
	findAsset,
	formatBytes,
	formatReleaseDate,
	linuxAssets,
	macosAssets,
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

/*
 * Extension stopped being a platform test the day a release carried an artifact
 * for a second platform, and it is now a two-way problem: the page prints an
 * "Apple silicon" label and a "Linux x86-64" one, each over a digest that
 * matches whatever file it was handed. The fixtures below are real artifact
 * names from both platforms, so a filter that leaks in either direction fails
 * here rather than on the page.
 */
function asset(name: string) {
	return {
		name,
		browser_download_url: `https://example.test/${name}`,
		size: 1,
		digest: null,
	};
}

/** Every artifact a modern release and the canary between them publish. */
const MACOS_NAMES = [
	'Ensemblr-0.1.0-beta.24-arm64.dmg',
	'Ensemblr-darwin-arm64-0.1.0-beta.24.zip',
	'Ensemblr-Canary-arm64.dmg',
	'Ensemblr-Canary-darwin-arm64.zip',
];

/*
 * Both spellings, because the app uses both: the release artifact is named
 * after Forge's `--arch=x64` and the canary after `uname -m`. A matcher that
 * took only one would drop the other silently.
 */
const LINUX_NAMES = [
	'Ensemblr-0.1.0-beta.24-x64.AppImage',
	'Ensemblr-Canary-x86_64.AppImage',
];

describe('macosAssets', () => {
	test('keeps every macOS artifact the app publishes', () => {
		expect(macosAssets(MACOS_NAMES.map(asset)).map((a) => a.name)).toEqual(
			MACOS_NAMES,
		);
	});

	test.each([...LINUX_NAMES, 'Ensemblr-linux-x64-0.1.0-beta.19.zip'])(
		'drops %s',
		(name) => {
			expect(macosAssets([asset(name)])).toEqual([]);
		},
	);
});

describe('linuxAssets', () => {
	test('accepts both arch spellings the app ships', () => {
		expect(linuxAssets(LINUX_NAMES.map(asset)).map((a) => a.name)).toEqual(
			LINUX_NAMES,
		);
	});

	/*
	 * The direction that would actually reach a reader: an Apple silicon build
	 * printed under a button labelled Linux, beside a digest that matches it.
	 */
	test.each(MACOS_NAMES)('never returns the macOS artifact %s', (name) => {
		expect(linuxAssets([asset(name)])).toEqual([]);
	});

	/*
	 * Arch alone is not enough. The app has published a linux zip before, and a
	 * zip handed to a button that says `.AppImage` is not the file the install
	 * instructions beside it describe.
	 */
	test('requires the AppImage extension, not just the arch', () => {
		expect(
			linuxAssets([asset('Ensemblr-linux-x64-0.1.0-beta.19.zip')]),
		).toEqual([]);
	});

	test('matches the extension regardless of case', () => {
		expect(linuxAssets([asset('Ensemblr-0.1.0-x64.appimage')])).toHaveLength(1);
	});
});

describe('the two platform filters together', () => {
	/*
	 * The invariant the pair exists for, asserted over one realistic release
	 * rather than one artifact at a time: no asset may answer for both
	 * platforms, and every asset must land on the side its filename names.
	 */
	test('partition a release with no asset in common', () => {
		const assets = [...MACOS_NAMES, ...LINUX_NAMES, 'checksums.txt'].map(asset);
		const macos = macosAssets(assets).map((a) => a.name);
		const linux = linuxAssets(assets).map((a) => a.name);

		expect(macos).toEqual(MACOS_NAMES);
		expect(linux).toEqual(LINUX_NAMES);
		expect(macos.filter((name) => linux.includes(name))).toEqual([]);
	});

	test('resolve all three downloads off one release, whatever the order', () => {
		const release = toRelease({
			tag_name: 'v0.1.0-beta.24',
			name: null,
			draft: false,
			prerelease: true,
			published_at: '2026-09-03T09:15:28Z',
			html_url: 'https://example.test/releases/tag/v0.1.0-beta.24',
			assets: [
				asset('Ensemblr-linux-x64-0.1.0-beta.19.zip'),
				asset('Ensemblr-0.1.0-beta.24-x64.AppImage'),
				asset('Ensemblr-0.1.0-beta.24-arm64.dmg'),
				asset('Ensemblr-darwin-arm64-0.1.0-beta.24.zip'),
			],
		});
		expect(release.dmg?.url).toEndWith('Ensemblr-0.1.0-beta.24-arm64.dmg');
		expect(release.zip?.url).toEndWith(
			'Ensemblr-darwin-arm64-0.1.0-beta.24.zip',
		);
		expect(release.appImage?.url).toEndWith(
			'Ensemblr-0.1.0-beta.24-x64.AppImage',
		);
	});

	test('reports a platform the release did not build as null', () => {
		const macOnly = toRelease({
			tag_name: 'v0.1.0-beta.24',
			name: null,
			draft: false,
			prerelease: true,
			published_at: '2026-09-03T09:15:28Z',
			html_url: 'https://example.test/releases/tag/v0.1.0-beta.24',
			assets: [asset('Ensemblr-0.1.0-beta.24-arm64.dmg')],
		});
		expect(macOnly.dmg).not.toBeNull();
		expect(macOnly.appImage).toBeNull();
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

	test('carries a Linux artifact — the page offers that download too', () => {
		expect(FALLBACK_RELEASE.appImage).not.toBeNull();
	});

	test.each(['dmg', 'zip', 'appImage'] as const)(
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
		for (const download of [
			FALLBACK_RELEASE.dmg,
			FALLBACK_RELEASE.zip,
			FALLBACK_RELEASE.appImage,
		]) {
			expect(download?.url).toContain(FALLBACK_RELEASE.tag);
		}
	});

	/*
	 * The pin is hand-copied, so the one mistake it invites is a macOS digest
	 * under a Linux label. The filenames are the check a reader would make.
	 */
	test('each pinned asset is named for the platform its label claims', () => {
		expect(FALLBACK_RELEASE.dmg?.url).toContain('arm64');
		expect(FALLBACK_RELEASE.zip?.url).toContain('arm64');
		expect(FALLBACK_RELEASE.appImage?.url).toEndWith('.AppImage');
		expect(FALLBACK_RELEASE.appImage?.url).not.toContain('arm64');
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

	/*
	 * `x86_64`, not the `x64` the release asset uses. Getting this wrong is a
	 * 404 on a link the page prints with no digest to fall back on, and nothing
	 * else in the repo compares the two spellings.
	 */
	test('spells the canary AppImage the way the nightly workflow uploads it', () => {
		expect(FALLBACK_NIGHTLY.appImage?.url).toEndWith(
			'Ensemblr-Canary-x86_64.AppImage',
		);
		expect(FALLBACK_NIGHTLY.appImage?.url).toContain(
			`/download/${NIGHTLY_TAG}/`,
		);
		expect(FALLBACK_NIGHTLY.appImage?.url).not.toContain(
			FALLBACK_RELEASE.version,
		);
	});

	/*
	 * The type has no field for either, which is the decision enforced a level
	 * down — but the pin is hand-written, so this is the assertion that a later
	 * edit cannot quietly widen it.
	 */
	test('carries no bytes it would have to be right about tomorrow', () => {
		for (const download of [FALLBACK_NIGHTLY.dmg, FALLBACK_NIGHTLY.appImage]) {
			expect(download).not.toHaveProperty('sizeBytes');
			expect(download).not.toHaveProperty('sha256');
		}
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

	test('the nightly resolves its AppImage under both arch spellings', () => {
		for (const name of [
			'Ensemblr-Canary-x86_64.AppImage',
			'Ensemblr-Canary-x64.AppImage',
		]) {
			const nightly = selectNightly([
				entry(NIGHTLY_TAG, {
					assets: [`Ensemblr-${NIGHTLY_TAG}-arm64.dmg`, name],
				}),
			]);
			expect(nightly?.appImage).toEqual({
				label: 'Linux x86-64 .AppImage',
				url: `https://example.test/download/nightly/${name}`,
			});
		}
	});

	/* A night the Linux job failed is a missing row, not a broken link. */
	test('reports a canary with no AppImage as null', () => {
		const nightly = selectNightly([
			entry(NIGHTLY_TAG, { assets: [`Ensemblr-${NIGHTLY_TAG}-arm64.dmg`] }),
		]);
		expect(nightly?.dmg).not.toBeUndefined();
		expect(nightly?.appImage).toBeNull();
	});
});
