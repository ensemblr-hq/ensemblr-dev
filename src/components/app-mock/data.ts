/**
 * Every string rendered inside the recreated workbench window lives here, so
 * the replica's fidelity can be corrected in one place. Row shapes were taken
 * from the running app rather than from prose.
 */

export const BREADCRUMB = {
	project: 'ensemblr',
	workspace: 'octocat/appearance-tokens',
	target: 'master',
	path: '~/Ensemblr/workspaces/ensemblr/adams',
} as const;

export const NAV_ROWS = ['Dashboard', 'History', 'Settings'] as const;

export interface MockRepository {
	readonly name: string;
	readonly workspaces: readonly MockWorkspace[];
}

export interface MockWorkspace {
	readonly name: string;
	readonly branch: string;
	readonly added: number;
	readonly removed: number;
	readonly state: 'running' | 'idle' | 'review';
	readonly active?: boolean;
	/** A dock script is running in this workspace; the app dots the row for it. */
	readonly dockActive?: boolean;
}

/**
 * Workspaces carry a written name over their branch, the way the app names one
 * from your first sentence to the agent — a row reading `add-dark-mode` twice
 * is the one thing the real sidebar never shows.
 */
export const REPOSITORIES: readonly MockRepository[] = [
	{
		name: 'ensemblr',
		workspaces: [
			{
				active: true,
				added: 142,
				branch: 'octocat/appearance-tokens',
				dockActive: true,
				name: 'Appearance tokens',
				removed: 18,
				state: 'running',
			},
			{
				added: 61,
				branch: 'octocat/ens-214-linear-sync',
				name: 'Linear issue sync',
				removed: 9,
				state: 'review',
			},
			{
				added: 24,
				branch: 'octocat/dock-port-detection',
				name: 'Dock port detection',
				removed: 3,
				state: 'idle',
			},
		],
	},
	{
		name: 'ensemblr-dev',
		workspaces: [
			{
				added: 3939,
				branch: 'octocat/marketing-site-rewrite',
				dockActive: true,
				name: 'Marketing site rewrite',
				removed: 444,
				state: 'running',
			},
		],
	},
	{ name: 'playground-repo', workspaces: [] },
];

export interface MockChatTab {
	readonly title: string;
	/** The tab you are looking at; the app rules its bottom edge. */
	readonly active?: boolean;
	/** The tab's agent is mid-turn; the app swaps its icon for a spinner. */
	readonly running?: boolean;
	/** Opened by another agent rather than by you; ruled along the top edge. */
	readonly subAgent?: boolean;
}

/**
 * A workspace holds as many chat tabs as you open, each pinned to the runtime
 * it was created with — so one tab sitting finished beside one still working is
 * the ordinary case, not an edge one.
 */
export const CHAT_TABS: readonly MockChatTab[] = [
	{ active: true, title: 'Appearance tokens' },
	{ running: true, subAgent: true, title: 'Terminal contrast pass' },
];

export type FileBadge = 'ts' | 'tsx' | 'css' | 'md' | 'json' | 'lock';

/**
 * The app renders an agent's prose as real markdown — bold lead-ins, lists, and
 * inline code and file references that are clickable chips rather than styled
 * text. Flattening that to a plain paragraph is what made the first replica
 * read as a diagram of a chat instead of a chat.
 */
export type InlineSpan =
	| { readonly kind: 'text'; readonly text: string }
	| { readonly kind: 'strong'; readonly text: string }
	| { readonly kind: 'code'; readonly text: string }
	| { readonly kind: 'file'; readonly text: string; readonly badge: FileBadge };

export type TimelineEntry =
	| { readonly kind: 'thinking'; readonly preview: string }
	| { readonly kind: 'tool'; readonly name: string }
	| {
			readonly kind: 'chip';
			readonly label: string;
			readonly file: string;
			readonly badge: FileBadge;
			readonly added?: number;
			readonly removed?: number;
	  }
	| { readonly kind: 'command'; readonly label: string; readonly text: string }
	| { readonly kind: 'paragraph'; readonly spans: readonly InlineSpan[] }
	| {
			readonly kind: 'list';
			readonly items: readonly (readonly InlineSpan[])[];
	  }
	| { readonly kind: 'user'; readonly text: string }
	/** Closes a finished turn: elapsed time, copy, and the turn's own menu. */
	| { readonly kind: 'turn-footer'; readonly duration: string };

const text = (value: string): InlineSpan => ({ kind: 'text', text: value });
const strong = (value: string): InlineSpan => ({ kind: 'strong', text: value });
const code = (value: string): InlineSpan => ({ kind: 'code', text: value });
const file = (value: string, badge: FileBadge): InlineSpan => ({
	badge,
	kind: 'file',
	text: value,
});

export const TIMELINE: readonly TimelineEntry[] = [
	{
		kind: 'user',
		text: 'Move the appearance tokens onto the shared palette and keep the terminal readable.',
	},
	{
		kind: 'thinking',
		preview: 'The xterm adapter reads the computed value, so the token has to…',
	},
	{ kind: 'tool', name: 'Grep  --ensemblr-canvas' },
	{ badge: 'css', file: 'index.css', kind: 'chip', label: 'Read' },
	{
		added: 64,
		badge: 'css',
		file: 'index.css',
		kind: 'chip',
		label: 'Edit',
		removed: 12,
	},
	{
		added: 38,
		badge: 'ts',
		file: 'xterm-adapter.ts',
		kind: 'chip',
		label: 'Edit',
		removed: 6,
	},
	{ kind: 'command', label: 'Running npm', text: 'npm run test -- appearance' },
	{
		kind: 'paragraph',
		spans: [
			strong('Done.'),
			text(
				' Palette resolves through one pair of light/dark cuts, and the terminal picks the change up on a live config reload.',
			),
		],
	},
	{
		kind: 'paragraph',
		spans: [
			strong('Two things to know:'),
			text(' the adapter reads computed values, not the variables themselves.'),
		],
	},
	{
		kind: 'list',
		items: [
			[
				code('--ensemblr-canvas'),
				text(' had two definitions. The one in '),
				file('index.css', 'css'),
				text(' won on every build, so the second was already dead.'),
			],
			[
				text('xterm caches its theme per instance — '),
				code('applyTheme()'),
				text(' now runs on the config event rather than on mount.'),
			],
		],
	},
	{ duration: '4m, 12.8s', kind: 'turn-footer' },
];

