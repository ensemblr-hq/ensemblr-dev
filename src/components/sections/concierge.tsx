import { FileBadge } from '@/components/app-mock/file-badge';
import { SectionHeading } from '@/components/brand/section-heading';
import { CheckIcon } from '@/components/icons/site';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

/*
 * The Concierge landed in 0.1.0-beta.15 and grew in beta.16. Every claim below
 * is read from `docs/guide/06-agents.md`'s "The Concierge" and
 * `docs/agent-control.md`'s "The Concierge's own surface" — including the two
 * clauses that sound like slogans and are the docs' own words, because both are
 * mechanisms and an adjective would be a weaker thing to print.
 *
 * Kept short on purpose. This is the newest thing on the page and the temptation
 * was to say all of it; a section nobody finishes makes no claim at all. Three
 * bullets a block, one line of prose, and the long tail stays in the app's docs.
 *
 * The lengths below are not a preference, they are the pattern's. The blocks are
 * `sections/feature-grid.tsx`'s label-plus-list, which is tuned for a short label
 * at 11px of tracked uppercase mono over a list of one-line capability items.
 * This section was first drafted carrying sentences instead — a 31-character
 * label set in caps at 0.3em, and bullets with subordinate clauses hanging off
 * em-dashes — and read as a wall two rules above the grid that wears the same
 * pattern properly. A clause that will not fit a bullet belongs in the block's
 * `note`, or in the app's docs. It does not belong in the bullet.
 */

/*
 * The two workspace names are the replica's own, from `app-mock/data.ts`. The
 * reader has just scrolled four screens of a window whose sidebar holds them.
 */
const CONTROL_ROWS = [
	{
		chip: 'Linear issue sync',
		op: 'ensemblr_start_conversation',
		verb: 'Opened a root orchestrator in',
	},
	{
		chip: 'Dock port detection',
		op: 'ensemblr_create_workspace',
		verb: 'Created',
	},
] as const;

/** What the `@` menu ranks, in the order `06-agents.md` lists them. */
const MENTIONABLE = ['project', 'workspace', 'chat', 'artifact'] as const;

/** `<root>/concierge`, which Ensemblr creates on launch and seeds. */
const HOME = [
	['MEMORY.md', 'the index — one line per memory'],
	['memory/', 'one file per durable fact, indexed for recall'],
	['artifacts/', 'reports it writes for you, opened in the panel'],
] as const;

/*
 * Read, act, contain. The middle block is why the third is not a list of
 * missing features: the Concierge changes things constantly, just never with
 * its own hands. Cut it and the set reads as a capability table with half the
 * rows struck out.
 */
const BLOCKS = [
	{
		items: [
			'Every workspace’s files, diff and review comments',
			'Any conversation replayed, tool calls included',
			'Terminals, the board, Linear, and projects with no workspace yet',
		],
		label: 'Reads all of it',
		note: null,
		tone: 'ok',
	},
	{
		items: [
			'Spawns a root orchestrator into a workspace and briefs it',
			'Creates a workspace when the work needs one',
			'Moves the board and the tracker; comments on any diff',
		],
		label: 'Acts through an agent',
		/*
		 * The peer/child distinction used to hang off the first bullet on an
		 * em-dash, phrased as taxonomy — "a peer, not a child of its own" — which
		 * is the docs' framing and answers a question no visitor asked. What the
		 * visitor is asking by this point in the section is how an agent that
		 * writes nothing gets anything done, and `06-agents.md` answers it in so
		 * many words: that agent has the write access the Concierge does not.
		 *
		 * A qualifier about the whole block belongs in `note`, not welded to one
		 * bullet, and it lands better read after all three.
		 */
		note: 'A peer that owns the task, with the write access the Concierge deliberately does not have.',
		tone: 'accent',
	},
	{
		items: [
			'Write a file in any workspace; bash is read-only',
			'Open a terminal or launch a harness',
			'Act on a workspace without naming one',
		],
		label: 'Cannot',
		note: 'Refused per tool call at the control channel, not asked for in the prompt.',
		tone: 'warning',
	},
] as const;

