import Link from 'next/link';
import { MoonIcon } from '@/components/icons/site';
import type { Nightly } from '@/lib/release';

/**
 * The second download, and the one that has to explain itself.
 *
 * Every fact below is read from `nightly.yml` in the app repo rather than
 * recalled: the 04:00 UTC cron, the change gate that skips a quiet night, the
 * canary channel's own bundle id and product name, and that the artifacts go
 * through the same sign-notarise-staple path a release does. If any of that
 * moves, this copy is wrong and nothing here will notice — the source is
 * `.github/workflows/nightly.yml` in `ensemblr-hq/ensemblr`.
 *
 * Subordinate to the release above it, but not *dim*. The first draft carried
 * the whole block at `faint` on no background and the download link was the
 * quietest thing in it — a row offering a real build, styled like a disclaimer.
 * Rank is set by size, by the dashed border and by sitting last; the text
 * itself reads at `muted` and the link at `ink`, the same weights the section
 * gives every other download it means.
 *
 * On the missing digest: the release row prints a SHA-256 the reader can check,
 * and a second download link sitting under it with no such line would read as
 * an oversight on a page whose entire argument is that its claims are
 * verifiable. So the row states why it has none instead of quietly omitting it.
 * The type it takes carries no digest field at all, which is the same decision
 * enforced a level down.
 */
export function NightlyDownload({ nightly }: { nightly: Nightly }) {
	return (
		<div className='flex flex-col gap-3 rounded-lg border border-line border-dashed bg-surface/70 p-4'>
			<p className='flex items-center gap-2 text-warning'>
				<MoonIcon className='size-3.5 shrink-0' />
				<span className='eyebrow text-warning'>Nightly · canary</span>
			</p>

			<p className='text-[0.8125rem] leading-relaxed text-muted'>
				<span className='font-medium text-ink'>
					An untested build of{' '}
					<code className='font-mono text-[0.75rem]'>master</code>.
				</span>{' '}
				Rebuilt at 04:00 UTC on the nights the branch moved, signed and
				notarised exactly like a release, and shipped on its own channel: it
				installs as{' '}
				<span className='text-ink'>&ldquo;Ensemblr Canary&rdquo;</span>{' '}
				<em className='font-medium text-ink not-italic'>alongside</em> a release
				rather than over it, so keeping both is the normal case.
			</p>

			<div className='flex flex-col gap-2 border-line/70 border-t pt-3'>
				<Link
					className='w-fit font-mono text-[0.8125rem] text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent'
					href={nightly.dmg.url}
				>
					{nightly.dmg.url.split('/').pop()}
				</Link>
				{/*
				 * No size either, and for the same reason — it is a different number
				 * every night. The release row prints one; this row prints neither
				 * rather than one of the two, which would only invite the question.
				 */}
				<p className='text-[0.75rem] leading-relaxed text-muted'>
					No SHA-256 here. The file behind this link is rebuilt and replaced
					most nights, so a digest printed on this page would be wrong by
					morning — the{' '}
					<Link
						className='text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent'
						href={nightly.notesUrl}
					>
						nightly release
					</Link>{' '}
					names the commit it was built from.
				</p>
			</div>
		</div>
	);
}
