import { ClaudeMark, PiMark } from '@/components/icons/runtimes';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

/**
 * The two runtimes' marks, in the hero, linked to their own sites.
 *
 * Marks only — no names, no hostnames. The lede directly above already says
 * "the Pi agent harness or the Claude Code CLI you already have installed", so
 * a label under each glyph would be the third time the page names them in a
 * single screenful. What the marks add is recognition at a glance: a reader
 * spots the one they already run before they have read a word.
 *
 * Neither logo is Ensemblr's, and neither vendor endorses this. They are here
 * as a statement of what the app drives, which is what the sentence above them
 * says in words.
 *
 * They are only lit on hover. Two vendor colours sitting bright in a hero that
 * spends its own accent once — on three words of the h1 — would read as two
 * more accents competing with it, so at rest they take the same `muted` as the
 * prose and the colour is the reward for reaching for them.
 */
const RUNTIMES = [
	{
		Mark: PiMark,
		name: 'Pi',
		url: 'https://pi.dev',
		/*
		 * `size-9` against Claude's `size-8`, because equal boxes are not equal
		 * marks. Pi's cropped viewBox still carries an inset, so at 32px its ink
		 * measured 26.2px while Claude's filled all 32 — the same nominal size
		 * rendering one vendor's logo 18% smaller than the other's, side by side,
		 * which is not a neutral way to show two things the app treats equally.
		 * A 36px box puts Pi's ink at 29.5px: a shade under Claude's extent,
		 * which is where a solid glyph has to sit to read the same weight as a
		 * thin radial one.
		 *
		 * This is a uniform scale of the box only. Neither path nor viewBox is
		 * touched here — both are traced from the vendors' own art and re-copied
		 * from the app repo, never redrawn.
		 */
		size: 'size-9',
		// Pi borrows Ensemblr's accent in the app itself, as the house runtime.
		hover: 'hover:text-accent-strong',
	},
	{
		Mark: ClaudeMark,
		name: 'Claude Code',
		/*
		 * `code.claude.com`, not `claude.ai`. The mark is labelled Claude Code and
		 * this is the one interaction in the hero whose job is answering "is my CLI
		 * the one it runs" — `claude.ai` is the consumer chat product and answers a
		 * different question. It is the host the app repo links into for setup, and
		 * the only one of the two that is not bot-filtered to a 403.
		 */
		url: 'https://code.claude.com',
		size: 'size-8',
		hover: 'hover:text-brand-claude',
	},
] as const;

/**
 * `index` is the caller's, not this component's: where the marks fall in the
 * hero's stagger is a fact about the hero's cascade, and a component that pins
 * its own position in someone else's sequence is how two siblings end up
 * sharing a step.
 */
export function RuntimeLinks({
	className,
	index,
}: {
	className?: string;
	index?: number;
}) {
	return (
		<Reveal
			as='ul'
			/*
			 * The gap is small because the two links are not: each is a 44px touch
			 * target around a mark of 32–36px, so it already carries several px of
			 * padding a side before the gap is counted. Setting this to the spacing
			 * the glyphs looked like they needed pushed them a third of the hero
			 * apart.
			 */
			className={cn('flex items-center justify-center gap-2', className)}
			index={index}
		>
			{RUNTIMES.map((runtime) => (
				<li key={runtime.name}>
					{/*
					 * The mark is `aria-hidden`, so the link would otherwise reach a
					 * screen reader with no name at all — the visually-hidden span is
					 * what keeps "just the logos" from meaning "two unlabelled links".
					 */}
					<a
						className={cn(
							'flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted transition-colors',
							runtime.hover,
						)}
						href={runtime.url}
					>
						<runtime.Mark className={runtime.size} />
						<span className='sr-only'>{runtime.name}</span>
					</a>
				</li>
			))}
		</Reveal>
	);
}
