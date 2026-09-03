import Link from 'next/link';
import { PixelRule } from '@/components/brand/pixel-rule';
import { EnsemblrWordmark } from '@/components/brand/wordmark';
import { GitHubIcon } from '@/components/icons/site';
import { getSiteReleases } from '@/lib/github-release';
import { ANALYTICS, LEGAL_PAGE, TRADEMARK } from '@/lib/legal';
import { releaseYear } from '@/lib/release';
import { AUTHOR, REPO, SITE } from '@/lib/site';

export async function SiteFooter() {
	const { stable: release } = await getSiteReleases();

	return (
		<footer className='mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8'>
			<PixelRule className='mb-10' />
			<div className='flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between'>
				<div className='flex flex-col gap-4'>
					{/* Static for the same reason as the nav: 16px is under the size
					    where a dot-matrix flicker still reads as one word. */}
					<EnsemblrWordmark className='h-4 sm:h-4' static />
					<p className='max-w-xs text-pretty text-[0.8125rem] leading-relaxed text-faint'>
						{SITE.tagline}
					</p>
				</div>

				<div className='flex flex-col gap-3 font-mono text-[0.6875rem] text-faint sm:items-end'>
					{/*
					 * Wrapping, since Schemas made it five. Four links at `gap-4` fitted
					 * a 320px viewport with 15px to spare; the fifth took the row to
					 * 308px of min-content inside a 265px box, and because a `flex` row
					 * that cannot wrap sets its parent's floor, that put a horizontal
					 * scrollbar under *every* page on the site — 320px being the width
					 * WCAG's reflow criterion is measured at.
					 *
					 * `gap-y-2` rather than the bare `gap-4` the row had: wrapped at
					 * 16px the two lines read as two separate rows of links, and this
					 * is one row that happens to fold.
					 */}
					<div className='flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end'>
						<Link
							className='flex items-center gap-1.5 transition-colors hover:text-ink'
							href={REPO.url}
						>
							<GitHubIcon className='size-3.5' />
							Source
						</Link>
						<Link
							className='transition-colors hover:text-ink'
							href={REPO.issuesUrl}
						>
							Issues
						</Link>
						<Link
							className='transition-colors hover:text-ink'
							href={REPO.changelogUrl}
						>
							Changelog
						</Link>
						{/* The only link in this row that stays on the site, and the only
						    way to reach the page at all — nothing in the nav points at it,
						    because the bar carries the home page's section anchors. */}
						<Link className='transition-colors hover:text-ink' href='/schemas'>
							Schemas
						</Link>
						{/* The licence of the source at `licenseUrl`, not of the build
						    named on the line below it. The relicence to Apache 2.0 does
						    not reach back over releases that shipped under MIT, which is
						    why this label links the repository and never a tag. */}
						<Link
							className='transition-colors hover:text-ink'
							href={REPO.licenseUrl}
						>
							{REPO.license}
						</Link>
					</div>
					{/* Year comes from the cached release rather than the clock: reading
					    the current time here would make the whole footer dynamic. */}
					<p>
						{release.tag} · © {releaseYear(release.publishedAt)}{' '}
						<Link
							className='transition-colors hover:text-ink'
							href={AUTHOR.url}
						>
							{AUTHOR.name}
						</Link>
					</p>
				</div>
			</div>

			{/*
			 * The two notices a visitor is owed, and a link to the rest.
			 *
			 * Four paragraphs used to sit here — the analytics detail, the brand
			 * terms, the third-party attribution and its disclaimer — on the page
			 * whose whole problem was length, in the quietest type on it. They are
			 * at `/legal` now, where each gets a heading and a readable size.
			 *
			 * These two stayed because they are the ones addressed to the person
			 * actually reading rather than to someone about to fork: that they are
			 * being counted, and that the name is a mark. The page argues "no
			 * telemetry" three times above this line, so the measurement it does do
			 * is not a thing to move behind a click.
			 */}
			<div className='mt-10 border-line/70 border-t pt-8'>
				<h2 className='sr-only'>Notices</h2>
				<p className='max-w-[80ch] text-pretty text-[0.75rem] text-muted leading-relaxed'>
					{ANALYTICS.notice}
				</p>
				<p className='mt-2 max-w-[80ch] text-pretty text-[0.75rem] text-muted leading-relaxed'>
					{TRADEMARK.notice}
				</p>
				<p className='mt-3 text-[0.75rem] leading-relaxed'>
					<Link
						className='text-faint underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-current'
						href={LEGAL_PAGE.path}
					>
						Analytics, trademark terms and third-party attributions
					</Link>
				</p>
			</div>
		</footer>
	);
}
