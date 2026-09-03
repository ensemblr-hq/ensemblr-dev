/**
 * Which of the two builds a visitor is being shown.
 *
 * The app builds for macOS on Apple silicon and for Linux on x86-64, and the
 * download surface has to answer for both without asking every reader to pick
 * before they have read anything. The mechanism is deliberately small and lives
 * entirely in one attribute on `<html>`:
 *
 *   - a blocking script in the layout sets `data-platform` before first paint
 *   - `globals.css` hides the block that is not the visitor's
 *   - `PlatformSwitch` rewrites the attribute when they disagree
 *
 * **With the attribute absent, both blocks render.** That is the whole reason
 * it is an attribute rather than React state: the server renders both, so the
 * markup a crawler reads and the markup a reader with JavaScript disabled gets
 * are complete and identical, there is no hydration boundary to mismatch, and
 * nothing flashes because the attribute is already on the element by the time
 * the first pixel is painted.
 *
 * The failure mode points the same way. If the script throws, the attribute is
 * never set and the page shows both downloads — more than the visitor needs,
 * rather than less.
 */

/** A build target. Two, and the site offers a release download for each. */
export type Platform = 'macos' | 'linux';

/**
 * What the download switcher offers, which is the two platforms plus a channel.
 *
 * `nightly` is not a third platform and the type says so: nothing that takes a
 * `Platform` — the button, the release line, the digest — can be handed it.
 * It is a tab because that is what it is to a reader: a third thing they might
 * want from this section, and one that was previously a card repeated at the
 * foot of both platform blocks.
 */
export type DownloadTab = Platform | 'nightly';

/**
 * What the attribute can say, which is a wider set than either.
 *
 * `both` is not a platform; it is the honest answer for a reader whose machine
 * runs neither — Windows, or a phone. They are shown both release blocks and
 * the switcher, rather than a guess dressed up as a detection. The detection
 * script never writes `nightly`: a channel is chosen, never detected.
 */
export type PlatformSelection = DownloadTab | 'both';

export const PLATFORM_ATTRIBUTE = 'data-platform';

export const PLATFORMS: readonly {
	readonly id: Platform;
	/** The word the copy uses for the platform, on a button and in a tab. */
	readonly label: string;
}[] = [
	{ id: 'macos', label: 'macOS' },
	{ id: 'linux', label: 'Linux' },
];

/**
 * The switcher's three tabs, in the order a reader should meet them: the two
 * builds they can install, then the one they have to opt into.
 */
export const DOWNLOAD_TABS: readonly {
	readonly id: DownloadTab;
	readonly label: string;
}[] = [...PLATFORMS, { id: 'nightly', label: 'Nightly' }];

/** Whether a value is one of the two platforms rather than the channel. */
export function isPlatform(value: PlatformSelection | null): value is Platform {
	return value === 'macos' || value === 'linux';
}

/**
 * The detection, as the source of the inline script that runs it.
 *
 * A string rather than a function because it has to execute before React does
 * — a component that set this in an effect would run after paint, which is the
 * flash this exists to avoid.
 *
 * Android is tested first and answers `both`. It reports `Linux armv8l` in
 * `navigator.platform`, so the obvious `/linux/` test hides the macOS download
 * from every Android phone on the strength of a kernel name.
 *
 * The whole thing is wrapped in a `try` because a page that fails to detect a
 * platform must fall back to showing both, never to showing none.
 */
export const PLATFORM_BOOTSTRAP = `(function(){try{var n=navigator,p=(n.userAgentData&&n.userAgentData.platform)||n.platform||'',u=p+' '+(n.userAgent||'');document.documentElement.setAttribute('${PLATFORM_ATTRIBUTE}',/android/i.test(u)?'both':/linux|x11/i.test(p)?'linux':/mac|iphone|ipad|ipod/i.test(p)?'macos':'both')}catch(e){}})();`;

/**
 * What the page needs when the script above never ran.
 *
 * The nightly tab is hidden until a reader presses it, which is right when
 * there is a switcher to press — and wrong when there is not. Without
 * JavaScript the switcher is hidden too, so that rule would take a real
 * download off the page rather than tucking it behind a control.
 *
 * Two release blocks, the nightly, no switcher: the complete page, which is
 * what every other part of this mechanism already degrades to.
 */
export const PLATFORM_NOSCRIPT_CSS =
	'[data-for-platform="nightly"]{display:contents}';
