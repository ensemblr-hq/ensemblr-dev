import Link from 'next/link';
import { SectionRule } from '@/components/brand/section-rule';
import { SiteFooter } from '@/components/chrome/site-footer';
import { SiteNav } from '@/components/chrome/site-nav';
import { Download } from '@/components/sections/download';
import { Hero } from '@/components/sections/hero';
import { Orchestration } from '@/components/sections/orchestration';
import { Showcase } from '@/components/sections/showcase';
import { Trust } from '@/components/sections/trust';
import { JsonLd } from '@/components/seo/json-ld';
import { getSiteReleases } from '@/lib/github-release';
import { buildHomeGraph } from '@/lib/structured-data';

export default async function Home() {
	/*
	 * The same lookup the hero, the download block and the footer each make. It
	 * is `'use cache'`d, so this is a fourth read of one cached value rather than
	 * a fourth request — and the structured data has to describe the build the
	 * button actually serves, not a version literal that can drift from it.
	 */
	const { stable: release } = await getSiteReleases();

	return (
		<>
			<JsonLd data={buildHomeGraph(release)} />
			{/* Seven tab stops sit between the top of the document and the first
			    heading, and the first of them is the nav's own back-to-top link. */}
			<Link
				className='sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-60 focus-visible:rounded-lg focus-visible:bg-accent focus-visible:px-4 focus-visible:py-2 focus-visible:font-medium focus-visible:text-[0.9375rem] focus-visible:text-accent-foreground'
				href='#main'
			>
				Skip to content
			</Link>
			<SiteNav />
			{/*
			 * Control is the second thing on the page, not the fifth.
			 *
			 * Counting the showcase's four steps, the orchestration section used to
			 * be the fifth thing a reader scrolled — behind four claims that a
			 * neighbouring product could make word for word. Isolated worktrees are
			 * table stakes in this category now; an agent that drives the app it
			 * runs inside is the one claim nobody else is making, so it goes
			 * directly under the headline that promises it. The showcase then
			 * *supports* that claim rather than competing with it: this is the
			 * surface those sub-agents are driving.
			 *
			 * Trust sits immediately before Download and now follows the showcase
			 * directly. The seventeen-item feature grid that used to sit between
			 * them is gone: the argument was made and then left to cool for a couple
			 * of thousand pixels, and nobody scrolled the long tail. `FEATURE_GROUPS`
			 * stays in `features.ts` and still reaches `featureList()`, so the
			 * machine-readable long tail survives while the page loses the scroll.
			 *
			 * The Concierge is no longer a section. It is the showcase's last step,
			 * which is where its argument was always heading: a reader who has just
			 * been walked through one workspace in three screens is exactly the
			 * reader wondering how you keep track of eight. As a section of its own
			 * it made that case in prose beside a bespoke card; as a step it makes it
			 * over the replica the reader has been watching, with the panel drawn on
			 * top and the app dimmed behind it. The `#concierge` anchor moved with
			 * it, so `NAV_SECTIONS` is unchanged.
			 */}
			<main id='main'>
				<Hero />
				<Orchestration />
				<SectionRule />
				<Showcase />
				<SectionRule />
				<Trust />
				<Download />
			</main>
			<SiteFooter />
		</>
	);
}
