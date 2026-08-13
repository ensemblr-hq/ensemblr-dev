import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google';

import { MotionProvider } from '@/components/motion/motion-provider';
import { JsonLd } from '@/components/seo/json-ld';
import { SITE } from '@/lib/site';
import { buildSiteGraph } from '@/lib/structured-data';

import './globals.css';

const geist = Geist({
	display: 'swap',
	subsets: ['latin'],
	variable: '--font-geist',
});

/* The app bundles JetBrains Mono for its terminal and code surfaces, so the
 * site's micro-typography is literally the product's own voice. */
const jetbrainsMono = JetBrains_Mono({
	display: 'swap',
	subsets: ['latin'],
	variable: '--font-jetbrains-mono',
});

/*
 * `openGraph.images` and `twitter.images` are deliberately absent: the
 * `opengraph-image.tsx` file convention fills the first, and Next copies it into
 * the second whenever `twitter` declares no images of its own. Naming either one
 * here would take over from the generated card and its dimensions.
 */
export const metadata: Metadata = {
	alternates: { canonical: '/' },
	applicationName: SITE.name,
	authors: [{ name: SITE.name, url: SITE.url }],
	category: 'technology',
	creator: SITE.name,
	description: SITE.description,
	/*
	 * The download block prints a 64-character SHA-256 and a version number, and
	 * iOS Safari reads long digit runs as phone numbers — it wraps them in tel:
	 * links, which is both wrong and a layout change on the one element whose
	 * whole job is being copied verbatim.
	 */
	formatDetection: { address: false, email: false, telephone: false },
	keywords: [
		'coding agents',
		'multi-agent',
		'git worktree',
		'Claude Code',
		'Pi',
		'macOS',
		'developer tools',
		'code review',
	],
	metadataBase: new URL(SITE.url),
	openGraph: {
		description: SITE.description,
		locale: SITE.ogLocale,
		siteName: SITE.name,
		title: `${SITE.name} — ${SITE.tagline}`,
		type: 'website',
		url: SITE.url,
	},
	publisher: SITE.name,
	/*
	 * The bare `index, follow` left Google's own defaults in place for snippet
	 * and preview size, which cap the image preview at a thumbnail. This page's
	 * argument is a screenshot of the product, so the large preview is the point.
	 */
	robots: {
		follow: true,
		googleBot: {
			follow: true,
			index: true,
			'max-image-preview': 'large',
			'max-snippet': -1,
			'max-video-preview': -1,
		},
		index: true,
	},
	title: {
		default: `${SITE.name} — ${SITE.tagline}`,
		template: `%s — ${SITE.name}`,
	},
	twitter: {
		card: 'summary_large_image',
		description: SITE.description,
		title: `${SITE.name} — ${SITE.tagline}`,
	},
};

export const viewport: Viewport = {
	colorScheme: 'dark',
	themeColor: '#0d0a09',
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			className={`${geist.variable} ${jetbrainsMono.variable}`}
			lang={SITE.locale}
		>
			<body className='bg-canvas text-ink antialiased'>
				{/* Site-wide nodes live here rather than on the page, so a second
				    route inherits the publisher and the site identity instead of
				    having to restate them. */}
				<JsonLd data={buildSiteGraph()} />
				<MotionProvider>{children}</MotionProvider>
				{/* Vercel Web Analytics. The component reads `useSearchParams` to
				    build the route it reports, so it wraps itself in a null-fallback
				    Suspense boundary — which is what keeps it from opting the whole
				    prerendered shell out under `cacheComponents`. It renders nothing
				    and no-ops off Vercel, so local dev stays untouched. */}
				<Analytics />
			</body>
		</html>
	);
}
