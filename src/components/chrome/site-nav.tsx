import Link from 'next/link';
import { EnsemblrWordmark } from '@/components/brand/wordmark';
import { DownloadButton } from '@/components/download/download-button';
import { PlatformChoice } from '@/components/download/platform-choice';
import { GitHubIcon } from '@/components/icons/site';
import { getSiteReleases } from '@/lib/github-release';
import { REPO } from '@/lib/site';
import { NavLinks } from './nav-links';
import { NavShell } from './nav-shell';

interface SiteNavProps {
	/**
	 * `home` is the bar the section anchors belong to. `page` is the same bar on
	 * a route that has none of those sections in it.
	 *
	 * `NavLinks` renders `NAV_SECTIONS` as in-page anchors and marks the one the
	 * reader is in by looking each `id` up in the document. On a second route
	 * every lookup misses: no crash — the hook gives up on an empty list — but
	 * five links that scroll nowhere and a wordmark pointing at a `#top` that
	 * only exists on the home page. So off the home page the anchors go, and the
	 * wordmark becomes the way back to the page they belong to.
	 */
	variant?: 'home' | 'page';
}

export async function SiteNav({ variant = 'home' }: SiteNavProps = {}) {
	const { stable: release } = await getSiteReleases();
	const atHome = variant === 'home';

	return (
		<NavShell>
			{/*
			 * `gap-3` until `sm`, because the bar has to survive 320px — the width
			 * WCAG's reflow criterion is measured at. Wordmark, disclosure, repo
			 * link and CTA at `gap-6` came to 366px of min-content, so the whole
			 * document gained a horizontal scrollbar and every section under it
			 * shifted left of its own gutter.
			 */}
			<nav className='mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-5 sm:gap-6 sm:px-8'>
				{/*
				 * Static at this size. The mark is a dot matrix, so at 14px tall each
				 * of its pixels is about 1.4px — and the flicker takes individual
				 * pixels down to 0.15 opacity, which at that scale drops whole strokes
				 * out of letters. Caught mid-cycle the bar read "ENSEMBL.R". The
				 * effect belongs where the glyphs are big enough to survive it.
				 */}
				<Link
					aria-label={atHome ? 'Ensemblr, back to top' : 'Ensemblr, home'}
					className='flex min-h-11 shrink-0 items-center'
					href={atHome ? '#top' : '/'}
				>
					<EnsemblrWordmark className='h-3.5 sm:h-3.5' static />
				</Link>

				{atHome ? <NavLinks /> : null}

				<div className='ml-auto flex items-center gap-3'>
					{/*
					 * Below `sm` this is the bar's only control, and it stands in for the
					 * download button rather than sitting beside it.
					 *
					 * The two of them together were what pushed the bar past 320px, and
					 * the one to drop is the one a phone cannot use: this is a desktop
					 * app behind a disk image or an AppImage, so the CTA on a handset
					 * hands over a file the device will never open. The repo is the thing
					 * a phone reader can actually do something with — read it here,
					 * install it at a desk. The hero's own download button is one screen
					 * below this and says the same thing with the size and the digest
					 * beside it, so nothing is lost but a control that could not be
					 * honoured.
					 */}
					{/* `-mr-3` below `sm`, where this is the last thing in the bar. The
					    44px box is a touch target, not a shape anyone can see: it leaves
					    13px of empty box to the right of an 18px glyph, which on top of
					    the 20px gutter set the mark a third of an inch off the edge while
					    the wordmark opposite sat flush on 20px. The pull puts the glyph
					    back on the gutter and leaves the target its full width. */}
					<Link
						aria-label='Ensemblr on GitHub'
						className='-mr-3 flex min-h-11 min-w-11 items-center justify-center text-muted transition-colors hover:text-ink sm:mr-0'
						href={REPO.url}
					>
						<GitHubIcon className='size-4.5' />
					</Link>
					{/* Solo: the bar has room for one CTA, and the download section
					    renders both platforms in full. See `PlatformChoice`. */}
					<PlatformChoice solo>
						{(platform) => (
							<DownloadButton
								className='hidden sm:inline-flex'
								platform={platform}
								release={release}
								size='sm'
								surface='nav'
							/>
						)}
					</PlatformChoice>
				</div>
			</nav>
		</NavShell>
	);
}
