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
 * "Desktop", not "macOS". The app has built a Linux x86-64 AppImage since
 * 0.1.0-beta.19 and this site now offers it, so the word here matches the app
 * README's own opening line. It was deliberately narrower than its source until
 * that decision was taken, and the widening was made in one pass rather than
 * piecemeal: this line, both descriptions, `REQUIREMENTS`, `DISTRIBUTION`, the
 * hero, the download section and `structured-data.ts`'s `operatingSystem`.
 *
 * Google renders about sixty characters and `Ensemblr — ` spends eleven, so
 * both runtimes are kept — "Ensemblr — A desktop orchestrator for Pi and Claude
 * Code." lands at 56 and neither name is truncated away — and "multi-agent
 * coding work" is carried by the descriptions and the keywords instead.
 */
export const SITE = {
	name: 'Ensemblr',
	url: 'https://www.ensemblr.dev',
	tagline: 'A desktop orchestrator for Pi and Claude Code.',
	/*
	 * Two descriptions, because the two consumers have different budgets.
	 *
	 * `searchDescription` is what Google renders under the title, and it renders
	 * about 155 characters of it. The single 267-character string these were
	 * split out of was cut mid-sentence at "drive the app itself" — so the two
	 * facts a sceptical reader most wants from a search result, that there is no
	 * account and which platforms it runs on, were the exact two that never
	 * appeared. This one is 153 and ends where it means to.
	 *
	 * `description` has no such limit: Open Graph, Twitter and every JSON-LD node
	 * take the full argument, and a link preview is read after the click has been
	 * half decided rather than before it. Neither is a summary of the other —
	 * they are the same claim at two lengths, and both must stay true.
	 */
	searchDescription:
		'A desktop orchestrator for Pi and Claude Code, on macOS and Linux. Every stream of work gets its own git worktree, and an agent can drive the app itself.',
	description:
		'A desktop orchestrator for the Pi agent harness or the Claude Code CLI you already have installed. Every stream of work gets its own git worktree, and an agent can drive the app itself — spawn sub-agents, delegate, wait, integrate. No account, no tokens stored. macOS on Apple silicon or Linux on x86-64, Apache 2.0.',
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
 * How each build is distributed, stated where the visitor is asked to run it.
 *
 * This audience is about to hand an app their `gh` session and their repos. The
 * page cannot answer that with an adjective, so it answers with the mechanism:
 * who signed it, whether anyone else has checked it, and the digest they can
 * check themselves before it ever opens.
 *
 * **The two halves are not symmetrical and the copy does not pretend they are.**
 * The macOS claim is `docs/guide/01-install.md`: "both the `.app` and the `.dmg`
 * carry their own ticket, so Gatekeeper clears them on first open without a
 * network round-trip." There is no counterpart for the AppImage. `make:linux`
 * runs in a CI job that skips `verify:signing` outright, and `notarizationEnabled`
 * has required darwin since it existed — so the Linux artifact is unsigned, and
 * the honest thing to do with that is print the word rather than change the
 * subject. It is also what makes the digest load-bearing there rather than
 * decorative: on Linux it is the only check there is.
 */
export const DISTRIBUTION = {
	macos: {
		summary: 'Signed with an Apple Developer ID and notarised by Apple.',
		detail:
			'Hardened runtime, and the ticket is stapled to both the .app and the disk image, so macOS validates each offline on first open. No Gatekeeper override, no quarantine flag to strip.',
	},
	linux: {
		summary: 'Unsigned. Linux has no notarisation to pass.',
		detail:
			'Nothing on Linux issues the equivalent of a Developer ID, and a self-signed binary would prove nothing. The SHA-256 below is the check, and install.sh refuses on a mismatch.',
	},
} as const;

/**
 * The other way to install it, copied from the cask rather than recalled.
 *
 * `ensemblr-hq/homebrew-tap` is a second, public repository holding one cask on
 * the stable channel. Every claim the page makes about it is a line in that
 * file: `depends_on arch: :arm64` and `depends_on macos: :ventura`, so brew
 * refuses on a machine that cannot open the app instead of installing it
 * anyway, and `auto_updates true`, which is why a plain `brew upgrade` leaves
 * the bundle to Ensemblr's own updater — two updaters writing one bundle is how
 * an install gets corrupted.
 *
 * That floor was `:monterey` until 0.1.0-beta.20, which moved the shell to
 * Electron 44 and lost macOS 12 with it. It is declared in the cask and nowhere
 * in the app repo, so the tap is the only place to read it — and it is the one
 * version number this page prints about the Homebrew path, in `HomebrewNote`.
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
	/*
	 * Said out loud now that the page has two platforms on it. The cask's
	 * `depends_on macos: :ventura` already refuses on anything else, but a
	 * Linux reader meeting a `brew` line has been handed an install path that
	 * cannot work — and with no JavaScript both platform blocks render, so this
	 * is not a case the switcher can be relied on to prevent.
	 */
	platformNote: 'macOS only.',
} as const;

