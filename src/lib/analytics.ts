import { track } from '@vercel/analytics';

import type { Platform } from './platform';

/**
 * The two things this page is for, measured.
 *
 * The page has exactly one job — get a build onto a machine — and it offers two
 * routes to it: a link to an artifact, and a command to paste into a terminal.
 * A total for either is worth nothing on its own. "412 downloads" cannot say
 * whether the Linux launch landed, and "88 commands copied" cannot say whether
 * anyone prefers `brew` to `curl … | sh`; both questions are about *which* one,
 * and both are the reason this file exists.
 *
 * So: two event names, and on each one a `target` naming the exact affordance.
 * Vercel's aggregate endpoint groups on `eventData/<property>` under a
 * `filter=eventName eq '…'`, which is what makes the breakdown a real dimension
 * in the dashboard rather than a string that only exists inside an event
 * nobody can split. Two names and one property, rather than a name per target,
 * because the dashboard's own event list is then six rows of `Download` noise
 * instead of two rows that open onto their own breakdown.
 *
 * `target` is a slug that survives a release. The filename in `asset` does not
 * — `Ensemblr-0.1.2-arm64.dmg` becomes `…-0.1.3-…` next week — so grouping on
 * the filename would scatter one affordance across a column per release, which
 * is exactly the aggregation failure this is written to avoid. The filename is
 * still carried, because "which build did they actually take" is a different
 * and also real question; it is just not the one `target` answers.
 */
export const ANALYTICS_EVENTS = {
	copyCommand: 'Copy Command',
	download: 'Download',
} as const;

/**
 * Where on the page the affordance was pressed.
 *
 * The same command and the same button appear more than once: the hero and the
 * Download section both offer the brew line and both offer the Linux installer,
 * and the nav bar carries a third copy of the download button. Without this,
 * those collapse into one row and the page cannot answer whether anyone gets
 * past the first screenful — which is the question a second copy of a control
 * exists to raise in the first place.
 *
 * It is a second dimension rather than part of `target` because Vercel groups
 * on at most two, and `target` × `surface` is the pair worth spending them on.
 */
export type AnalyticsSurface = 'hero' | 'nav' | 'download';

/**
 * Every command the site offers to copy, enumerated.
 *
 * A union rather than a free string, so a call site cannot invent a fifth id or
 * misspell one of these four into a column of its own. `CopyCommand` requires
 * it, which is what makes "every copy affordance is measured" a thing the
 * compiler checks instead of a thing this comment claims: the component has one
 * clipboard write in it and `src/lib/clipboard.ts` has one caller, so a copy
 * button that fires nothing cannot be added without adding a prop it will not
 * type-check without.
 */
export type CopyTarget =
	| 'homebrew-install'
	| 'homebrew-upgrade'
	| 'linux-install'
	| 'linux-update';

/** Which of the two release channels a download came from. */
export type DownloadChannel = 'stable' | 'nightly';

/**
 * The artifact shapes the page links to, named as the reader sees them.
 *
 * `releases-page` is not an artifact. It is what `DownloadButton` falls back to
 * when a release shipped nothing for the reader's platform — the two builds run
 * in separate CI jobs, so it happens — and it is tracked rather than skipped
 * because a press there is a download intent the page failed to satisfy, which
 * is worth more than the presses it did satisfy.
 */
export type DownloadFormat = 'dmg' | 'zip' | 'appimage' | 'releases-page';

/**
 * The slug that identifies one download affordance across every release.
 *
 * Built rather than written out, because the rows it names are rendered from
 * data — `NightlyDownload` maps over `PLATFORMS`, and `DownloadButton` picks
 * its asset by platform — and a literal typed into a loop body is the same
 * string for every row the loop draws.
 */
export function downloadTarget(
	channel: DownloadChannel,
	platform: Platform,
	format: DownloadFormat,
): string {
	return format === 'releases-page'
		? `${channel}-${platform}-releases-page`
		: `${channel}-${platform}-${format}`;
}

/**
 * The filename at the end of a release asset URL.
 *
 * Read off the href the reader is about to follow rather than passed in beside
 * it, so the measurement cannot name a different file from the one the click
 * fetches. `null` where the link is the releases page and there is no file.
 */
export function assetName(url: string): string | null {
	const last = url.split('?')[0]?.split('/').pop();

	return last?.includes('.') ? last : null;
}

/**
 * Record a press on a download link.
 *
 * Fire-and-forget by design: `track` queues a beacon, and nothing about the
 * navigation waits on it. A blocked or failed beacon must never cost the reader
 * the download — the page's one job outranks knowing about it.
 */
export function trackDownload(properties: {
	readonly target: string;
	readonly asset: string | null;
	readonly channel: DownloadChannel;
	readonly platform: Platform;
	readonly format: DownloadFormat;
	readonly version: string;
	readonly surface: AnalyticsSurface;
}): void {
	track(ANALYTICS_EVENTS.download, { ...properties });
}

/** Record a command copied to the clipboard. */
export function trackCopyCommand(properties: {
	readonly target: CopyTarget;
	readonly command: string;
	readonly surface: AnalyticsSurface;
}): void {
	track(ANALYTICS_EVENTS.copyCommand, { ...properties });
}
