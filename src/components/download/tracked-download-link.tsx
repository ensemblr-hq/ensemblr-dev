'use client';

import Link from 'next/link';

import {
	type AnalyticsSurface,
	assetName,
	type DownloadChannel,
	type DownloadFormat,
	downloadTarget,
	trackDownload,
} from '@/lib/analytics';
import type { Platform } from '@/lib/platform';

interface TrackedDownloadLinkProps {
	href: string;
	channel: DownloadChannel;
	platform: Platform;
	format: DownloadFormat;
	/** The release version, or `nightly` for the canary, whose bytes have none. */
	version: string;
	surface: AnalyticsSurface;
	className?: string;
	children: React.ReactNode;
}

/**
 * A download link that says which download it was.
 *
 * The links themselves are server-rendered — the release is fetched at build
 * time and the markup is static — so this is the smallest possible client
 * boundary: an `onClick` and nothing else. Everything that decides *what* the
 * link is stays on the server and arrives here as props.
 *
 * The identifying values are derived here rather than passed as a ready-made
 * string, and that is the whole point of the component. Two of the three call
 * sites render from data — `NightlyDownload` maps over `PLATFORMS`, and
 * `DownloadButton` chooses its asset by platform — and a slug typed into a loop
 * body is one slug for every row the loop draws, which is the failure this is
 * built to make impossible. `downloadTarget` composes it from the row, and
 * `assetName` reads the filename off the href the click actually follows.
 *
 * `onClick` rather than `onMouseDown` or a `beforeunload` hook: `track` sends a
 * `navigator.sendBeacon` payload, which is specified to survive the document
 * being torn down by the navigation that follows. Nothing here delays the
 * click, and a beacon that never leaves costs a data point and not a download.
 */
export function TrackedDownloadLink({
	channel,
	children,
	className,
	format,
	href,
	platform,
	surface,
	version,
}: TrackedDownloadLinkProps) {
	return (
		<Link
			className={className}
			href={href}
			onClick={() =>
				trackDownload({
					asset: assetName(href),
					channel,
					format,
					platform,
					surface,
					target: downloadTarget(channel, platform, format),
					version,
				})
			}
		>
			{children}
		</Link>
	);
}
