/**
 * Just enough of SemVer 2.0.0 to order the app's release tags correctly.
 *
 * A string comparison is the obvious implementation and it is wrong in a way
 * that stays hidden for months: `v0.1.0-beta.10` sorts *before* `v0.1.0-beta.9`
 * lexically, because `1` < `9` at the first differing character. The app is at
 * beta.7, so a string compare would keep giving the right answer until beta.10
 * ships and then quietly serve beta.9 as the newest release — the failure mode
 * being a download link that works, which is why nobody would notice.
 *
 * So precedence follows §11 of the spec: numeric identifiers compare
 * numerically, alphanumeric ones compare in ASCII order, a numeric identifier
 * ranks below an alphanumeric one, a longer identifier set outranks a shorter
 * prefix of itself, and any prerelease ranks below the release it precedes.
 * Build metadata is parsed and then ignored, exactly as the spec requires.
 */

export interface SemVer {
	readonly major: number;
	readonly minor: number;
	readonly patch: number;
	/** Dot-separated prerelease identifiers; empty for a final release. */
	readonly prerelease: readonly string[];
}

/**
 * The official SemVer 2.0.0 pattern with a mandatory leading `v`, because the
 * tag namespace is what this is selecting over: `v<semver>` is a release of the
 * app and anything else — `nightly` above all — is not.
 */
const TAG_PATTERN =
	/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const NUMERIC = /^\d+$/;

/** A `v<semver>` tag as its comparable parts, or null when it is not one. */
export function parseVersionTag(tag: string): SemVer | null {
	const match = TAG_PATTERN.exec(tag);
	if (!match) {
		return null;
	}
	return {
		major: Number(match[1]),
		minor: Number(match[2]),
		patch: Number(match[3]),
		prerelease: match[4] ? match[4].split('.') : [],
	};
}

function compareIdentifiers(a: string, b: string): number {
	const aNumeric = NUMERIC.test(a);
	const bNumeric = NUMERIC.test(b);

	if (aNumeric && bNumeric) {
		return Number(a) - Number(b);
	}
	// "Numeric identifiers always have lower precedence than alphanumeric
	// identifiers" — so `beta.2` is below `beta.rc`, not above it.
	if (aNumeric !== bNumeric) {
		return aNumeric ? -1 : 1;
	}
	if (a === b) {
		return 0;
	}
	return a < b ? -1 : 1;
}

function comparePrerelease(a: readonly string[], b: readonly string[]): number {
	// An absent prerelease outranks any present one: 1.0.0 > 1.0.0-beta.1.
	if (a.length === 0 || b.length === 0) {
		if (a.length === b.length) {
			return 0;
		}
		return a.length === 0 ? 1 : -1;
	}

	for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
		const ordering = compareIdentifiers(a[index], b[index]);
		if (ordering !== 0) {
			return ordering;
		}
	}

	// Every identifier they share is equal, so the longer set wins:
	// beta.1.1 > beta.1.
	return a.length - b.length;
}

/** Negative when `a` precedes `b`, positive when it follows, 0 when equal. */
export function compareSemVer(a: SemVer, b: SemVer): number {
	return (
		a.major - b.major ||
		a.minor - b.minor ||
		a.patch - b.patch ||
		comparePrerelease(a.prerelease, b.prerelease)
	);
}
