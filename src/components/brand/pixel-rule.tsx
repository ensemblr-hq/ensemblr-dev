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
 */
export function PixelRule({ className }: { className?: string }) {
	return (
		<div
			aria-hidden='true'
			className={cn('h-px w-full', className)}
			style={{
				backgroundImage:
					'repeating-linear-gradient(to right, oklch(0.71 0.008 75 / 32%) 0 2px, transparent 2px 6px)',
				maskImage:
					'linear-gradient(to right, transparent, black 14%, black 86%, transparent)',
			}}
		/>
	);
}
