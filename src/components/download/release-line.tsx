import Link from 'next/link';
import { formatReleaseDate, type Release } from '@/lib/release';
import { cn } from '@/lib/utils';

/**
 * Version, channel and date, stated plainly under the download button.
 *
 * Every fact here is read off a release — the live one when GitHub answers, the
 * pinned copy `getSiteReleases` serves when it does not — and the two render
 * identically. The pin is not hedged on the page because it is not hedged in
 * the repo: `check:pin` fails CI the moment any value in it stops matching the
 * release it names, so a visitor cannot be shown a version, a date or a digest
 * that disagrees with the tag this line links to.
 *
 * The parts are separated for a screen reader too. Read as one undifferentiated
 * run it announces "v0.1.0-beta.4 beta Apple silicon 14 Aug 2026", which is four
 * facts and no labels; the visually-hidden prefixes name each one.
 *
 * `ink` at 12px, not `faint` at 11px, and the same on the hero's gate list, the
 * trust echo, the zip line and the digest — the runs of metadata that sit under
 * a download button. Both quieter tiers were tried and both read washed out,
 * `faint` at 6.8:1 and `muted` at 8.6:1, which is the tell that the ratio was
 * never the problem: these are thin mono glyphs with wide tracking on a bloomed
 * dark ground at the smallest size the page uses, and contrast maths knows
 * nothing about stroke weight. Rank comes from size and from the separators
 * sitting a step below instead.
 *
 * `faint` and `muted` are still right for the footer's legal small print, which
 * is there to be found rather than read. These lines are read: they carry the
 * version, the architecture, the date and the digest.
 */
export function ReleaseLine({
	className,
	release,
}: {
	className?: string;
	/** Same object the button beside this one links to. */
	release: Release;
}) {
	const published = formatReleaseDate(release.publishedAt);

	return (
		<p
			className={cn(
				'flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.75rem] text-ink',
				className,
			)}
		>
			<span className='sr-only'>Version </span>
			{/* No colour step left to give it — the whole run is at `ink` now — so
			    the tag is marked as the line's one link by its underline and its
			    accent hover, which is what was carrying that job anyway. */}
			<Link
				className='rounded-sm text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent'
				href={release.notesUrl}
			>
				{release.tag}
			</Link>
			{release.isPrerelease ? (
				<>
					<span aria-hidden='true'>·</span>
					<span className='text-warning'>
						<span className='sr-only'>Channel: </span>beta
					</span>
				</>
			) : null}
			<span aria-hidden='true'>·</span>
			<span>
				<span className='sr-only'>Architecture: </span>Apple silicon
			</span>
			{published ? (
				<>
					<span aria-hidden='true'>·</span>
					<span>
						<span className='sr-only'>Published </span>
						{published}
					</span>
				</>
			) : null}
		</p>
	);
}
