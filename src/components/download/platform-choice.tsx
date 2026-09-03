import {
	DOWNLOAD_TABS,
	type DownloadTab,
	PLATFORMS,
	type Platform,
} from '@/lib/platform';

/**
 * Renders its children once per tab and lets CSS keep the one the reader is on.
 *
 * A server component with no state and no client boundary: the whole mechanism
 * is `data-for-platform` and the rules in `globals.css` that read it. Every
 * copy is in the markup either way, which is what makes the page complete for a
 * crawler and for a reader with JavaScript off.
 *
 * The wrappers are `display: contents`, so this composes into a flex row or a
 * grid without inserting a box of its own — the button it wraps lays out
 * exactly as it would have unwrapped.
 */
function ChoiceGroup({
	children,
	solo,
	tabs,
}: {
	children: (tab: DownloadTab) => React.ReactNode;
	solo?: boolean;
	tabs: readonly { readonly id: DownloadTab }[];
}) {
	return (
		<span className='contents' data-platform-solo={solo ? '' : undefined}>
			{tabs.map((tab) => (
				<span className='contents' data-for-platform={tab.id} key={tab.id}>
					{children(tab.id)}
				</span>
			))}
		</span>
	);
}

/**
 * The two builds, and nothing else. Used where a channel makes no sense.
 *
 * `solo` is for the two places that cannot draw both at once: the nav bar,
 * which is 320px wide at its narrowest and cannot hold a second CTA, and the
 * hero's button row. There the pair defaults to macOS and swaps on detection,
 * which costs a reader with no JavaScript nothing — the download section
 * renders every tab in full, digests included, and that is the surface a
 * crawler reads anyway.
 */
export function PlatformChoice({
	children,
	solo,
}: {
	children: (platform: Platform) => React.ReactNode;
	solo?: boolean;
}) {
	return (
		<ChoiceGroup solo={solo} tabs={PLATFORMS}>
			{/* Safe by construction: `tabs` is `PLATFORMS`, so the callback is only
			    ever handed one of the two. The assertion is what saves every caller
			    from narrowing a case it cannot be given. */}
			{(tab) => children(tab as Platform)}
		</ChoiceGroup>
	);
}

/**
 * The download section's three: both builds, and the nightly channel.
 *
 * Separate from `PlatformChoice` so the two callbacks have the types they
 * deserve. A component that always handed back a `DownloadTab` would make every
 * caller narrow it, including the nav and the hero, which never offer a
 * channel — and a narrowing written for a case that cannot happen is one nobody
 * maintains.
 *
 * The nightly tab stays hidden until it is chosen even when nothing has been
 * detected, because a channel is not something a script can guess at. That rule
 * lives in `globals.css`, beside the ones it is an exception to.
 */
export function DownloadChoice({
	children,
}: {
	children: (tab: DownloadTab) => React.ReactNode;
}) {
	return <ChoiceGroup tabs={DOWNLOAD_TABS}>{children}</ChoiceGroup>;
}
