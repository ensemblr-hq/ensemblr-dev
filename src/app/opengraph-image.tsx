import { ImageResponse } from 'next/og';

import { buildWordmarkPixels, PIXEL_INSET, PIXEL_SIZE } from '@/lib/glyphs';
import { SITE } from '@/lib/site';

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { height: 630, width: 1200 };
export const contentType = 'image/png';

/*
 * Satori renders a constrained subset of CSS and does not understand `oklch`,
 * so the palette is restated here as the sRGB equivalents of the site tokens.
 */
const CANVAS = '#100c0b';
const INK = '#e8e3de';
const MUTED = '#a49d97';
const ACCENT = '#35b8d0';
const LINE = '#3a3230';

const UNIT = 15;
const PIXELS = buildWordmarkPixels();

/*
 * Rendered on demand rather than prerendered: an `ImageResponse` is a stream,
 * not a serialisable value, so it cannot cross a `use cache` boundary. The card
 * is static content and crawlers fetch it rarely, so the cost is negligible.
 */
export default function OpengraphImage() {
	return new ImageResponse(
		<div
			style={{
				background: CANVAS,
				color: INK,
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				justifyContent: 'space-between',
				padding: '72px',
				width: '100%',
			}}
		>
			{/* Wordmark, drawn from the same bitmap the site renders as SVG. */}
			<div
				style={{
					display: 'flex',
					height: `${UNIT * 7}px`,
					position: 'relative',
					width: `${UNIT * 47}px`,
				}}
			>
				{PIXELS.map((pixel) => (
					<div
						key={`${pixel.x}-${pixel.y}`}
						style={{
							background: INK,
							height: `${UNIT * PIXEL_SIZE}px`,
							left: `${(pixel.x + PIXEL_INSET) * UNIT}px`,
							position: 'absolute',
							top: `${(pixel.y + PIXEL_INSET) * UNIT}px`,
							width: `${UNIT * PIXEL_SIZE}px`,
						}}
					/>
				))}
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
				<div
					style={{
						display: 'flex',
						fontSize: '58px',
						fontWeight: 600,
						letterSpacing: '-0.03em',
						lineHeight: 1.1,
						maxWidth: '900px',
					}}
				>
					Agents that drive the app, not just the code.
				</div>
				{/* The card carries the h1 and the runtime pair, in that order, because
				    a social preview is read at a glance and the two runtimes are what
				    tell a scroller whether this is for them. */}
				<div
					style={{
						color: MUTED,
						display: 'flex',
						fontSize: '26px',
						maxWidth: '820px',
					}}
				>
					A desktop orchestrator for Pi and Claude Code. Every stream of work
					gets its own git worktree.
				</div>
			</div>

			<div
				style={{
					alignItems: 'center',
					borderTop: `1px solid ${LINE}`,
					color: MUTED,
					display: 'flex',
					fontSize: '22px',
					justifyContent: 'space-between',
					paddingTop: '28px',
				}}
			>
				<div style={{ display: 'flex' }}>github.com/ensemblr-hq/ensemblr</div>
				<div style={{ color: ACCENT, display: 'flex' }}>ensemblr.dev</div>
			</div>
		</div>,
		size,
	);
}
