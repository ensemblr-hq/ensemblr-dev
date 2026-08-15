import { describe, expect, test } from 'bun:test';

import { fitScale } from './scaled-shell';

describe('fitScale', () => {
	test('fits the content to the room it is given', () => {
		expect(fitScale(296, 592)).toBe(0.5);
		expect(fitScale(416, 832)).toBe(0.5);
	});

	test('never scales past 1', () => {
		// The replica is a miniature of a desktop app. A column wider than the
		// shell's own width gets the shell at its own size, centred, rather than
		// a blown-up screenshot.
		expect(fitScale(1200, 832)).toBe(1);
		expect(fitScale(832, 832)).toBe(1);
	});

	test('holds at 1 for a box that has not been laid out yet', () => {
		// A `ResizeObserver` reports a zero box for an element that is still
		// `display: none` — the showcase replica below `xl`, or either shell in
		// the frame before layout. Scaling to zero there would leave the window
		// invisible until something else happened to resize it.
		expect(fitScale(0, 592)).toBe(1);
		expect(fitScale(-10, 592)).toBe(1);
		expect(fitScale(400, 0)).toBe(1);
	});
});
