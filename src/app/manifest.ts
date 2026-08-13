import type { MetadataRoute } from 'next';

import { SITE } from '@/lib/site';

/**
 * A web app manifest for a site nobody installs, which is the point: it is the
 * one place a crawler or an OS finds the short name, the theme colour and a
 * square icon in a single document, and Next links it from `<head>` for free
 * once this file exists.
 *
 * `display: 'browser'`. The site is a page to read, not a shell to launch —
 * `standalone` would strip the URL bar off a document whose entire argument is
 * that its claims are checkable against a domain and a GitHub repository.
 */
export default function manifest(): MetadataRoute.Manifest {
	return {
		background_color: '#0d0a09',
		categories: ['developer', 'productivity', 'utilities'],
		description: SITE.description,
		display: 'browser',
		icons: [
			{
				purpose: 'any',
				sizes: 'any',
				src: '/icon.svg',
				type: 'image/svg+xml',
			},
			{
				purpose: 'maskable',
				sizes: '1024x1024',
				src: '/apple-icon.png',
				type: 'image/png',
			},
		],
		id: '/',
		lang: SITE.locale,
		name: `${SITE.name} — ${SITE.tagline}`,
		short_name: SITE.name,
		start_url: '/',
		theme_color: '#0d0a09',
	};
}
