import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

/**
 * Eyebrow, title and lede in the one arrangement every section shares.
 *
 * `size` is the only real variation between the sections that use it, and it
 * moves the title and the lede together — the showcase's four beats are
 * subordinate to the section they sit in, so they take a smaller heading *and*
 * a smaller lede. Splitting those into two props would let a caller set a step
 * heading over a section-sized lede, which is not a combination the page has.
 */
interface SectionHeadingProps {
	eyebrow: string;
	title: React.ReactNode;
	lede?: React.ReactNode;
	className?: string;
	/** For the odd measure — Download caps its title at 18ch, not `max-w-3xl`. */
	titleClassName?: string;
	align?: 'left' | 'center';
	size?: 'title' | 'step';
	/**
	 * The level this heading renders at, independent of the size it renders at.
	 *
	 * `h2` is the default because every section that uses this on the home page
	 * sits under the hero's own `h1`. A route that has no hero has to say so:
	 * `/schemas` opens on this component, and left at the default it shipped a
	 * document whose every heading — the page title, both card titles and the
	 * provenance note — was an `h2` peer of the others, with no `h1` anywhere.
	 * Size and level are set separately for exactly this reason.
	 */
	as?: 'h1' | 'h2';
}

/*
 * Tokens at every breakpoint, not just `lg`. `text-3xl sm:text-4xl` set a font
 * size and nothing else, so every section heading below 1024px rendered at
 * weight 400 with default leading — the display treatment arrived at one
 * breakpoint and the page had two typographic identities depending on the
 * window. The sizes are the same ones those utilities produced.
 */
const TITLE_CLASS = {
	title: 'max-w-3xl text-title-sm sm:text-title-md lg:text-title',
	step: 'text-step-sm sm:text-step-md lg:text-step',
} as const;

/*
 * Measured in characters, not rems: a lede is read as a single run of prose,
 * and ~52ch is where it stops needing a return sweep. The old `max-w-2xl` was
 * ~74ch at this size, wide enough that every section lede filled its line to
 * the same edge and the page gained a second, accidental left-to-right rhythm.
 */
const LEDE_CLASS = {
	title: 'max-w-[52ch] text-base leading-relaxed sm:text-lg',
	step: 'text-[0.9375rem] leading-relaxed',
} as const;

export function SectionHeading({
	align = 'left',
	as: Heading = 'h2',
	className,
	eyebrow,
	lede,
	size = 'title',
	title,
	titleClassName,
}: SectionHeadingProps) {
	return (
		<div
			className={cn(
				'flex flex-col gap-5',
				align === 'center' && 'items-center text-center',
				className,
			)}
		>
			<Reveal className='flex items-center gap-2.5'>
				<span
					aria-hidden='true'
					className='size-1.5 shrink-0 bg-accent shadow-[0_0_12px_var(--accent)]'
				/>
				<span className='eyebrow'>{eyebrow}</span>
			</Reveal>
			<Reveal index={1}>
				<Heading
					className={cn('text-balance', TITLE_CLASS[size], titleClassName)}
				>
					{title}
				</Heading>
			</Reveal>
			{lede ? (
				<Reveal index={2}>
					<p className={cn('text-pretty text-muted', LEDE_CLASS[size])}>
						{lede}
					</p>
				</Reveal>
			) : null}
		</div>
	);
}
