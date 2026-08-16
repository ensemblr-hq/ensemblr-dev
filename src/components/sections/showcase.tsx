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
const STEPS: readonly Step[] = [
	{
		body: 'The worktree manager underneath Control. A workspace is a real git worktree, not a branch you keep switching between, so a fan-out of agents cannot collide — two of them rewrite the same file at the same time and never see each other.',
		eyebrow: 'Workspaces',
		id: 'workspaces',
		points: [
			'Start from a branch, a GitHub PR, or a Linear issue',
			'Adopt an existing branch, or cut a fresh one from the base ref',
			'Base branch fetched and fast-forwarded before the copy is made',
			'Branch names derived from your first sentence to the agent',
			// The board claim, restated for 0.1.0-beta.5. It used to describe a
			// board that only held workspaces, so its first column was empty until
			// you had already started the work — which is the half of the story a
			// reader deciding where their backlog lives most needs. Backlog now
			// carries unstarted Linear issues and unassigned open GitHub issues,
			// and the drag is what creates the workspace. The second bullet is not
			// a caveat: nothing is written back to either tracker, and a reader
			// handing an app their issue tracker buys exactly that.
			'A board whose Backlog holds Linear and GitHub issues no workspace exists for yet',
			'Drag one rightward to cut its workspace — nothing is written back to the tracker',
		],
		region: 'sidebar',
		title: 'One repo. As many streams as you have ideas.',
	},
	{
		body: 'Pi runs as a CLI over RPC; Claude Code runs in-process through the Agent SDK against the binary you already have on PATH. The wiring differs, the surface does not — both land on the same timeline with the same tools, approvals and checkpoints, and a chat tab keeps the runtime it was opened with.',
		eyebrow: 'Runtimes',
		id: 'runtimes',
		points: [
			'One timeline, tool cards, approval prompts and context gauge for both',
			'Plan mode holds an agent — and every sub-agent it spawns — to read-only tools',
			'Git-backed checkpoints restore the tree to an earlier turn',
			'Sessions persist to SQLite, with tree-structured branching',
			'Codex, Vibe and the claude TUI also run as terminal harnesses',
		],
		region: 'conversation',
		title: 'Two runtimes. One surface.',
	},
	{
		body: 'The review panel sits beside the conversation that produced the change, so reading the diff never means leaving the agent that wrote it.',
		eyebrow: 'Review',
		id: 'review',
		points: [
			'Files, Changes and Checks, remembered per workspace',
			'Diffs scoped to uncommitted work, a commit, or a whole branch',
			'Inline comments anchored to lines, with resolved ones struck through',
			'PR title and description, live check status, merge — all through gh',
			'Per-file discard, behind a confirmation',
		],
		region: 'review',
		title: 'Review the change where you made it.',
	},
	{
		body: 'A repository declares its scripts once in .ensemblr/settings.toml and every workspace gets them, pointed at its own copy of the tree.',
		eyebrow: 'Scripts & terminals',
		id: 'run',
		points: [
			'Any number of named run scripts, each with its own command and icon',
			'A fingerprinted setup script that skips an unchanged workspace',
			'Real PTY terminals that survive an app restart with clean scrollback',
			'Detected dev-server ports surface as an Open :PORT action',
			// "the app", not "the workbench". The rest of the page dropped Ensemblr's
			// own word for itself when the copy moved to "orchestrator"; this was the
			// one line of visible text still carrying it, so the page named itself
			// two different things depending on how far you had scrolled.
			'⌘R toggles the default run script from anywhere in the app',
		],
		region: 'dock',
		title: 'Run it without leaving the workspace.',
	},
];

function StepBody({ step }: { step: Step }) {
	return (
		// The half of the section this column takes is the same fact the window
		// reads to size itself, so it is one token rather than a number in each
		// file — see the note beside it in `globals.css` for why it is 26rem.
		<div className='flex flex-col gap-5 xl:w-[var(--showcase-copy)]'>
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
 * The four core stories, told against a single replica of the workbench. Each
 * step claims the window's highlight as it reaches the middle of the viewport,
 * and the window slides to the half of the section the copy is not using; below
 * `xl` the sticky layer is dropped and the hero's window stands in.
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
						<AppWindow />
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
