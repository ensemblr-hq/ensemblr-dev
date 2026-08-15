/**
 * The four regions of the replica the showcase moves its highlight between.
 *
 * Their order here is the order they are drawn in: the workspace sidebar on the
 * left, the conversation beside it, and the review panel stacked over the script
 * dock in a column down the right-hand edge.
 */
export type MockRegion = 'sidebar' | 'conversation' | 'review' | 'dock';

/**
 * The two regions that share the shell's right-hand column.
 *
 * Which side of the *shell* a region sits on decides which side of the *page*
 * the window belongs on, so this is read twice: once to place a step's copy,
 * once to move the window. A step about the review panel or the dock, told with
 * the window parked on the right of the page, puts the lit region as far from
 * the sentence describing it as the layout allows — the copy is on the left
 * rail and the thing it names is against the right edge of a window three
 * columns wide. Mirroring the pair brings them back together.
 */
const RIGHT_EDGE_REGIONS: readonly MockRegion[] = ['review', 'dock'];

/** Whether the region is drawn against the shell's right-hand edge. */
export function isRightEdgeRegion(region: MockRegion | null): boolean {
	return region !== null && RIGHT_EDGE_REGIONS.includes(region);
}
