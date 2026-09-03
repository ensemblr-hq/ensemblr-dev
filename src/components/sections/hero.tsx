import Link from 'next/link';
import { AppWindow } from '@/components/app-mock/window';
import { PixelField } from '@/components/brand/pixel-field';
import { EnsemblrWordmark } from '@/components/brand/wordmark';
import { CopyCommand } from '@/components/download/copy-command';
import { DownloadButton } from '@/components/download/download-button';
import { PlatformChoice } from '@/components/download/platform-choice';
import { ReleaseLine } from '@/components/download/release-line';
import { GitHubIcon } from '@/components/icons/site';
import { Reveal } from '@/components/motion/reveal';
import { getSiteReleases } from '@/lib/github-release';
import { LINUX_INSTALL } from '@/lib/install-scripts';
import { HOMEBREW, REPO, REQUIREMENTS } from '@/lib/site';
import { HeroWindow } from './hero-window';
import { RuntimeLinks } from './runtime-links';

/*
 * The hard gates, in the first screenful rather than only at the button.
 *
 * Three of these four disqualify a reader outright — an Intel Mac or an arm64
 * Linux box, no agent CLI on PATH, no authenticated `gh` — and a page that
 * withholds them until the download section has spent the reader's whole scroll
 * on a product they cannot install. Said up front they cost one line and buy the
 * rest of the page.
 */
const GATES = REQUIREMENTS.filter((requirement) => requirement.required).map(
	(requirement) => requirement.short,
);

/** The one-line install, at both platforms' widths. */
const INSTALL_LINE =
	'max-w-full break-words px-2 font-mono text-[0.75rem] text-muted';

/*
 * One await for the whole hero. The button and the line beneath it describe the
 * same build, so they read it from one object rather than each reaching for the
 * lookup independently.
 */
