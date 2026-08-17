import type { Metadata } from 'next';
import Link from 'next/link';

import { SectionHeading } from '@/components/brand/section-heading';
import { SectionRule } from '@/components/brand/section-rule';
import { SiteFooter } from '@/components/chrome/site-footer';
import { SiteNav } from '@/components/chrome/site-nav';
import { Reveal } from '@/components/motion/reveal';
import { JsonLd } from '@/components/seo/json-ld';
import { SCHEMA_DIALECT, SCHEMAS, SCHEMAS_PAGE } from '@/lib/schemas';
import { REPO, SITE } from '@/lib/site';
import { buildSchemasGraph } from '@/lib/structured-data';

/* One source for the three surfaces that have to say the same thing: this
 * metadata block, the `WebPage` node below it, and `sitemap.ts`. */
const { description: DESCRIPTION, title: TITLE } = SCHEMAS_PAGE;

/*
 * Metadata objects merge shallowly, so `openGraph` and `twitter` are restated in
 * full rather than patched — declaring one key of either would drop every key
 * the layout sets beside it. Images stay absent for the same reason they are
 * absent there: `opengraph-image.tsx` covers this route too, and naming one here
 * would take over from the generated card.
 */
export const metadata: Metadata = {
	alternates: { canonical: SCHEMAS_PAGE.path },
	description: DESCRIPTION,
	openGraph: {
		description: DESCRIPTION,
		locale: SITE.ogLocale,
		siteName: SITE.name,
		title: `${TITLE} — ${SITE.name}`,
		type: 'website',
		url: SCHEMAS_PAGE.url,
	},
	title: TITLE,
	twitter: {
		card: 'summary_large_image',
		description: DESCRIPTION,
		title: `${TITLE} — ${SITE.name}`,
	},
};

