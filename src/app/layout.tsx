import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google';

import { MotionProvider } from '@/components/motion/motion-provider';
import { JsonLd } from '@/components/seo/json-ld';
import { PLATFORM_BOOTSTRAP, PLATFORM_NOSCRIPT_CSS } from '@/lib/platform';
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
	/*
	 * The short one, and only here. `<meta name="description">` is the string a
	 * search result is cut from, so it is the one place on the site with a hard
	 * 155-character budget; every other consumer below takes the full argument.
	 */
	description: SITE.searchDescription,
	/*
	 * The download block prints a 64-character SHA-256 and a version number, and
	 * iOS Safari reads long digit runs as phone numbers — it wraps them in tel:
	 * links, which is both wrong and a layout change on the one element whose
	 * whole job is being copied verbatim.
	 */
	formatDetection: { address: false, email: false, telephone: false },
	/*
	 * The words a reader would actually type, not the words the product uses for
	 * itself. "Workbench" is Ensemblr's term and nobody searches it; someone
	 * looking for this app searches for an orchestrator, a multi-agent setup, or
	 * a worktree manager, so all three appear here and in the visible copy.
	 */
	keywords: [
		'agent orchestrator',
		'coding agents',
		'multi-agent',
		'sub-agents',
		'git worktree',
		'worktree manager',
		'Claude Code',
		'Pi',
		'macOS',
		'Linux',
		'AppImage',
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

/*
 * `suppressHydrationWarning` on `<html>`, for `data-platform` and nothing else.
 *
 * The script at the top of the body sets that attribute before React hydrates,
 * which is the whole point of it — an effect would run after the first paint
 * and the reader would watch one download block disappear. React then finds an
 * attribute on `<html>` the server never rendered and warns about it; this is
 * the documented way to say the difference is deliberate.
 *
 * It covers this element's own attributes and not its subtree, so no real
 * mismatch anywhere on the page is hidden behind it.
 */
export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			className={`${geist.variable} ${jetbrainsMono.variable}`}
			lang={SITE.locale}
			suppressHydrationWarning
		>
			<body className='bg-canvas text-ink antialiased'>
				{/*
				 * The platform detection, first in the body and synchronous.
				 *
				 * It sets one attribute on `<html>`, which is what `globals.css`
				 * reads to hide the download block that is not the reader's. It has
				 * to run before the first paint — an effect would run after it and
				 * the reader would see both blocks and then one of them vanish — and
				 * the parser blocks here, before a pixel of the page below has been
				 * parsed, let alone painted.
				 *
				 * Deliberately not `next/script`: every strategy it offers runs after
				 * hydration or after load, which is exactly the ordering this cannot
				 * have. It is four hundred bytes of source, so there is nothing to
				 * defer.
				 *
				 * The payload is a constant in `src/lib/platform.ts`, not a template
				 * — nothing user-supplied reaches it, which is what makes
				 * `dangerouslySetInnerHTML` safe here rather than merely convenient.
				 */}
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: a build-time
				    constant with no interpolation; see PLATFORM_BOOTSTRAP. */}
				<script dangerouslySetInnerHTML={{ __html: PLATFORM_BOOTSTRAP }} />
				{/*
				 * And the other half: with no JavaScript the switcher is hidden, so a
				 * tab that opens only on a click would take the nightly downloads off
				 * the page altogether. This puts them back. It sits after the
				 * stylesheet in source order, which is what lets one rule of equal
				 * specificity win.
				 */}
				<noscript>
					{/* biome-ignore lint/security/noDangerouslySetInnerHtml: a
					    build-time constant with no interpolation; see
					    PLATFORM_NOSCRIPT_CSS. */}
					<style dangerouslySetInnerHTML={{ __html: PLATFORM_NOSCRIPT_CSS }} />
				</noscript>
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
