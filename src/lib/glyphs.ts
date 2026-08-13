/**
 * The 5x7 bitmap font the Ensemblr wordmark is drawn from — the same glyph
 * table the desktop app uses for its welcome screen. Every grid, rule and
 * backdrop on this site is laid out on these units, so the mark and the space
 * around it share one coordinate system.
 */

const GLYPHS: Record<string, readonly string[]> = {
	B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
	E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
	L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
	M: ['10001', '11011', '10101', '10001', '10001', '10001', '10001'],
	N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
	R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
	S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
};

export const WORD = 'ENSEMBLR';
export const GLYPH_WIDTH = 5;
export const GLYPH_HEIGHT = 7;
export const LETTER_GAP = 1;
export const TOTAL_WIDTH =
	WORD.length * GLYPH_WIDTH + (WORD.length - 1) * LETTER_GAP;
export const PIXEL_INSET = 0.1;
export const PIXEL_SIZE = 1 - PIXEL_INSET * 2;

export interface PixelRect {
	readonly x: number;
	readonly y: number;
}

/**
 * Lit-pixel positions for a single letter, in its own 5x7 coordinate space.
 * Returns an empty list for a character the table does not carry.
 *
 * Split out from the wordmark builder because the app icon and the favicon draw
 * the `E` on its own: one bitmap table, so the mark in the browser tab is the
 * same five-by-seven grid as the mark on the page rather than a hand-traced
 * lookalike that drifts the next time the font changes.
 */
export function buildGlyphPixels(character: string): PixelRect[] {
	const glyph = GLYPHS[character];
	if (!glyph) {
		return [];
	}
	const pixels: PixelRect[] = [];
	for (let row = 0; row < glyph.length; row += 1) {
		const rowData = glyph[row];
		for (let col = 0; col < rowData.length; col += 1) {
			if (rowData[col] === '1') {
				pixels.push({ x: col, y: row });
			}
		}
	}
	return pixels;
}

/**
 * Lit-pixel positions for the wordmark. Derived purely from the bitmaps above,
 * so server and client agree byte for byte — random flicker timing is applied
 * separately, after mount.
 */
export function buildWordmarkPixels(): PixelRect[] {
	const pixels: PixelRect[] = [];
	for (let letterIndex = 0; letterIndex < WORD.length; letterIndex += 1) {
		const baseX = letterIndex * (GLYPH_WIDTH + LETTER_GAP);
		for (const pixel of buildGlyphPixels(WORD[letterIndex])) {
			pixels.push({ x: baseX + pixel.x, y: pixel.y });
		}
	}
	return pixels;
}
