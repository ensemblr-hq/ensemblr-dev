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
