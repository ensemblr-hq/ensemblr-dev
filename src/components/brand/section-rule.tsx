import { PixelRule } from '@/components/brand/pixel-rule';

/**
 * The seam between two prose sections, drawn on the page's own rail.
 *
 * Sections that each open with an eyebrow and a display heading, separated by
 * nothing but their own padding, read as one undifferentiated column however
 * well each is set — the rule is what makes them chapters.
 *
 * A component rather than a local helper because it is not one page's idiom:
 * `/schemas` needs the same seam between its two sections, and the container it
 * has to be drawn in — the `max-w-7xl` rail and its two gutters — is a value
 * both routes have to agree on or the rule lands short of every heading above
 * it. Restated per page, that agreement is a coincidence.
 */
export function SectionRule() {
	return (
		<div className='mx-auto w-full max-w-7xl px-5 sm:px-8'>
			<PixelRule />
		</div>
	);
}