const BULLET_TONE = {
	accent: 'bg-accent/60',
	ok: 'bg-ok/60',
	warning: 'bg-warning/60',
} as const;

/**
 * A project, workspace, chat or artifact the Concierge named, as something you
 * can click rather than dead text.
 *
 * `align-middle` and `inline-flex` rather than a block, because the point of
 * the answer line below is that prose flows *around* these. Chips used to force
 * a line break on both sides; a mock that stacked them would be drawing the bug
 * rather than the fix.
 */
function Chip({
	accent,
	children,
	icon,
}: {
	accent?: boolean;
	children: React.ReactNode;
	icon?: React.ReactNode;
}) {
	return (
		<span
			className={cn(
				'inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-0.5 align-middle font-mono text-[10px] leading-[1.4]',
				accent
					? 'border-accent/40 bg-accent/[0.08] text-accent'
					: 'border-line bg-pane-strong/50 text-ink/85',
			)}
		>
			{icon}
			<span className='truncate'>{children}</span>
		</span>
	);
}

/**
 * A panel, not a chat tab — which is why it is a card of its own rather than
 * something inside the replica window the showcase just spent four screens on.
 *
 * A `no workspace · ~/Ensemblr/concierge` line used to sit under the header.
 * It was two true facts and no picture: the folder is spelled out in its own
 * block below, and "no workspace" is a thing to say in prose, not a status line
 * a real panel would carry. What earns space here is what the panel *shows* —
 * the vocabulary of its rows, and the chips in them.
 */
function ConciergePanel() {
	return (
		<div className='rounded-xl border border-line bg-surface/70 p-5 sm:p-6'>
			<div className='flex items-center justify-between gap-3'>
				<span className='eyebrow'>Concierge</span>
				{/* `kbd`, not a span: it is a key to press, and the element is what
				    says so to anything not looking at the page.

				    `font-key`, not `font-mono`: neither webfont draws ⌘ or ⇧ at the
				    latin subset they are loaded with, so the mono set this string in
				    two typefaces at once — Menlo modifiers beside a JetBrains Mono C.
				    A keycap is not a code token anyway; it is a picture of a key, and
				    the system font is where those three glyphs are drawn as a set.
				    The extra pixel and the tracking are what that swap costs: SF Pro's
				    modifiers are proportional and smaller on the body than a mono
				    cell's, so at 10px flush they read as specks. */}
				<kbd className='rounded-md border border-line px-1.5 py-0.5 font-key text-[11px] leading-none tracking-[0.08em] text-muted/80'>
					⌘⇧C
				</kbd>
			</div>

			<div className='mt-5 flex flex-col gap-2'>
				{CONTROL_ROWS.map((row) => (
					<div
						className='rounded-lg border border-line bg-pane/50 px-3 py-2.5'
						key={row.op}
					>
						<div className='flex items-center gap-1.5'>
							<CheckIcon className='size-3 shrink-0 text-ok' />
							{/* The op name, because these rows are the Concierge's own
							    vocabulary and the vocabulary is the point: a workspace agent
							    spawns a sub-agent that reports back to it; this spawns a root
							    orchestrator you can go open. */}
							<span className='font-mono text-[10px] text-muted/80'>
								{row.op}
							</span>
						</div>
						<p className='mt-1.5 text-[11px] leading-relaxed text-ink/80'>
							{row.verb} <Chip>{row.chip}</Chip>
						</p>
					</div>
				))}
			</div>

			{/* The answer line exists to show a chip mid-sentence, so it says one
			    thing and stops. It used to explain that an artifact opens over the
			    transcript — true, and prose about the panel written inside a picture
			    of the panel, which is the same thing wrong with the status line that
			    used to sit under the header. */}
			<p className='mt-4 text-[11px] leading-relaxed text-muted/85'>
				Both are running. Where they stand is in{' '}
				<Chip accent icon={<FileBadge badge='md' className='size-3' />}>
					artifacts/where-the-work-stands.md
				</Chip>
			</p>

			<div className='mt-5 flex flex-wrap items-center gap-1.5 border-line/70 border-t pt-4'>
				<span className='font-mono text-[11px] text-accent'>@</span>
				{MENTIONABLE.map((kind) => (
					<span
						className='rounded-md bg-pane px-2 py-1 font-mono text-[10px] text-muted'
						key={kind}
					>
						{kind}
					</span>
				))}
				<span className='text-[10px] text-faint'>ranked across the app</span>
			</div>
		</div>
	);
}

