'use client';

import { useEffect, useState } from 'react';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * The reduced-motion preference, or `null` while it is still unknown.
 *
 * Two things had to be true at once, and the third state is what buys both.
 *
 * The preference is a live media query, so reading `matchMedia(...).matches`
 * once is not enough: a reader who turns it on from System Settings while the
 * page is open gets no change event, and every JS-driven animation keeps
 * running until they reload. The CSS-driven motion on this page already stops
 * immediately — the flicker should not be the one surface that ignores them.
 * Hence the subscription.
 *
 * But the server cannot know the preference, so the first client render has to
 * agree with the server's and claim nothing. Returning `false` there was the
 * bug: consumers declare their animation effect *after* this hook's, both flush
 * together, and the consumer therefore read `false` before the correction
 * landed — attaching the animation, committing, and only tearing it down on the
 * next pass. `useEffect` is passive, so that intermediate commit can paint. A
 * reader who asked for no motion got a frame of exactly what they asked to be
 * spared, and in the wordmark's case a whole RGB-split glitch, because its
 * first burst fires immediately.
 *
 * `null` says "not yet known" rather than guessing "no". Consumers return early
 * on it and attach nothing until the answer is real.
 */
export function useReducedMotion(): boolean | null {
	const [reduced, setReduced] = useState<boolean | null>(null);

	useEffect(() => {
		const query = window.matchMedia(REDUCED_MOTION_QUERY);
		const sync = () => setReduced(query.matches);
		sync();
		query.addEventListener('change', sync);
		return () => query.removeEventListener('change', sync);
	}, []);

	return reduced;
}
