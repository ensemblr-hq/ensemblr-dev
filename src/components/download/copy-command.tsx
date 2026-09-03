'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CopyIcon } from '@/components/icons/site';
import {
	type AnalyticsSurface,
	type CopyTarget,
	trackCopyCommand,
} from '@/lib/analytics';
import { selectTextOf, writeClipboard } from '@/lib/clipboard';
import { cn } from '@/lib/utils';

/** How long the confirmation holds before the button offers itself again. */
const COPIED_MS = 2000;

type CopyState = 'idle' | 'copied' | 'failed';

/** The visible word beside the mark, in the block variant that has room for it. */
const LABEL: Record<CopyState, string> = {
	idle: 'Copy',
	copied: 'Copied',
	failed: 'Press ⌘C',
};

/*
 * What a screen reader is told, because the icon swap tells it nothing. Spelt
 * out rather than symbolic: "⌘C" is read as "C" or as nothing at all depending
 * on the reader, and it is the whole instruction in the failure case.
 */
const ANNOUNCEMENT: Record<CopyState, string> = {
	idle: '',
	copied: 'Copied to the clipboard.',
	failed:
		'Copying failed. The command is selected — press Command C to copy it.',
};

interface CopyCommandProps {
	/** The command, verbatim. What is shown is exactly what is written. */
	command: string;
	/**
	 * Which command this is, for the `Copy Command` event. Required, and a union
	 * rather than a string: the page offers four commands across six buttons,
	 * and a count that cannot tell `brew` from `curl … | sh` answers none of the
	 * questions the measurement exists for. Making it required is what stops a
	 * seventh copy button being added that fires nothing — the component will
	 * not compile without it.
	 */
	target: CopyTarget;
	/**
	 * Where the button was pressed. The brew line and the Linux installer each
	 * appear twice, in the hero and in the Download section, and this is what
	 * keeps the two apart.
	 */
	surface: AnalyticsSurface;
	/**
	 * `block` is a row of its own inside a card: full width, a 44px touch floor,
	 * and the word beside the mark. `inline` is the hero's single line, where the
	 * command sits mid-sentence — it carries the mark alone, because a word
	 * appearing and disappearing inside a centred line moves the line, and it
	 * takes the WCAG 2.2 target-size exception for a target inside a sentence
	 * rather than growing a 44px box in the middle of one.
	 */
	variant?: 'block' | 'inline';
	className?: string;
}

/**
 * A command the reader can take with one click instead of a drag and a ⌘C.
 *
 * The page prints commands it means people to run — the brew pair, and the two
 * `curl … | sh` lines that are the Linux install — and every one of them wraps
 * at phone widths, which is exactly where selecting three lines of mono by hand
 * is worst. Wrapping is the right call for a command (`wrap-anywhere`, never
 * `truncate`: a command with its middle missing cannot be copied at all), and
 * this is what pays for it.
 *
 * The button never claims more than it did. `writeClipboard` reports whether
 * the write happened, and when it did not — an insecure context, a denied
 * permission — the command is selected in place and the label says to press
 * ⌘C, instead of a check mark over an unchanged clipboard.
 */
