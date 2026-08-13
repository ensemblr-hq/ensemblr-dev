import { cn } from '@/lib/utils';

import type { FileBadge as FileBadgeKind } from './data';

/**
 * The app draws a real file-type glyph next to every path. These are the same
 * marks reduced to a letter tile, which keeps the rows legible at the size the
 * replica renders without pulling in an icon set.
 */
const BADGES: Record<
	FileBadgeKind,
	{ readonly label: string; readonly className: string }
> = {
	css: { className: 'bg-[#8b5cf6]/25 text-[#c4b5fd]', label: 'CS' },
	json: { className: 'bg-[#eab308]/20 text-[#fde047]', label: '{}' },
	lock: { className: 'bg-muted/15 text-muted/70', label: '🔒' },
	md: { className: 'bg-[#64748b]/25 text-[#cbd5e1]', label: 'M↓' },
	ts: { className: 'bg-[#3178c6]/25 text-[#7cc0ff]', label: 'TS' },
	tsx: { className: 'bg-[#22d3ee]/20 text-[#67e8f9]', label: '⚛' },
};

export function FileBadge({
	badge,
	className,
}: {
	badge: FileBadgeKind;
	className?: string;
}) {
	const { className: tone, label } = BADGES[badge];
	return (
		<span
			aria-hidden='true'
			className={cn(
				'grid size-3.5 shrink-0 place-items-center rounded-[3px] font-mono text-[7px] leading-none',
				tone,
				className,
			)}
		>
			{label}
		</span>
	);
}
