'use client';

import { useMockFocus } from '@/components/app-mock/focus';
import { isRightEdgeRegion } from '@/components/app-mock/regions';
import { cn } from '@/lib/utils';

/**
 * The showcase's sticky replica, parked in the half of the section the step
 * being read is not using.
 *
 * The window is one element that slides, not two windows that swap: the reader
 * is looking straight at it when the step changes, and a cut would read as a
 * second screenshot rather than as the same window being moved out of the way.
 *
 * The two positions are the same geometry mirrored. The window keeps the whole
 * half it is given plus the `--rail` overhang on its own side — the section is
 * wider than the page's text rail and the window is what that extra width was
 * bought for — while the copy stays on the rail in both. Because both states
 * are a `translate` off the same box, nothing here reflows when the side
 * changes: the shell is not re-measured and not re-scaled, it is moved.
 *
 * Both positions are read off `--showcase-copy`, `--showcase-gap` and `--rail`,
 * which `globals.css` declares — the first two as constants, the third as a
 * `0px` this component is welcome to inherit and a live measurement inside
 * `rail-context`. So this belongs in the showcase's section, but it degrades to
 * the un-railed geometry anywhere else rather than to no geometry at all.
 *
 * `children` rather than an import of `AppWindow`, so the ~300 nodes of the
 * replica stay server-rendered. All this component contributes to the bundle is
 * which side they are drawn on.
 */
export function ShowcaseReplica({ children }: { children: React.ReactNode }) {
	const mirrored = isRightEdgeRegion(useMockFocus());

	return (
		// Stacked in the same grid cell as the steps rather than sitting in a
		// column of its own, because the two halves are no longer fixed to a
		// column each. The cell takes its height from the steps, which is the
		// range the sticky window has to travel over.
		//
		// Deaf to the pointer, because the two layers overlap: the replica is a
		// picture with nothing in it to click, and a drag that starts over it is a
		// reader trying to select the sentence behind it.
		<div className='pointer-events-none hidden xl:col-start-1 xl:row-start-1 xl:block'>
			{/*
			 * Parked just above centre rather than at the top of the viewport, so the
			 * step text beside it lands on the same optical line instead of reading
			 * as a caption under a pinned header.
			 *
			 * The offset is half the window's drawn height, which is the shell's
			 * 32.5rem times whatever the section scales it by — a little under at
			 * `xl`, all of it once the section stops growing.
			 */}
			<div className='sticky top-[calc(50vh-14.5rem)] min-[1440px]:top-[calc(50vh-16rem)]'>
				<div
					className={cn(
						// Whatever the copy is not using, on whichever side the window is
						// currently on. Written as the same two tokens `StepBody` sets its
						// own width from rather than as the 30rem they add up to, so
						// widening the copy column moves this edge with it instead of
						// quietly closing the gutter between them.
						'w-[calc(100%-var(--showcase-copy)-var(--showcase-gap)-var(--rail))]',
						// Long for a page whose other motion is measured in a couple of
						// hundred milliseconds, because this is a 36rem journey across the
						// reader's field of view and taken quickly it reads as a cut. Not
						// longer, though: the side is claimed the moment the next step's
						// copy reaches the bottom of the viewport, and the window has
						// until that copy arrives on the middle line to be out of its way
						// — which is under a second at a normal scroll, and less than that
						// when the header's own nav jumps straight to a step. The curve
						// spends most of itself decelerating, so the window leaves at once
						// and settles rather than drifting.
						'transition-transform duration-[650ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
						mirrored
							? 'translate-x-0'
							: 'translate-x-[calc(var(--showcase-copy)+var(--showcase-gap)+var(--rail))]',
					)}
				>
					{children}
				</div>
			</div>
		</div>
	);
}
