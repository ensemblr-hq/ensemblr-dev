import { PixelRule } from '@/components/brand/pixel-rule';
import { EnsemblrWordmark } from '@/components/brand/wordmark';
import { GitHubIcon } from '@/components/icons/site';
import { getLatestRelease } from '@/lib/github-release';
import { releaseYear } from '@/lib/release';
import { REPO, SITE } from '@/lib/site';

export async function SiteFooter() {
	const release = await getLatestRelease();

	return (
		<footer className='mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8'>
			<PixelRule className='mb-10' />
			<div className='flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between'>
				<div className='flex flex-col gap-4'>
					{/* Static for the same reason as the nav: 16px is under the size
					    where a dot-matrix flicker still reads as one word. */}
					<EnsemblrWordmark className='h-4 sm:h-4' static />
					<p className='max-w-xs text-pretty text-[0.8125rem] leading-relaxed text-faint'>
						{SITE.tagline}
					</p>
				</div>

				<div className='flex flex-col gap-3 font-mono text-[0.6875rem] text-faint sm:items-end'>
					<div className='flex items-center gap-4'>
						<a
							className='flex items-center gap-1.5 transition-colors hover:text-ink'
							href={REPO.url}
						>
							<GitHubIcon className='size-3.5' />
							Source
						</a>
						<a
							className='transition-colors hover:text-ink'
							href={REPO.issuesUrl}
						>
							Issues
						</a>
						<a
							className='transition-colors hover:text-ink'
							href={REPO.changelogUrl}
						>
							Changelog
						</a>
						<a
							className='transition-colors hover:text-ink'
							href={REPO.licenseUrl}
						>
							{REPO.license}
						</a>
					</div>
					{/* Year comes from the cached release rather than the clock: reading
					    the current time here would make the whole footer dynamic. */}
					<p>
						{release.tag} · © {releaseYear(release.publishedAt)} Ensemblr
					</p>
				</div>
			</div>
		</footer>
	);
}
