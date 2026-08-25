import { Spinner, StatusDot } from '@/components/app-mock/primitives';
import { SectionHeading } from '@/components/brand/section-heading';
import { CheckIcon } from '@/components/icons/site';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

const SUB_AGENTS = [
	{ label: 'audit the reducer', state: 'done' },
	{ label: 'port the tests', state: 'running' },
	{ label: 'sweep the i18n keys', state: 'running' },
] as const;

const BEATS = ['delegate', 'wait', 'evaluate', 'integrate'] as const;

const TOOLS = [
	'ensemblr_start_conversation',
	'ensemblr_wait_for_agents',
	'ensemblr_launch_harness',
	'ensemblr_get_workspace_diff',
	'ensemblr_add_diff_comments',
	'ensemblr_ask_user_question',
	'ensemblr_set_workspace_status',
] as const;

/*
 * The last row is the one the app README leads its orchestration paragraph
 * with, and it was missing here: agent work stops at In Review, in code rather
 * than in a prompt. It is the strongest thing this section can say — every
 * other guardrail limits how much an agent can do, and that one settles who
 * decides when the work is finished. A reader handing an agent their repo is
 * buying exactly that guarantee.
 */
const GUARDRAILS = [
	['Permission mode', 'read-only · approval required · workspace-trusted'],
	['Delegation depth', 'shallow — sub-agents never delegate onward'],
	['Spawn limits', 'per-session quota and rate cap'],
	[
		'Waits',
		'bounded — the caller blocks until its children report or the window expires; a blocked child can wake it',
	],
	[
		'Issue writes',
		'withheld from sub-agents — and agent work stops at In Review, enforced in code',
	],
	/*
	 * 0.1.0-beta.5. The row above says what an agent may not do to a ticket; this
	 * one says why it does anything to it at all, which is the half that was
	 * missing. `docs/agent-control.md` is blunt about it — the tools had been
	 * there since Linear landed, and for as long as nothing told the agent there
	 * *was* a ticket, every transition happened because someone asked for one by
	 * hand, "which is the same as it not happening".
	 *
	 * "cut to the calls that caller may make" is the load-bearing clause and not
	 * a flourish: the block is built per caller, so a sub-agent's variant asks it
	 * to name the state in its report and a planning agent's keeps the read and
	 * the comment. A brief that named a call the caller would be refused would be
	 * the guardrails leaking back out as instructions.
	 */
	[
		'Linked issue',
		'a workspace made from one names it in every agent’s brief, cut to the calls that caller may make',
	],
	/*
	 * 0.1.0-beta.6, from `docs/guide/06-agents.md` and CONTEXT.md's own entry for
	 * the term at `30b2d945`. The two rows above say what an agent is *told*; this
	 * one says what it can look up, which is what the chip row on the other side
	 * of this section has been silently assuming since it was written. Seven tool
	 * names are a vocabulary an agent either knows or guesses at, and until this
	 * shipped the honest answer was that it guessed.
	 *
	 * "Agent skill" is the app's own word for it — CONTEXT.md warns off "prompt",
	 * "plugin" and "playbook", the last because the playbook is the text an agent
	 * always carries and this is the reference it reads on demand. The distinction
	 * is the reason the row can claim both: a full key reference, and almost no
	 * context spent until a task needs one.
	 *
	 * The second clause is a trust claim standing in a guardrail list on purpose.
	 * A reader who has just been told the app hands every agent a skill wants to
	 * know where that skill was installed, and the answer — inside the bundle,
	 * not in your repository and not in `~/.claude` or `~/.pi` — is the same
	 * answer the Credentials section gives about the agent binary itself.
	 */
	[
		'Agent skill',
		'handed to every agent it starts — the tool surface, the worktree model and every settings.toml key, read on demand and shipped inside the app, so nothing is written into your repository or your ~/.claude',
	],
	/*
	 * 0.1.0-beta.15's own containment story, and a different one from the six
	 * rows above: those all gate an agent that has a workspace. The Concierge —
	 * `docs/agent-control.md`'s "The Concierge's own surface" and
	 * `docs/guide/06-agents.md`'s "The Concierge" — does not, so it is held by
	 * refusal rather than by mode. `bash` is read-only and a file write outside
	 * its own folder is refused outright; the only way it changes anything is to
	 * spawn an orchestrator into the workspace that needs it and brief it, and
	 * that orchestrator is a peer, never the Concierge's own sub-agent.
	 */
	[
		'The Concierge',
		'reads across every workspace, project and terminal; writes nothing outside its own folder — real change goes through an orchestrator it spawns into the workspace that needs it',
	],
] as const;

