import Link from 'next/link';
import { PixelField } from '@/components/brand/pixel-field';
import { SectionHeading } from '@/components/brand/section-heading';
import { DownloadButton } from '@/components/download/download-button';
import { IntegrityNote } from '@/components/download/integrity-note';
import { NightlyDownload } from '@/components/download/nightly-download';
import { ReleaseLine } from '@/components/download/release-line';
import { GitHubIcon } from '@/components/icons/site';
import { Reveal } from '@/components/motion/reveal';
import { getSiteReleases } from '@/lib/github-release';
import { formatBytes } from '@/lib/release';
import { REPO, REQUIREMENTS } from '@/lib/site';

/**
 * The two facts the visitor came to check, restated at the moment they matter.
 *
 * They are already made at length in the Trust section directly above, and that
 * is the point: a reader who scrolled past the argument still meets its
 * conclusion at the button, where the decision is actually taken.
 */
const TRUST_ECHO = [
	'Ships no agent binary',
	'No GitHub tokens stored',
	'Session history is a local SQLite file',
] as const;

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
				 * committing to a 149 MB transfer, and the button has to be the last
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
						 * The last sentence arrived with 0.1.0-beta.8, from that release's
						 * notes and `docs/guide/01-install.md`, and it lands here rather
						 * than in the feature grid because it answers the objection this
						 * paragraph raises. A page that admits to rough edges and weekly
						 * betas has just told the reader they are signing up to re-download
						 * this by hand; they are not, and the sentence that says so belongs
						 * against the one that provoked it. "Offers to restart" is the
						 * mechanism, not a softening: the download is background, the
						 * restart is the visitor's, and an agent still working is asked
						 * about first.
						 */}
						<Reveal index={2}>
							<p className='max-w-xl text-pretty text-base leading-relaxed text-muted'>
								Ensemblr is at{' '}
								<strong className='text-ink'>{release.version}</strong> and
								still pre-1.0. The core loop — isolated workspaces, agent
								sessions, review, PR — is wired to real services and used daily.
								Expect rough edges, and{' '}
								<Link
									className='text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent'
									href={REPO.issuesUrl}
								>
									file them
								</Link>
								. Once installed it keeps up on its own: newer builds download
								in the background, and it offers to restart into one when you
								say so.
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
						<Reveal
							className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'
							index={3}
						>
							<DownloadButton release={release} />
							<Link
								className='inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-5 py-3 text-[0.9375rem] text-ink transition-colors hover:border-muted/50 hover:bg-surface'
								href={REPO.releasesUrl}
							>
								<GitHubIcon className='size-4' />
								All releases
							</Link>
						</Reveal>

						<Reveal index={4}>
							<ReleaseLine release={release} />
						</Reveal>

						<Reveal index={4}>
							{/*
							 * The separator trails its claim rather than leading the next
							 * one. Three claims do not fit one line at any width the page
							 * offers, so this list always wraps — and with the dot leading,
							 * the wrap put a bare `·` at the start of the second line, which
							 * reads as a bullet the other two rows are missing. Trailing, a
							 * wrapped line ends on the dot, which is what a run-on line of
							 * metadata is supposed to look like.
							 */}
							<ul className='flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.75rem] text-ink'>
								{TRUST_ECHO.map((claim, index) => (
									<li className='flex items-center gap-2' key={claim}>
										{claim}
										{/* `muted` under an `ink` run, matching the hero's gate list,
										    which runs the same idiom over the same tier. One step
										    down is all a separator needs; the fraction it used to
										    carry was measured against far quieter text. */}
										{index < TRUST_ECHO.length - 1 ? (
											<span aria-hidden='true' className='text-muted'>
												·
											</span>
										) : null}
									</li>
								))}
							</ul>
						</Reveal>

						<Reveal index={5}>
							<IntegrityNote release={release} />
						</Reveal>

						{release.zip ? (
							<Reveal index={5}>
								<p className='font-mono text-[0.75rem] text-ink'>
									Prefer a zip?{' '}
									<Link
										className='text-muted underline decoration-line underline-offset-4 transition-colors hover:text-accent'
										href={release.zip.url}
									>
										{release.zip.label} · {formatBytes(release.zip.sizeBytes)}
									</Link>
								</p>
							</Reveal>
						) : null}

						{/*
						 * Last, and visibly subordinate. Two buttons of equal weight would
						 * ask a first-time visitor to pick a channel before they have
						 * opened the app once — and the honest recommendation for almost
						 * everyone is the release directly above. This row is here for the
						 * reader who wants what landed on `master` today and knows what
						 * that costs.
						 *
						 * Rendered only when there is one. `null` means the lookup
						 * succeeded and GitHub had no `nightly` tag, which is a verified
						 * absence — the pinned copy shows only when the lookup itself
						 * failed. See `getSiteReleases`.
						 */}
						{nightly ? (
							<Reveal index={5}>
								<NightlyDownload nightly={nightly} />
							</Reveal>
						) : null}
					</div>
				</div>
			</div>
		</section>
	);
}
