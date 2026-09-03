import Link from 'next/link';
import { TrackedDownloadLink } from '@/components/download/tracked-download-link';
import { MoonIcon } from '@/components/icons/site';
import { PLATFORMS, type Platform } from '@/lib/platform';
import {
	NIGHTLY_TAG,
	type Nightly,
	type NightlyDownloadLink,
} from '@/lib/release';

/**
 * The third tab: one untested build of `master`, for both platforms.
 *
 * Every fact below is read from `nightly.yml` in the app repo rather than
 * recalled: the 04:00 UTC cron, the change gate that skips a quiet night, the
 * canary channel's own bundle id and product name, and — for macOS only — that
 * the artifacts go through the same sign-notarise-staple path a release does.
 * If any of that moves, this copy is wrong and nothing here will notice; the
 * source is `.github/workflows/nightly.yml` in `ensemblr-hq/ensemblr`.
 *
 * The signing clause is macOS's alone, and the workflow says so in as many
 * words: the `build-linux` job does not run `verify:signing`, "an AppImage
 * carries no notarization ticket". One sentence over both platforms is how a
 * true claim about one build becomes a false one about the other — so each row
 * carries its own, and the shared paragraph carries neither.
 *
 * A tab rather than a card at the foot of each platform block, which is where
 * this used to live: printed twice, below the fold both times, and offering a
 * channel almost nobody should take on a first visit. Behind a tab it is a
 * thing a reader asks for, which is what it always was.
 *
 * On the missing digest: the release tabs print a SHA-256 the reader can check,
 * and a download offered here with no such line would read as an oversight on a
 * page whose entire argument is that its claims are verifiable. So it states
 * why it has none instead of quietly omitting it. The type it takes carries no
 * digest field at all, which is the same decision enforced a level down.
 */
function NightlyRow({
	download,
	label,
	note,
	platform,
}: {
	download: NightlyDownloadLink;
	label: string;
	note: string;
	/*
	 * The row's own platform, threaded through from the map below rather than
	 * inferred here. This component is drawn once per platform, so anything it
	 * decided for itself would be the same value on both rows — which is the one
	 * way an identifier can silently stop identifying anything.
	 */
	platform: Platform;
}) {
	return (
		<div className='flex flex-col gap-1 border-line/70 border-t pt-3 first:border-t-0 first:pt-0'>
			<p className='flex flex-wrap items-baseline gap-x-2 text-[0.8125rem] text-muted'>
				<span className='font-medium text-ink'>{label}</span>
				{note}
			</p>
			{/* `break-all`: these filenames are long, and a link shown with its
			    middle missing is one the reader cannot check against the release
			    page it came from. */}
			<TrackedDownloadLink
				channel='nightly'
				className='w-fit break-all font-mono text-[0.8125rem] text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent'
				format={platform === 'macos' ? 'dmg' : 'appimage'}
				href={download.url}
				platform={platform}
				surface='download'
				/*
				 * The tag, not a version. These URLs are fixed and the bytes behind
				 * them are replaced most nights, so there is no version to name —
				 * the same reason the row prints no digest and no size. `nightly` is
				 * the honest value, and it keeps the canary's rows from being
				 * averaged into whichever release happened to be current.
				 */
				version={NIGHTLY_TAG}
			>
				{download.url.split('/').pop()}
			</TrackedDownloadLink>
		</div>
	);
}

/** What each platform's canary is, in the one clause that differs. */
const NIGHTLY_NOTES: Record<string, string> = {
	linux: 'unsigned, like the release AppImage',
	macos: 'signed and notarised exactly like a release',
};

export function NightlyDownload({ nightly }: { nightly: Nightly }) {
	const rows = PLATFORMS.map((platform) => ({
		download:
			platform.id === 'macos'
				? (nightly.dmg as NightlyDownloadLink | null)
				: nightly.appImage,
		id: platform.id,
		label: platform.label,
	}));

	return (
		<div className='flex flex-col gap-4 rounded-lg border border-line border-dashed bg-surface/70 p-4'>
			<p className='flex items-center gap-2 text-warning'>
				<MoonIcon className='size-3.5 shrink-0' />
				<span className='eyebrow text-warning'>Nightly · canary</span>
			</p>

			<p className='text-[0.8125rem] leading-relaxed text-muted'>
				<span className='font-medium text-ink'>
					An untested build of{' '}
					<code className='font-mono text-[0.75rem]'>master</code>.
				</span>{' '}
				Rebuilt at 04:00 UTC on the nights the branch moved. It installs as{' '}
				<span className='text-ink'>&ldquo;Ensemblr Canary&rdquo;</span>{' '}
				<em className='font-medium text-ink not-italic'>alongside</em> a release
				rather than over it.
			</p>

			<div className='flex flex-col gap-3'>
				{rows.map((row) =>
					/*
					 * A night the Linux job failed leaves the tag carrying macOS assets
					 * and nothing else. That row is dropped rather than pointed at the
					 * release page: this is the optional download, and an empty one is
					 * not worth a line.
					 */
					row.download ? (
						<NightlyRow
							download={row.download}
							key={row.id}
							label={row.label}
							note={NIGHTLY_NOTES[row.id]}
							platform={row.id}
						/>
					) : null,
				)}
			</div>

			{/*
			 * No size either, and for the same reason — it is a different number
			 * every night. The release tabs print one; this one prints neither
			 * rather than one of the two, which would only invite the question.
			 */}
			<p className='border-line/70 border-t pt-3 text-[0.75rem] leading-relaxed text-muted'>
				No SHA-256 here: the bytes behind these links are replaced most nights,
				so one printed here would be wrong by morning. The{' '}
				<Link
					className='text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent'
					href={nightly.notesUrl}
				>
					nightly release
				</Link>{' '}
				names the commit it was built from.
			</p>
		</div>
	);
}
