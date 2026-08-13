import type { MetadataRoute } from 'next';

import { SITE } from '@/lib/site';

/**
 * Everything is crawlable and there is nothing to hide, so the only work this
 * file does beyond the default is name the canonical host — which is the answer
 * to the one ambiguity the site has, `www` versus apex. `alternates.canonical`
 * says the same thing in `<head>`; a crawler that reads only one of the two
 * should still get the same answer.
 */
export default function robots(): MetadataRoute.Robots {
	return {
		host: SITE.url,
		rules: { allow: '/', userAgent: '*' },
		sitemap: `${SITE.url}/sitemap.xml`,
	};
}
