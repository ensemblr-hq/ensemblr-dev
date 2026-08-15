import { describe, expect, test } from 'bun:test';

import { isRightEdgeRegion } from './regions';

describe('isRightEdgeRegion', () => {
	test('claims the two regions stacked in the shell right-hand column', () => {
		expect(isRightEdgeRegion('review')).toBe(true);
		expect(isRightEdgeRegion('dock')).toBe(true);
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
