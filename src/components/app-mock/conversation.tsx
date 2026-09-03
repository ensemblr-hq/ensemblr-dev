import { cn } from '@/lib/utils';

import { MockComposer } from './composer';
import { BREADCRUMB, CHAT_TABS, COMPOSER, TIMELINE } from './data';
import {
	BotIcon,
	BranchIcon,
	ChevronIcon,
	ChevronsIcon,
	HistoryIcon,
	MessageIcon,
	PanelRightIcon,
	PlusIcon,
	VSCodeIcon,
} from './icons';
import { Spinner } from './primitives';
import { MockTimeline } from './timeline';

/**
 * Breadcrumb bar: project, workspace, the branch this one merges into, and the
 * two controls the app parks on the right — the editor launcher, which is a
 * split button because its chevron picks a different editor, and the toggle
 * that collapses the review sidebar.
 */
function Header() {
	return (
		// `overflow-hidden` for the same reason the tab strip below carries it: a
		// row of `shrink-0` controls ending in `ml-auto` does not wrap when it runs
		// out of room, it paints over the pane to its right. Clipped is a worse
		// picture than complete; painted over the review panel is not a picture of
		// this app at all.
		<div className='flex h-12 shrink-0 items-center gap-2 overflow-hidden border-line border-b px-3'>
			<span
				aria-hidden='true'
				className='grid size-4 shrink-0 place-items-center rounded-[3px] bg-pane-strong font-mono text-[8px] text-muted'
			>
				E
			</span>
			<div className='flex min-w-0 flex-col gap-0.5'>
				<div className='flex items-center gap-1.5 text-[11px]'>
					{/* The project is the first thing worth giving up when the column
					    is tight: it is named again in the sidebar and again in the path
					    line below, and holding it costs the branch its name — 20rem of
					    column bought "ens… / octocat/appear… ⎇ m" where dropping it
					    buys "octocat/appearance-tokens ⎇ master". Neither shell is
					    that wide today; both were, at some point in this pass. */}
					<span className='@max-[20rem]:hidden truncate text-ink'>
						{BREADCRUMB.project}
					</span>
					<span className='@max-[20rem]:hidden text-muted/50'>/</span>
					<span className='truncate text-ink'>{BREADCRUMB.workspace}</span>
					{/* `shrink-0`: the branch is the shortest name in the row and the
					    one the reader cannot reconstruct from anything else on screen,
					    so the workspace gives way to it rather than the two of them
					    truncating together into "octocat/appear… ⎇ ma…". The row cannot
					    overflow the pane any more — the header clips — so holding this
					    at its natural width costs nothing. */}
					<span className='ml-1 flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 text-[10px] text-muted'>
						<BranchIcon className='size-3 shrink-0' />
						<span className='truncate'>{BREADCRUMB.target}</span>
						<ChevronsIcon className='size-2.5 shrink-0 text-muted/60' />
					</span>
				</div>
				<span className='truncate font-mono text-[9px] text-muted/60'>
					{BREADCRUMB.path}
				</span>
			</div>
			<span className='ml-auto flex shrink-0 items-center gap-1.5'>
				{/* Bordered and transparent, not a filled accent pill. The colour in
				    it is the editor's own application icon — the app reads the real
				    one off disk — and the chevron beside it, behind its own divider,
				    picks a different editor rather than repeating this one. */}
				<span className='flex h-6 items-center overflow-hidden rounded-md border border-line'>
					<span className='grid h-full w-6 place-items-center'>
						<VSCodeIcon className='size-3.5' />
					</span>
					<span className='h-4 w-px bg-line' />
					<span className='grid h-full w-5 place-items-center'>
						<ChevronIcon className='size-2.5 rotate-90 text-muted/70' />
					</span>
				</span>
				<PanelRightIcon className='size-3.5 text-muted/65' />
			</span>
		</div>
	);
}

/**
 * The session tabs. Each tab keeps its own agent, so one can be finished while
 * the next is mid-turn — which the app shows by swapping that tab's icon for a
 * spinner. The pair on the right opens a terminal harness and the list of tabs
 * you have closed.
 */
function TabStrip() {
	return (
		/*
		 * `min-w-0 overflow-hidden` is load-bearing, not defensive.
		 *
		 * A flex item's default `min-width: auto` is its content's min-content
		 * width, so this row refused to be narrower than its tabs plus the icon
		 * cluster — around 354px against the ~297px the conversation column gets at
		 * 1440. `ml-auto` then pushed the trailing icons past the column's right
		 * edge and painted them straight over the review panel's "All files" tab,
		 * at every desktop width from 1024 up. The replica is this page's entire
		 * proof of craft; it cannot be the thing that overlaps itself.
		 */
		<div className='flex h-10 min-w-0 shrink-0 items-stretch overflow-hidden border-line border-b'>
			{CHAT_TABS.map((tab) => (
				<span
					className={cn(
						// Tabs are full-height segments flush against each other, not
						// rounded pills floating in the strip. Both states paint the same
						// surface, so what separates them is the text colour and a 2px
						// edge accent — which is why the active tab has no fill.
						// `flex-none` plus a min-width meant the `truncate` below could
						// never engage — the tab simply refused to be smaller than its
						// title. Basis sets the width it wants; shrink lets it give way.
						'relative flex h-full min-w-0 shrink basis-[9rem] items-center gap-2 px-3',
						tab.active ? 'text-ink' : 'text-muted/75',
					)}
					key={tab.title}
				>
					{tab.running ? (
						<Spinner className='size-3' />
					) : (
						<MessageIcon className='size-3 shrink-0' />
					)}
					<span className='truncate text-[11px]'>{tab.title}</span>
					{/* Top edge marks a tab an agent spawned; bottom edge marks the one
					    you are looking at. Absolute, so neither consumes row height. */}
					{tab.subAgent ? (
						<span
							aria-hidden='true'
							className='pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-accent'
						/>
					) : null}
					{tab.active ? (
						<span
							aria-hidden='true'
							className='pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-accent'
						/>
					) : null}
				</span>
			))}
			<span className='flex items-center pl-1.5'>
				<PlusIcon className='size-3 shrink-0 text-muted/60' />
			</span>
			<span className='ml-auto flex shrink-0 items-center gap-2 pr-3'>
				<BotIcon className='size-3.5 text-muted/60' />
				<HistoryIcon className='size-3.5 text-muted/60' />
			</span>
		</div>
	);
}

/** Centre column: breadcrumb, session tabs, timeline, composer. */
export function MockConversation() {
	return (
		// A query container, because what this column can hold is a question about
		// the column and not about the viewport: the same 240px conversation shows
		// up in a phone's scaled-down shell and in a desktop one, and the rows that
		// have to give something up are the same rows in both.
		<div className={cn('@container flex h-full min-w-0 flex-1 flex-col')}>
			<Header />
			<TabStrip />
			<MockTimeline entries={TIMELINE} />
			<MockComposer
				model={COMPOSER.model}
				placeholder={COMPOSER.placeholder}
				thinking={COMPOSER.thinking}
			/>
		</div>
	);
}
