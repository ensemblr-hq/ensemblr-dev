import { type JsonLdNode, serialiseJsonLd } from '@/lib/structured-data';

/**
 * Structured data as a `<script>` in the tree, which is what Next recommends —
 * the Metadata API has no `<script>` field and will not render one.
 *
 * The escaping that makes the payload safe to inline lives with the graph
 * builders in `src/lib/structured-data.ts`, where it can be tested without
 * rendering React.
 */
export function JsonLd({ data }: { data: JsonLdNode }) {
	return (
		<script
			// biome-ignore lint/security/noDangerouslySetInnerHtml: the only way to emit a JSON-LD script body; the payload is escaped by serialiseJsonLd.
			dangerouslySetInnerHTML={{ __html: serialiseJsonLd(data) }}
			type='application/ld+json'
		/>
	);
}
