/**
 * Icons the *site* draws — nav, footer, hero, download, orchestration.
 *
 * Separate from `@/components/app-mock/icons` on purpose. These four appear
 * nowhere in the workbench replica, and when they lived alongside it eight
 * files in `chrome/`, `download/` and `sections/` reached into the replica
 * module to get a GitHub mark. The import path is documentation: a site
 * component asking `app-mock` for an icon reads as the site depending on the
 * mock's internals, which it does not.
 */

import { Icon, type IconProps } from './icon';

/** Three rules — the site nav's disclosure, not the app's bar chart. */
export function MenuIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M2.5 4.5h11M2.5 8h11M2.5 11.5h11' />
		</Icon>
	);
}

export function ShieldCheckIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='M8 1.75 3 3.5v4.25c0 2.9 2 5.1 5 6.5 3-1.4 5-3.6 5-6.5V3.5Z' />
			<path d='m6 7.75 1.5 1.5L10.25 6.5' />
		</Icon>
	);
}

export function CheckIcon(props: IconProps) {
	return (
		<Icon {...props}>
			<path d='m3.5 8.5 3 3 6-7' />
		</Icon>
	);
}

export function GitHubIcon({ className }: IconProps) {
	return (
		<svg
			aria-hidden='true'
			className={className}
			fill='currentColor'
			viewBox='0 0 16 16'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path d='M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z' />
		</svg>
	);
}

/*
 * There is no AppleIcon here any more, and adding one back is not a small
 * decision. A traced Apple logo shipped on the download button until Apple's
 * "Guidelines for Using Apple Trademarks and Copyrights" were read against it:
 * the Apple logo "does not appear ... without express written permission from
 * Apple", and an image asserting compatibility must be "an actual photograph of
 * the genuine Apple product and not an artist's rendering". The path is deleted
 * rather than left unexported, because an unused component in this file is an
 * invitation and the reason it went is not visible from its call site.
 *
 * The Apple *word* marks are fine and stay — "macOS", "Apple silicon" — with the
 * attribution notice `THIRD_PARTY` in `src/lib/legal.ts` prints in the footer.
 */