/*
 * The delegation fan, drawn outward from the orchestrator: down to the bus at
 * x=150, then each half of the bus away from that centre, then down each leg.
 * Direction is load-bearing — a dash travels along its sub-path the way the
 * sub-path is drawn, so drawing the bus as one left-to-right run sent the dashes
 * on the left half inward, against the flow of work they stand for. Two halves
 * from the centre out makes both sides read as delegation leaving the
 * orchestrator, and mirrors their dash phase for free (SVG restarts the dash
 * pattern at every sub-path).
 */
const CONNECTOR_PATH =
	'M150 0V18 M150 18H50 M150 18H250 M50 18V40 M150 18V40 M250 18V40';

function Connector() {
	return (
		<svg
			aria-hidden='true'
			className='h-10 w-full text-muted/55'
			fill='none'
			preserveAspectRatio='none'
			viewBox='0 0 300 40'
			xmlns='http://www.w3.org/2000/svg'
		>
			{/* `non-scaling-stroke` keeps every leg a hairline despite the
			    `preserveAspectRatio: none` stretch that fits the card's width.
			    This static tree is the whole diagram under reduced motion — the
			    accent pass over it is a 10-on-46-off dash, so at the /30 this was
			    drawn at, a reader who asks for no animation was left with four
			    disconnected specks where the delegation fan should be. */}
			<path
				d={CONNECTOR_PATH}
				stroke='currentColor'
				strokeWidth='1'
				vectorEffect='non-scaling-stroke'
			/>
			<path
				className='animate-[dash_2.6s_linear_infinite] motion-reduce:animate-none'
				d={CONNECTOR_PATH}
				stroke='var(--accent)'
				strokeDasharray='10 46'
				strokeWidth='1'
				vectorEffect='non-scaling-stroke'
			/>
		</svg>
	);
}

function ControlDiagram() {
	return (
		<div className='rounded-xl border border-line bg-surface/70 p-5 sm:p-6'>
			<div className='flex items-center justify-between'>
				<span className='eyebrow'>Ensemblr Control</span>
				<span className='rounded-md border border-warning/40 px-1.5 py-0.5 font-mono text-[10px] text-warning'>
					approval required
				</span>
			</div>

			<div className='mt-5 rounded-lg border border-accent/40 bg-accent/[0.06] px-3 py-2.5'>
				<div className='flex items-center gap-2'>
					<StatusDot state='active' />
					<span className='font-mono text-[11px] text-ink'>orchestrator</span>
					<span className='ml-auto font-mono text-[10px] text-muted/80'>
						claude-opus-5
					</span>
				</div>
			</div>

			<Connector />

			<div className='grid grid-cols-3 gap-2'>
				{SUB_AGENTS.map((agent) => (
					<div
						className='rounded-lg border border-line bg-pane/50 px-2.5 py-2'
						key={agent.label}
					>
						<div className='flex items-center gap-1.5'>
							{agent.state === 'running' ? (
								<Spinner />
							) : (
								<CheckIcon className='size-3 shrink-0 text-ok' />
							)}
							<span className='font-mono text-[10px] text-muted/80'>
								sub-agent
							</span>
						</div>
						<p className='mt-1.5 text-[11px] leading-snug text-ink/80'>
							{agent.label}
						</p>
					</div>
				))}
			</div>

			{/*
			 * Wraps. Unwrapped, the four beats and their arrows have a min-content of
			 * 324px, which the card's padding pushes to 366 — 16px wider than the
			 * column a 390px phone can give it, so the whole section broke the page's
			 * right gutter while every neighbouring section held it. The row is a
			 * sequence, not a table: on two lines it still reads left to right.
			 */}
			<div className='mt-5 flex flex-wrap items-center gap-x-1.5 gap-y-2 border-line/70 border-t pt-4'>
				{/* The arrow leads its beat rather than trailing the one before it, so
				    a wrap starts the next line with "→ integrate" instead of leaving a
				    bare arrow hanging off the end of the first. */}
				{BEATS.map((beat, index) => (
					<span className='flex items-center gap-1.5' key={beat}>
						{/* /55, not /45 and certainly not the /30 this started at. The
						    arrow is what makes four chips a sequence rather than four
						    tags — a graphical mark carrying meaning, so 3:1 is the floor,
						    and /45 measured 2.57:1 on `pane`. /55 lands at 3.18:1 there
						    and stays well below the chips it separates. */}
						{index > 0 ? (
							<span aria-hidden='true' className='text-muted/55'>
								→
							</span>
						) : null}
						<span
							className={cn(
								'rounded-md px-2 py-1 font-mono text-[10px]',
								index === 1
									? 'bg-accent/15 text-accent'
									: // Full `muted`, not /70: these chips sit on `pane`, which is
										// two steps lighter than the canvas the rest of the muted
										// ramp was tuned against, and the same alpha that clears
										// 4.5:1 down there lands at 3.9:1 up here.
										'bg-pane text-muted',
							)}
						>
							{beat}
						</span>
					</span>
				))}
			</div>
		</div>
	);
}

