/** Canonical, single-source facts about the product this site markets. */

export const SITE = {
	name: 'Ensemblr',
	url: 'https://www.ensemblr.dev',
	tagline: 'A macOS workbench for isolated, multi-agent coding workflows.',
	description:
		'Ensemblr gives every stream of work its own isolated copy of your repo — its own branch, working tree, agent sessions and review path. Drive it with Pi or Claude Code, review the diff in place, open the PR. Native macOS, open source, MIT.',
	/*
	 * One locale, three spellings of it. `<html lang>` and schema.org want the
	 * BCP 47 tag, Open Graph wants the underscored form, and the page's own copy
	 * is British — "notarised", and dates formatted through `en-GB`. These were
	 * previously set independently and the document element disagreed with the
	 * og:locale beside it.
	 */
	locale: 'en-GB',
	ogLocale: 'en_GB',
} as const;

/**
 * Who holds the copyright on the work this site markets, named in the footer.
 * A person rather than the product: `SITE.name` is the app, and the two are not
 * interchangeable in a copyright line.
 */
export const AUTHOR = {
	name: 'Philipp Soldunov',
	url: 'https://github.com/psoldunov',
} as const;

export const REPO = {
	owner: 'ensemblr-hq',
	name: 'ensemblr',
	url: 'https://github.com/ensemblr-hq/ensemblr',
	releasesUrl: 'https://github.com/ensemblr-hq/ensemblr/releases',
	issuesUrl: 'https://github.com/ensemblr-hq/ensemblr/issues',
	changelogUrl:
		'https://github.com/ensemblr-hq/ensemblr/blob/master/CHANGELOG.md',
	licenseUrl: 'https://github.com/ensemblr-hq/ensemblr/blob/master/LICENSE',
	license: 'MIT',
} as const;

/**
 * In-page anchors, shared by the nav and the sections themselves.
 *
 * Download is deliberately absent. The bar already carries a download *button*,
 * and an anchor beside it reading the same word did something entirely
 * different — one scrolled, one started a 149 MB transfer. Dropping it also
 * takes the bar from seven simultaneous targets down to six.
 */
export const NAV_SECTIONS = [
	{ id: 'workspaces', label: 'Workspaces' },
	{ id: 'runtimes', label: 'Runtimes' },
	// Review is a showcase step and Control is the section after it, so this is
	// the order the reader meets them in. Listing Control third described a page
	// that does not exist.
	{ id: 'review', label: 'Review' },
	{ id: 'control', label: 'Control' },
	{ id: 'trust', label: 'Credentials' },
] as const;

/**
 * How the build is distributed, stated where the visitor is asked to run it.
 *
 * This audience is about to hand an app their `gh` session and their repos. The
 * page cannot answer that with an adjective, so it answers with the mechanism:
 * who signed it, whether Apple has seen it, and the digest they can check
 * themselves before it ever opens.
 */
export const DISTRIBUTION = {
	signed: true,
	notarised: true,
	summary: 'Signed with an Apple Developer ID and notarised by Apple.',
	detail:
		'macOS verifies the signature and the notarisation ticket on first launch. No Gatekeeper override, no right-click → Open, no quarantine flag to strip.',
} as const;

/**
 * What you need installed before Ensemblr is useful. Stated on the page rather
 * than buried, because several of these are hard gates: the app refuses to run
 * agent sessions without a runtime CLI present.
 */
export const REQUIREMENTS = [
	{
		name: 'macOS on Apple silicon',
		detail: 'Builds are arm64-only.',
		required: true,
	},
	{
		name: 'An agent runtime CLI',
		detail:
			'Pi, Claude Code, or both. Ensemblr drives your own binaries and ships none.',
		required: true,
	},
	{
		name: 'git',
		detail: 'Used natively for worktrees, branches, commits and diffs.',
		required: true,
	},
	{
		name: 'GitHub CLI (gh), authenticated',
		detail:
			'Authenticate once with gh auth login. PR and check data is read through it; no GitHub tokens are stored.',
		required: true,
	},
	{
		name: 'A Linear account',
		detail: 'OAuth only, with the token held in the macOS Keychain.',
		required: false,
	},
] as const;
