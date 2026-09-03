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
 */
export function HomebrewNote() {
	return (
		<div className='flex flex-col gap-3 rounded-lg border border-line/70 bg-surface/40 p-4'>
			<p className='font-mono text-[0.75rem] text-ink'>
				Or install it with Homebrew:
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
			<CopyCommand command={HOMEBREW.install} />

			<p className='border-line/70 border-t pt-3 text-[0.8125rem] leading-relaxed text-muted'>
				<Link
					className='text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent'
					href={HOMEBREW.tapUrl}
				>
					The cask
				</Link>{' '}
				declares Apple silicon and macOS 13, so brew refuses on a machine that
				cannot open the app rather than installing it anyway. It also declares{' '}
				{/* The cask's `depends_on formula: "gh"`. It is the one requirement
				    brew resolves for the reader rather than refusing on, so it is stated
				    as what the install still leaves them to do rather than as a third bar
				    to clear beside the two above it. `REQUIREMENTS` carries the same fact
				    for the reader who took the .dmg; this half of the page has to say it
				    too, because a `brew install` that succeeds is exactly when nobody
				    goes back to read a requirements list. */}
				<code className='whitespace-nowrap font-mono text-[0.75rem]'>gh</code>,
				so Homebrew installs the GitHub CLI with it —{' '}
				<code className='whitespace-nowrap font-mono text-[0.75rem]'>
					gh auth login
				</code>{' '}
				stays yours to run. It is marked{' '}
				{/* Short enough to hold a line at any width the card has, and both read
				    as one token — `brew | upgrade` split across two lines is a command
				    the reader has to reassemble to be sure of. */}
				<code className='whitespace-nowrap font-mono text-[0.75rem]'>
					auto_updates
				</code>{' '}
				because Ensemblr updates itself, so a plain{' '}
				<code className='whitespace-nowrap font-mono text-[0.75rem]'>
					brew upgrade
				</code>{' '}
				leaves the bundle alone — two updaters writing one app is how an install
				gets corrupted. To hand the job to Homebrew instead, turn{' '}
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
			<CopyCommand command={HOMEBREW.upgrade} />
		</div>
	);
}
