/**
 * Long-tail capability copy for the closing feature grid. Sourced from the
 * app's own README and the "Current Shell Contract" section of
 * `docs/ux-conventions.md`, kept out of the section components so the prose can
 * be corrected in one place. That section is where `docs/product/current-shell-
 * inventory.md` went — the path this file and `AGENTS.md` both used to name now
 * 404s in the app repo, which is worth knowing before the next re-pin cites it.
 *
 * Strictly the *rest* of it. Every claim the showcase already makes in
 * `sections/showcase.tsx` is deliberately absent here — an earlier cut of this
 * file repeated most of those bullets almost verbatim a screen and a half
 * later, which is what made the page read as padded however well each section
 * was set. A reader who has scrolled the four steps should meet nothing twice.
 *
 * Three groups, not six: `lg:grid-cols-3` then lands them in a single row
 * instead of two ragged ones, and each column carries enough weight to justify
 * its rule.
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
		body: 'Ensemblr stores none. No token field in settings, no OAuth screen, no second place one can leak from — it shells out to the CLI you already authenticated.',
	},
	{
		title: 'Secrets live in the Keychain',
		body: 'Linear’s OAuth tokens go straight to the macOS Keychain, keyed per account — never a file, never an environment variable. Infisical secrets are not stored at all: they resolve live at every launch.',
	},
	{
		title: 'No agent binary ships',
		body: 'Your pi and claude installs, your credentials, your models, your config. The ~260 MB the Claude Agent SDK would bundle is deliberately left out.',
	},
	{
		title: 'No account, no server',
		body: 'Ensemblr talks to GitHub, Linear, Infisical and your agent CLIs directly — no backend in the path, no telemetry. State is a local SQLite database beside your worktrees.',
	},
];
