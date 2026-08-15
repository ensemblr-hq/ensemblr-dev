import { PixelRule } from '@/components/brand/pixel-rule';
import { EnsemblrWordmark } from '@/components/brand/wordmark';
import { GitHubIcon } from '@/components/icons/site';
import { getLatestRelease } from '@/lib/github-release';
import { ANALYTICS, THIRD_PARTY, TRADEMARK } from '@/lib/legal';
import { releaseYear } from '@/lib/release';
import { AUTHOR, REPO, SITE } from '@/lib/site';

export async function SiteFooter() {
	const release = await getLatestRelease();

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
					<div className='flex items-center gap-4'>
						<a
							className='flex items-center gap-1.5 transition-colors hover:text-ink'
							href={REPO.url}
						>
							<GitHubIcon className='size-3.5' />
							Source
						</a>
						<a
							className='transition-colors hover:text-ink'
							href={REPO.issuesUrl}
						>
							Issues
						</a>
						<a
							className='transition-colors hover:text-ink'
							href={REPO.changelogUrl}
						>
							Changelog
						</a>
						{/* The licence of the source at `licenseUrl`, not of the build
						    named on the line below it. The relicence to Apache 2.0 does
						    not reach back over releases that shipped under MIT, which is
						    why this label links the repository and never a tag. */}
						<a
							className='transition-colors hover:text-ink'
							href={REPO.licenseUrl}
						>
							{REPO.license}
						</a>
					</div>
					{/* Year comes from the cached release rather than the clock: reading
					    the current time here would make the whole footer dynamic. */}
					<p>
						{release.tag} · © {releaseYear(release.publishedAt)}{' '}
						<a className='transition-colors hover:text-ink' href={AUTHOR.url}>
							{AUTHOR.name}
						</a>
					</p>
				</div>
			</div>

			{/*
			 * The legal area. This site is one route, so there is no /legal page to
			 * hold the brand-usage terms and no link that could reach one — the
			 * notice lives here, at the foot of the page whose licence link sits
			 * three lines above it.
			 *
			 * Last in the document and quietest on it, but not hidden behind a
			 * disclosure: the reader it is written for is one who has just followed
			 * that licence link, and a forker who has to open something to find the
			 * name terms is a forker who does not find them. `max-w-[80ch]` because
			 * the second paragraph is four sentences and the footer is otherwise
			 * short-measure copy — set full width it would run to 150 characters a
			 * line against a 7xl container.
			 */}
			<div className='mt-10 border-line/70 border-t pt-8'>
				{/*
				 * Analytics first, and at the `text-muted` everything under it steps
				 * down from. Of the three notices in this block it is the only one
				 * addressed to the person actually reading the page — the two below
				 * are written for someone about to fork or redistribute — and the
				 * only one that concedes something rather than reserving something.
				 * The page argues "no telemetry" three times above this line, so the
				 * measurement it does do is not a thing to put last and dimmest.
				 *
				 * The link is the substance rather than a courtesy: this paragraph
				 * paraphrases another company's document, and a reader who cannot
				 * reach that document has been asked to take the paraphrase on
				 * trust — the one currency this page does not have.
				 */}
				<h2 className='sr-only'>Analytics</h2>
				<p className='max-w-[80ch] text-pretty text-[0.75rem] text-muted leading-relaxed'>
					{ANALYTICS.notice}
				</p>
				<p className='mt-2 max-w-[80ch] text-pretty text-[0.75rem] text-faint leading-relaxed'>
					{ANALYTICS.detail}
				</p>
				<p className='mt-2 text-[0.75rem] leading-relaxed'>
					<a
						className='text-faint underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-current'
						href={ANALYTICS.sourceUrl}
					>
						{ANALYTICS.sourceLabel}
					</a>
				</p>

				<h2 className='sr-only'>Trademarks</h2>
				<p className='mt-6 max-w-[80ch] text-pretty text-[0.75rem] text-muted leading-relaxed'>
					{TRADEMARK.notice}
				</p>
				<p className='mt-2 max-w-[80ch] text-pretty text-[0.75rem] text-faint leading-relaxed'>
					{TRADEMARK.terms}
				</p>

				{/*
				 * Other people's marks, below ours and quieter again. The gap is
				 * `mt-6` against the `mt-2` that joins the two paragraphs above it:
				 * four paragraphs of legal copy set at one rhythm read as one
				 * undifferentiated block, and these two are about different owners
				 * than those two. The step in spacing is the only thing separating
				 * "what you may not take from us" from "what we did not take from
				 * them" — there is no heading to do it, because a visible one would
				 * put the loudest word in the footer on its least important lines.
				 */}
				<p className='mt-6 max-w-[80ch] text-pretty text-[0.75rem] text-faint leading-relaxed'>
					{THIRD_PARTY.attribution}
				</p>
				<p className='mt-2 max-w-[80ch] text-pretty text-[0.75rem] text-faint leading-relaxed'>
					{THIRD_PARTY.disclaimer}
				</p>
			</div>
		</footer>
	);
}
