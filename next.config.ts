import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/*
	 * The page is a static shell except for the live GitHub release lookup in
	 * `src/lib/github-release.ts`. Cache Components lets that one function opt
	 * into `use cache` while everything around it prerenders.
	 */
	cacheComponents: true,
};

export default nextConfig;
