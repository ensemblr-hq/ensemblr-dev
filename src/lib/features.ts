/**
 * Long-tail capability copy for the closing feature grid. Sourced from the
 * app's own README and `docs/product/current-shell-inventory.md`, kept out of
 * the section components so the prose can be corrected in one place.
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
			'Auto-generated session names and summaries',
			'Per-runtime model visibility',
			'Workspace toolchain PATH and ENSEMBLR_* variables inherited',
			'One shared code surface for viewer, diff and tool previews',
			'File tree with live filesystem watch and lazy-loaded ignores',
		],
	},
	{
		label: 'Config & diagnostics',
		items: [
			'Layered user / repository / workspace config, live reload',
			'Per-runtime executable override and readiness checks',
			'Git defaults: branch prefix, auto-rename, archive on merge',
			'Appearance: theme, code theme, markdown style, mono fonts',
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
 */
export const TRUST_ITEMS: readonly TrustItem[] = [
	{
		title: 'GitHub tokens stay with gh',
		body: 'Ensemblr stores none. No token field in settings, no OAuth screen, no second place one can leak from — it shells out to the CLI you already authenticated.',
	},
	{
		title: 'Secrets live in the Keychain',
		body: 'Linear’s OAuth tokens go straight to the macOS Keychain — never a file, never an environment variable. The app can list what it holds without reading it back.',
	},
	{
		title: 'No agent binary ships',
		body: 'Your pi and claude installs, your credentials, your models, your config. The ~260 MB the Claude Agent SDK would bundle is deliberately left out.',
	},
	{
		title: 'No account, no server',
		body: 'Ensemblr talks to GitHub, Linear and your agent CLIs directly — no backend in the path, no telemetry. State is a local SQLite database beside your worktrees.',
	},
];
