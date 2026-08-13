'use client';

import { useEffect, useState } from 'react';

import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import {
	buildWordmarkPixels,
	GLYPH_HEIGHT,
	PIXEL_INSET,
	PIXEL_SIZE,
	TOTAL_WIDTH,
} from '@/lib/glyphs';
import { cn } from '@/lib/utils';

const FLICKER_CYCLE_MIN = 12;
const FLICKER_CYCLE_RANGE = 8;
const FLICKER_DELAY_RANGE = 16;
const BURST_INTERVAL_MIN_MS = 9000;
const BURST_INTERVAL_RANGE_MS = 8000;
const BURST_DURATION_MIN_MS = 260;
const BURST_DURATION_RANGE_MS = 200;

interface FlickerTiming {
	delay: number;
	duration: number;
}

/**
 * Positions are deterministic (see `@/lib/glyphs`), so they are identical on
 * the server and the client and never trigger a hydration mismatch. Random
 * flicker timing is intentionally NOT computed here.
 */
const PIXELS = buildWordmarkPixels();

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
export function EnsemblrWordmark({
	className,
	static: isStatic = false,
}: {
	className?: string;
	/** Suppress flicker and glitch entirely — for sizes too small to carry them. */
	static?: boolean;
}) {
	const [glitching, setGlitching] = useState(false);
	const [flicker, setFlicker] = useState<FlickerTiming[] | null>(null);
	const reducedMotion = useReducedMotion();

	useEffect(() => {
		// `null` means the preference has not been read yet. It matters more here
		// than in the pixel field: `runBurst()` below fires immediately rather than
		// after an interval, so acting on a guessed `false` painted the whole
		// RGB-split glitch in front of a reader who asked for no motion.
		if (reducedMotion === null) {
			return;
		}

		if (isStatic || reducedMotion) {
			// Clear anything a previous run attached, so turning the preference on
			// mid-session actually stops the mark rather than waiting for a reload.
			setFlicker(null);
			setGlitching(false);
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
	}, [isStatic, reducedMotion]);

	return (
		<span
			aria-label='Ensemblr'
			/* `w-fit` matters: without it a stretching flex parent widens the span,
			   and the SVG then letterboxes its content instead of sitting flush. */
			className={cn(
				'relative inline-flex h-16 w-fit text-ink sm:h-20',
				className,
			)}
			role='img'
			style={{ aspectRatio: `${TOTAL_WIDTH} / ${GLYPH_HEIGHT}` }}
		>
			<GhostLayer color='var(--signal)' offset={-3} visible={glitching} />
			<GhostLayer color='var(--accent)' offset={3} visible={glitching} />
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
