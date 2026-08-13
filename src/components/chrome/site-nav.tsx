import { EnsemblrWordmark } from '@/components/brand/wordmark';
import { DownloadButton } from '@/components/download/download-button';
import { GitHubIcon } from '@/components/icons/site';
import { getLatestRelease } from '@/lib/github-release';
import { REPO } from '@/lib/site';

import { NavLinks } from './nav-links';
import { NavShell } from './nav-shell';

export async function SiteNav() {
	const release = await getLatestRelease();

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
				<a
					aria-label='Ensemblr, back to top'
					className='flex min-h-11 shrink-0 items-center'
					href='#top'
				>
					<EnsemblrWordmark className='h-3.5 sm:h-3.5' static />
				</a>

				<NavLinks />

				<div className='ml-auto flex items-center gap-3'>
					{/*
					 * From `sm` up. The tightened gaps alone do not clear 320px, and of
					 * the two right-hand controls this is the one the page can spare:
					 * the hero's "View source" button sits one screen below it and the
					 * footer carries the same link again, whereas the download button
					 * is the reason the bar exists.
					 */}
					<a
						aria-label='Ensemblr on GitHub'
						className='hidden min-h-11 min-w-11 items-center justify-center text-muted transition-colors hover:text-ink sm:flex'
						href={REPO.url}
					>
						<GitHubIcon className='size-[1.125rem]' />
					</a>
					<DownloadButton release={release} size='sm' />
				</div>
			</nav>
		</NavShell>
	);
}