export function Orchestration() {
	return (
		<section
			className='mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20'
			id='control'
		>
			{/*
			 * The guardrails sit under the diagram rather than under the lede, and
			 * the column stopped being sticky when they moved.
			 *
			 * Both changes are the same fix. This section is shorter than a
			 * viewport, so the sticky card never had anywhere to travel — all it
			 * did was pin a short card to the top of a column stretched to a much
			 * taller neighbour, leaving a third of the right-hand side empty. With
			 * the constraints moved across, the two columns land within a line of
			 * each other and the facts about what an agent may do sit beside the
			 * picture of it doing them, which is where a reader looks for them.
			 */}
			<div className='grid gap-12 lg:grid-cols-2 lg:gap-20'>
				<div className='flex flex-col gap-8'>
					{/*
					 * The title no longer restates the h1 — the hero took "agents that
					 * drive the app" when Control moved to the front of the page, and a
					 * section that repeats the headline it sits directly under reads as
					 * the reader having lost their place. This one escalates instead,
					 * and it is the app's own framing: `docs/agent-control.md` opens on
					 * turning "a place you run one agent into a place a team of agents
					 * runs itself".
					 */}
					{/*
					 * The parity claim names the two chat-surface runtimes and stops
					 * there. It used to read "Claude Code and any MCP-capable harness
					 * reach the same operations", which is the one caller class it is
					 * false for: `CHAT_TAB_ONLY_OPS` — `setName`, `setSummary`,
					 * `askUserQuestion`, `exitPlanMode` — are refused to any caller that
					 * drives no native chat tab, and a terminal harness is exactly that.
					 * The sentence was advertising `askUserQuestion` two clauses earlier.
					 *
					 * "Cannot drift" is not the loose half of that claim and survives: the
					 * Pi extension registers the complement of `SUBAGENT_WITHHELD_OPS` and
					 * a parity test compares its copy against the shared set.
					 */}
					<SectionHeading
						eyebrow='Ensemblr Control'
						lede='A permission-gated control surface lets an agent drive the app itself — spawn sub-agents into their own tabs and block until they report, launch a harness, run a script, read the diff and leave review comments on it, ask you a multiple-choice question, move the workspace across the board. Pi reaches it through a shipped extension, Claude Code through an embedded MCP server, and a parity test keeps the two tool lists from drifting apart.'
						title='Not a place you run one agent. A place a team of agents runs itself.'
					/>

					<Reveal className='flex flex-wrap gap-1.5' index={3}>
						{TOOLS.map((tool) => (
							<span
								className='rounded-md border border-line bg-surface/60 px-2 py-1 font-mono text-[10px] text-muted/80'
								key={tool}
							>
								{tool}
							</span>
						))}
					</Reveal>
				</div>

				<div className='flex flex-col gap-8'>
					<Reveal>
						<ControlDiagram />
					</Reveal>

					<dl className='flex flex-col gap-3'>
						{GUARDRAILS.map(([term, detail], index) => (
							<Reveal
								className='grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4'
								index={index}
								key={term}
							>
								<dt className='font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-faint'>
									{term}
								</dt>
								<dd className='text-[0.875rem] leading-relaxed text-muted'>
									{detail}
								</dd>
							</Reveal>
						))}
					</dl>
				</div>
			</div>
		</section>
	);
}
