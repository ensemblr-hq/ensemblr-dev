'use client';

import { useEffect, useRef, useState } from 'react';

import { MenuIcon } from '@/components/icons/site';
import { NAV_SECTIONS } from '@/lib/site';
import { cn } from '@/lib/utils';

/** Where "here" is: a line across the upper third of the viewport. */
const READING_LINE = 0.35;

/**
 * The section the reading line has last crossed.
 *
 * An IntersectionObserver band was the first attempt and it does not survive
 * this page: the sections are wildly uneven — four screen-tall showcase steps
 * against a Trust block barely half a viewport — so any band thin enough not to
 * hold two sections at once is thin enough for a short one to fall straight
 * through, and the bar goes blank in the middle of a section the reader is
 * plainly looking at. A single line asks a question every section can answer,
 * whatever its height: has this one started above me. The last that has is the
 * one being read, and at the foot of the page that is the last section, which
 * is also the correct answer there.
 */
function useActiveSection(): string | null {
	const [active, setActive] = useState<string | null>(null);

	useEffect(() => {
		/*
		 * Sorted by where they actually are, not by the order they are listed in.
		 *
		 * Four of these anchors are showcase steps and one is a whole section
		 * further down, so the list order and the page order are not obliged to
		 * agree — and when they disagreed, "last one above the line" returned
		 * whichever came last in the *array*, marking a section the reader had not
		 * reached. Reading document position makes the resolver independent of how
		 * the bar chooses to arrange itself.
		 */
		const sections = NAV_SECTIONS.map((section) =>
			document.getElementById(section.id),
		)
			.filter((element): element is HTMLElement => element !== null)
			.sort((a, b) =>
				a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
					? -1
					: 1,
			);

		if (sections.length === 0) {
			return;
		}

		let frame = 0;

		const resolve = () => {
			frame = 0;
			const line = window.innerHeight * READING_LINE;
			let current: string | null = null;
			for (const section of sections) {
				if (section.getBoundingClientRect().top <= line) {
					current = section.id;
				}
			}
			setActive(current);
		};

		// One resolve per frame at most: scroll fires far more often than the bar
		// can usefully change, and reading layout on every event is what turns a
		// nav highlight into jank.
		const onScroll = () => {
			frame ||= window.requestAnimationFrame(resolve);
		};

		resolve();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (frame) {
				window.cancelAnimationFrame(frame);
			}
		};
	}, []);

	return active;
}

function linkClass(isActive: boolean): string {
	return cn(
		'relative flex min-h-11 items-center rounded-md text-[0.8125rem] transition-colors',
		isActive ? 'text-ink' : 'text-muted hover:text-ink',
	);
}

/**
 * The section anchors, in the two shapes the bar needs.
 *
 * Wide: a row that marks where the reader is. The page is roughly 6,800px of
 * near-identical dark sections, and without an active mark the bar spends that
 * whole scroll claiming the reader is nowhere.
 *
 * Narrow: the same anchors behind a disclosure, because they used to simply
 * vanish below `md` — a phone reader got a bar with a wordmark and a download
 * button and no way to reach any part of the page. `details`/`summary` keeps
 * the anchors reachable with JavaScript disabled, and keyboard operation comes
 * free with the element. Escape does not: `details` has no native dismiss, so
 * a keyboard reader who opened the menu and changed their mind had to walk
 * back up to the summary and toggle it. `closeMenu` supplies it, and returns
 * focus to the summary rather than dropping it on a collapsed subtree.
 *
 * The switch is at `lg`, not `md`. Five labels at `gap-6` plus the wordmark,
 * the repo link and the CTA measure ~813px of min-content, so opening the row
 * at 768 handed a tablet a bar 45px wider than its own viewport and a
 * horizontal scrollbar on every section beneath it. The disclosure holds the
 * same five anchors and costs 44px, so nothing is lost by keeping it one
 * breakpoint longer.
 */
export function NavLinks() {
	const active = useActiveSection();
	const disclosure = useRef<HTMLDetailsElement>(null);

	/*
	 * `returnFocus` is the whole difference between the two ways out. Escape
	 * dismisses without going anywhere, so focus has to be put back on the
	 * summary or it lands on a subtree that no longer exists. A link click is
	 * going somewhere: the browser moves focus and scroll to the target itself,
	 * and pulling focus back to the summary here would undo both and bounce the
	 * reader to the top of the page they just navigated away from.
	 */
	const closeMenu = (returnFocus: boolean) => {
		const element = disclosure.current;
		if (!element?.open) {
			return;
		}
		element.open = false;
		if (returnFocus) {
			element.querySelector('summary')?.focus();
		}
	};

	return (
		<>
			<ul className='hidden items-center gap-6 lg:flex'>
				{NAV_SECTIONS.map((section) => (
					<li key={section.id}>
						<a
							aria-current={active === section.id ? 'true' : undefined}
							className={linkClass(active === section.id)}
							href={`#${section.id}`}
						>
							{section.label}
							{/* The mark is a rule under the label rather than a colour
							    change alone, so it is not carried by colour only. */}
							<span
								aria-hidden='true'
								className={cn(
									'absolute inset-x-0 bottom-2 h-px bg-accent transition-opacity',
									active === section.id ? 'opacity-100' : 'opacity-0',
								)}
							/>
						</a>
					</li>
				))}
			</ul>

			{/* The key handler sits on `details` rather than on the summary because
			    that is where the event bubbles to from both the summary and the open
			    panel — the two places a reader can be when they press Escape. */}
			<details
				className='group relative lg:hidden'
				onKeyDown={(event) => {
					if (event.key === 'Escape') {
						closeMenu(true);
					}
				}}
				ref={disclosure}
			>
				<summary className='flex min-h-11 min-w-11 cursor-pointer list-none items-center gap-2 text-[0.8125rem] text-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden'>
					<MenuIcon className='size-4' />
					<span className='sr-only'>Sections</span>
				</summary>
				{/*
				 * Opaque, and the blur behind it is gone with the translucency.
				 * `bg-canvas/95` sounds like nothing until you see what it opens
				 * over: the h1 is near-white at 32px, so five per cent of it came
				 * through the panel and the menu read as a list printed on top of a
				 * headline. A `backdrop-blur` under an opaque fill is dead weight —
				 * it composites a layer nobody can see.
				 */}
				<ul className='absolute top-full left-0 z-50 mt-2 flex min-w-44 flex-col rounded-lg border border-line bg-canvas p-1.5 shadow-[0_18px_40px_-20px_oklch(0_0_0/0.9)]'>
					{/* An in-page anchor does not collapse the `details` it sits in, so
					    without this the panel stayed open over the very section it had
					    just scrolled to — the reader arrives at Runtimes and the menu is
					    still covering it. */}
					{NAV_SECTIONS.map((section) => (
						<li key={section.id}>
							<a
								aria-current={active === section.id ? 'true' : undefined}
								className={cn(
									'flex min-h-11 items-center rounded-md px-3 text-[0.875rem] transition-colors',
									active === section.id
										? 'bg-surface text-ink'
										: 'text-muted hover:bg-surface hover:text-ink',
								)}
								href={`#${section.id}`}
								onClick={() => closeMenu(false)}
							>
								{section.label}
							</a>
						</li>
					))}
				</ul>
			</details>
		</>
	);
}
