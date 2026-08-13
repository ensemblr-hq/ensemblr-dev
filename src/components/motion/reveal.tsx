import { cn } from '@/lib/utils';

const STAGGER_STEP_PERCENT = 2.5;

interface RevealProps {
	children: React.ReactNode;
	className?: string;
	/** Position within a group; shifts the scroll range to stagger siblings. */
	index?: number;
	as?: 'div' | 'section' | 'li' | 'article' | 'header' | 'dl';
}

/**
 * The house entrance: content lifts and fades in as it scrolls into view.
 *
 * Deliberately a server component with no JavaScript behind it — the animation
 * is a CSS scroll-driven timeline (see `.reveal` in `globals.css`). Browsers
 * without support, and readers who ask for reduced motion, get the settled
 * state and never a hidden one.
 */
export function Reveal({
	as: Component = 'div',
	children,
	className,
	index = 0,
}: RevealProps) {
	return (
		<Component
			className={cn('reveal', className)}
			style={
				index
					? ({
							'--reveal-delay': `${index * STAGGER_STEP_PERCENT}%`,
						} as React.CSSProperties)
					: undefined
			}
		>
			{children}
		</Component>
	);
}
