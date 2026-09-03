import Link from 'next/link';
import { PixelField } from '@/components/brand/pixel-field';
import { SectionHeading } from '@/components/brand/section-heading';
import { DownloadButton } from '@/components/download/download-button';
import { HomebrewNote } from '@/components/download/homebrew-note';
import { IntegrityNote } from '@/components/download/integrity-note';
import { LinuxInstallNote } from '@/components/download/linux-install-note';
import { NightlyDownload } from '@/components/download/nightly-download';
import { DownloadChoice } from '@/components/download/platform-choice';
import { PlatformSwitch } from '@/components/download/platform-switch';
import { ReleaseLine } from '@/components/download/release-line';
import { TrackedDownloadLink } from '@/components/download/tracked-download-link';
import { GitHubIcon } from '@/components/icons/site';
import { Reveal } from '@/components/motion/reveal';
import { getSiteReleases } from '@/lib/github-release';
import { isPlatform, type Platform } from '@/lib/platform';
import { formatBytes, type Release } from '@/lib/release';
import { REPO, REQUIREMENTS } from '@/lib/site';

/**
 * One platform's tab of the download surface: the button, the line under it,
 * the digest, and the alternate install path for that platform.
 *
 * Both are rendered, always. `globals.css` hides the one that is not the
 * reader's, off an attribute a blocking script sets before first paint — so a
 * crawler and a reader with JavaScript off get both, complete, and nobody sees
 * a flash. See `src/lib/platform.ts`.
 */
function PlatformDownload({
	platform,
	release,
}: {
	platform: Platform;
	release: Release;
}) {
	return (
		<div className='flex flex-col gap-6'>
			<Reveal
				className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'
				index={3}
			>
				<DownloadButton
					platform={platform}
					release={release}
					surface='download'
				/>
				<Link
					className='inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-5 py-3 text-[0.9375rem] text-ink transition-colors hover:border-muted/50 hover:bg-surface'
					href={REPO.releasesUrl}
				>
					<GitHubIcon className='size-4' />
					All releases
				</Link>
			</Reveal>

			<Reveal index={4}>
				<ReleaseLine platform={platform} release={release} />
			</Reveal>

			<Reveal index={5}>
				<IntegrityNote platform={platform} release={release} />
			</Reveal>

			{/*
			 * The alternate install path, on the same beat for both platforms. It
			 * leads the rest because it is the only one that is a different way to
			 * get the build the reader already wants — the zip under it is that
			 * download in a wrapper needing no mount, and the nightly below is a
			 * different build entirely.
			 */}
			<Reveal index={5}>
				{platform === 'macos' ? <HomebrewNote /> : <LinuxInstallNote />}
			</Reveal>

			{/* macOS only, because there is no second Linux artifact: the AppImage is
			    the whole delivery. */}
			{platform === 'macos' && release.zip ? (
				<Reveal index={5}>
					<p className='font-mono text-[0.75rem] text-ink'>
						Prefer a zip?{' '}
						<TrackedDownloadLink
							channel='stable'
							className='text-muted underline decoration-line underline-offset-4 transition-colors hover:text-accent'
							format='zip'
							href={release.zip.url}
							platform='macos'
							surface='download'
							version={release.version}
						>
							{release.zip.label} · {formatBytes(release.zip.sizeBytes)}
						</TrackedDownloadLink>
					</p>
				</Reveal>
			) : null}
		</div>
	);
}

