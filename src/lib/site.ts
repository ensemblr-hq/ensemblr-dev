/** Canonical, single-source facts about the product this site markets. */

/*
 * "Orchestrator", not "workbench", and the two runtimes named in the first
 * clause.
 *
 * Isolated worktrees are table stakes — every neighbouring product ships them,
 * so leading on isolation put the page's first sentence on the one claim it
 * shares with its competitors. What none of them offer is an agent that drives
 * the app itself, and the runtime pair is what makes the page findable at all:
 * "Claude Code" is where the search volume is, "Pi" is where Ensemblr is the
 * only answer.
 *
 * The app's README leads the same way as of `4c17975`: "A macOS orchestrator
 * for multi-agent coding work, driving the Pi CLI or the Claude Code CLI —
 * whichever you already run." This is that sentence cut to a length a `<title>`
 * survives. Google renders about sixty characters and `Ensemblr — ` spends
 * eleven, so both runtimes are kept — "Ensemblr — A macOS orchestrator for Pi
 * and Claude Code." lands at 55 and neither name is truncated away — and
 * "multi-agent coding work" is carried by the descriptions and the keywords
 * instead.
 */
export const SITE = {
	name: 'Ensemblr',
	url: 'https://www.ensemblr.dev',
	tagline: 'A macOS orchestrator for Pi and Claude Code.',
	/*
	 * Two descriptions, because the two consumers have different budgets.
	 *
	 * `searchDescription` is what Google renders under the title, and it renders
	 * about 155 characters of it. The single 267-character string these were
	 * split out of was cut mid-sentence at "drive the app itself" — so the two
	 * facts a sceptical reader most wants from a search result, that there is no
	 * account and that it is Apple silicon only, were the exact two that never
	 * appeared. This one is 152 and ends where it means to.
	 *
	 * `description` has no such limit: Open Graph, Twitter and every JSON-LD node
	 * take the full argument, and a link preview is read after the click has been
	 * half decided rather than before it. Neither is a summary of the other —
	 * they are the same claim at two lengths, and both must stay true.
	 */
	searchDescription:
		'A macOS orchestrator for Pi and Claude Code. Every stream of work gets its own git worktree, and an agent can spawn sub-agents and drive the app itself.',
	description:
		'A macOS orchestrator for the Pi agent harness or the Claude Code CLI you already have installed. Every stream of work gets its own git worktree, and an agent can drive the app itself — spawn sub-agents, delegate, wait, integrate. No account, no tokens stored. Apple silicon, MIT.',
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
	// Control leads, because it is now the section directly under the hero — and
	// because it is the only label here a competing product could not also print.
	// The three that follow are the showcase's steps, in the order the reader
	// scrolls them.
	{ id: 'control', label: 'Control' },
	{ id: 'workspaces', label: 'Workspaces' },
	{ id: 'runtimes', label: 'Runtimes' },
	{ id: 'review', label: 'Review' },
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
		'Hardened runtime, and the notarisation ticket is stapled to the build — so macOS validates it offline on first launch. No Gatekeeper override, no right-click → Open, no quarantine flag to strip.',
} as const;

/**
 * What you need installed before Ensemblr is useful. Stated on the page rather
 * than buried, because several of these are hard gates: the app refuses to run
 * agent sessions without a runtime CLI present.
 *
 * `short` is the same gate in the length a single run-on line can carry, and it
 * exists so the hero can state the constraints beside the download button
 * instead of only in the Download section eight screens down. A reader who
 * learns "Apple silicon only" after scrolling the whole argument has been sold
 * something they cannot run; one who learns it in the first screenful trusts
 * everything under it. Both surfaces read the same array, so the two lists
 * cannot drift into disagreeing about what the app needs.
 *
 * Every `short` is a noun phrase naming the thing you need, because the hero
 * sets them as one run-on line with middots between. "bring your own Pi or
 * Claude Code CLI" was an imperative sitting between "Apple silicon only" and
 * "git", so the line changed voice mid-sentence and read as three constraints
 * with an instruction wedged into the middle of them. What it was doing — say
 * that the CLI is yours to supply — the hero's own credentials line already
 * says one paragraph above, in a sentence with room for it.
 *
 * The optional entry carries a `short` it never spends: the hero filters this
 * array on `required`, so Linear's is unreachable today. It stays because the
 * array is read as a table — a member missing the field would make `short`
 * optional for every reader of the type, and a hero that widened its filter
 * would find a hole rather than a string. `required: false` is where the
 * optionality is stated; the `short` obeys the noun-phrase rule like the rest.
 */
export const REQUIREMENTS = [
	{
		name: 'macOS on Apple silicon',
		short: 'Apple silicon only',
		detail: 'Builds are arm64-only.',
		required: true,
	},
	{
		name: 'An agent runtime CLI',
		short: 'Pi or Claude Code CLI',
		detail:
			'Pi, Claude Code, or both. Ensemblr drives your own binaries and ships none.',
		required: true,
	},
	{
		name: 'git',
		short: 'git',
		detail: 'Used natively for worktrees, branches, commits and diffs.',
		required: true,
	},
	{
		name: 'GitHub CLI (gh), authenticated',
		short: 'gh, authenticated',
		detail:
			'Authenticate once with gh auth login. PR and check data is read through it; no GitHub tokens are stored.',
		required: true,
	},
	{
		name: 'A Linear account',
		short: 'Linear',
		detail: 'OAuth only, with the token held in the macOS Keychain.',
		required: false,
	},
] as const;
