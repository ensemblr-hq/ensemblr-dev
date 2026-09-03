'use client';

import { cn } from '@/lib/utils';

import { useMockFocus } from './focus';

/**
 * Holds the Concierge panel out of the replica until the step that describes
 * it, then brings it in lit.
 *
 * The panel is a floating card the reader opens from a launcher; a replica that
 * drew it at every scroll position would be showing it open through three
 * steps that are not about it, over panes those steps are trying to point at.
 * So it arrives when its step claims the focus, which is the same signal
 * `Region` reads to dim everything else — the panel rising as the app recedes,
 * one beat rather than two.
 *
 * It is *lit* as well as revealed, with the accent hairline and bloom `Region`
 * gives a focused pane. No pane claims `'concierge'`, so without this the step
 * would dim all four and light nothing: the highlight the section runs on every
 * other step would simply be missing on the one that needs it most.
 *
 * Under `prefers-reduced-motion` the transition drops and the panel appears at
 * its final position, which is the same contract the rest of the replica keeps.
 */
export function ConciergeOverlay({ children }: { children: React.ReactNode }) {
	const focus = useMockFocus();
	const shown = focus === 'concierge';

	return (
		<div
			// Hidden from assistive technology as well as from view. The window
			// around it is a `role='img'` whose label already says the panel is
			// there, and a card announced through three steps that are not about it
			// is the same wrong picture for a reader who cannot see it.
			aria-hidden={!shown}
			className={cn(
				'absolute inset-0 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none',
				shown
					? 'translate-y-0 scale-100 opacity-100'
					: // Down and back a little, so it reads as a panel opening from the
						// corner it docks to rather than as a card fading in place.
						'pointer-events-none translate-y-4 scale-[0.97] opacity-0',
			)}
		>
			{children}
		</div>
	);
}