export default function SchemasPage() {
	return (
		<>
			{/* The layout emits the site-wide `Organization` and `WebSite` on every
			    route, so without this the page described the site and never itself. */}
			<JsonLd data={buildSchemasGraph()} />
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
				{/* `sm:pt-24`, the hero's opening beat rather than the `sm:py-20` every
				    *section* on the home page takes. This is the first thing under the
				    bar on its own route, not the third section of another page, and at
				    20 it opened 16px tighter than the only other route on the site —
				    the one difference a reader arriving from `/` reads as the page
				    having started somewhere above the fold. */}
				<section className='mx-auto w-full max-w-7xl px-5 pt-16 pb-16 sm:px-8 sm:pt-24 sm:pb-20'>
					{/*
					 * `h1`, not the component's default `h2`. This is the opening heading
					 * of its own route, and left at the default the document had no `h1`
					 * at all — a screen reader's heading list read this, both card titles
					 * and the provenance note below as four peers of equal rank.
					 */}
					<SectionHeading
						as='h1'
						eyebrow='Schemas'
						lede={
							<>
								Ensemblr reads two configuration files, and each has a published
								JSON Schema so an editor can complete, validate and document it
								without Ensemblr running. Both are{' '}
								<Link
									className='underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-current'
									href={SCHEMA_DIALECT}
								>
									JSON Schema draft 2020-12
								</Link>
								.
							</>
						}
						title={
							<>
								Schemas your editor can{' '}
								<span className='text-accent'>read</span>.
							</>
						}
					/>

					{/*
					 * Two cards, not a table. Each one carries a paragraph, a URL meant to
					 * be copied and a code block — a row that has to hold all three is a
					 * row whose cells wrap to different heights at every breakpoint.
					 *
					 * Which is what `subgrid` buys back at `lg`, where the two do sit side
					 * by side: the cards are the same height because the grid stretches
					 * them, but nothing inside them lined up. The summaries run to three
					 * lines and four, so the `Canonical URL` rule sat 22px lower in the
					 * second card than the first, the wiring rule 22px lower again, and
					 * the JSON snippet is four lines against the TOML's one — leaving the
					 * second card 94px of dead air above a guide link that `mt-auto` had
					 * pinned to the floor. Five hairlines, none of them continuous: a
					 * comparison whose two halves disagree about where the seams are.
					 *
					 * Each card takes the parent's five rows instead of sizing its own,
					 * so every rule is one line across both, and the slack from the short
					 * snippet lands inside its row rather than pooling at the bottom of
					 * the card. Below `lg` there is nothing to align against — one column,
					 * each card its own height — so the flex stack stands as written and
					 * as the fallback anywhere `subgrid` is missing.
					 */}
					<Reveal className='mt-12 grid gap-5 lg:grid-cols-2 lg:grid-rows-[auto_auto_auto_auto_auto]'>
						{SCHEMAS.map((schema) => (
							<article
								className='flex min-w-0 flex-col gap-5 rounded-xl border border-line bg-surface/30 p-6 sm:p-8 lg:row-span-5 lg:grid lg:grid-rows-subgrid'
								key={schema.file}
							>
								<div className='flex flex-col gap-2'>
									<p className='font-mono text-[0.6875rem] text-faint'>
										{schema.describes}
									</p>
									<h2 className='text-balance font-medium text-[1.0625rem] text-ink leading-snug'>
										{schema.title}
									</h2>
								</div>

								<p className='text-pretty text-[0.875rem] text-muted leading-relaxed'>
									{schema.summary}
								</p>

								{/*
								 * Plain `<a>`: the target is a file under `public/`, not a
								 * route, so a client-side navigation to it is a router miss.
								 *
								 * `break-all` for the same reason the download block breaks a
								 * digest that way — this string exists to be copied, and a URL
								 * shown with its middle missing is one nobody can copy.
								 */}
								<div className='flex flex-col gap-1.5 border-line/70 border-t pt-4'>
									<p className='font-mono text-[0.6875rem] text-faint'>
										Canonical URL
									</p>
									<a
										className='break-all font-mono text-[0.6875rem] text-muted leading-relaxed underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-current'
										href={schema.path}
									>
										{schema.id}
									</a>
								</div>

								{/*
								 * `min-w-0` here and on the `article`, and neither is
								 * decoration. A flex item and a grid item both default to
								 * `min-width: auto` — the width of their content — so the
								 * un-wrappable line in the snippet set this block's floor, the
								 * block set the card's, the card set the grid's, and at 320px
								 * the whole document gained a horizontal scrollbar.
								 * `overflow-x-auto` on the `pre` cannot help while everything
								 * above it is still sizing itself to the same long line.
								 */}
								<div className='flex min-w-0 flex-col gap-2 border-line/70 border-t pt-4'>
									<p className='text-pretty text-[0.8125rem] text-muted leading-relaxed'>
										{schema.wiringLabel}
									</p>
									{/* `tab-size: 2`. The snippet is indented with tabs, as the
									    repository is, and a `pre` defaults to eight-column tabs —
									    which set a four-line JSON object at the width of a
									    paragraph and pushed the block into a scrollbar. */}
									<pre className='overflow-x-auto rounded-lg border border-line/70 bg-canvas p-3 [tab-size:2]'>
										<code
											className={`language-${schema.wiringLanguage} font-mono text-[0.6875rem] text-muted leading-relaxed`}
										>
											{schema.wiring}
										</code>
									</pre>
								</div>

								<p className='mt-auto pt-1 font-mono text-[0.6875rem] text-faint'>
									<Link
										className='underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-current'
										href={schema.guideUrl}
									>
										Guide: {schema.guideLabel}
									</Link>
								</p>
							</article>
						))}
					</Reveal>
				</section>

				<SectionRule />

				{/*
				 * Where they come from, stated rather than implied. The site publishes
				 * these on the app's behalf — it does not author them — and a reader
				 * validating their config against this domain deserves to know which
				 * repository the document actually came out of, and that TOML gets a
				 * JSON Schema by way of Taplo rather than by some private extension.
				 */}
				<section className='mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20'>
					{/*
					 * A section heading, at the size the system has for one. This ran as a
					 * bare `h2.eyebrow` — 11px of uppercase mono, the tier the page spends
					 * on `Canonical URL` and a file path — so the page's second section
					 * was introduced by its smallest type, with none of the accent dot and
					 * display heading every section on the home page opens with, and no
					 * entrance where everything around it lifts in.
					 *
					 * `step` rather than `title`: it is the provenance note under the
					 * argument, not a second argument, and the scale has a tier for
					 * exactly that. The eyebrow is the label the old heading text vacated
					 * on its way up to the title, where it belongs — this is the section
					 * carrying the page's checkable-claims promise, and PRODUCT.md puts
					 * that first among its principles.
					 */}
					<SectionHeading
						eyebrow='Provenance'
						size='step'
						title='Where these come from.'
					/>
					{/*
					 * 15px, one step up from the 14 it had. That size is the card body on
					 * this page — set under a 32px heading and against nothing but page,
					 * it read as a caption that had lost its figure.
					 */}
					<Reveal
						className='mt-8 flex max-w-[68ch] flex-col gap-4 text-pretty text-[0.9375rem] text-muted leading-relaxed'
						index={2}
					>
						<p>
							Both files are written in the app repository, at{' '}
							<code className='font-mono text-[0.8125rem] text-ink'>
								schemas/
							</code>
							, and copied here verbatim — this site serves them because each
							one names this domain in its own{' '}
							<code className='font-mono text-[0.8125rem] text-ink'>$id</code>.
							A check in CI compares the copies against{' '}
							<Link
								className='underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-current'
								href={`${REPO.url}/tree/master/schemas`}
							>
								the originals
							</Link>{' '}
							and fails when they differ.
						</p>
						<p>
							TOML has no schema language of its own.{' '}
							<Link
								className='underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-current'
								href='https://taplo.tamasfe.dev/'
							>
								Taplo
							</Link>{' '}
							— the engine behind the Even Better TOML extension — validates
							TOML against JSON Schema, which is why{' '}
							<code className='font-mono text-[0.8125rem] text-ink'>
								settings.toml
							</code>{' '}
							gets one too.
						</p>
					</Reveal>
				</section>
			</main>

			<SiteFooter />
		</>
	);
}
