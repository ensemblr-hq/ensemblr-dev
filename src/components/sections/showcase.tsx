import { ConciergeOverlay } from '@/components/app-mock/concierge-overlay';
import { ConciergePanel } from '@/components/app-mock/concierge-panel';
import { FocusStep, MockFocusProvider } from '@/components/app-mock/focus';
import type { MockRegion } from '@/components/app-mock/regions';
import { isRightEdgeRegion } from '@/components/app-mock/regions';
import { AppWindow } from '@/components/app-mock/window';
import { SectionHeading } from '@/components/brand/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

import { ShowcaseReplica } from './showcase-replica';

interface Step {
	readonly id: string;
	readonly region: MockRegion;
	readonly eyebrow: string;
	readonly title: React.ReactNode;
	readonly body: string;
	readonly points: readonly string[];
}

/*
 * These four titles used to each accent one word, and so did the hero, the
 * orchestration heading and the trust heading — seven headings running the same
 * device in a row. Emphasis that fires every time is not emphasis; by the third
 * heading the accent had stopped meaning "read this word" and started meaning
 * "this is a heading". It is spent twice on the page now: the h1, and the trust
 * heading beside the button.
 */
/*
 * Five bullets a step, not seven, and none over twelve words.
 *
 * Three rows went in the cut that took the page to a readable length, and each
 * was dropped for a reason rather than for size. The base branch being fetched
 * and fast-forwarded is implementation the reader never has to think about;
 * "sessions persist to SQLite" is the Credentials section's sentence one screen
 * down, and this page says a fact once; the review panel's three tabs are drawn
 * in the replica beside the step that names them.
 */
const STEPS: readonly Step[] = [
	{
		body: 'A workspace is a real git worktree, not a branch you keep switching between. Two agents can rewrite the same file at once and never see each other.',
		eyebrow: 'Workspaces',
		id: 'workspaces',
		points: [
			'Start from a branch, a GitHub PR, or a Linear issue',
			'Adopt an existing branch, or cut one from the base ref',
			'Branch names derived from your first sentence to the agent',
			// The board's first column holds work that has no workspace yet —
			// unstarted Linear issues and unassigned open GitHub issues — which is
			// the half a reader deciding where their backlog lives most needs. The
			// second bullet is not a caveat: nothing is written back to either
			// tracker, and a reader handing an app their issue tracker buys that.
			'A Backlog holding Linear and GitHub issues no workspace exists for',
			'Drag one rightward to cut its workspace; nothing is written back',
		],
		region: 'sidebar',
		title: 'One repo. As many streams as you have ideas.',
	},
	{
		body: 'Pi runs as a CLI over RPC; Claude Code runs through the Agent SDK against the binary you already have. The wiring differs, the surface does not.',
		eyebrow: 'Runtimes',
		id: 'runtimes',
		points: [
			'One timeline, tool cards, approvals and context gauge for both',
			'Plan mode holds an agent and every sub-agent to read-only tools',
			'Git-backed checkpoints restore the tree to an earlier turn',
			// `docs/guide/06-agents.md`'s "When a turn fails". It belongs to this
			// step because the step's claim is the surface, and a turn that dies is
			// part of it — the one place the two runtimes used to stop agreeing,
			// each leaking its provider's English under the last tool card. The
			// clause that matters is the second: the row offers only what its
			// failure class earns, rather than a retry that would be refused again.
			'A failed turn offers only the recoveries its failure class earns',
			'Codex, Vibe and the claude TUI run as terminal harnesses',
		],
		region: 'conversation',
		title: 'Two runtimes. One surface.',
	},
	{
		body: 'The review panel sits beside the conversation that produced the change. Reading the diff never means leaving the agent that wrote it.',
		eyebrow: 'Review',
		id: 'review',
		points: [
			'Diffs scoped to uncommitted work, a commit, or a whole branch',
			// `docs/guide/08-reviewing-changes.md`. It belongs to this step rather
			// than the long tail because it is the step's own argument made
			// mechanical: the panel sits beside the conversation, and this is the
			// two-click path between them. A diff has no file of its own, so its
			// patch is written out as a document and the chip points at that —
			// which is why it says "attach a diff" and not "paste a diff".
			'Attach a file, a folder or a diff to the chat beside it',
			'Inline comments anchored to lines, resolved ones struck through',
			// The coalescing clause is what keeps this from being an annoyance: the
			// pull is per workspace on a rolling window, so a pass that files ten
			// comments takes focus once and a resolve batch that closed nothing
			// takes it never.
			'An agent’s comment pass pulls Checks forward once, however many it files',
			'PR title, description, live check status and merge, all through gh',
		],
		region: 'review',
		title: 'Review the change where you made it.',
	},
	/*
	 * The Concierge, which used to be a section of its own two rules further
	 * down and had no picture at all — the newest thing in the app, and the only
	 * claim on the page the reader had to take on trust.
	 *
	 * It replaces the "Scripts & terminals" step rather than joining it. That
	 * step described a pane the replica draws, which is the best kind of step
	 * this section has; it also described the least surprising thing in the
	 * product, and every neighbouring tool runs scripts in a terminal. Its rows
	 * live on in `FEATURE_GROUPS`, which still reaches JSON-LD.
	 *
	 * The `points` are what survived the section: the three "Cannot" claims,
	 * which are the most distinctive thing it said, plus the one that explains
	 * how something that writes nothing gets anything done.
	 */
	{
		body: 'A panel that belongs to the app rather than to a workspace. It reads everywhere and changes nothing by hand: real work goes to an orchestrator it spawns.',
		eyebrow: 'The Concierge',
		id: 'concierge',
		points: [
			'Reads every workspace’s files, diff, review comments and terminals',
			'Replays any conversation, tool calls included',
			'Spawns a root orchestrator into a workspace, and briefs it',
			'Cannot write a file in any workspace; its bash is read-only',
			'Cannot open a terminal or launch a harness',
			'Cannot act on a workspace without naming one',
		],
		region: 'concierge',
		title: 'Every workspace at once. Write access to none.',
	},
];

