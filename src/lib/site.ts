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
 * The app's README led the same way as of `4c17975`: "A macOS orchestrator for
 * multi-agent coding work, driving the Pi CLI or the Claude Code CLI —
 * whichever you already run." This is that sentence cut to a length a `<title>`
 * survives.
 *
 * It now reads "A desktop orchestrator", and the word here stays "macOS"
 * anyway. That is a decision, not drift: the second platform is not being
 * advertised on this site yet, so every surface here describes the one download
 * the page offers. Widening this line is what announcing Linux looks like —
 * along with the platform table in the README, `REQUIREMENTS` below, the
 * download section and `structured-data.ts`'s `operatingSystem`. Do not do it
 * piecemeal because the README says something broader. Google renders about sixty characters and `Ensemblr — ` spends
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
		'A macOS orchestrator for the Pi agent harness or the Claude Code CLI you already have installed. Every stream of work gets its own git worktree, and an agent can drive the app itself — spawn sub-agents, delegate, wait, integrate. No account, no tokens stored. Apple silicon, Apache 2.0.',
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
	/*
	 * The licence the source carries now, spelled the way a reader says it rather
	 * than the way SPDX writes it — this string is a link label in the footer, not
	 * a machine-readable field, and nothing on the site consumes an SPDX id.
	 *
	 * It describes the repository at `licenseUrl`, not any particular build. The
	 * relicence is not retroactive: every release up to and including
	 * v0.1.0-beta.4 shipped under MIT and stays MIT, and v0.1.0-beta.5 is the
	 * first build to carry Apache 2.0 — which is why no versioned surface on this
	 * site prints a licence beside a tag, and why the machine-readable claim in
	 * `structured-data.ts` is made about the release the page is rendering rather
	 * than about the download in the abstract.
	 */
	license: 'Apache 2.0',
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
	// A sixth label, and the bar still opens as a row at `lg`. The note in
	// `chrome/nav-links.tsx` measures five at ~813px of min-content beside the
	// wordmark, the repo link and the CTA; "Concierge" and its gap add ~90px, so
	// the row lands near 900 and clears 1024 with room. A seventh would not be
	// free — that is the label to weigh against the disclosure moving to `xl`.
	{ id: 'concierge', label: 'Concierge' },
	{ id: 'trust', label: 'Credentials' },
] as const;

/**
 * How the build is distributed, stated where the visitor is asked to run it.
 *
 * This audience is about to hand an app their `gh` session and their repos. The
 * page cannot answer that with an adjective, so it answers with the mechanism:
 * who signed it, whether Apple has seen it, and the digest they can check
 * themselves before it ever opens.
 *
 * "Both the .app and the disk image" is newly true and deliberately specific.
 * Releases build in CI as of 0.1.0-beta.7, and that is where the `.dmg` started
 * being codesigned before notarisation — stapling a ticket to an unsigned image
 * leaves Gatekeeper nothing to assess, and every earlier beta shipped that way.
 * The claim is `docs/guide/01-install.md` at `4d719d35`: "both the `.app` and
 * the `.dmg` carry their own ticket, so Gatekeeper clears them on first open
 * without a network round-trip."
 */
export const DISTRIBUTION = {
	signed: true,
	notarised: true,
	summary: 'Signed with an Apple Developer ID and notarised by Apple.',
	detail:
		'Hardened runtime, and the notarisation ticket is stapled to both the .app and the disk image it arrives in — so macOS validates each of them offline, on first open. No Gatekeeper override, no right-click → Open, no quarantine flag to strip.',
} as const;

/**
 * The other way to install it, copied from the cask rather than recalled.
 *
 * `ensemblr-hq/homebrew-tap` is a second, public repository holding one cask on
 * the stable channel. Every claim the page makes about it is a line in that
 * file: `depends_on arch: :arm64` and `depends_on macos: :monterey`, so brew
 * refuses on a machine that cannot open the app instead of installing it
 * anyway, and `auto_updates true`, which is why a plain `brew upgrade` leaves
 * the bundle to Ensemblr's own updater — two updaters writing one bundle is how
 * an install gets corrupted.
 *
 * `install` carries no version, and nothing on the page may print one beside
 * it. The cask resolves its own version from the tap, and the app's release
 * workflow rewrites it there; a tag repeated here would be a second thing to
 * bump on every release, which is the per-release chore the tap was built to
 * remove.
 *
 * This is an alternative path, never a replacement for the `.dmg`. The button
 * is the page's one conversion event, and the digest printed beneath it
 * describes the file that button links to.
 */
export const HOMEBREW = {
	tapUrl: 'https://github.com/ensemblr-hq/homebrew-tap',
	install: 'brew install --cask ensemblr-hq/tap/ensemblr',
	/** Only meaningful once the in-app updater has been turned off. */
	upgrade: 'brew upgrade --cask --greedy ensemblr',
	/** The toggle to turn off first, named as the app's own menu spells it. */
	autoUpdateSetting: 'Settings → General → Update Ensemblr automatically',
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
 * The optional entries carry a `short` they never spend: the hero filters this
 * array on `required`, so neither Linear's nor Infisical's is reachable today.
 * They stay because the array is read as a table — a member missing the field
 * would make `short` optional for every reader of the type, and a hero that
 * widened its filter would find a hole rather than a string. `required: false`
 * is where the optionality is stated; the `short` obeys the noun-phrase rule
 * like the rest.
 *
 * Infisical joined the table in 0.1.0-beta.5. It is a hard gate for nothing —
 * an unreachable Infisical never blocks a workspace — but it is now one of the
 * five things the app talks to outside itself, and a reader deciding whether the
 * secrets story fits their team needs to see it named beside Linear rather than
 * discovering it after the download.
 */
export const REQUIREMENTS = [
	{
		name: 'macOS on Apple silicon',
		short: 'Apple silicon only',
		// Scoped to macOS on purpose. "Builds are arm64-only" was a true sentence
		// about the whole product for as long as macOS was the whole product; it
		// stopped being one and this is the same constraint stated about the
		// download this page actually offers, which is the .dmg above.
		detail: 'macOS builds are arm64-only.',
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
		detail:
			'OAuth only, as many organisations as you need, with every token held in the macOS Keychain.',
		required: false,
	},
	{
		name: 'An Infisical project',
		short: 'Infisical',
		detail:
			'A Machine Identity on your machine, and a project link committed to the repository. Secrets resolve live at every launch.',
		required: false,
	},
] as const;