export function Concierge() {
	return (
		<section
			className='mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20'
			id='concierge'
		>
			{/*
			 * The title states the asymmetry rather than announcing the feature,
			 * because the asymmetry is the feature — "Meet the Concierge" is a
			 * heading a reader skips having learned nothing. The name goes in the
			 * eyebrow, where every other section puts it.
			 *
			 * No accented word: the page spends that device exactly twice, on the h1
			 * and the Credentials heading, and a third takes it back to meaning
			 * "this is a heading".
			 */}
			{/*
			 * Two sentences, and neither of them the title's.
			 *
			 * It ran to four lines by opening on ⌘⇧C — which the panel below prints
			 * as a `kbd` in its own header, where a shortcut belongs — then restating
			 * "sees all your work at once", which is the title one line above, then
			 * claiming the two runtimes, which is a whole section of its own further
			 * up. What is left is the part nothing else on the page says: what the
			 * panel *is*, and how a thing that writes nowhere still gets work done.
			 */}
			<SectionHeading
				eyebrow='The Concierge'
				lede='A panel that belongs to the app rather than to a workspace. It reads everywhere and changes nothing by hand: real work goes to an orchestrator it spawns into the workspace that needs it.'
				title='Every workspace at once. Write access to none of them.'
			/>

			<div className='mt-12 grid gap-12 lg:grid-cols-2 lg:gap-20'>
				<div className='flex flex-col gap-8'>
					<Reveal>
						<ConciergePanel />
					</Reveal>

					<Reveal className='flex flex-col gap-4' index={1}>
						<h3 className='eyebrow border-line/70 border-b pb-3 text-ink/70'>
							Its own folder
						</h3>
						<dl className='flex flex-col gap-3'>
							{HOME.map(([path, holds]) => (
								<div
									className='grid gap-1 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4'
									key={path}
								>
									<dt className='font-mono text-[0.6875rem] text-faint'>
										{path}
									</dt>
									<dd className='text-[0.875rem] leading-relaxed text-muted'>
										{holds}
									</dd>
								</div>
							))}
						</dl>
						{/*
						 * The memory *rule*, not the memory feature. Every agent product
						 * claims persistence; the claim worth one line is the test applied
						 * before writing — a memory that duplicates a tool call is worse
						 * than none, because the file gets trusted instead of the call
						 * being made.
						 */}
						<p className='text-[0.875rem] leading-relaxed text-muted/85'>
							Its context does not survive a clear. Its files do — and it writes
							only what no tool call could answer back.
						</p>
					</Reveal>
				</div>

				<div className='flex flex-col gap-10'>
					{BLOCKS.map((block, blockIndex) => (
						<Reveal
							className='flex flex-col gap-4'
							index={blockIndex}
							key={block.label}
						>
							<h3 className='eyebrow border-line/70 border-b pb-3 text-ink/70'>
								{block.label}
							</h3>
							<ul className='flex flex-col gap-2.5'>
								{block.items.map((item) => (
									<li
										className='flex gap-3 text-[0.875rem] leading-relaxed text-muted/85'
										key={item}
									>
										<span
											aria-hidden='true'
											className={cn(
												'mt-[0.5rem] size-1 shrink-0',
												BULLET_TONE[block.tone],
											)}
										/>
										{item}
									</li>
								))}
							</ul>
							{/* Indented to where the bullet text starts — `size-1` plus the
							    list's `gap-3` — so the note reads as belonging to the list
							    above it rather than as a stray line under the block. Set flush
							    left it starts further out than every line it qualifies. */}
							{block.note ? (
								<p className='pl-4 text-[0.8125rem] leading-relaxed text-faint'>
									{block.note}
								</p>
							) : null}
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
