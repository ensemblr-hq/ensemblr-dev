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

export const TRUST_ITEMS: readonly TrustItem[] = [
	{
		title: 'GitHub, through your own gh',
		body: 'PR state, checks and comments are read through the GitHub CLI using the credentials you already authenticated. Ensemblr stores no GitHub tokens.',
	},
	{
		title: 'Linear, OAuth only',
		body: 'Issue integration is OAuth, and the token lives in the macOS Keychain rather than in a config file.',
	},
	{
		title: 'Your runtimes, your keys',
		body: 'Ensemblr ships no agent binary. It drives the Pi and claude CLIs you installed, so provider credentials stay in their own environment.',
	},
	{
		title: 'Local by default',
		body: 'Workspaces are git worktrees on your disk and session history is a local SQLite file. Nothing is uploaded to run the app.',
	},
];
