/**
 * The regions of the replica the showcase moves its highlight between.
 *
 * Their order here is the order they are drawn in: the workspace sidebar on the
 * left, the conversation beside it, the review panel stacked over the script
 * dock in a column down the right-hand edge — and then the Concierge, which is
 * none of those.
 *
 * `'concierge'` is the odd one and deliberately so. No pane claims it, because
 * the Concierge is not a pane: it is a panel that floats over the shell from a
 * launcher of its own, above every workspace rather than inside one. `Region`
 * dims everything that is not the focused region, so a focus nothing claims
 * dims **all four panes at once** — which is exactly the beat that step needs,
 * the panel arriving and the app receding behind it, with no special case
 * anywhere in `Region`.
 *
 * `'dock'` stays in this union even though no step focuses it any more. The
 * pane is still drawn and still wrapped in a `Region`; what changed is which
 * region a step asks for.
 */
export type MockRegion =
	| 'sidebar'
	| 'conversation'
	| 'review'
	| 'dock'
	| 'concierge';

/**
 * The regions drawn against the shell's right-hand edge.
 *
 * Which side of the *shell* a region sits on decides which side of the *page*
 * the window belongs on, so this is read twice: once to place a step's copy,
 * once to move the window. A step about the review panel or the dock, told with
 * the window parked on the right of the page, puts the lit region as far from
 * the sentence describing it as the layout allows — the copy is on the left
 * rail and the thing it names is against the right edge of a window three
 * columns wide. Mirroring the pair brings them back together.
 *
 * The Concierge is here for the same reason and not by analogy: the real panel
 * docks to the bottom-right corner, 16px in from the right edge, and the
 * replica draws it there. Copy on the right keeps the panel nearest the
 * sentence describing it.
 */
const RIGHT_EDGE_REGIONS: readonly MockRegion[] = [
	'review',
	'dock',
	'concierge',
];

/** Whether the region is drawn against the shell's right-hand edge. */
export function isRightEdgeRegion(region: MockRegion | null): boolean {
	return region !== null && RIGHT_EDGE_REGIONS.includes(region);
}
