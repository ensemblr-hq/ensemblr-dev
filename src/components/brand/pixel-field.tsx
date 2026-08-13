'use client';

import { useEffect, useState } from 'react';

import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { cn } from '@/lib/utils';

const COLUMNS = 110;
const ROWS = 46;
const PIXEL_INSET = 0.14;
const PIXEL_SIZE = 1 - PIXEL_INSET * 2;
const FLICKER_MIN_S = 9;
const FLICKER_RANGE_S = 11;
const FLICKER_DELAY_RANGE_S = 14;

/** Centre of the field, in grid units — behind the headline, not the corner. */
const ORIGIN_X = COLUMNS / 2;
const ORIGIN_Y = ROWS * 0.34;
/** Radius, in grid units, at which density has fallen to nothing. */
const FIELD_RADIUS = COLUMNS * 0.58;
/** Fraction of the radius carrying the densest band. */
const PEAK_RADIUS = 0.68;
/** How quickly density falls away on either side of that band. */
const BAND_WIDTH = 0.42;
/** Share of cells lit at the band's crest. Low: this is a texture, not a pattern. */
const PEAK_DENSITY = 0.085;
/** Only this share of lit pixels ever flickers, so the field sits still. */
const FLICKER_SHARE = 0.14;

interface FieldPixel {
	readonly x: number;
	readonly y: number;
	readonly opacity: number;
	readonly flickers: boolean;
}

/**
 * Cheap deterministic hash. The lit-pixel layout must be byte-identical on the
 * server and the client, so `Math.random()` cannot appear anywhere in it — the
 * same constraint the wordmark documents in `brand/wordmark.tsx`.
 *
 * It is integer-only on purpose. The obvious `sin`-based hash is not portable:
 * Node and the browser disagree in the last few bits of a double, which is
 * enough to make React report a hydration mismatch on the rendered opacity.
 */
function hash(x: number, y: number): number {
	let value = Math.imul(x + 1, 0x27d4_eb2d) ^ Math.imul(y + 1, 0x1656_67b1);
	value = Math.imul(value ^ (value >>> 15), 0x2f1c_e68b);
	value ^= value >>> 13;
	return (value >>> 0) / 0x1_0000_0000;
}

/**
 * Density peaks in a *band* at `PEAK_RADIUS` and falls away on both sides, so
 * the field opens out around the headline instead of piling up behind it. A
 * centre-peaked falloff puts its densest pixels exactly where the largest type
 * sits, and no amount of lowering the opacity rescues that — the backdrop and
 * the words end up competing for the same square inch.
 *
 * Brightness follows the same band, which is what makes it read as one mass
 * dissolving outwards rather than as grain sprayed over a rectangle: a
 * uniformly-lit scatter looks like sensor noise however it is distributed.
 *
 * Cells are stretched 2:1 on x before the distance is taken, because a grid
 * cell is square but the field it fills is wide — measuring in raw cells would
 * put the horizon much closer above than beside.
 */
function buildPixels(): FieldPixel[] {
	const pixels: FieldPixel[] = [];
	for (let y = 0; y < ROWS; y += 1) {
		for (let x = 0; x < COLUMNS; x += 1) {
			const dx = (x - ORIGIN_X) / 2;
			const dy = y - ORIGIN_Y;
			const distance = Math.sqrt(dx * dx + dy * dy) / FIELD_RADIUS;
			const offBand = (distance - PEAK_RADIUS) / BAND_WIDTH;
			const band = Math.max(0, 1 - offBand * offBand);
			if (hash(x, y) > band * PEAK_DENSITY) {
				continue;
			}
			const opacity =
				Math.round((0.08 + band * 0.16 + hash(y, x) * 0.08) * 100) / 100;
			pixels.push({
				flickers: hash(x + COLUMNS, y + ROWS) < FLICKER_SHARE,
				opacity,
				x,
				y,
			});
		}
	}
	return pixels;
}

const PIXELS = buildPixels();

interface FlickerTiming {
	readonly delay: number;
	readonly duration: number;
}

function buildFlickerTimings(): FlickerTiming[] {
	return PIXELS.map(() => ({
		delay: Math.random() * FLICKER_DELAY_RANGE_S,
		duration: FLICKER_MIN_S + Math.random() * FLICKER_RANGE_S,
	}));
}

/**
 * Ambient backdrop drawn on the same unit grid as the wordmark, so the brand
 * mark and the space behind it share one coordinate system. Static under
 * reduced motion.
 */
export function PixelField({ className }: { className?: string }) {
	const [flicker, setFlicker] = useState<FlickerTiming[] | null>(null);
	const reducedMotion = useReducedMotion();

	useEffect(() => {
		// `null` means the preference has not been read yet — this effect and the
		// hook's own are registered in the same component and flush together, so on
		// the first pass the answer genuinely is not in yet. Attaching the flicker
		// on a guessed `false` and removing it a render later paints one frame of
		// it in front of a reader who asked for none.
		if (reducedMotion === null) {
			return;
		}
		// The hook subscribes rather than sampling, so turning the preference on
		// mid-session stops the field here without waiting for a reload.
		setFlicker(reducedMotion ? null : buildFlickerTimings());
	}, [reducedMotion]);

	return (
		<svg
			aria-hidden='true'
			className={cn(
				'pointer-events-none absolute inset-0 h-full w-full text-accent',
				className,
			)}
			preserveAspectRatio='xMidYMin slice'
			shapeRendering='crispEdges'
			/*
			 * A gentle mask only. The radial density falloff in `buildPixels` is
			 * what dissolves the field now, so this is left to soften the very
			 * edge — a tight mask on top of a falloff clips the mass twice and
			 * puts a visible ellipse back into the backdrop.
			 *
			 * The stop positions are what changed. The fade used to begin at 45%
			 * of a radius wider than the viewport itself, so it had barely started
			 * by the time it ran off the side of the page: the band's outermost
			 * pixels survived at close to full strength out in the far corners,
			 * where there is nothing near them to belong to. Half a dozen isolated
			 * squares in an otherwise empty corner read as dirt on the screen, not
			 * as the edge of a field. Starting the fade at 22% and finishing it
			 * inside the box lets the mass thin to nothing while it is still dense
			 * enough to read as a mass.
			 */
			style={{
				maskImage:
					'radial-gradient(ellipse 62% 70% at 50% 28%, black 22%, transparent 88%)',
			}}
			viewBox={`0 0 ${COLUMNS} ${ROWS}`}
			xmlns='http://www.w3.org/2000/svg'
		>
			{PIXELS.map((pixel, index) => (
				<rect
					fill='currentColor'
					height={PIXEL_SIZE}
					key={`${pixel.x}-${pixel.y}`}
					opacity={pixel.opacity}
					style={
						flicker && pixel.flickers
							? ({
									animation: `ensemblr-field-flicker ${flicker[index].duration}s linear ${flicker[index].delay}s infinite`,
									'--pixel-opacity': pixel.opacity,
								} as React.CSSProperties)
							: undefined
					}
					width={PIXEL_SIZE}
					x={pixel.x + PIXEL_INSET}
					y={pixel.y + PIXEL_INSET}
				/>
			))}
		</svg>
	);
}