export async function Hero() {
	const { stable: release } = await getSiteReleases();

	return (
		<section className='relative overflow-hidden' id='top'>
			<PixelField className='h-144' />
			<div
				aria-hidden='true'
				className='bloom pointer-events-none absolute inset-x-0 top-0 h-168'
			/>

			<div className='relative mx-auto w-full max-w-7xl px-5 pt-16 pb-16 sm:px-8 sm:pt-24 lg:pb-24'>
				<div className='flex flex-col items-center gap-6 text-center'>
					{/* Small on purpose. The wordmark is the signature under the headline,
					    not a second headline — set any larger it competes with the h1
					    directly beneath it and the eye has two things to read first. */}
					<Reveal>
						<EnsemblrWordmark className='h-5 sm:h-6' />
					</Reveal>

					{/*
					 * The h1 is the control claim, not the isolation claim.
					 *
					 * Every product in this category now ships isolated worktrees, so
					 * "isolated, multi-agent coding workflows" described Ensemblr and
					 * three of its competitors equally well. An agent that drives the
					 * app it runs inside — spawning sub-agents, waiting on them, folding
					 * their work back in — is the sentence none of them can print.
					 */}
					<Reveal className='mt-1' index={1}>
						{/* `text-[2rem]` set a size and nothing else, so the h1 arrived on
						    a phone at weight 400 on a 48px line — a leading of 1.5 where
						    the display token asks for 1.02. Same sizes, now carrying the
						    weight, leading and tracking at every width. */}
						<h1 className='max-w-4xl text-balance text-display-sm sm:text-display-md lg:text-display'>
							Agents that{' '}
							<span className='whitespace-nowrap text-accent'>
								drive the app
							</span>
							, not just the code.
						</h1>
					</Reveal>

					{/* Both runtimes in the first clause: Claude Code is where the volume
					    is, Pi is where Ensemblr is the only option, and a reader who has
					    one of them installed is a reader who can run this today. */}
					{/*
					 * The page's one ™, and it belongs here rather than on the h1 or the
					 * wordmark above it. The headline never says the name, and the
					 * wordmark is a logo — marking either would put the symbol on
					 * something that is not a use of the word. This is the first time a
					 * reader meets "Ensemblr" as a word in prose, which is the occurrence
					 * a notice attaches to. Every later mention on the page goes unmarked
					 * on purpose; the footer's trademark notice is the only other place
					 * the symbol appears, and it is verbatim there.
					 */}
					<Reveal index={2}>
						<p className='max-w-[54ch] text-pretty text-base leading-relaxed text-muted sm:text-lg'>
							Ensemblr™ is a desktop orchestrator for the Pi agent harness or
							the Claude Code CLI you already have installed. Every stream of
							work gets its own git worktree, and the agent inside it can spawn
							sub-agents, delegate, wait and integrate — then open the diff, run
							the scripts and file the PR.
						</p>
					</Reveal>

					{/*
					 * Directly under the lede that names them, and above everything
					 * else, so what this drives is settled in the first screenful. A
					 * reader arrives asking one qualifying question — is my CLI the one
					 * it runs — and two marks answer it before the prose has to.
					 *
					 * `-mt-2` against the column's `gap-6`, and the same stagger step as
					 * the lede. The marks are that sentence's first clause drawn rather
					 * than written, and at the full gap they sat equidistant from the
					 * paragraph above and the paragraph below — two unlabelled glyphs
					 * floating between two blocks of prose, belonging to neither. Pulled
					 * up they read as what they are: the lede's last line.
					 */}
					<RuntimeLinks className='-mt-2' index={2} />

					{/*
					 * The credentials line, promoted out of the section it used to wait
					 * in. Against funded competitors that all run an account and a sync
					 * service, "there is nothing to sign into" is a differentiator, and a
					 * differentiator stated for the first time two thousand pixels down
					 * is one most readers never meet.
					 */}
					{/*
					 * Its own step in the cascade, not the lede's. This shared `index={2}`
					 * with the paragraph three blocks up and the marks between them, so
					 * a stagger built to arrive one beat at a time landed three
					 * consecutive beats at once and then paused.
					 */}
					<Reveal index={3}>
						<p className='max-w-[52ch] text-pretty text-[0.9375rem] text-muted/85 leading-relaxed'>
							No account, no sign-in, no cloud sync, no telemetry. No Ensemblr
							backend in the path, and no agent binary of its own.
						</p>
					</Reveal>

					{/*
					 * Full-width below `sm`, side by side above it. Centred and left at
					 * their intrinsic widths, the two buttons stacked as a wide bar above
					 * a narrower one on the same axis — close enough to match to read as
					 * a failed attempt at matching. The Download section pairs the same
					 * two controls left-aligned, where unequal widths share an edge and
					 * are plainly deliberate; a centred stack has no such edge.
					 */}
					<Reveal
						className='mt-2 flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-center'
						index={4}
					>
						{/* Solo, because the row cannot hold two CTAs and a reader who
						    needs the other one meets both, in full, in the download
						    section — see `PlatformChoice`. */}
						<PlatformChoice solo>
							{(platform) => (
								<DownloadButton
									className='justify-center'
									platform={platform}
									release={release}
									surface='hero'
								/>
							)}
						</PlatformChoice>
						<Link
							className='inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line px-5 py-3 text-[0.9375rem] text-ink transition-colors hover:border-muted/50 hover:bg-surface'
							href={REPO.url}
						>
							<GitHubIcon className='size-4' />
							View source
						</Link>
					</Reveal>

					{/*
					 * The one-line install, at the button rather than only in the
					 * Download section eight screens down. A reader who installs Mac apps
					 * with `brew` reaches for it before a disk image, and a Linux reader
					 * would otherwise never learn there is a script that unpacks the
					 * launcher entry — neither fact is on the way down this page.
					 *
					 * The button's beat, not the fine print's: this is the same act by
					 * another route, and the gates below it qualify both. It stays one
					 * line of mono with no version, no digest and no explanation — what
					 * the cask declares and which updater owns the bundle afterwards are
					 * the download section's to answer, at the length that needs.
					 */}
					{/*
					 * Set at the size the gates and the release line under it now take,
					 * with only the `or` stepped back: this is a line to be copied, and
					 * the contrast pass that lifted this whole band to `ink` did it
					 * because 11px of `faint` is not a size anyone reads a command at.
					 *
					 * And a line to be copied, so it copies — one click instead of a drag
					 * across a wrapped command.
					 */}
					{/*
					 * Gone below `sm`, where it wrapped onto two lines and spent a second
					 * row of the first screenful on the install path a phone reader is
					 * least likely to take: `brew` is a desktop act, and the terminal it
					 * runs in is not the device holding this page. Nothing is lost — the
					 * Download section carries the same command with the tap, the cask's
					 * gates and the upgrade line beside it, and it copies there too.
					 */}
					<Reveal className='hidden sm:block' index={4}>
						{/* Each branch names its own constant rather than sharing one
						    through a ternary, so `copy-command.test.ts` can see that every
						    command this page prints is wrapped in a `CopyCommand`. That
						    check reads source text, and a command reached through a
						    variable is a command it cannot vouch for. */}
						<PlatformChoice solo>
							{(platform) =>
								platform === 'macos' ? (
									<p className={INSTALL_LINE}>
										or{' '}
										<CopyCommand
											command={HOMEBREW.install}
											surface='hero'
											target='homebrew-install'
											variant='inline'
										/>
									</p>
								) : (
									<p className={INSTALL_LINE}>
										or{' '}
										<CopyCommand
											command={LINUX_INSTALL.install}
											surface='hero'
											target='linux-install'
											variant='inline'
										/>
									</p>
								)
							}
						</PlatformChoice>
					</Reveal>

					{/* The separator trails its gate, for the same reason the download
					    section's does: this list wraps at every width the hero offers,
					    and a leading dot puts a bare bullet at the head of line two. */}
					{/* Gates and release line share a step on purpose: they are one band
					    of fine print under the button, not two beats. */}
					<Reveal index={5}>
						<ul className='flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[0.75rem] text-ink'>
							{GATES.map((gate, index) => (
								<li className='flex items-center gap-2' key={gate}>
									{gate}
									{/* Full `muted`, not a /55 of it. The middot is what keeps
									    four constraints from reading as one run-on phrase, and it
									    only has to sit a step under its neighbours to do that —
									    which it now does by being `muted` under an `ink` run. At
									    /55 of `muted` it measured 3.29:1 against the canvas, just
									    over the 3:1 a graphical mark needs, and under text this
									    bright it read as dirt on the screen rather than a
									    separator. */}
									{index < GATES.length - 1 ? (
										<span aria-hidden='true' className='text-muted'>
											·
										</span>
									) : null}
								</li>
							))}
						</ul>
					</Reveal>

					<Reveal index={5}>
						<PlatformChoice solo>
							{(platform) => (
								<ReleaseLine
									className='justify-center'
									platform={platform}
									release={release}
								/>
							)}
						</PlatformChoice>
					</Reveal>
				</div>

				{/*
				 * Below `xl` only. From `xl` up the showcase's sticky replica is the
				 * page's single window, and it arrives on the very next scroll — two
				 * copies of the same screenshot a few hundred pixels apart reads as a
				 * mistake, however good each one is. Narrower viewports drop that
				 * sticky column, so this is where they get their look at the product.
				 *
				 * The handover used to sit at `lg`, which handed a 1024–1280 laptop
				 * the showcase's replica in a column too narrow to hold it: the
				 * conversation was squeezed to ~190px there and to nothing at all
				 * below 1060. At those widths the compact shell, scaled to the hero's
				 * own text column, is the better picture by a distance.
				 */}
				{/* Wider than the text column on a phone. The window is scaled to
				    whatever width it is handed, so the page's 20px gutters cost it
				    ~5% of its drawn size — which on a 390px screen is the difference
				    between reading the file names in the review panel and not. */}
				<div className='-mx-3 mt-14 sm:mx-0 sm:mt-20 xl:hidden'>
					<HeroWindow>
						<AppWindow variant='compact' />
					</HeroWindow>
				</div>
			</div>
		</section>
	);
}
