import { AppleIcon } from '@/components/icons/site';
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
		<a
			className={cn(
				// The floor is a touch target, not a look: at `py-3` the large button
				// rendered 32px tall, well under the 44px a thumb needs, and the page's
				// one job is this button.
				'group inline-flex items-center gap-2.5 whitespace-nowrap rounded-lg bg-accent font-medium text-accent-foreground transition-colors hover:bg-accent-strong',
				size === 'lg'
					? 'min-h-11 px-5 py-3 text-[0.9375rem]'
					: // 44px where a thumb is doing the pressing, back to a compact bar
						// button from `md` up where a pointer is.
						'min-h-11 px-3 py-1.5 text-sm md:min-h-9',
				className,
			)}
			href={href}
		>
			{/*
			 * 18px beside a 15px label, not 16. The Apple mark is a narrow glyph
			 * with a bite out of one side and a leaf above it, so it carries far
			 * less visual mass than its box implies — matched to the cap height of
			 * the words next to it, it reads smaller than them rather than equal.
			 * Set a step over the text it labels, it finally sits as the platform
			 * badge on the one control this page exists to get pressed.
			 */}
			<AppleIcon className={size === 'lg' ? 'size-[1.125rem]' : 'size-4'} />
			{size === 'lg' ? (
				<span>Download for macOS</span>
			) : (
				<>
					{/* The bar has a wordmark, a menu and a repo link beside this. At
					    390px the full label wrapped onto two lines and pushed the bar
					    out of its own height; the platform is stated everywhere else on
					    the page, so the short label loses nothing. */}
					<span className='sm:hidden'>Download</span>
					<span className='hidden sm:inline'>Download for macOS</span>
				</>
			)}
			{/* /80, not /65. Dark-on-accent has far less headroom than the page's
			    light-on-dark ramp: the same 65% that reads as a quiet subtitle in
			    body copy lands at 4.1:1 here, under AA on the one control the page
			    exists to get pressed. */}
			{size === 'lg' && release.dmg ? (
				<span className='font-mono text-[0.6875rem] text-accent-foreground/80'>
					{formatBytes(release.dmg.sizeBytes)}
				</span>
			) : null}
		</a>
	);
}
