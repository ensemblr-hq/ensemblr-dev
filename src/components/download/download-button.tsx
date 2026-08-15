import Link from 'next/link';
import { formatBytes, type Release } from '@/lib/release';
import { REPO } from '@/lib/site';
import { cn } from '@/lib/utils';

interface DownloadButtonProps {
	/**
	 * The release this button and everything around it describe. Passed in
	 * rather than fetched here, so the url it links to, the size it prints, and
	 * the digest `IntegrityNote` prints beside it are provably the same build.
	 */
	release: Release;
	size?: 'sm' | 'lg';
	className?: string;
}

/** The page's one job. */
export function DownloadButton({
	className,
	release,
	size = 'lg',
}: DownloadButtonProps) {
	const href = release.dmg?.url ?? REPO.releasesUrl;

	return (
		<Link
			className={cn(
				// The floor is a touch target, not a look: at `py-3` the large button
				// rendered 32px tall, well under the 44px a thumb needs, and the page's
				// one job is this button.
				'group inline-flex items-center gap-2.5 whitespace-nowrap rounded-lg bg-accent font-medium text-accent-foreground transition-colors hover:bg-accent-strong',
				size === 'lg'
					? 'min-h-11 px-5 py-3 text-[0.9375rem]'
					: // 32px in the bar, not 36: the bar is 56px tall, and a control
						// filling two thirds of its own height reads as the bar rather
						// than as something sitting in it.
						//
						// The touch floor is asked for by input device rather than by
						// width now. The bar hides this button below `sm` and shows the
						// repo link instead, but `sm` up still catches a tablet, and 32px
						// is under the 44px a thumb needs. `pointer-coarse` is the
						// question that was always being asked; `md` was standing in for
						// it.
						'min-h-8 px-3 py-1 text-sm pointer-coarse:min-h-11',
				className,
			)}
			href={href}
		>
			{/*
			 * No platform glyph, deliberately. An Apple mark sat here as the
			 * platform badge until Apple's own guidelines were read: the Apple logo
			 * "does not appear ... without express written permission from Apple",
			 * and a compatibility image must be "an actual photograph of the genuine
			 * Apple product and not an artist's rendering" — which a traced SVG on a
			 * download button is not. The word mark is the part Apple permits
			 * referentially, and the label below already carries it, so the glyph was
			 * saying nothing the words were not. Do not reinstate it.
			 */}
			{/* One label at both sizes. The bar used to carry a short "Download" for
			    phones, where the full string wrapped onto two lines and pushed the bar
			    out of its own height — but the bar now drops this button below `sm`
			    entirely and shows the repo link in its place, so the only widths this
			    ever renders at are ones the full label fits. */}
			<span>Download for macOS</span>
			{/* /80, not /65. Dark-on-accent has far less headroom than the page's
			    light-on-dark ramp: the same 65% that reads as a quiet subtitle in
			    body copy lands at 4.1:1 here, under AA on the one control the page
			    exists to get pressed. */}
			{size === 'lg' && release.dmg ? (
				<span className='font-mono text-[0.6875rem] text-accent-foreground/80'>
					{formatBytes(release.dmg.sizeBytes)}
				</span>
			) : null}
		</Link>
	);
}
