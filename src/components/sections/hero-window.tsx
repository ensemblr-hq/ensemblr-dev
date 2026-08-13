'use client';

import { m, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

/**
 * Tilts the replica back and lays it flat as it scrolls up into the viewport,
 * so the window arrives as an object rather than a picture.
 *
 * Reduced motion is honoured in CSS (`.scrub-tilt` in `globals.css`) rather
 * than by branching here. The server cannot know the reader's preference, so a
 * JS branch would render one tree on the server and a different one on the
 * client — which is a hydration mismatch, not an optimisation.
 */
export function HeroWindow({ children }: { children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		offset: ['start end', 'end center'],
		target: ref,
	});
	const rotateX = useTransform(scrollYProgress, [0, 1], [13, 0]);
	const scale = useTransform(scrollYProgress, [0, 1], [0.93, 1]);
	const opacity = useTransform(scrollYProgress, [0, 0.35], [0.55, 1]);

	return (
		<div ref={ref} style={{ perspective: '1800px' }}>
			<m.div
				className='scrub-tilt'
				style={{ opacity, rotateX, scale, transformOrigin: 'center top' }}
			>
				{children}
			</m.div>
		</div>
	);
}
