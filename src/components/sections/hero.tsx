import { AppWindow } from '@/components/app-mock/window';
import { PixelField } from '@/components/brand/pixel-field';
import { EnsemblrWordmark } from '@/components/brand/wordmark';
import { DownloadButton } from '@/components/download/download-button';
import { ReleaseLine } from '@/components/download/release-line';
import { GitHubIcon } from '@/components/icons/site';
import { Reveal } from '@/components/motion/reveal';
import { getLatestRelease } from '@/lib/github-release';
import { REPO } from '@/lib/site';

import { HeroWindow } from './hero-window';

/*
 * One await for the whole hero. The button and the line beneath it describe the
 * same build, so they read it from one object rather than each reaching for the
 * lookup independently.
 */
export async function Hero() {
	const release = await getLatestRelease();

	return (
		<section className='relative overflow-hidden' id='top'>
			<PixelField className='h-[36rem]' />
			<div
				aria-hidden='true'
				className='bloom pointer-events-none absolute inset-x-0 top-0 h-[42rem]'
			/>

			<div className='relative mx-auto w-full max-w-7xl px-5 pt-16 pb-16 sm:px-8 sm:pt-24 lg:pb-24'>
				<div className='flex flex-col items-center gap-6 text-center'>
					<Reveal className='flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1'>
						<span className='size-1.5 rounded-full bg-warning' />
						<span className='font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted'>
							Public beta
						</span>
					</Reveal>

					{/* Small on purpose. The wordmark is the signature under the headline,
					    not a second headline — set any larger it competes with the h1
					    directly beneath it and the eye has two things to read first. */}
					<Reveal index={1}>
						<EnsemblrWordmark className='h-5 sm:h-6' />
					</Reveal>

					<Reveal className='mt-1' index={2}>
						<h1 className='max-w-4xl text-balance text-[2rem] sm:text-5xl lg:text-display'>
							A macOS workbench for isolated,{' '}
							<span className='whitespace-nowrap text-accent'>multi-agent</span>{' '}
							coding workflows.
						</h1>
					</Reveal>

					<Reveal index={3}>
						<p className='max-w-[54ch] text-pretty text-base leading-relaxed text-muted sm:text-lg'>
							Every stream of work gets its own copy of the repo — its own
							branch, working tree, agent sessions and review path. Drive it
							with the Pi or Claude Code CLI you already have installed, review
							the diff where you made it, open the PR.
						</p>
					</Reveal>

					<Reveal
						className='mt-2 flex flex-col items-center gap-4 sm:flex-row'
						index={4}
					>
						<DownloadButton release={release} />
						<a
							className='inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-5 py-3 text-[0.9375rem] text-ink transition-colors hover:border-muted/50 hover:bg-surface'
							href={REPO.url}
						>
							<GitHubIcon className='size-4' />
							View source
						</a>
					</Reveal>

					<Reveal index={5}>
						<ReleaseLine className='justify-center' release={release} />
					</Reveal>
				</div>

				{/*
				 * Below `lg` only. From `lg` up the showcase's sticky replica is the
				 * page's single window, and it arrives on the very next scroll — two
				 * copies of the same screenshot a few hundred pixels apart reads as a
				 * mistake, however good each one is. Narrow viewports drop that sticky
				 * column, so this is where they get their look at the product.
				 */}
				<div className='mt-14 sm:mt-20 lg:hidden'>
					<HeroWindow>
						<AppWindow variant='narrow' />
					</HeroWindow>
				</div>
			</div>
		</section>
	);
}
