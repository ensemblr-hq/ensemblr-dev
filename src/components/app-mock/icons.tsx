/**
 * The glyphs the workbench replica draws, and only those.
 *
 * Icons the site itself uses — GitHub, Apple, the nav's menu rules, the shield
 * beside the digest, the tick in the orchestration diagram — live in
 * `@/components/icons/site`. They appear nowhere in this replica, and keeping
 * them here is what had eight files in `chrome/`, `download/` and `sections/`
 * importing from a module named after a mock.
 */

import { Icon, type IconProps } from '@/components/icons/icon';

export function LayoutIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<rect height='11' rx='1.5' width='12' x='2' y='2.5' />
			<path d='M6 2.5v11' />
		</Icon>
	);
}

export function ClockIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx='8' cy='8' r='5.5' />
			<path d='M8 5v3.2l2 1.2' />
		</Icon>
	);
}

export function HelpIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx='8' cy='8' r='5.5' />
			<path d='M6.4 6.3a1.7 1.7 0 1 1 1.9 1.9v1' />
			<path d='M8.3 11.2h.01' />
		</Icon>
	);
}

export function GearIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx='8' cy='8' r='2.2' />
			<path d='M8 1.8v1.6M8 12.6v1.6M14.2 8h-1.6M3.4 8H1.8M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1M12.4 12.4l-1.1-1.1M4.7 4.7 3.6 3.6' />
		</Icon>
	);
}

export function BranchIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx='4.5' cy='3.5' r='1.6' />
			<circle cx='4.5' cy='12.5' r='1.6' />
			<circle cx='11.5' cy='6' r='1.6' />
			<path d='M4.5 5.1v5.8M6.1 6h2.4a3 3 0 0 0 3-0' />
		</Icon>
	);
}

export function PullRequestIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx='4.5' cy='3.5' r='1.6' />
			<circle cx='4.5' cy='12.5' r='1.6' />
			<circle cx='11.5' cy='12.5' r='1.6' />
			<path d='M4.5 5.1v5.8M11.5 10.9V6a2 2 0 0 0-2-2H7.4' />
			<path d='m9 2.2-1.8 1.8L9 5.8' />
		</Icon>
	);
}

export function TerminalIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='m3 5 2.5 2.5L3 10' />
			<path d='M8 11h5' />
		</Icon>
	);
}

export function PlayIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M5.5 3.6 12 8l-6.5 4.4z' fill='currentColor' />
		</Icon>
	);
}

export function ChevronIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='m6 4 4 4-4 4' />
		</Icon>
	);
}

export function PlusIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M8 3.5v9M3.5 8h9' />
		</Icon>
	);
}

export function SparkIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M8 2.2 9.3 6 13 7.3 9.3 8.6 8 12.4 6.7 8.6 3 7.3 6.7 6z' />
		</Icon>
	);
}

export function ArrowIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M3 8h9.5M9 4.5 12.5 8 9 11.5' />
		</Icon>
	);
}

export function PanelIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<rect height='11' rx='1.5' width='12' x='2' y='2.5' />
			<path d='M10 2.5v11' />
		</Icon>
	);
}

export function PlusSquareIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<rect height='11' rx='2' width='11' x='2.5' y='2.5' />
			<path d='M8 5.5v5M5.5 8h5' />
		</Icon>
	);
}

export function InfoIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx='8' cy='8' r='5.5' />
			<path d='M8 7.3v3.4M8 5.3h.01' />
		</Icon>
	);
}

export function WrenchIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M10.4 2.6a3 3 0 0 0-3.7 3.9L3 10.2a1.4 1.4 0 0 0 2 2l3.7-3.7a3 3 0 0 0 3.9-3.7l-1.7 1.7-1.4-1.4z' />
		</Icon>
	);
}

export function PencilIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M11 2.8 13.2 5 5.6 12.6l-3 .8.8-3z' />
		</Icon>
	);
}

export function PromptIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='m3 4 3 4-3 4M8.5 12H13' />
		</Icon>
	);
}

export function EyeIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M1.8 8S4 4 8 4s6.2 4 6.2 4-2.2 4-6.2 4S1.8 8 1.8 8Z' />
			<circle cx='8' cy='8' r='1.7' />
		</Icon>
	);
}

export function ListIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M2.5 4.5h11M2.5 8h11M2.5 11.5h7' />
		</Icon>
	);
}

export function DotsIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M8 3.6h.01M8 8h.01M8 12.4h.01' />
		</Icon>
	);
}

