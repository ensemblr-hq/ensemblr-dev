'use client';

import { useEffect, useState } from 'react';

import {
	DOWNLOAD_TABS,
	type DownloadTab,
	PLATFORM_ATTRIBUTE,
	type PlatformSelection,
} from '@/lib/platform';
import { cn } from '@/lib/utils';

/**
 * Three words and a fill: the two builds, and the channel.
 *
 * The only new client JavaScript this page takes on, and it does one thing:
 * rewrite `data-platform` on `<html>`. Everything downstream of that is CSS,
 * so nothing re-renders and no state is lifted anywhere — which is why the
 * blocks it switches between are plain server-rendered markup.
 *
 * `Nightly` is the odd tab and is meant to be. The first two are answers to a
 * question the detection already guessed at; the third is a channel nothing can
 * guess, and it is closed until pressed. It sits here rather than as a card at
 * the foot of both platform blocks, which is where it used to be — printed
 * twice, read once, and below the fold either way.
 *
 * It reads its own state out of the DOM rather than owning it, because the
 * attribute is set by a blocking script before React exists. Server and first
 * client render therefore agree on `null` — neither option pressed — and the
 * effect fills it in. The alternative is guessing the platform on the server,
 * which is the flash this whole approach was chosen to avoid.
 */
export function PlatformSwitch({ className }: { className?: string }) {
	const [view, setView] = useState<PlatformSelection | null>(null);

	useEffect(() => {
		const current = document.documentElement.getAttribute(PLATFORM_ATTRIBUTE);
		if (
			current === 'macos' ||
			current === 'linux' ||
			current === 'nightly' ||
			current === 'both'
		) {
			setView(current);
		}
	}, []);

	const select = (tab: DownloadTab) => {
		document.documentElement.setAttribute(PLATFORM_ATTRIBUTE, tab);
		setView(tab);
	};

	return (
		// `data-platform-switch` is what `globals.css` keys the whole control's
		// visibility off: with no detection there is nothing for it to switch.
		<fieldset
			className={cn(
				// `min-w-0`: a fieldset's default `min-inline-size: min-content`
				// would keep it from ever being narrower than both labels plus the
				// padding, which is a floor nothing else in this column has.
				'min-w-0 items-center gap-0.5 rounded-lg border border-line bg-surface/70 p-0.5',
				className,
			)}
			data-platform-switch=''
		>
			{/* A fieldset rather than a `role='group'` div, and the legend rather
			    than an `aria-label`: two related controls whose meaning is the
			    question they answer together, which is exactly what the element
			    pair is for. Hidden because the two labels are self-explanatory on
			    screen — the name is for a reader who meets them out of context. */}
			<legend className='sr-only'>Choose a download</legend>
			{DOWNLOAD_TABS.map((tab) => {
				const selected = view === tab.id;
				return (
					<button
						// `aria-pressed` rather than `aria-current`: these are toggles
						// over what the page shows, not links to somewhere else.
						aria-pressed={selected}
						className={cn(
							// 32px, and the touch floor asked for by input device rather
							// than by width — the same question the nav's download button
							// asks, and the same answer.
							'min-h-8 cursor-pointer rounded-md px-3 py-1 font-medium text-[0.8125rem] transition-colors pointer-coarse:min-h-11',
							selected
								? 'bg-pane-strong text-ink'
								: 'text-muted hover:text-ink',
						)}
						key={tab.id}
						onClick={() => select(tab.id)}
						type='button'
					>
						{tab.label}
					</button>
				);
			})}
		</fieldset>
	);
}
