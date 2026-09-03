import Link from 'next/link';
import { CopyCommand } from '@/components/download/copy-command';
import { HOMEBREW } from '@/lib/site';

/**
 * The install path that does not go through the button above it.
 *
 * A reader who already runs `brew` installs Mac apps with it by default, and
 * the tap answers something the disk image cannot: what upgrades this later.
 * Both halves are mechanism rather than adjective, like the note above — what
 * the cask declares, and which of the two updaters owns the bundle afterwards.
 *
 * Placed under the digest rather than beside the button. The button is the
 * page's one conversion event and `IntegrityNote` describes the exact file it
 * links to; a second command set alongside it would split that click to serve
 * the smaller half of the audience.
 *
 * Inside the macOS block, and labelled macOS anyway. `depends_on macos:` means
 * the cask refuses on Linux, but with no JavaScript both platform blocks render
 * — so the label is what stops a Linux reader copying a command that cannot
 * work, in the one case the switcher cannot cover.
 */
export function HomebrewNote() {
	return (
		<div className='flex flex-col gap-3 rounded-lg border border-line/70 bg-surface/40 p-4'>
			<p className='flex flex-wrap items-center gap-x-2 font-mono text-[0.75rem] text-ink'>
				Or install it with Homebrew:
				<span className='rounded border border-line px-1 py-px text-[9px] text-faint uppercase tracking-wider'>
					{HOMEBREW.platformNote}
				</span>
			</p>
			{/*
			 * `break-words`, where the digest above it takes `break-all`. Both wrap
			 * rather than truncate — a command shown with its middle missing cannot
			 * be copied — but breaking anywhere is only harmless in a hex string,
			 * where every position is equally arbitrary. Here it cut the command at
			 * `…/tap/en | semblr`. This one has spaces and a real hyphen to break at,
			 * and does, on the phone widths where it does not fit a line.
			 *
			 * Which is where `CopyCommand` earns itself: the width that wraps this
			 * into three lines is the width where selecting it by hand is worst.
			 *
			 * No version in it, and none printed beside it: the cask resolves its own
			 * from the tap.
			 */}
			<CopyCommand
				command={HOMEBREW.install}
				surface='download'
				target='homebrew-install'
			/>

			<p className='border-line/70 border-t pt-3 text-[0.8125rem] leading-relaxed text-muted'>
				{/* Every claim in this paragraph is a line in the cask — `depends_on
				    arch: :arm64`, `depends_on macos: :ventura`, `depends_on formula:
				    "gh"`, `auto_updates true` — read from
				    `ensemblr-hq/homebrew-tap` rather than from `brew info`, which
				    reports whatever tap the reader has already fetched. */}
				<Link
					className='text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent'
					href={HOMEBREW.tapUrl}
				>
					The cask
				</Link>{' '}
				declares Apple silicon and macOS 13, so brew refuses where the app
				cannot open. It pulls in{' '}
				<code className='whitespace-nowrap font-mono text-[0.75rem]'>gh</code>{' '}
				too;{' '}
				<code className='whitespace-nowrap font-mono text-[0.75rem]'>
					gh auth login
				</code>{' '}
				stays yours to run.
			</p>

			<p className='text-[0.8125rem] leading-relaxed text-muted'>
				{/* Short enough to hold a line at any width the card has, and both read
				    as one token — `brew | upgrade` split across two lines is a command
				    the reader has to reassemble to be sure of. */}
				It is marked{' '}
				<code className='whitespace-nowrap font-mono text-[0.75rem]'>
					auto_updates
				</code>
				, so{' '}
				<code className='whitespace-nowrap font-mono text-[0.75rem]'>
					brew upgrade
				</code>{' '}
				leaves the bundle to Ensemblr&rsquo;s own updater. To hand it to
				Homebrew instead, turn{' '}
				<span className='text-ink'>{HOMEBREW.autoUpdateSetting}</span> off and
				upgrade explicitly:
			</p>

			{/*
			 * On its own line rather than inline at the end of that sentence, where it
			 * was long enough to wrap and a line may break after a hyphen: it came
			 * apart at `brew upgrade -- | cask --greedy ensemblr`, which reads as a
			 * flag the reader is missing. Starting a line of its own, what it wraps at
			 * on a narrow phone is a space instead.
			 */}
			<CopyCommand
				command={HOMEBREW.upgrade}
				surface='download'
				target='homebrew-upgrade'
			/>
		</div>
	);
}
