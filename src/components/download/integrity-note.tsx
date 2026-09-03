import { FingerprintIcon, ShieldCheckIcon } from '@/components/icons/site';
import type { Platform } from '@/lib/platform';
import type { Release } from '@/lib/release';
import { DISTRIBUTION } from '@/lib/site';

/**
 * What happens to the file after the click.
 *
 * The page's one conversion event hands a developer an app that will read their
 * `gh` session and their repositories, and the visitor's second question — the
 * one PRODUCT.md names — is whether they can trust it with their machine.
 * Answering that two thousand pixels further up the page and not at the button
 * is the same as not answering it.
 *
 * Both halves are mechanism rather than adjective, which is the site's voice:
 * who signed it and whether anyone else has checked it, then the digest they
 * can check before it opens.
 *
 * **The two platforms get different marks, and that is the point.** macOS is
 * signed and notarised, and a tick inside a shield says so. The AppImage is
 * unsigned — nothing on Linux issues the equivalent — so it takes a fingerprint
 * instead, at `warning` rather than `ok`. A green shield over the word
 * "unsigned" would be the page contradicting itself in the one place it can
 * least afford to.
 *
 * The release arrives as a prop for one reason: this digest has to describe the
 * file the button links to. Fetching it here made that a property of the cache
 * rather than of the code, and a `shasum` printed beside a binary it does not
 * match is the single worst thing this page could say.
 */
export function IntegrityNote({
	platform,
	release,
}: {
	platform: Platform;
	release: Release;
}) {
	const download = platform === 'macos' ? release.dmg : release.appImage;
	const distribution = DISTRIBUTION[platform];
	const signed = platform === 'macos';
	const sha256 = download?.sha256 ?? null;

	return (
		<div className='flex flex-col gap-3 rounded-lg border border-line/70 bg-surface/40 p-4'>
			<p className='flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-muted'>
				{signed ? (
					<ShieldCheckIcon className='mt-0.5 size-4 shrink-0 text-ok' />
				) : (
					<FingerprintIcon className='mt-0.5 size-4 shrink-0 text-warning' />
				)}
				<span>
					<span className='font-medium text-ink'>{distribution.summary}</span>{' '}
					{distribution.detail}
				</span>
			</p>

			{sha256 ? (
				<div className='flex flex-col gap-1.5 border-line/70 border-t pt-3'>
					<p className='font-mono text-[0.75rem] text-ink'>
						Check it before you open it:
					</p>
					{/*
					 * `break-all`, not `truncate`. A digest shown with its middle
					 * missing is a digest nobody can compare — the one string on the
					 * page where wrapping ugly beats fitting neatly.
					 */}
					<code className='break-all font-mono text-[0.75rem] leading-relaxed text-ink'>
						{/* `shasum` on macOS, `sha256sum` on Linux: coreutils ships the
						    second and not the first, and a command that is not there is
						    worse than no command at all. */}
						{signed ? 'shasum -a 256' : 'sha256sum'} ~/Downloads/
						{download?.url.split('/').pop()}
						<br />
						<span className='text-ink'>{sha256}</span>
					</code>
				</div>
			) : null}
		</div>
	);
}
