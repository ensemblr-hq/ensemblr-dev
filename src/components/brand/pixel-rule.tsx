import { cn } from '@/lib/utils';

/**
 * Section divider drawn as a dotted run on the brand's unit grid, fading out at
 * both ends so it reads as part of the pixel field rather than a hairline.
 *
 * Drawn in the *ink* family at low alpha, not in `--border`. A border-coloured
 * dotted 1px line on this canvas measures as a difference of 0.16 lightness
 * spread over a third of a row of pixels, which is to say it is not there: the
 * seams it was meant to mark read as nothing but the gap between two blocks of
 * padding, and the chapters it was meant to separate run together anyway.
 *
 * Two paint layers and no `mask-image`, which is the whole of the Safari fix.
 *
 * The fade used to be a CSS mask, and a mask promotes its element to a
 * composited layer of its own. That is survivable on a normal box and is not
 * survivable on this one: the layer is 1px tall and as wide as the page, so
 * Safari kept a raster of it and reused that raster at the wrong scale — the
 * line came back on screen as ~26px dashes 60px apart, the 2px/4px pattern
 * stretched by about sixteen. Rendered fresh at any width it was always
 * correct, which is what says it is the cached layer and not the gradient.
 *
 * So the ends are *painted over* rather than masked out: the top layer is a
 * canvas-coloured veil, opaque at each edge and gone by the same 14%/86% the
 * mask used to reach. It costs the coupling stated below and buys an element
 * that never leaves its parent's layer, and so has nothing to keep stale.
 */

/** The dots themselves, as a 6px tile: 2px lit, 4px of gap. */
const DOT_TILE =
	'linear-gradient(to right, oklch(0.71 0.008 75 / 32%) 0 2px, transparent 2px)';

/**
 * The end fade, painted rather than masked — so it is only invisible while what
 * sits behind the rule really is `--canvas`. Both callers place it directly on
 * the page background; a section with a fill of its own would need the veil to
 * name that fill instead.
 */
const END_VEIL =
	'linear-gradient(to right, var(--canvas), transparent 14%, transparent 86%, var(--canvas))';

export function PixelRule({ className }: { className?: string }) {
	return (
		<div
			aria-hidden='true'
			className={cn('h-px w-full', className)}
			style={{
				// Veil first: background layers paint front to back, so the fade sits
				// over the dots.
				backgroundImage: `${END_VEIL}, ${DOT_TILE}`,
				backgroundRepeat: 'no-repeat, repeat-x',
				backgroundSize: '100% 1px, 6px 1px',
			}}
		/>
	);
}
