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
	'ensemblr_set_workspace_status',
] as const;

const GUARDRAILS = [
	['Permission mode', 'read-only · approval required · workspace-trusted'],
	['Delegation depth', 'shallow — sub-agents never delegate onward'],
	['Spawn limits', 'per-session quota and rate cap'],
	['Waits', 'bounded, and a blocked child can wake its caller'],
] as const;

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
				d='M150 0V18 M50 18H250 M50 18V40 M150 18V40 M250 18V40'
				stroke='currentColor'
				strokeWidth='1'
				vectorEffect='non-scaling-stroke'
			/>
			<path
				className='animate-[dash_2.6s_linear_infinite] motion-reduce:animate-none'
				d='M150 0V18 M50 18H250 M50 18V40 M150 18V40 M250 18V40'
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
						{/* /45, not /30. The arrow is what makes four chips a sequence
						    rather than four tags, and at /30 it sat near 1.9:1 — present
						    in the DOM and effectively absent on the screen. */}
						{index > 0 ? (
							<span aria-hidden='true' className='text-muted/45'>
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
					<SectionHeading
						eyebrow='Ensemblr Control'
						lede='A permission-gated control surface lets an agent drive the app itself — spawn a conversation, launch a harness, run a script, open a diff, leave a review comment, move the workspace across the board. Pi reaches it through a shipped extension; Claude Code and MCP harnesses through an embedded MCP server.'
						title='Agents that drive the app, not just the code.'
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