export function CopyCommand({
	className,
	command,
	surface,
	target,
	variant = 'block',
}: CopyCommandProps) {
	const [state, setState] = useState<CopyState>('idle');
	const commandRef = useRef<HTMLElement>(null);
	const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const markSize = variant === 'block' ? 'size-3.5' : 'size-3';

	// The write is awaited, so the timer can outlive the button that set it —
	// a reader who copies and then navigates away leaves a `setState` aimed at
	// an unmounted component behind them.
	useEffect(() => () => clearTimeout(resetTimer.current), []);

	const copy = async () => {
		clearTimeout(resetTimer.current);
		const copied = await writeClipboard(command);

		if (!copied) {
			selectTextOf(commandRef.current);
		}

		setState(copied ? 'copied' : 'failed');

		/*
		 * Only the success expires. "Copied" is a receipt for something already
		 * done and it should not sit there implying the last click is still the
		 * current state; "Press ⌘C" is an instruction the reader has not carried
		 * out yet, and an instruction that vanishes after two seconds while the
		 * selection it refers to stays highlighted is worse than none. The next
		 * click clears it.
		 */
		if (copied) {
			resetTimer.current = setTimeout(() => setState('idle'), COPIED_MS);
		}

		/*
		 * The successful write only, for the same reason the label does not claim
		 * a check mark over an unchanged clipboard: the event means the command is
		 * on the reader's clipboard, and firing it on the fallback path would make
		 * it mean "someone pressed a button", which is a different and much weaker
		 * claim to read off a chart. The fallback selects the text and asks for
		 * ⌘C, and whether that key was pressed is not something this page can see
		 * — so counting it would be inventing the half it cannot observe.
		 */
		if (copied) {
			trackCopyCommand({ command, surface, target });
		}
	};

	return (
		<>
			{/*
			 * The command is the button's content *and* its accessible name is set
			 * explicitly, because the content alone names it "brew install --cask
			 * ensemblr-hq/tap/ensemblr" — a name that says what the thing is and
			 * not what pressing it does.
			 */}
			<button
				aria-label={`Copy ${command}`}
				className={cn(
					'group cursor-pointer rounded-md border border-transparent text-left transition-colors',
					variant === 'block'
						? // Negative margin so the row's hover fill reaches past the text
							// without the card having to give it a column of its own.
							//
							// The mark drops below the command under 27rem, and only there.
							// Beside it, it and its reserved label take 71px of a column
							// that is 248px wide at 320 — leaving less than the install
							// URL needs, so the one line the reader is meant to run wrapped
							// as `…/install` + `.sh`, a filename split across two rows on a
							// page whose whole argument is that its claims are checkable.
							// Stacked, the command gets the full width and stays whole at
							// every phone width above the 320 floor.
							'-mx-2 flex min-h-11 w-full flex-col items-start justify-between gap-1 px-2 py-2 min-[27rem]:flex-row min-[27rem]:items-center min-[27rem]:gap-3 hover:border-line/70 hover:bg-surface'
						: // `align-middle` and a tight line box, because this one sits in a
							// sentence: a button is an atomic inline box whatever display it
							// is given, so it aligns as a unit, and left on the baseline with
							// the code's own `leading-relaxed` inside it the command rode
							// about half a line above the `or` in front of it.
							'inline-flex items-center gap-1.5 px-1 py-0.5 align-middle hover:bg-surface',
					className,
				)}
				onClick={copy}
				type='button'
			>
				{/*
				 * `wrap-anywhere`, not `break-words`. They wrap identically once the
				 * box is measured; they do not measure it the same way. `break-words`
				 * is `overflow-wrap: break-word`, which permits a mid-word break at
				 * layout time but leaves the element's *min-content* width equal to
				 * its longest unbreakable token — and the longest token here is
				 * `https://www.ensemblr.dev/install.sh`, 252px of JetBrains Mono.
				 *
				 * That number was a floor under the whole download column. The grid
				 * item defaults to `min-width: auto`, so the column could not shrink
				 * below it, and at 320px the section measured 379px inside a 320px
				 * box. Nothing scrolled — `#download` is `overflow-hidden` for the
				 * pixel field — so the overflow was simply cut off, taking the right
				 * edge of the h2 and of every requirement row with it.
				 *
				 * `overflow-wrap: anywhere` makes the same break legal *and* counts it
				 * in min-content, so the column shrinks to the viewport. The guarantee
				 * the old class was chosen for is unchanged: every character is still
				 * rendered, and this is still never `truncate`.
				 */}
				<code
					className={cn(
						'min-w-0 wrap-anywhere font-mono text-[0.75rem] text-ink',
						variant === 'block' ? 'leading-relaxed' : 'leading-none',
					)}
					ref={commandRef}
				>
					{command}
				</code>

				{/*
				 * Hidden from assistive technology, all of it: the mark is decorative,
				 * the word duplicates the button's own name, and the state change is
				 * announced by the live region below instead — where it is a sentence
				 * rather than two characters.
				 */}
				<span
					aria-hidden='true'
					className={cn(
						// Reserved width, flushed right: the label changes length as the
						// state does, and a cluster that measured itself would drag the
						// command's own wrap point sideways on every click. The word's
						// right edge stays put and the mark shifts instead.
						//
						// Both only apply while the mark is beside the command. Stacked
						// under it, it shares no line with the command and so cannot move
						// its wrap point however long the label grows — and 9ch of empty
						// box flushed right at the foot of a card is reserving room
						// against a collision that can no longer happen.
						'flex shrink-0 items-center gap-1.5 font-mono text-[0.6875rem] transition-colors',
						variant === 'block' &&
							'min-[27rem]:min-w-[9ch] min-[27rem]:justify-end',
						state === 'copied' && 'text-ok',
						state === 'failed' && 'text-warning',
						state === 'idle' && 'text-muted group-hover:text-ink',
					)}
				>
					{state === 'copied' ? (
						<CheckIcon className={markSize} />
					) : (
						<CopyIcon className={markSize} />
					)}
					{/*
					 * The failed label is the one that carries a ⌘, and JetBrains Mono
					 * is loaded at a latin subset that has no U+2318 — so in the mono
					 * the glyph dropped through to Menlo and sat beside a JetBrains
					 * Mono C in a different weight. `font-key` sets the whole phrase in
					 * the font that draws all of it, which is the right voice for it
					 * anyway: this state is an instruction, not a code token like the
					 * command it sits beside. The reserved `9ch` stays on the parent so
					 * the swap cannot move the command's wrap point.
					 */}
					{variant === 'block' ? (
						<span className={cn(state === 'failed' && 'font-key')}>
							{LABEL[state]}
						</span>
					) : null}
				</span>
			</button>

			{/*
			 * `output` rather than a `span` with `role='status'`: same implicit live
			 * region, and it is the element that means "a result the page computed
			 * from what the reader did", which is what this is.
			 *
			 * Rendered empty from the first paint rather than mounted on demand — a
			 * live region inserted at the same moment as its text is a region the
			 * screen reader was not yet watching when the text arrived.
			 */}
			<output className='sr-only'>{ANNOUNCEMENT[state]}</output>
		</>
	);
}
