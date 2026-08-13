/**
 * The 16px inline icon frame both sets are drawn in.
 *
 * The app uses Lucide; pulling that whole package in to draw a few dozen glyphs
 * is not a trade worth making, so these are hand-cut to the same 1.5px stroke
 * weight and named after the Lucide icon each one stands in for.
 */

export type IconProps = { className?: string };

export function Icon({
	children,
	className,
}: IconProps & { children: React.ReactNode }) {
	return (
		<svg
			aria-hidden='true'
			className={className}
			fill='none'
			stroke='currentColor'
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='1.5'
			viewBox='0 0 16 16'
			xmlns='http://www.w3.org/2000/svg'
		>
			{children}
		</svg>
	);
}