function StepBody({ step }: { step: Step }) {
	return (
		// The half of the section this column takes is the same fact the window
		// reads to size itself, so it is one token rather than a number in each
		// file — see the note beside it in `globals.css` for why it is 26rem.
		<div className='flex flex-col gap-5 xl:w-[var(--showcase-copy)]'>
			{/*
			 * Below `xl` the sticky replica is dropped, so the panel drawn over it
			 * would be invisible on a phone — the newest feature in the app, on the
			 * device most visitors arrive with. The same component renders here
			 * instead, at the column's own width, which is what the standalone card
			 * this step replaced already was.
			 *
			 * First in the column rather than after the bullets: it is the picture
			 * the copy is about, and the three "Cannot" rows read differently once
			 * you have seen the thing they are about.
			 */}
			{step.id === 'concierge' ? (
				<ConciergePanel className='h-[22rem] w-full xl:hidden' />
			) : null}
			{/* `step`, not `title`. These four beats are subordinate to the section
			    they sit in, so the heading and the body drop together — one size
			    knob rather than a heading scale a caller could mismatch its lede to. */}
			<SectionHeading
				eyebrow={step.eyebrow}
				lede={step.body}
				size='step'
				title={step.title}
			/>
			<ul className='flex flex-col gap-2.5'>
				{step.points.map((point, index) => (
					<Reveal as='li' index={index} key={point}>
						<span className='flex gap-3 text-[0.875rem] leading-relaxed text-muted/85'>
							<span
								aria-hidden='true'
								className='mt-[0.5rem] size-1 shrink-0 bg-muted/40'
							/>
							{point}
						</span>
					</Reveal>
				))}
			</ul>
		</div>
	);
}

/**
 * The four core stories, told against a single replica of the app. Each step
 * claims the window's highlight as it reaches the middle of the viewport, and
 * the window slides to the half of the section the copy is not using; below
 * `xl` the sticky layer is dropped and the hero's window stands in.
 *
 * The last step is the Concierge, and it is the one that is not a pane. Its
 * region is claimed by no pane at all, so `Region` dims the whole shell and the
 * panel drawn over it is what stays lit — the panel arriving and the app
 * receding, out of the rule that was already there.
 */
