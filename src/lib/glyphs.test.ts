import { describe, expect, test } from 'bun:test';

import {
	buildGlyphPixels,
	buildWordmarkPixels,
	GLYPH_HEIGHT,
	GLYPH_WIDTH,
	LETTER_GAP,
	TOTAL_WIDTH,
	WORD,
} from './glyphs';

describe('buildGlyphPixels', () => {
	test('stays inside one 5x7 cell', () => {
		for (const pixel of buildGlyphPixels('E')) {
			expect(pixel.x).toBeGreaterThanOrEqual(0);
			expect(pixel.x).toBeLessThan(GLYPH_WIDTH);
			expect(pixel.y).toBeGreaterThanOrEqual(0);
			expect(pixel.y).toBeLessThan(GLYPH_HEIGHT);
		}
	});

	/*
	 * The favicon is drawn from this and nothing else, and it is generated
	 * ahead of time rather than at build — an empty list there would produce a
	 * plain dark tile that still passes every other check.
	 */
	test('lights the letters the marks are drawn from', () => {
		for (const character of new Set(WORD)) {
			expect(buildGlyphPixels(character).length).toBeGreaterThan(0);
		}
	});

	test('returns nothing for a character the table does not carry', () => {
		expect(buildGlyphPixels('Q')).toEqual([]);
		expect(buildGlyphPixels('')).toEqual([]);
	});

	test('agrees with the wordmark it composes', () => {
		const first = buildGlyphPixels(WORD[0]);
		const wordmark = buildWordmarkPixels().filter(
			(pixel) => pixel.x < GLYPH_WIDTH,
		);
		expect(wordmark).toEqual(first);
	});
});

describe('buildWordmarkPixels', () => {
	/*
	 * The load-bearing property. The wordmark and the OG image are drawn from
	 * this list on the server, and the animated mark redraws it on the client —
	 * so anything non-deterministic here is a hydration mismatch, which is why
	 * flicker timing is generated separately after mount.
	 */
	test('is deterministic across calls', () => {
		expect(buildWordmarkPixels()).toEqual(buildWordmarkPixels());
	});

	test('stays inside the viewBox both consumers set', () => {
		for (const pixel of buildWordmarkPixels()) {
			expect(pixel.x).toBeGreaterThanOrEqual(0);
			expect(pixel.x).toBeLessThan(TOTAL_WIDTH);
			expect(pixel.y).toBeGreaterThanOrEqual(0);
			expect(pixel.y).toBeLessThan(GLYPH_HEIGHT);
		}
	});

	/*
	 * `buildWordmarkPixels` skips a letter with no glyph rather than throwing, so
	 * a missing entry in the table would silently render "ENSEMLR" — legible
	 * enough to survive review and wrong on every page. This is the check that a
	 * dropped glyph cannot pass.
	 */
	test('lights at least one pixel in every letter cell', () => {
		const pixels = buildWordmarkPixels();
		for (let index = 0; index < WORD.length; index += 1) {
			const start = index * (GLYPH_WIDTH + LETTER_GAP);
			const lit = pixels.filter(
				(pixel) => pixel.x >= start && pixel.x < start + GLYPH_WIDTH,
			);
			expect(lit.length).toBeGreaterThan(0);
		}
	});

	test('leaves the gap between letters empty', () => {
		const pixels = buildWordmarkPixels();
		for (let index = 0; index < WORD.length - 1; index += 1) {
			const gap = index * (GLYPH_WIDTH + LETTER_GAP) + GLYPH_WIDTH;
			expect(pixels.some((pixel) => pixel.x === gap)).toBe(false);
		}
	});

	test('never lights the same cell twice', () => {
		const pixels = buildWordmarkPixels();
		const keys = new Set(pixels.map((pixel) => `${pixel.x}-${pixel.y}`));
		expect(keys.size).toBe(pixels.length);
	});
});

describe('TOTAL_WIDTH', () => {
	test('is the glyphs plus the gaps between them', () => {
		expect(TOTAL_WIDTH).toBe(
			WORD.length * GLYPH_WIDTH + (WORD.length - 1) * LETTER_GAP,
		);
	});
});
