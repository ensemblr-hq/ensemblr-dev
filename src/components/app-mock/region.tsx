'use client';

import { cn } from '@/lib/utils';

import { useMockFocus } from './focus';
import type { MockRegion } from './regions';

/**
 * Wraps one region of the replica so the showcase can light it while dimming
 * the rest. With no region claimed, everything renders at full strength.
 *
 * Alone in its own file because it is the only part of the replica that needs
 * a client boundary. Sitting in `primitives.tsx` it dragged `Spinner` and
 * `StatusDot` across that boundary with it — and `sections/orchestration.tsx`,
 * a server component that wants nothing but a CSS spinner, ended up importing
 * a module whose transitive graph reaches `motion/react` through `./focus`.
 */
export function Region({
	children,
	className,
	region,
}: {
	children: React.ReactNode;
	className?: string;
	region: MockRegion;
}) {
	const focus = useMockFocus();
	const dimmed = focus !== null && focus !== region;
	const lit = focus === region;

	return (
		<div
			className={cn(
				'relative transition-[opacity,filter] duration-500 ease-out motion-reduce:transition-none',
				// Dimmed, not extinguished. The unfocused panes still have to read as
				// a working app around the one being talked about — drop them far
				// enough that the window goes black and the replica stops being
				// evidence of anything.
				dimmed && 'opacity-[0.62] brightness-[0.82]',
				className,
			)}
		>
			{children}
			{/*
			 * Held a couple of pixels off the region's edge and rounded, rather than
			 * hugging it. A hairline flush with the window's outer edge runs into
			 * the frame's own corner radius, where the parent's `overflow-hidden`
			 * clips it — and a clipped round corner reads as a square one poking out
			 * of the window. Sitting inside the radius, it never meets the clip.
			 */}
			<span
				aria-hidden='true'
				className={cn(
					'pointer-events-none absolute inset-[2px] z-10 rounded-md transition-opacity duration-500 motion-reduce:transition-none',
					// An inner accent hairline plus a soft bloom off the same edge, so
					// the lit pane looks illuminated rather than outlined.
					'shadow-[0_0_0_1px_var(--accent)_inset,0_0_28px_-4px_oklch(0.75_0.123_221/0.35)_inset]',
					lit ? 'opacity-100' : 'opacity-0',
				)}
			/>
		</div>
	);
}
