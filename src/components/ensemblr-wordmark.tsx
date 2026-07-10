'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

const GLYPHS: Record<string, readonly string[]> = {
	B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
	E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
	L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
	M: ['10001', '11011', '10101', '10001', '10001', '10001', '10001'],
	N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
	R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
	S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
};

const WORD = 'ENSEMBLR';
const GLYPH_WIDTH = 5;
const GLYPH_HEIGHT = 7;
const LETTER_GAP = 1;
const TOTAL_WIDTH = WORD.length * GLYPH_WIDTH + (WORD.length - 1) * LETTER_GAP;
const PIXEL_INSET = 0.1;
const PIXEL_SIZE = 1 - PIXEL_INSET * 2;

const FLICKER_CYCLE_MIN = 12;
const FLICKER_CYCLE_RANGE = 8;
const FLICKER_DELAY_RANGE = 16;
const BURST_INTERVAL_MIN_MS = 9000;
const BURST_INTERVAL_RANGE_MS = 8000;
const BURST_DURATION_MIN_MS = 260;
const BURST_DURATION_RANGE_MS = 200;

interface PixelRect {
	x: number;
	y: number;
}

interface FlickerTiming {
	delay: number;
	duration: number;
}

/**
 * Deterministic pixel positions derived from the glyph bitmaps. These are
 * identical on the server and client, so they never trigger a hydration
 * mismatch. Random flicker timing is intentionally NOT computed here.
 */
function buildPixels(): PixelRect[] {
	const pixels: PixelRect[] = [];
	for (let letterIndex = 0; letterIndex < WORD.length; letterIndex += 1) {
		const glyph = GLYPHS[WORD[letterIndex]];
		if (!glyph) {
			continue;
		}
		const baseX = letterIndex * (GLYPH_WIDTH + LETTER_GAP);
		for (let row = 0; row < glyph.length; row += 1) {
			const rowData = glyph[row];
			for (let col = 0; col < rowData.length; col += 1) {
				if (rowData[col] === '1') {
					pixels.push({ x: baseX + col, y: row });
				}
			}
		}
	}
	return pixels;
}

const PIXELS = buildPixels();

/**
 * Per-pixel flicker timing uses `Math.random()`, so it must be generated on the
 * client after mount — never at module scope — or SSR and client markup differ.
 */
function buildFlickerTimings(): FlickerTiming[] {
	return PIXELS.map(() => ({
		delay: Math.random() * FLICKER_DELAY_RANGE,
		duration: FLICKER_CYCLE_MIN + Math.random() * FLICKER_CYCLE_RANGE,
	}));
}

const KEYFRAMES = `
@keyframes ensemblr-wordmark-flicker {
  0%, 100% { opacity: 1; }
  48% { opacity: 1; }
  49% { opacity: 0.15; }
  50% { opacity: 0.85; }
  51% { opacity: 1; }
  76% { opacity: 1; }
  77% { opacity: 0.4; }
  78% { opacity: 1; }
}
`;

interface GhostLayerProps {
	color: string;
	offset: number;
	visible: boolean;
}

function GhostLayer({ color, offset, visible }: GhostLayerProps) {
	return (
		<svg
			aria-hidden='true'
			className='pointer-events-none absolute inset-0 h-full w-full'
			shapeRendering='crispEdges'
			style={{
				color,
				opacity: visible ? 0.75 : 0,
				transform: `translateX(${visible ? offset : 0}px)`,
				transition:
					'opacity 70ms ease-out, transform 70ms cubic-bezier(.2,.7,.2,1)',
			}}
			viewBox={`0 0 ${TOTAL_WIDTH} ${GLYPH_HEIGHT}`}
			xmlns='http://www.w3.org/2000/svg'
		>
			{PIXELS.map((pixel) => (
				<rect
					fill='currentColor'
					height={PIXEL_SIZE}
					key={`${pixel.x}-${pixel.y}`}
					width={PIXEL_SIZE}
					x={pixel.x + PIXEL_INSET}
					y={pixel.y + PIXEL_INSET}
				/>
			))}
		</svg>
	);
}

/**
 * Dot-matrix Ensemblr wordmark: per-pixel CSS flicker plus a periodic,
 * JS-timed RGB-split glitch burst (pink + cyan ghosts). Fully static when the
 * user prefers reduced motion.
 */
export function EnsemblrWordmark({ className }: { className?: string }) {
	const [glitching, setGlitching] = useState(false);
	const [flicker, setFlicker] = useState<FlickerTiming[] | null>(null);

	useEffect(() => {
		if (
			typeof window === 'undefined' ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			return;
		}

		// Attach per-pixel flicker timing only after mount, so the server-rendered
		// markup (no `animation` style) matches the first client render exactly.
		setFlicker(buildFlickerTimings());

		let cancelled = false;
		let burstTimeoutId: number | undefined;
		let releaseTimeoutId: number | undefined;

		const runBurst = () => {
			if (cancelled) {
				return;
			}
			setGlitching(true);
			const duration =
				BURST_DURATION_MIN_MS + Math.random() * BURST_DURATION_RANGE_MS;
			releaseTimeoutId = window.setTimeout(() => {
				if (cancelled) {
					return;
				}
				setGlitching(false);
				scheduleNextBurst();
			}, duration);
		};

		const scheduleNextBurst = () => {
			if (cancelled) {
				return;
			}
			const wait =
				BURST_INTERVAL_MIN_MS + Math.random() * BURST_INTERVAL_RANGE_MS;
			burstTimeoutId = window.setTimeout(runBurst, wait);
		};

		runBurst();

		return () => {
			cancelled = true;
			if (burstTimeoutId !== undefined) {
				window.clearTimeout(burstTimeoutId);
			}
			if (releaseTimeoutId !== undefined) {
				window.clearTimeout(releaseTimeoutId);
			}
		};
	}, []);

	return (
		<span
			aria-label='Ensemblr'
			className={cn(
				'relative inline-flex h-16 text-foreground sm:h-20',
				className,
			)}
			role='img'
			style={{ aspectRatio: `${TOTAL_WIDTH} / ${GLYPH_HEIGHT}` }}
		>
			<style>{KEYFRAMES}</style>
			<GhostLayer color='#ff2e63' offset={-3} visible={glitching} />
			<GhostLayer color='#22d3ee' offset={3} visible={glitching} />
			<svg
				aria-hidden='true'
				className='relative h-full w-full'
				shapeRendering='crispEdges'
				style={{
					transform: glitching ? 'translateX(1px) skewX(-2deg)' : 'none',
					transition: 'transform 70ms cubic-bezier(.2,.7,.2,1)',
				}}
				viewBox={`0 0 ${TOTAL_WIDTH} ${GLYPH_HEIGHT}`}
				xmlns='http://www.w3.org/2000/svg'
			>
				<title>Ensemblr</title>
				{PIXELS.map((pixel, index) => (
					<rect
						fill='currentColor'
						height={PIXEL_SIZE}
						key={`${pixel.x}-${pixel.y}`}
						style={
							flicker
								? {
										animation: `ensemblr-wordmark-flicker ${flicker[index].duration}s linear ${flicker[index].delay}s infinite`,
									}
								: undefined
						}
						width={PIXEL_SIZE}
						x={pixel.x + PIXEL_INSET}
						y={pixel.y + PIXEL_INSET}
					/>
				))}
			</svg>
		</span>
	);
}
