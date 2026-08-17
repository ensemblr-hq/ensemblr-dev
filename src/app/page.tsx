import Link from 'next/link';
import { SectionRule } from '@/components/brand/section-rule';
import { SiteFooter } from '@/components/chrome/site-footer';
import { SiteNav } from '@/components/chrome/site-nav';
import { Download } from '@/components/sections/download';
import { FeatureGrid } from '@/components/sections/feature-grid';
import { Hero } from '@/components/sections/hero';
import { Orchestration } from '@/components/sections/orchestration';
import { Showcase } from '@/components/sections/showcase';
import { Trust } from '@/components/sections/trust';
import { JsonLd } from '@/components/seo/json-ld';
import { getLatestRelease } from '@/lib/github-release';
import { buildHomeGraph } from '@/lib/structured-data';

export default async function Home() {
	/*
	 * The same lookup the hero, the download block and the footer each make. It
	 * is `'use cache'`d, so this is a fourth read of one cached value rather than
	 * a fourth request — and the structured data has to describe the build the
	 * button actually serves, not a version literal that can drift from it.
	 */
	const release = await getLatestRelease();

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
			 * Trust still sits immediately before Download, not two sections up. It
			 * answers the visitor's second question — can I trust this with my
			 * credentials and my machine — and it used to be separated from the
			 * button by the entire seventeen-item feature grid, so the argument was
			 * made and then left to cool for a couple of thousand pixels. The long
			 * tail is the right thing to defer; the reason to click is not.
			 */}
			<main id='main'>
				<Hero />
				<Orchestration />
				<SectionRule />
				<Showcase />
				<SectionRule />
				<FeatureGrid />
				<SectionRule />
				<Trust />
				<Download />
			</main>
			<SiteFooter />
		</>
	);
}
