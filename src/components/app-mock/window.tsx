import { cn } from '@/lib/utils';

import { MockConversation } from './conversation';
import { MockDock } from './dock';
import { Region } from './region';
import { MockReviewPanel } from './review-panel';
import { ScaledShell } from './scaled-shell';
import { MockSidebar } from './sidebar';

/**
 * The two sizes the replica is drawn at, in CSS pixels, with the pane widths
 * that go with each.
 *
 * Both are the whole app — sidebar, conversation, review, dock. They differ in
 * how much room each pane gets, not in which panes exist, because every pane
 * carries part of the argument: the workspace list is the isolation claim, the
 * conversation is the agent, the diff is the review, the dock is the running
 * project. Drop one and the picture stops being the product.
 *
 * `compact` is the size the shell still reads at when it is scaled down to a
 * phone. Its conversation column is 296px against `full`'s 312 — narrow, but
 * every row inside was checked at that width rather than left to reflow.
 */
const SHELL = {
	compact: {
		dock: 'h-[9rem]',
		/** Fallback until the observer measures: fits a 320px-wide phone. */
		fallbackScale: 0.45,
		height: 370,
		review: 'w-[13rem]',
		sidebar: 'w-[9rem]',
		width: 592,
	},
	full: {
		dock: 'h-[11rem]',
		/** Fallback until the observer measures: the showcase column at `lg`. */
		fallbackScale: 0.6,
		height: 520,
		review: 'w-[19rem]',
		sidebar: undefined,
		width: 832,
	},
} as const;

/**
 * A DOM replica of the Ensemblr workbench, laid out from the running app: no
 * native title bar, traffic lights in the sidebar, and the script dock stacked
 * under the review panel rather than running the full width.
 *
 * `app-chrome` is what makes it read as the product rather than as a diagram —
 * it re-points every colour token inside this subtree at the app's own dark
 * cut, which sits three steps lighter than the page. The window is lit by the
 * product's palette; the page keeps its own.
 *
 * Regions are wrapped so the showcase can move a highlight through the shell
 * as the reader scrolls, rather than cutting between screenshots.
 *
 * The shell is drawn at a fixed size and scaled to fit — see `ScaledShell`.
 * It used to be fluid, and the responsive rules that came with that hid the
 * sidebar below `lg` and the review panel below `md`, so a phone was shown the
 * conversation alone: a chat box, the one picture that makes this look like
 * every other agent wrapper. Showing two panes instead of three was the same
 * mistake in the other direction. The window scales now, whole.
 */
interface AppWindowProps {
	className?: string;
	/**
	 * Drawn over the shell rather than beside it: the Concierge panel, which
	 * floats above whatever workspace is open instead of taking a column.
	 *
	 * Absolutely positioned by the caller, so the shell's own layout is
	 * untouched when nothing is passed — the hero renders no overlay at all and
	 * gets the same three-pane box it always did.
	 */
	overlay?: React.ReactNode;
	/**
	 * `full` is the desktop shell, drawn at the width the showcase column
	 * reaches on a large screen so it lands there at 1:1.
	 *
	 * `compact` is the same shell at the smallest size its panes still hold,
	 * for the hero — where the window has the page's own text column to fit
	 * into and nothing else on the row to borrow width from.
	 */
	variant?: 'full' | 'compact';
}

export function AppWindow({
	className,
	overlay,
	variant = 'full',
}: AppWindowProps) {
	const shell = SHELL[variant];

	return (
		<ScaledShell
			// A wide, very soft drop: the thing that reads as "a window above the
			// page" rather than "a bordered box drawn on it". It sits on the box
			// rather than on the shell because the box is what does the clipping,
			// and because a shadow is cast by a window at the size it is seen — it
			// has no business shrinking with the miniature's own scale.
			className={cn(
				'shadow-[0_40px_90px_-30px_oklch(0_0_0/0.85),0_8px_24px_-12px_oklch(0_0_0/0.6)]',
				className,
			)}
			fallbackScale={shell.fallbackScale}
			height={shell.height}
			width={shell.width}
		>
			<div
				// The entire description of the replica for a reader who is not looking
				// at it, so it names what is actually drawn — including the panel,
				// when there is one. "app", not "workbench": the same word the visible
				// copy settled on.
				aria-label={
					overlay
						? 'The Ensemblr app with the Concierge panel open over it: project sidebar, agent conversation, review panel, and script dock.'
						: 'The Ensemblr app: project sidebar, agent conversation, review panel, and script dock.'
				}
				className={cn(
					// `relative` for the overlay alone: it is the box the Concierge
					// panel hangs its corner off, and the `overflow-hidden` beside it
					// clips the panel to the window frame — which is correct, because a
					// panel spilling past the window's rounded corner would be a picture
					// of something the app cannot do.
					'app-chrome relative flex h-full w-full overflow-hidden rounded-xl bg-canvas',
					// The frame's own marks — an edge and a hairline of light along the
					// top — stay inside the scale, because they are part of the window
					// being drawn rather than of the light it sits in.
					'ring-1 ring-line/80 ring-inset',
					'shadow-[0_1px_0_0_oklch(1_0_0/0.06)_inset]',
				)}
				role='img'
			>
				<Region className='block shrink-0' region='sidebar'>
					<MockSidebar className={shell.sidebar} />
				</Region>

				<Region className='flex min-w-0 flex-1' region='conversation'>
					<MockConversation />
				</Region>

				{/* A query container for the same reason the conversation is one: the
				    review panel and the dock share this column's width, and what they
				    can hold is a question about that width alone. */}
				<div
					className={cn(
						'@container flex shrink-0 flex-col border-line border-l',
						shell.review,
					)}
				>
					<Region className='flex min-h-0 flex-1 flex-col' region='review'>
						<MockReviewPanel />
					</Region>
					<Region region='dock'>
						<MockDock className={shell.dock} />
					</Region>
				</div>

				{/* Last in the tree and above `Region`'s `z-10` lit edge, so the panel
				    sits over a dimmed pane rather than under its highlight. Positioning
				    only — whether the overlay is visible at a given scroll position is
				    the overlay's own business. */}
				{overlay ? (
					<div className='pointer-events-none absolute inset-0 z-20'>
						{overlay}
					</div>
				) : null}
			</div>
		</ScaledShell>
	);
}
