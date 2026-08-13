'use client';

import { domAnimation, LazyMotion } from 'motion/react';

/**
 * Every animated surface uses the `m` component rather than `motion`, so the
 * full feature bundle never ships. `strict` turns an accidental `motion.*`
 * import into an error instead of a silent ~30kb regression.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
	return (
		<LazyMotion features={domAnimation} strict>
			{children}
		</LazyMotion>
	);
}
