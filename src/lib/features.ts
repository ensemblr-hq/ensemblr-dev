/**
 * Long-tail capability copy. Sourced from the app's own README and the "Current
 * Shell Contract" section of `docs/ux-conventions.md`, kept in one place so the
 * prose can be corrected in one place. That section is where
 * `docs/product/current-shell-inventory.md` went — the path this file and
 * `AGENTS.md` both used to name now 404s in the app repo, which is worth
 * knowing before the next re-pin cites it.
 *
 * **Nothing renders this any more, and it is not dead.** The seventeen-item
 * grid that closed the page was deleted in the cut that took the page from
 * ~2,200 rendered words to ~1,000: it was the longest thing on it and the least
 * read, three columns of capability rows a visitor scrolled past on the way to
 * the download. `featureList()` in `structured-data.ts` still flattens this into
 * the `SoftwareApplication` node's `featureList`, so the long tail keeps its
 * machine-readable home while the page loses the scroll. Keep it current; just
 * do not put it back on the page without deciding to.
 *
 * Strictly the *rest* of it. Every claim the showcase makes in
 * `sections/showcase.tsx` is deliberately absent here — an earlier cut repeated
 * most of those bullets almost verbatim a screen and a half later, which is
 * what made the page read as padded however well each section was set.
 */

export interface FeatureGroup {
	readonly label: string;
	readonly items: readonly string[];
}

export const FEATURE_GROUPS: readonly FeatureGroup[] = [
	{
		label: 'Workspaces & history',
		items: [
			'Continue finished work onto a numbered continuation branch',
			'Configured files copied into every new workspace',
			'Archive a workspace’s context, git-backed, and browse it later',
			'A History screen that restores or permanently deletes',
			'Pin workspaces above their project groups',
			'Unread markers and per-workspace activity dots',
		],
	},
	{
		label: 'Sessions & composer',
		items: [
			'Pasted images and @-mention file payloads',
			// 0.1.0-beta.11, from `docs/guide/06-agents.md`'s "Right-clicking text".
			// Electron draws no context menu unless the app builds one, so until this
			// release right-clicking the composer did nothing at all — which is why
			// the row names the spellchecker rather than the clipboard verbs: Cut,
			// Copy and Paste are what a reader assumes a text box already has, and
			// the suggestions plus **Add to dictionary** are the half that only
			// exists because the app forwards Chromium's uncancelled verdict.
			'Composer right-click menu with spellchecker suggestions and Add to dictionary',
			'Auto-generated session names and summaries',
			'Per-runtime model visibility',
			'Claude plan usage per rate-limit window, beside the session’s cost',
			'Workspace toolchain PATH and ENSEMBLR_* variables inherited',
			'One shared code surface for viewer, diff and tool previews',
			'File tree with live filesystem watch and lazy-loaded ignores',
		],
	},
	{
		// "Settings", not "Config & diagnostics". Beta 5 put two integration rows
		// in this column — the Linear accounts list and the repository's Infisical
		// link — and both of them are settings panes rather than diagnostics, so
		// the label names the screen every row here is reached from rather than
		// the one row that reports on it.
		label: 'Settings & integrations',
		items: [
			'Layered user / repository / workspace config, live reload',
			// 0.1.0-beta.6, from `docs/guide/11-app-settings.md` and
			// `12-repository-settings.md`. The schemas themselves have a page of
			// their own on this site, so the row is deliberately the *product*
			// claim rather than the publishing one: what a reader gets is an editor
			// that completes both config files, and the `/schemas` link in the
			// footer is where someone who wants the two `$id`s goes next.
			'Both config files carry a published JSON Schema your editor completes against',
			'Per-runtime executable override and readiness checks',
			'Git defaults: branch prefix, auto-rename, archive on merge',
			'Appearance: theme, code theme, markdown style, mono fonts',
			'Any number of Linear organisations connected at once',
			'Infisical secrets resolved live at launch, never written into the repo',
			'Setup diagnostics with per-check remediation',
			// 0.1.0-beta.15, from `docs/guide/11-app-settings.md`'s "Concierge
			// settings". `app.concierge` is a top-level sibling of `app.models`,
			// not a key inside it — the model that suits supervising a dozen
			// workspaces is not the one that suits editing a file in any of them.
			//
			// This survived the Concierge getting a section of its own, and the
			// no-repeats rule at the top of this file is why: that section states
			// what the Concierge *is* and never once names a settings key, so this
			// is not a second telling. It is also the row a reader hunting for the
			// pane would look under, which is this column and not a section three
			// rules up.
			'Concierge runtime, model and thinking level as their own setting, separate from workspace defaults',
		],
	},
];

export interface TrustItem {
	readonly title: string;
	readonly body: string;
}

/*
 * The four claims re-cut against the app README's own "What it stores, and
 * where" section (`4c17975`), which states each of these as a mechanism rather
 * than a posture. Every clause below has a counterpart there — "no token field
 * in settings", "never a file and never an environment variable", the ~260 MB
 * the Agent SDK would bundle, "no Ensemblr backend in the path and no
 * telemetry". None of it is this site's invention, and none of it should be
 * softened into an adjective on the way across.
 *
 * Two clauses arrived with 0.1.0-beta.5 and come from
 * `docs/guide/10-integrations.md` at `34d446b0` rather than the README: Linear's
 * tokens are now "keyed per account", because several organisations can be
 * connected at once, and "Infisical secrets are not stored at all — they resolve
 * live at launch". The second is the stronger claim of the two and is the reason
 * a new integration did not weaken this section: what reaches the Keychain is
 * the Machine Identity's client secret and a failure fallback, not the secrets.
 */
export const TRUST_ITEMS: readonly TrustItem[] = [
	{
		title: 'GitHub tokens stay with gh',
		body: 'Ensemblr stores none. No token field in settings, no OAuth screen, no second place one can leak from.',
	},
	{
		// "The OS keyring", not "the Keychain", since the page offers a Linux
		// download. ADR 0056 is the source: Linux has no Keychain to shell out to,
		// so the app wraps Electron's `safeStorage` — gnome-keyring under GNOME,
		// KWallet under KDE — and the ciphertext lands in `ensemblr.db`. Naming
		// the macOS mechanism for both platforms would be the one kind of claim
		// this section cannot afford: a specific, checkable, wrong one.
		title: 'Secrets live in the OS keyring',
		body: 'Linear’s OAuth tokens go to the macOS Keychain, or gnome-keyring or KWallet on Linux — never a file, never an environment variable. Infisical secrets are not stored at all: they resolve live at launch.',
	},
	{
		title: 'No agent binary ships',
		body: 'Your pi and claude installs, your credentials, your models. The ~260 MB the Claude Agent SDK would bundle is left out.',
	},
	{
		title: 'No account, no server',
		body: 'Ensemblr talks to GitHub, Linear, Infisical and your CLIs directly — no backend in the path, no telemetry. State is a local SQLite database.',
	},
];