/**
 * What you need installed before Ensemblr is useful. Stated on the page rather
 * than buried, because several of these are hard gates: the app refuses to run
 * agent sessions without a runtime CLI present.
 *
 * `short` is the same gate in the length a single run-on line can carry, and it
 * exists so the hero can state the constraints beside the download button
 * instead of only in the Download section eight screens down. A reader who
 * learns which architectures are built only after scrolling the whole argument
 * has been sold something they cannot run; one who learns it in the first
 * screenful trusts everything under it. Both surfaces read the same array, so the two lists
 * cannot drift into disagreeing about what the app needs.
 *
 * Every `short` is a noun phrase naming the thing you need, because the hero
 * sets them as one run-on line with middots between. "bring your own Pi or
 * Claude Code CLI" was an imperative sitting between the architecture gate and
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
		// One row for both platforms rather than one each, because it is one
		// question — will it run on this machine — and a reader whose answer is
		// "no" should meet it once. No semicolon anywhere in `name`:
		// `softwareRequirements` joins these on `'; '` and the test splits them
		// back, so a semicolon here silently invents a requirement.
		name: 'macOS on Apple silicon, or Linux on x86-64',
		// The page's one ®, and the Linux Foundation's own instruction for it: the
		// first prominent appearance of the mark carries the symbol, the footer
		// carries the legend, and no later mention repeats either. This gate line
		// is where a reader meets the word first — the hero renders it above
		// everything but the headline. See THIRD_PARTY in `legal.ts`.
		short: 'Apple silicon or x86-64 Linux®',
		detail:
			'Intel Macs and arm64 Linux are not built. Windows is not supported.',
		required: true,
	},
	{
		name: 'An agent runtime CLI',
		short: 'Pi or Claude Code CLI',
		/*
		 * The third sentence arrived with 0.1.1, and it belongs on this row rather
		 * than beside the Fable claim in the Runtimes step.
		 *
		 * `claude-model-catalog.ts` pins `claude-fable-5-1` as an id the runtime
		 * accepts but does not advertise, and #423 states the consequence outright:
		 * Fable 5.1 resolves only against a `claude` binary at 2.1.251 or newer.
		 * The app drives the CLI the reader installed, so the SDK version inside
		 * the bundle settles nothing — which makes this a gate the reader supplies,
		 * and gates are what this card is. The step one screen up names the model;
		 * this names the floor, and neither repeats the other.
		 *
		 * It is a version number about somebody else's CLI, not about Ensemblr, so
		 * the rule that keeps a tag off the `brew` line does not reach it: nothing
		 * here goes stale when Ensemblr ships, and `depends_on macos: :ventura` is
		 * already printed on the same page for the same reason.
		 */
		detail:
			'Pi, Claude Code, or both. Ensemblr ships neither. Fable 5.1 resolves only against a claude binary at 2.1.251 or newer.',
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
			'Authenticate once with gh auth login. PR and check data reads through it.',
		required: true,
	},
	{
		name: 'A Linear account',
		short: 'Linear',
		detail: 'OAuth only, as many organisations as you need.',
		required: false,
	},
	{
		name: 'An Infisical project',
		short: 'Infisical',
		detail:
			'A Machine Identity and a project link in the repo. Secrets resolve live at launch.',
		required: false,
	},
] as const;
