import { CopyCommand } from '@/components/download/copy-command';
import { INSTALL_SCRIPT_PATH, LINUX_INSTALL } from '@/lib/install-scripts';

/**
 * The Linux counterpart of `HomebrewNote`, and the reason the AppImage button
 * above it is not the whole story.
 *
 * A downloaded AppImage is a file in `~/Downloads` with no launcher entry, no
 * icon and no update path — the app cannot give it any of those, because it
 * cannot write to a file the user placed themselves and may not own. The script
 * does: it puts the AppImage under `~/.local`, extracts the desktop entry and
 * the icon ladder the bundle already carries, and symlinks it onto `PATH`.
 *
 * It also verifies the download against the digest GitHub published before it
 * installs anything, which is what earns a `curl … | sh` line a place on a page
 * whose whole argument is that its claims are checkable. The button above it
 * prints the same digest for a reader who would rather do it by hand.
 *
 * No version anywhere near either command, the same rule the brew line follows:
 * the script resolves the newest release itself, by the same SemVer comparison
 * `selectStableRelease` applies, so a tag printed here would be a second thing
 * to bump every release and the first to go stale.
 */
export function LinuxInstallNote() {
	return (
		<div className='flex flex-col gap-3 rounded-lg border border-line/70 bg-surface/40 p-4'>
			<p className='font-mono text-[0.75rem] text-ink'>
				Or install it with the script:
			</p>
			<CopyCommand
				command={LINUX_INSTALL.install}
				surface='download'
				target='linux-install'
			/>

			<p className='border-line/70 border-t pt-3 text-[0.8125rem] leading-relaxed text-muted'>
				It verifies the SHA-256 first, puts the AppImage under{' '}
				<code className='whitespace-nowrap font-mono text-[0.75rem]'>
					~/.local
				</code>
				, and unpacks the launcher entry and icons the bundle already carries.{' '}
				<a
					className='text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent'
					href={INSTALL_SCRIPT_PATH}
				>
					Read it first
				</a>
				: nothing in it needs root or writes outside your home directory.
			</p>

			<p className='text-[0.8125rem] leading-relaxed text-muted'>
				Ensemblr does not update itself on Linux — an AppImage is a file you
				placed yourself, often somewhere it cannot be written back to. It
				reports a newer version instead; this is the other end of that:
			</p>

			<CopyCommand
				command={LINUX_INSTALL.update}
				surface='download'
				target='linux-update'
			/>
		</div>
	);
}
