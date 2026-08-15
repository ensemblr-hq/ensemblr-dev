'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * The scale that fits `intrinsic` pixels of content into `available` pixels of
 * room. Never above 1: the replica is a miniature of a desktop app, and blown
 * up past its own size it reads as a screenshot someone zoomed rather than as
 * a window.
 *
 * Guards both inputs because a `ResizeObserver` reports a zero-sized box for an
 * element that has no box at all: the showcase replica is `display: none` below
 * `xl` and is observed the whole time it is hidden. Scaling by zero would leave
 * nothing to draw, so 1 stands for "not measured yet" — the observer fires
 * again with a real box the moment the element is shown.
 */
export function fitScale(available: number, intrinsic: number): number {
	if (available <= 0 || intrinsic <= 0) {
		return 1;
	}

	return Math.min(1, available / intrinsic);
}

interface ScaledShellProps {
	children: React.ReactNode;
	className?: string;
	/**
	 * What the scale is before the observer has measured anything, in the engines
	 * that cannot compute the fit in CSS — the value their server-rendered HTML
	 * paints with, and the one a reader without JavaScript keeps. Kept under the
	 * fit at every width the shell is used at, because too small draws a smaller
	 * window centred in its box and too large draws one with its edges cut off.
	 */
	fallbackScale: number;
	/** Intrinsic height of the content, in CSS pixels. */
	height: number;
	/**
	 * The content's own corner radius, as a CSS length. The box takes the same
	 * radius scaled by the same factor, so a drop shadow set on it lands on the
	 * corners the reader can see rather than a squarer set outside them.
	 */
	radius?: string;
	/** Intrinsic width of the content, in CSS pixels. */
	width: number;
}

/**
 * Fits a fixed-size replica into whatever width it is given by scaling the
 * whole thing, rather than by taking panes away from it.
 *
 * The alternative — letting the shell reflow — is what this replaces. Three
 * panes, two of them fixed-width, left the conversation column whatever was
 * over: around 190px on a 1250px viewport and nothing at all below 1060, at
 * which point the composer painted itself across the review panel. A miniature
 * of an app has no reason to reflow like the app does; it only has to stay in
 * proportion, and a transform keeps it in proportion at every width.
 *
 * The box is sized by `aspect-ratio` off the same two numbers the transform
 * uses, so its height is correct before the observer has run and stays correct
 * through every resize. Nothing here can shift the page.
 */
export function ScaledShell({
	children,
	className,
	fallbackScale,
	height,
	radius = '0.75rem',
	width,
}: ScaledShellProps) {
	const host = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const node = host.current;
		if (!node) {
			return undefined;
		}

		// Written straight to the DOM as a custom property rather than held in
		// state: this fires on every frame of a window drag, and React does not
		// need to re-render a static tree of ~300 nodes to move one number.
		const observer = new ResizeObserver((entries) => {
			const entry = entries.at(0);
			if (!entry) {
				return;
			}

			node.style.setProperty(
				'--mock-scale',
				String(fitScale(entry.contentRect.width, width)),
			);
		});

		observer.observe(node);
		return () => observer.disconnect();
	}, [width]);

	return (
		// Clipped, because a transform leaves the layout box the size it was: at
		// half scale the content still occupies its full intrinsic width in flow
		// and hangs a couple of hundred pixels off both sides of this box. Left
		// unclipped that is scrollable overflow on whatever ancestor happens to
		// clip first — a horizontal scrollbar on the document, or a section that
		// can be scrolled sideways by a stray `scrollIntoView`.
		//
		// The clip is why anything painted *outside* the content — its drop
		// shadow — belongs on this element instead, which is what `className`
		// carries in from the caller.
		<div
			className={cn(
				'mock-fit relative mx-auto w-full overflow-hidden',
				className,
			)}
			ref={host}
			style={
				{
					aspectRatio: `${width} / ${height}`,
					borderRadius: `calc(${radius} * var(--mock-scale))`,
					// Both are read by `.mock-fit` in `globals.css`, which resolves the
					// first-paint scale from them — see the note there. `cqw` needs a
					// query container to measure, which is what the container type is
					// for; nothing here queries it.
					'--mock-fallback': fallbackScale,
					'--mock-w': `${width}px`,
					containerType: 'inline-size',
					maxWidth: `${width}px`,
				} as React.CSSProperties
			}
		>
			{/*
			 * Centred by half-offsets rather than by `inset-0 m-auto`, which is the
			 * trick that reads better and is wrong here: auto margins split *free*
			 * space, and an element wider than its container has none to split, so
			 * the spec sends it to the left edge. Scaling about its centre then
			 * pushed the drawn window a third of its own width to the right of the
			 * box that was supposed to hold it.
			 *
			 * The translate is by half the element's own untransformed size, which
			 * lands the scaled content exactly over the box at the fitted scale and
			 * centred in it at any smaller one.
			 */}
			<div
				className='absolute top-1/2 left-1/2'
				style={{
					height: `${height}px`,
					transform: 'translate(-50%, -50%) scale(var(--mock-scale))',
					width: `${width}px`,
				}}
			>
				{children}
			</div>
		</div>
	);
}