export function Showcase() {
	return (
		<MockFocusProvider>
			{/* Wider than the rest of the page on purpose: the replica needs room to
			    keep three panes legible at something close to real proportions. */}
			{/* The `lg:pt-8` that used to sit here was borrowed from the hero's
			    bottom padding, back when this section followed the hero directly.
			    Control sits between them now, behind a rule of its own, so the
			    section takes the page's ordinary section padding at the top. */}
			{/* `rail-context` is the query container `--rail` is measured against —
			    see the note beside it in `globals.css`. */}
			<section className='rail-context mx-auto w-full max-w-[92rem] px-5 py-16 sm:px-8 sm:py-20 lg:pb-24'>
				{/*
				 * `xl`, not `lg`. Two halves arrive here only once the second one can
				 * hold a window: at `lg` the replica's half was 480px, less than the
				 * sidebar and review panel take between them, and the shell it was
				 * given had no conversation left in it at all. The hero's compact
				 * window covers everything below this breakpoint.
				 *
				 * One cell, two layers, rather than a column each: the window and the
				 * copy swap sides partway down, and neither of them can be pinned to a
				 * grid column if they are going to trade places. The steps layer is
				 * second and the replica takes no pointer events, so the copy is what
				 * the reader's cursor finds anywhere over the row.
				 */}
				<div className='xl:grid'>
					<ShowcaseReplica>
						{/*
						 * The panel is in the markup at every scroll position and only
						 * *shown* at its own step — see `ConciergeOverlay`. It is a card
						 * the reader opens from a launcher, so drawing it open through
						 * three steps that are not about it would be the wrong picture of
						 * the app, and over panes those steps are pointing at.
						 *
						 * `Region` does the other half: no pane claims `'concierge'`, so
						 * focusing it dims all four at once — the app receding as the
						 * panel arrives, out of a rule that was already there.
						 *
						 * Proportions are the app's. The real panel docks at 416×512 CSS
						 * pixels, 16px in from the right edge and 96 up from the bottom;
						 * against this 832×520 shell, drawn at the scale a desktop window
						 * would be, that is a card a little over half the shell's height
						 * inset from the bottom-right corner.
						 */}
						<AppWindow
							overlay={
								<ConciergeOverlay>
									<ConciergePanel
										className='absolute right-3 bottom-14 h-[19.5rem] w-64'
										lit
									/>
								</ConciergeOverlay>
							}
						/>
					</ShowcaseReplica>

					{/*
					 * Each step is a screen tall and centres its own content, rather
					 * than a fixed gap between blocks. That paces the story — one step
					 * holds the middle band of the viewport at a time, which is what
					 * lets exactly one region stay lit — and it keeps the text on the
					 * replica's optical centre line at every scroll position, instead
					 * of only at the two where a hand-set gap happens to land.
					 */}
					<div className='flex flex-col gap-20 xl:col-start-1 xl:row-start-1 xl:gap-0'>
						{/*
						 * The id sits on the step block itself, not on an inner wrapper.
						 * On the wrapper the anchor inherited no scroll margin, so a nav
						 * link parked the step's text flush under the sticky header and
						 * skipped the half-viewport of lead-in above it — which reads as
						 * landing past the section rather than on it.
						 */}
						{STEPS.map((step) => (
							<FocusStep
								className={cn(
									'scroll-mt-24 xl:flex xl:min-h-[92vh] xl:items-center',
									/*
									 * Which side the copy takes is a fact about the region it
									 * describes, not a hand-assigned alternation: the two steps
									 * about the shell's right-hand column sit on the right, so
									 * the pane being lit is always the one nearest the sentence
									 * lighting it. The window reads the same rule and moves to
									 * the other half.
									 *
									 * The padding puts the column back on the page's rail.
									 * Everything else on the page is `max-w-7xl`; this section
									 * is `max-w-[92rem]`, so without it these headings would
									 * start up to 6rem outside every other heading — the one
									 * section that breaks the rail, and the one the reader
									 * scrolls longest. The window keeps that 6rem on its own
									 * side rather than giving it back.
									 */
									isRightEdgeRegion(step.region)
										? 'xl:justify-end xl:pr-[var(--rail)]'
										: 'xl:pl-[var(--rail)]',
								)}
								id={step.id}
								key={step.id}
								region={step.region}
							>
								<StepBody step={step} />
							</FocusStep>
						))}
					</div>
				</div>
			</section>
		</MockFocusProvider>
	);
}
