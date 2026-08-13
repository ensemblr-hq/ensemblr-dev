'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

const SCROLLED_PAST = 24;

/**
 * The bar is transparent over the hero and only takes on a surface once the
 * page has moved, so the first screen stays uninterrupted.
 */
export function NavShell({ children }: { children: React.ReactNode }) {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > SCROLLED_PAST);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<header
			className={cn(
				'sticky top-0 z-50 transition-colors duration-300 motion-reduce:transition-none',
				scrolled
					? 'border-line/70 border-b bg-canvas/80 backdrop-blur-xl'
					: 'border-transparent border-b',
			)}
		>
			{children}
		</header>
	);
}
