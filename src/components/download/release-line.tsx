import { formatReleaseDate, type Release } from '@/lib/release';
import { cn } from '@/lib/utils';

/**
 * Version, channel and date, stated plainly under the download button.
 *
 * Every fact here is read off the release at build time, so the line has to be
 * able to say when it *could not* read one. When the GitHub API rate-limits,
 * `getLatestRelease` serves a pinned copy — and a pinned copy rendered with a
 * confident publication date is the page asserting a freshness the build never
 * confirmed. On a site whose first principle is that every claim is checkable,
 * that is the worst available failure, so the fallback drops the date and says
 * what it is instead.
 *
 * The parts are separated for a screen reader too. Read as one undifferentiated
 * run it announces "v0.1.0-beta.3 beta Apple silicon 13 Aug 2026", which is four
 * facts and no labels; the visually-hidden prefixes name each one.
 */
export function ReleaseLine({
	className,
	release,
}: {
	className?: string;
	/** Same object the button beside this one links to. */
	release: Release;
}) {
	const published = release.isFallback
		? null
		: formatReleaseDate(release.publishedAt);

	return (
		<p
			className={cn(
				'flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.6875rem] text-faint',
				className,
			)}
		>
			<span className='sr-only'>Version </span>
			<a
				className='rounded-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-accent'
				href={release.notesUrl}
			>
				{release.tag}
			</a>
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
			{release.isFallback ? (
				<>
					<span aria-hidden='true'>·</span>
					<span className='text-warning'>
						pinned build — GitHub was unreachable at build time
					</span>
				</>
			) : null}
		</p>
	);
}
