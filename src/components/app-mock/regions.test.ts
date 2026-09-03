import { describe, expect, test } from 'bun:test';

import { isRightEdgeRegion } from './regions';

describe('isRightEdgeRegion', () => {
	test('claims the regions stacked in the shell right-hand column', () => {
		expect(isRightEdgeRegion('review')).toBe(true);
		expect(isRightEdgeRegion('dock')).toBe(true);
	});

	/*
	 * Not by analogy with the two above it: the real Concierge panel docks to the
	 * bottom-right corner, and the replica draws it there. A step told with the
	 * window on the right of the page would put the panel as far from its own
	 * sentence as the layout allows.
	 *
	 * `'dock'` stays a `MockRegion` and stays in this list even though no step
	 * focuses it any more — the pane is still drawn and still wrapped. What
	 * changed is which region a step asks for, not which regions exist.
	 */
	test('claims the Concierge, which docks to the same corner', () => {
		expect(isRightEdgeRegion('concierge')).toBe(true);
	});

	test('leaves the rest of the shell alone', () => {
		expect(isRightEdgeRegion('sidebar')).toBe(false);
		expect(isRightEdgeRegion('conversation')).toBe(false);
	});

	test('reads no focus as the opening side', () => {
		// The showcase asks this before any step has claimed the highlight — the
		// server render, and every scroll position above the section. Answering
		// true there would ship HTML with the window already mirrored and slide it
		// back the moment the first step arrived.
		expect(isRightEdgeRegion(null)).toBe(false);
	});
});
