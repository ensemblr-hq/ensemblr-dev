import { describe, expect, test } from 'bun:test';

import { compareSemVer, parseVersionTag } from './semver';

function order(a: string, b: string): number {
	const left = parseVersionTag(a);
	const right = parseVersionTag(b);
	if (!left || !right) {
		throw new Error(`not a version tag: ${left ? b : a}`);
	}
	return Math.sign(compareSemVer(left, right));
}

describe('parseVersionTag', () => {
	test('reads the app’s tag shape', () => {
		expect(parseVersionTag('v0.1.0-beta.7')).toEqual({
			major: 0,
			minor: 1,
			patch: 0,
			prerelease: ['beta', '7'],
		});
	});

	test('reads a final release', () => {
		expect(parseVersionTag('v1.2.3')).toEqual({
			major: 1,
			minor: 2,
			patch: 3,
			prerelease: [],
		});
	});

	/*
	 * The rejections are the load-bearing half. This is the rule that decides
	 * what counts as a release of the app at all, so anything it accepts becomes
	 * a candidate for the stable download link.
	 */
	test.each([
		['the rolling nightly tag', 'nightly'],
		['a dated nightly tag', 'nightly-20260818'],
		['no leading v', '0.1.0'],
		['a leading V', 'V0.1.0'],
		['a partial version', 'v0.1'],
		['a leading zero', 'v01.0.0'],
		['empty', ''],
		['prose', 'latest'],
	])('rejects %s', (_label, tag) => {
		expect(parseVersionTag(tag)).toBeNull();
	});

	test('parses but discards build metadata, per §10 of the spec', () => {
		expect(parseVersionTag('v1.0.0+build.5')?.prerelease).toEqual([]);
		expect(order('v1.0.0+build.5', 'v1.0.0')).toBe(0);
	});
});

describe('compareSemVer', () => {
	/*
	 * The reason this file exists. A string comparison puts beta.10 *before*
	 * beta.9, so the site would serve the older build the week beta.10 ships —
	 * and would do it with a working download link, which is why nobody would
	 * catch it.
	 */
	test('orders double-digit prerelease numbers numerically', () => {
		expect(order('v0.1.0-beta.10', 'v0.1.0-beta.9')).toBe(1);
		expect('v0.1.0-beta.10' < 'v0.1.0-beta.9').toBe(true);
	});

	test.each([
		['major', 'v2.0.0', 'v1.9.9'],
		['minor', 'v1.2.0', 'v1.1.9'],
		['patch', 'v1.0.2', 'v1.0.1'],
	])('orders by %s', (_label, higher, lower) => {
		expect(order(higher, lower)).toBe(1);
		expect(order(lower, higher)).toBe(-1);
	});

	test('a release outranks its own prereleases', () => {
		expect(order('v1.0.0', 'v1.0.0-beta.1')).toBe(1);
		expect(order('v0.1.0', 'v0.1.0-beta.99')).toBe(1);
	});

	test('a numeric identifier ranks below an alphanumeric one', () => {
		expect(order('v1.0.0-rc', 'v1.0.0-2')).toBe(1);
	});

	test('alphanumeric identifiers compare in ASCII order', () => {
		expect(order('v1.0.0-beta', 'v1.0.0-alpha')).toBe(1);
		expect(order('v1.0.0-rc.1', 'v1.0.0-beta.1')).toBe(1);
	});

	test('a longer identifier set outranks a prefix of itself', () => {
		expect(order('v1.0.0-beta.1.1', 'v1.0.0-beta.1')).toBe(1);
	});

	test('equal versions compare equal', () => {
		expect(order('v0.1.0-beta.7', 'v0.1.0-beta.7')).toBe(0);
	});

	/* The full precedence example from §11 of the spec, sorted end to end. */
	test('reproduces the spec’s worked example', () => {
		const ascending = [
			'v1.0.0-alpha',
			'v1.0.0-alpha.1',
			'v1.0.0-alpha.beta',
			'v1.0.0-beta',
			'v1.0.0-beta.2',
			'v1.0.0-beta.11',
			'v1.0.0-rc.1',
			'v1.0.0',
		];

		const shuffled = [...ascending].reverse();
		const sorted = shuffled.sort((a, b) => {
			const left = parseVersionTag(a);
			const right = parseVersionTag(b);
			if (!left || !right) {
				throw new Error('unparseable tag in fixture');
			}
			return compareSemVer(left, right);
		});

		expect(sorted).toEqual(ascending);
	});
});