export const COMPOSER = {
	placeholder: 'Send a follow-up',
	model: 'Opus 5',
	thinking: 'Max',
} as const;

/**
 * Statuses are the app's own git vocabulary. `modified` carries no letter —
 * it is the default a row is already understood to be in — which is why the
 * mark beside the counts, not a letter, is what tells the states apart.
 */
export type ChangeStatus =
	| 'modified'
	| 'added'
	| 'deleted'
	| 'renamed'
	| 'untracked';

export interface MockChange {
	readonly path: string;
	readonly file: string;
	readonly badge: FileBadge;
	readonly added: number;
	readonly removed: number;
	readonly status: ChangeStatus;
}

export const CHANGES: readonly MockChange[] = [
	{
		added: 110,
		badge: 'css',
		file: 'index.css',
		path: 'renderer/styles/',
		removed: 14,
		status: 'modified',
	},
	{
		added: 62,
		badge: 'ts',
		file: 'xterm-adapter.ts',
		path: 'renderer/lib/terminal/',
		removed: 6,
		status: 'modified',
	},
	{
		added: 23,
		badge: 'tsx',
		file: 'preview.tsx',
		path: 'renderer/appearance/',
		removed: 0,
		status: 'added',
	},
	{
		added: 16,
		badge: 'ts',
		file: 'appearance.ts',
		path: 'renderer/state/',
		removed: 4,
		status: 'renamed',
	},
	{
		added: 0,
		badge: 'ts',
		file: 'legacy-theme.ts',
		path: 'renderer/lib/',
		removed: 113,
		status: 'deleted',
	},
	{
		added: 41,
		badge: 'json',
		file: 'appearance.json',
		path: 'renderer/fixtures/',
		removed: 12,
		status: 'modified',
	},
	{
		added: 8,
		badge: 'md',
		file: 'appearance.md',
		path: 'docs/',
		removed: 0,
		status: 'untracked',
	},
	{
		added: 4,
		badge: 'lock',
		file: 'bun.lock',
		path: '',
		removed: 2,
		status: 'modified',
	},
	{
		added: 31,
		badge: 'ts',
		file: 'palette.ts',
		path: 'renderer/lib/theme/',
		removed: 7,
		status: 'modified',
	},
	{
		added: 12,
		badge: 'tsx',
		file: 'terminal-view.tsx',
		path: 'renderer/components/',
		removed: 5,
		status: 'modified',
	},
	{
		added: 9,
		badge: 'ts',
		file: 'appearance.test.ts',
		path: 'renderer/state/__tests__/',
		removed: 0,
		status: 'added',
	},
	{
		added: 6,
		badge: 'json',
		file: 'settings.schema.json',
		path: 'shared/config/',
		removed: 6,
		status: 'modified',
	},
	{
		added: 0,
		badge: 'css',
		file: 'terminal-theme.css',
		path: 'renderer/styles/',
		removed: 48,
		status: 'deleted',
	},
	{
		added: 2,
		badge: 'md',
		file: 'CHANGELOG.md',
		path: '',
		removed: 0,
		status: 'modified',
	},
];

export const REVIEW_TABS = [
	{ count: null, label: 'All files' },
	{ count: CHANGES.length, label: 'Changes' },
	{ count: null, label: 'Checks' },
] as const;

/**
 * The review sidebar's header resolves the workspace's git and PR state to one
 * line, with the primary action on the right. Here a second tab's agent is
 * mid-turn, so the action is frozen behind a spinner.
 *
 * The spinner carries no visible text at any width, and that is the app's own
 * shape rather than this mock's simplification: `HeaderActivitySpinner` in the
 * app's `right-sidebar-header/header-action-buttons.tsx` is an `<output>` whose
 * only child is the spinning icon, with the run named in `aria-label`. Checked
 * at 0.1.0-beta.11, which is the release that moved a running action's label
 * into the accessible name across the app. An earlier note here explained the
 * missing label as a container query dropping it at this width; there is no
 * such query, and a mock that draws the right pixels for the wrong reason is
 * one redesign away from drawing the wrong ones.
 */
export const REVIEW_HEADER = {
	label: 'Working…',
} as const;

export const DOCK_OUTPUT: readonly string[] = [
	'+ @biomejs/biome@2.2.0',
	'+ @tailwindcss/postcss@4.3.2',
	'+ @types/node@20.19.43',
	'+ @types/react@19.2.17',
	'+ @types/react-dom@19.2.3',
	'+ electron@34.1.1',
	'+ next@16.2.10',
	'+ react@19.2.4',
	'+ react-dom@19.2.4',
	'+ tailwindcss@4.3.2',
	'+ typescript@5.9.3',
	'+ vitest@3.1.4',
	'+ xterm@5.5.0',
	'+ zod@4.4.3',
];

export const DOCK_FOOTER = '57 packages installed [751.00ms]' as const;