export function RefreshIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M13.2 8a5.2 5.2 0 1 1-1.6-3.7' />
			<path d='M13.4 2.6v2.6h-2.6' />
		</Icon>
	);
}

export function BoxIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<rect height='9' rx='1.5' width='9' x='3.5' y='3.5' />
		</Icon>
	);
}

export function ExternalIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M9.5 3h3.5v3.5M12.5 3.5 7.5 8.5' />
			<path d='M12 9.5v2.6a1 1 0 0 1-1 1H4.4a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1H7' />
		</Icon>
	);
}

export function MessageIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M2.8 3.8a1 1 0 0 1 1-1h8.4a1 1 0 0 1 1 1v5.4a1 1 0 0 1-1 1H6.2L3.4 13V10.2h.4a1 1 0 0 1-1-1z' />
		</Icon>
	);
}

/** The harness launcher menu, which the app marks with a bot. */
export function BotIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<rect height='7.5' rx='2' width='11' x='2.5' y='5.5' />
			<path d='M8 2.5v3M5.5 9h.01M10.5 9h.01M1 8.5v2M15 8.5v2' />
		</Icon>
	);
}

/** Closed-session history: a clock wound backwards. */
export function HistoryIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M2.6 8a5.4 5.4 0 1 0 1.7-3.9' />
			<path d='M2.4 2.6v2.8h2.8' />
			<path d='M8 5.2V8l2 1.2' />
		</Icon>
	);
}

/** Right-sidebar toggle, which lives beside the launcher in the app header. */
export function PanelRightIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<rect height='11' rx='1.5' width='12' x='2' y='2.5' />
			<path d='M10 2.5v11' />
			<path d='M11.2 6.6 12.6 8l-1.4 1.4' />
		</Icon>
	);
}

/** MCP servers panel. */
export function PlugIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M6 2.2v3.3M10 2.2v3.3' />
			<path d='M4.4 5.5h7.2v2a3.6 3.6 0 0 1-7.2 0z' />
			<path d='M8 11.1v2.7' />
		</Icon>
	);
}

/** Plan mode: the app draws it as an open book. */
export function BookIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M8 4.4S6.8 3.2 4 3.2H2.4v8.4H4c2.8 0 4 1.2 4 1.2s1.2-1.2 4-1.2h1.6V3.2H12c-2.8 0-4 1.2-4 1.2z' />
			<path d='M8 4.4v8.4' />
		</Icon>
	);
}

/**
 * Thinking strength. The app's own icon is a bar chart whose bars grow with the
 * selected effort, so the tallest set is what `Max` shows.
 */
export function BarsIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M3.5 10.5v2M6.5 8v4.5M9.5 5.5v7M12.5 3v9.5' />
		</Icon>
	);
}

/** Context-window gauge: a ring with the used arc drawn over it. */
export function GaugeIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<circle cx='8' cy='8' opacity='0.45' r='5.3' />
			<path d='M8 2.7a5.3 5.3 0 0 1 4.6 7.9' />
		</Icon>
	);
}

export function MinusSquareIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<rect height='11' rx='2' width='11' x='2.5' y='2.5' />
			<path d='M5.5 8h5' />
		</Icon>
	);
}

export function DotSquareIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<rect height='11' rx='2' width='11' x='2.5' y='2.5' />
			<path d='M8 8h.01' />
		</Icon>
	);
}

export function CopyIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<rect height='8.5' rx='1.5' width='8.5' x='5' y='5' />
			<path d='M3.2 10.4A1.4 1.4 0 0 1 2.5 9.2V3.9a1.4 1.4 0 0 1 1.4-1.4h5.3c.5 0 .95.27 1.2.7' />
		</Icon>
	);
}

/**
 * The branch picker's affordance. A single chevron reads as "expand"; the app
 * uses the two-way one, because the control swaps the value rather than
 * revealing anything.
 */
export function ChevronsIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M5 6.4 8 3.4l3 3M11 9.6 8 12.6l-3-3' />
		</Icon>
	);
}

/**
 * The editor the header's launcher opens. The app draws the real application
 * icon it read off disk, so this one is full-colour rather than a stroked glyph
 * taking the surrounding text colour — the launcher is a bordered button with a
 * live app icon in it, not a tinted pill.
 */
export function VSCodeIcon({ className }: IconProps) {
	return (
		<svg
			aria-hidden='true'
			className={className}
			fill='#0098ff'
			viewBox='0 0 24 24'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path d='M23.15 2.587 18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z' />
		</svg>
	);
}
