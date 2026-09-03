import { cn } from '@/lib/utils';

import { MockComposer } from './composer';
import { CONCIERGE_COMPOSER, CONCIERGE_TIMELINE } from './data';
import {
	CloseIcon,
	ConciergeMark,
	GripIcon,
	MaximizeIcon,
	RefreshIcon,
} from './icons';
import { MockTimeline } from './timeline';

/**
 * The Concierge panel, drawn to the app's own chrome.
 *
 * It is not a pane and the replica does not draw it as one: in the app it is a
 * floating card opened from a launcher of its own, docked to the bottom-right
 * corner and sitting *over* whatever workspace happens to be on screen. That is
 * the whole argument of the section it illustrates — one agent above every
 * workspace rather than inside any of them — so a picture that filed it beside
 * the sidebar and the review panel would be arguing the opposite.
 *
 * The title bar is the app's, in order: drag handle, the mark, the name, then
 * clear, maximize and close. `RefreshIcon` is the clear control, which the app
 * draws as Lucide's `rotate-ccw` — it starts a fresh conversation and lets the
 * old one write to memory in the background.
 *
 * Sized by its caller. As the window's overlay it takes a fixed box drawn to
 * the real panel's proportions; below `xl` the showcase drops the sticky
 * replica altogether and renders this same component standalone in the step
 * body, where it takes the column's width. One component, two placements, one
 * data source — the alternative was a bespoke card that would drift away from
 * the replica the first time either was touched.
 */
export function ConciergePanel({
	className,
	lit,
}: {
	className?: string;
	/**
	 * Wears the accent hairline and bloom `Region` gives a focused pane.
	 *
	 * Only the overlay placement asks for it. No pane claims `'concierge'`, so
	 * the step that focuses it dims all four and lights nothing — this is what
	 * puts the highlight back on the one thing the step is about. The standalone
	 * placement below `xl` has nothing around it to be lit against.
	 */
	lit?: boolean;
}) {
	return (
		// `app-chrome` again, though the overlay placement already sits inside it.
		// Re-pointing the same tokens costs nothing there and is what makes the
		// standalone placement — which has only the page's palette around it —
		// draw in the product's colours rather than the site's.
		<div
			className={cn(
				'app-chrome @container flex flex-col overflow-hidden rounded-xl border border-line bg-canvas',
				// A card above a window, so a heavier drop than anything inside the
				// shell: it has to read as floating over the panes rather than as
				// another one of them.
				'shadow-[0_24px_50px_-18px_oklch(0_0_0/0.9),0_4px_14px_-8px_oklch(0_0_0/0.7)]',
				// The same hairline-plus-bloom `Region` draws, moved onto the border
				// rather than an inset pseudo-element: this card has a border of its
				// own to tint, where a pane has none.
				lit &&
					'border-accent/70 shadow-[0_24px_50px_-18px_oklch(0_0_0/0.9),0_0_34px_-6px_oklch(0.75_0.123_221/0.45)]',
				className,
			)}
		>
			<div className='flex h-9 shrink-0 items-center gap-1.5 border-line border-b px-2'>
				<GripIcon className='size-3 shrink-0 text-muted/50' />
				<ConciergeMark className='size-3.5 shrink-0 text-muted' />
				<span className='min-w-0 flex-1 truncate font-medium text-[11px] text-ink'>
					Concierge
				</span>
				<span className='flex shrink-0 items-center gap-1.5 text-muted/60'>
					<RefreshIcon className='size-3' />
					<MaximizeIcon className='size-3' />
					<CloseIcon className='size-3' />
				</span>
			</div>

			<MockTimeline entries={CONCIERGE_TIMELINE} />

			<MockComposer
				model={CONCIERGE_COMPOSER.model}
				placeholder={CONCIERGE_COMPOSER.placeholder}
				thinking={CONCIERGE_COMPOSER.thinking}
			/>
		</div>
	);
}
