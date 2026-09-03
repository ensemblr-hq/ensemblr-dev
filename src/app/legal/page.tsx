import type { Metadata } from 'next';
import Link from 'next/link';

import { SectionHeading } from '@/components/brand/section-heading';
import { SiteFooter } from '@/components/chrome/site-footer';
import { SiteNav } from '@/components/chrome/site-nav';
import { Reveal } from '@/components/motion/reveal';
import { JsonLd } from '@/components/seo/json-ld';
import { ANALYTICS, LEGAL_PAGE, THIRD_PARTY, TRADEMARK } from '@/lib/legal';
import { REPO, SITE } from '@/lib/site';
import { buildLegalGraph } from '@/lib/structured-data';

/* One source for the three surfaces that have to say the same thing: this
 * metadata block, the `WebPage` node below it, and `sitemap.ts`. */
const { description: DESCRIPTION, title: TITLE } = LEGAL_PAGE;

/*
 * Metadata objects merge shallowly, so `openGraph` and `twitter` are restated in
 * full rather than patched — declaring one key of either would drop every key
 * the layout sets beside it.
 */
export const metadata: Metadata = {
	alternates: { canonical: LEGAL_PAGE.path },
	description: DESCRIPTION,
	openGraph: {
		description: DESCRIPTION,
		locale: SITE.ogLocale,
		siteName: SITE.name,
		title: `${TITLE} — ${SITE.name}`,
		type: 'website',
		url: LEGAL_PAGE.url,
	},
	title: TITLE,
	twitter: {
		card: 'summary_large_image',
		description: DESCRIPTION,
		title: `${TITLE} — ${SITE.name}`,
	},
};

/**
 * One block of the page: a heading and the paragraphs under it.
 *
 * `max-w-[80ch]` is the measure the footer used to set these at, kept because
 * the strings did not change — they are legal copy supplied as copy, and the
 * wrapping is this page's business while the words are not.
 */
function LegalBlock({
	children,
	index,
	title,
}: {
	children: React.ReactNode;
	index: number;
	title: string;
}) {
	return (
		<Reveal className='flex max-w-[80ch] flex-col gap-3' index={index}>
			<h2 className='eyebrow border-line/70 border-b pb-3 text-ink/70'>
				{title}
			</h2>
			{children}
		</Reveal>
	);
}

/**
 * The long-form notices, moved off the home page.
 *
 * All four paragraphs used to sit in the footer of a page that was already too
 * long, in the quietest type on it, addressed to a reader who has to go looking
 * for them anyway. The footer keeps the two sentences a *visitor* is owed — the
 * analytics notice and the trademark notice — and links here for the rest.
 *
 * Nothing was reworded on the way across. `TRADEMARK.terms` and
 * `THIRD_PARTY.attribution` are verbatim legal copy whose owners specify the
 * wording; `ANALYTICS.detail` paraphrases another company's document and is
 * held to it by the comments in `legal.ts`. This route is a container.
 */
export default function LegalPage() {
	return (
		<>
			{/* The layout emits the site-wide `Organization` and `WebSite` on every
			    route, so without this the page described the site and never itself. */}
			<JsonLd data={buildLegalGraph()} />
			<Link
				className='sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-60 focus-visible:rounded-lg focus-visible:bg-accent focus-visible:px-4 focus-visible:py-2 focus-visible:font-medium focus-visible:text-[0.9375rem] focus-visible:text-accent-foreground'
				href='#main'
			>
				Skip to content
			</Link>
			{/* No section anchors here: this route has none of the home page's
			    sections in it, and the bar's wordmark is the way back. */}
			<SiteNav variant='page' />

			<main id='main'>
				<section className='mx-auto w-full max-w-7xl px-5 pt-16 pb-16 sm:px-8 sm:pt-24 sm:pb-20'>
					{/* `h1`, not the component's default `h2`: this is the opening
					    heading of its own route, and the blocks below are its peers. */}
					<SectionHeading
						as='h1'
						eyebrow='Legal'
						lede='What this website measures, what the Ensemblr name does and does not grant you, and whose other marks appear here.'
						title='The small print, at a readable size.'
					/>

					<div className='mt-12 flex flex-col gap-12'>
						<LegalBlock index={0} title='Analytics'>
							<p className='text-pretty text-[0.9375rem] leading-relaxed text-muted'>
								{ANALYTICS.notice}
							</p>
							<p className='text-pretty text-[0.9375rem] leading-relaxed text-muted/85'>
								{ANALYTICS.detail}
							</p>
							{/* The link is the substance rather than a courtesy: that
							    paragraph paraphrases another company's document, and a
							    reader who cannot reach it has been asked to take the
							    paraphrase on trust — the one currency this page does not
							    have. */}
							<p className='text-[0.9375rem] leading-relaxed'>
								<Link
									className='text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent'
									href={ANALYTICS.sourceUrl}
								>
									{ANALYTICS.sourceLabel}
								</Link>
							</p>
						</LegalBlock>

						<LegalBlock index={1} title='Trademarks'>
							<p className='text-pretty text-[0.9375rem] leading-relaxed text-muted'>
								{TRADEMARK.notice}
							</p>
							<p className='text-pretty text-[0.9375rem] leading-relaxed text-muted/85'>
								{TRADEMARK.terms}
							</p>
							{/* The licence of the source, not of any build: the relicence to
							    Apache 2.0 does not reach back over releases that shipped
							    under MIT, which is why this links the repository and never a
							    tag. It is also the sentence the paragraph above answers — a
							    reader who has just been told they may fork this is the
							    reader who needs the name terms. */}
							<p className='text-[0.9375rem] leading-relaxed text-muted/85'>
								The source is{' '}
								<Link
									className='text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent'
									href={REPO.licenseUrl}
								>
									{REPO.license}
								</Link>
								. That covers the code and nothing else.
							</p>
						</LegalBlock>

						{/* Other people's marks, after ours. The two blocks answer
						    different questions — what you may not take from us, and what
						    we did not take from them — and a heading each is what the
						    footer never had room to give them. */}
						<LegalBlock index={2} title='Third-party marks'>
							<p className='text-pretty text-[0.9375rem] leading-relaxed text-muted/85'>
								{THIRD_PARTY.attribution}
							</p>
							<p className='text-pretty text-[0.9375rem] leading-relaxed text-muted/85'>
								{THIRD_PARTY.disclaimer}
							</p>
						</LegalBlock>
					</div>
				</section>
			</main>
			<SiteFooter />
		</>
	);
}
