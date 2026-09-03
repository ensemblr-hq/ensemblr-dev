import { SITE } from './site';

/**
 * The route the long-form notices moved to, and the three surfaces that have to
 * agree on it: the page's own metadata, its `WebPage` node, and `sitemap.ts`.
 *
 * They used to sit in the footer, all four paragraphs of them, on a page whose
 * whole problem was length. What stayed behind is the part addressed to the
 * person actually reading — that they are being counted, and that the name is
 * a mark — with a link to the rest. A forker who follows the licence link finds
 * the terms one click on rather than four paragraphs down.
 */
export const LEGAL_PAGE = {
	description:
		'Analytics, trademark terms and third-party attributions for the Ensemblr website.',
	path: '/legal',
	title: 'Legal',
	url: `${SITE.url}/legal`,
} as const;

/**
 * What this website measures about the person reading it.
 *
 * `<Analytics />` sits in the root layout, so every visitor is counted whether
 * or not the page says so. Three separate surfaces here — the hero, the
 * Credentials section and `TRUST_ITEMS` — sell the app on "no telemetry", and a
 * page that makes that argument while quietly measuring its own readers has
 * spent the only thing it was selling. So this is stated, in the footer, next to
 * the other notices.
 *
 * Every clause was read from Vercel's own privacy and compliance page at
 * `sourceUrl` in the session it was written, not recalled:
 *
 * - "without using any third-party cookies, instead end users are identified by
 *   a hash created from the incoming request" — hence "no third-party cookies"
 *   and not the broader "no cookies", which that sentence does not support.
 * - "The lifespan of a visitor session is not stored permanently, it is
 *   automatically discarded after 24 hours."
 * - "The recording of data points ... is anonymous, so you have insight into
 *   your data without it being tied to or associated with any individual,
 *   customer, or IP address."
 * - The list in `detail` is that page's own Data Point Information table,
 *   which is the complete set: timestamp, URL, dynamic path, referrer, filtered
 *   query params, geolocation to city, device OS and version, browser and
 *   version, device type, and the script's own version.
 *
 * No `beforeSend` redaction is configured, and none is needed today: Vercel's
 * warning is about paths and query strings that carry a user id or a token, and
 * this site is one route with no authenticated surface to put one in. A second
 * route that took a parameter would change that, and the redaction hook is at
 * vercel.com/docs/analytics/redacting-sensitive-data.
 *
 * `legal.test.ts` holds the copy to what the app actually does: the notice says
 * page views, so importing `track` from `@vercel/analytics` — custom events,
 * with a payload this paragraph does not describe — fails the suite.
 */
export const ANALYTICS = {
	notice:
		'This site counts page views with Vercel Web Analytics. It sets no third-party cookies, and no data point it records is tied to your IP address.',
	detail:
		'Each view stores a timestamp, the path, the referrer, a country, region and city derived from the connection, and the browser, OS and device type. Visitors are counted by a hash Vercel derives from the request and discards after 24 hours, so there is no identifier that follows you to another site and nothing to build a profile from. This is the website, not the app: Ensemblr sends no telemetry of its own, and none of this measurement follows the download.',
	sourceLabel: 'What Vercel stores, in Vercel’s words',
	sourceUrl: 'https://vercel.com/docs/analytics/privacy-policy',
} as const;

/**
 * The brand-usage terms, stated where a reader who has just been handed the
 * source can see them.
 *
 * Apache 2.0 section 6 grants no trademark rights, and a page whose whole
 * argument is "here is the repository, go and check" is a page that actively
 * invites forks. The licence and the name are two different grants; this is
 * where the site says so out loud rather than leaving a forker to infer it from
 * a licence clause they did not read.
 *
 * Verbatim, and not to be reworded in passing. `notice` and `terms` are the two
 * paragraphs of a legal notice supplied as copy — the wrapping is the footer's
 * business, the words are not. The straight quotes around "Ensemblr" in `terms`
 * are deliberate against the typographic quotes the rest of the site's prose
 * uses: this string is quoted elsewhere as-is.
 *
 * The trademark is Philipp Soldunov's personally, the same person `AUTHOR` in
 * `site.ts` names on the copyright line — the product name and the owner are
 * not interchangeable here either.
 *
 * Application pending, so ™ and never ®. Nothing on this site may say
 * "registered", name a registration number, or otherwise imply the EUTM
 * application has completed.
 */