export async function Download() {
	const { nightly, stable: release } = await getSiteReleases();

	return (
		<section
			className='relative scroll-mt-24 overflow-hidden border-line/70 border-y'
			id='download'
		>
			<PixelField className='h-full' />
			{/*
			 * Brighter than the hero's. The two glows were identical, so the page
			 * arrived at its closing CTA with exactly the light it opened on and the
			 * ending read as a repeat of the beginning rather than a destination.
			 */}
			<div
				aria-hidden='true'
				className='bloom-strong pointer-events-none absolute inset-x-0 top-0 h-full'
			/>

			<div className='relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-28'>
				{/*
				 * Explicit placement rather than source order, because the two orders
				 * genuinely differ. On a phone the requirements have to land between
				 * the promise and the button — the visitor should meet the gates before
				 * committing to a transfer this size, and the button has to be the last
				 * thing before the footer rather than the top of a five-row checklist
				 * they scroll past on the way out. On a wide screen the same card sits
				 * alongside instead, where it is read in parallel with the CTA.
				 */}
				<div className='grid gap-10 lg:grid-cols-2 lg:gap-20'>
					<div className='flex flex-col gap-6 lg:col-start-1 lg:row-start-1'>
						<SectionHeading
							eyebrow='Download'
							title='Open it, point it at a repo, start a workspace.'
							titleClassName='max-w-[18ch]'
						/>

						{/*
						 * Not the section's `lede`. This is a status line about the build
						 * — a version number and a link to file bugs against it — rather
						 * than the sentence that explains the section, so it keeps body
						 * measure and body size instead of taking the lede's `sm:text-lg`.
						 *
						 * What it used to close on — that the app downloads newer builds
						 * in the background and offers to restart into one — is macOS's
						 * behaviour and not Linux's, so it moved to the two platform
						 * blocks below where each can be true. Stated here it would have
						 * been a promise to a Linux reader the app deliberately does not
						 * keep.
						 */}
						<Reveal index={2}>
							<p className='max-w-xl text-pretty text-base leading-relaxed text-muted'>
								Ensemblr is at{' '}
								<strong className='text-ink'>{release.version}</strong> and
								still pre-1.0. The core loop is wired to real services and used
								daily; expect rough edges, and{' '}
								<Link
									className='text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent'
									href={REPO.issuesUrl}
								>
									file them
								</Link>
								.
							</p>
						</Reveal>
					</div>

					{/*
					 * `self-start`, because the card spans both rows and the rows are
					 * not the same height. Left to stretch it took the full 614px of
					 * the CTA column against 452px of content, so a quarter of the one
					 * card on the page was empty floor with a border round it — the
					 * requirements read as a list that had run out rather than a list
					 * that had finished. Hugging its content lets the two columns end
					 * where their arguments end.
					 */}
					<Reveal
						className='self-start rounded-xl border border-line bg-surface/70 p-6 backdrop-blur-sm sm:p-8 lg:col-start-2 lg:row-span-2 lg:row-start-1'
						index={2}
					>
						<h3 className='eyebrow'>Before it is useful</h3>
						<dl className='mt-6 flex flex-col divide-y divide-line/70'>
							{REQUIREMENTS.map((requirement) => (
								<div
									className='flex gap-3 py-4 first:pt-0 last:pb-0'
									key={requirement.name}
								>
									{/*
									 * A dash, not a tick. Every row was ticked, and a tick reads
									 * as "you have this" — the page congratulating the visitor
									 * for four things it has no way of knowing. These are gates
									 * they must supply; the marker should be neutral.
									 */}
									<span
										aria-hidden='true'
										className={
											requirement.required
												? 'mt-2 h-px w-4 shrink-0 bg-accent'
												: 'mt-2 h-px w-4 shrink-0 bg-muted/35'
										}
									/>
									<div className='flex flex-col gap-1'>
										<dt className='flex flex-wrap items-center gap-2 font-medium text-[0.875rem] text-ink'>
											{requirement.name}
											{/* Only the exceptions are labelled. Four of the six rows
											    are hard gates, so badging each of them "REQUIRED"
											    puts the same word down the card four times and the
											    two rows that differ stop standing out. The accent
											    dash carries required; the badge carries optional. */}
											{requirement.required ? null : (
												<span className='rounded border border-line px-1 py-px font-mono text-[9px] text-faint uppercase tracking-wider'>
													optional
												</span>
											)}
										</dt>
										<dd className='text-[0.8125rem] leading-relaxed text-muted'>
											{requirement.detail}
										</dd>
									</div>
								</div>
							))}
						</dl>
					</Reveal>

					<div className='flex flex-col gap-6 lg:col-start-1 lg:row-start-2'>
						{/*
						 * The switcher sits above the blocks rather than inside any of
						 * them, because it is the question they are three answers to —
						 * and because with no detection it is not drawn at all and the
						 * row costs nothing.
						 */}
						{/* `self-start`: a segmented control is sized by its own tabs.
						    As a plain flex item it stretched the full column and put
						    three short words against a foot of empty box. */}
						<PlatformSwitch className='self-start' />

						{/*
						 * Three tabs from one component: the two release blocks, and the
						 * nightly. `isPlatform` is what keeps the channel from reaching
						 * anything that takes a `Platform` — the button, the release
						 * line, the digest — and the type says so rather than a comment.
						 *
						 * The nightly renders only when there is one. `null` means the
						 * lookup succeeded and GitHub had no `nightly` tag, which is a
						 * verified absence: the pinned copy shows only when the lookup
						 * itself failed. See `getSiteReleases`.
						 */}
						<DownloadChoice>
							{(tab) =>
								isPlatform(tab) ? (
									<PlatformDownload platform={tab} release={release} />
								) : nightly ? (
									<Reveal index={3}>
										<NightlyDownload nightly={nightly} />
									</Reveal>
								) : null
							}
						</DownloadChoice>
					</div>
				</div>
			</div>
		</section>
	);
}