export const TRADEMARK = {
	notice:
		'Ensemblr™ is a trademark of Philipp Soldunov (EUTM application pending).',
	terms:
		'The Apache 2.0 license covers this source code. It does not grant any right to use the Ensemblr name, logo, or branding. You may state that your project is derived from or compatible with Ensemblr. You may not name your fork or distribution "Ensemblr", nor use the name or logo in a way that suggests endorsement by or affiliation with the project.',
} as const;

/**
 * The other direction: marks this site uses that belong to someone else.
 *
 * `TRADEMARK` above tells a forker what they may not take from us. This tells a
 * reader what we have taken from five other owners — the Invertocat in the nav,
 * footer, hero and download section, the Claude and Pi marks in the hero, and
 * Apple's and Linus Torvalds's word marks throughout the copy. Naming our own
 * mark and staying silent on theirs is the asymmetry a page about checkable
 * claims cannot afford.
 *
 * Apple is the one owner here whose *logo* this site does not draw, and that is
 * the finding rather than an oversight: a traced Apple glyph sat on the download
 * button until Apple's guidelines were read against it. See the note where it
 * used to live in `src/components/icons/site.tsx`. Apple stays in the list below
 * because "macOS" and "Apple silicon" are still all over the copy, and word
 * marks are exactly the referential use Apple does permit.
 *
 * The use is nominative: each mark names the thing it depicts, and the only
 * reason any of them is on the page is to say what Ensemblr drives and what it
 * runs on. Nominative use is a defence, not a licence, and it turns on the
 * reader not inferring sponsorship — which is what `disclaimer` is for and why
 * it names all four owners rather than gesturing at "respective owners".
 *
 * Every clause below was read from the owner's own page in the session it was
 * written, not recalled:
 *
 * - GitHub's sentence is verbatim from the Legal block of https://github.com/logos,
 *   trimmed to the two marks this site actually shows. The OCTOCAT marks are in
 *   GitHub's line and not here because no Octocat appears on this site.
 * - "Anthropic, PBC" is the entity named in Anthropic's Commercial Terms of
 *   Service; the consumer terms name Anthropic Ireland, Limited for the EEA, UK
 *   and Switzerland. PBC is the owner of the marks. No ® on the Claude marks:
 *   registration was not checked, and this file does not claim a status it has
 *   not read — the same rule that keeps ™ and not ® on Ensemblr above.
 * - The Apple sentence is the attribution notice Apple's own trademark list
 *   supplies as the example form. Apple asks that publications distributed
 *   outside the United States carry that notice *instead of* ™/® symbols, which
 *   is why the Apple marks are bare here while GitHub's carry ®: a website is
 *   read everywhere, and each owner's own instruction wins for its own marks.
 * - Pi carries no trademark claim to state. It is MIT-licensed at
 *   github.com/earendil-works/pi, © 2025 Mario Zechner, and the attribution is
 *   to the person because there is no company to name.
 * - Linux joined the list the day this site announced a Linux download. The
 *   sentence and the ® are both what the Linux Foundation's own mark page asks
 *   for, verbatim: "For each web page ... the first prominent appearance of
 *   LINUX should feature the 'circle R' character adjacent to the X", and this
 *   exact legend "at the end of your web page". So the ® sits once, on
 *   `REQUIREMENTS[0].short` — the hero's gate line, which is where a reader
 *   meets the word first — and nowhere else on the page. Torvalds owns the
 *   mark; the Foundation is the exclusive licensee, and this site is not a
 *   sublicensee, so the sublicensee legend is deliberately not the one used.
 */
export const THIRD_PARTY = {
	attribution:
		'GITHUB® and the INVERTOCAT logo design are trademarks of GitHub, Inc., registered in the United States and other countries. Claude and Claude Code are trademarks of Anthropic, PBC. Apple, Mac and macOS are trademarks of Apple Inc., registered in the U.S. and other countries and regions. Linux® is the registered trademark of Linus Torvalds in the U.S. and other countries. Pi is a project by Mario Zechner.',
	disclaimer:
		'Ensemblr is not affiliated with, endorsed by, or sponsored by GitHub, Anthropic, Apple, Linus Torvalds, or the Pi project. Their names and marks appear on this site only to identify the runtimes Ensemblr drives and the platforms it runs on.',
} as const;
