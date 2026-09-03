import type { InlineSpan, TimelineEntry } from './data';
import { FileBadge } from './file-badge';
import {
	CopyIcon,
	DotsIcon,
	InfoIcon,
	PencilIcon,
	PromptIcon,
	WrenchIcon,
} from './icons';

/**
 * One row of an agent's turn, whichever surface is drawing it.
 *
 * Lifted out of `conversation.tsx` when the Concierge panel arrived. The two
 * surfaces render the same row shapes — a user bubble, prose with inline chips,
 * a tool call, a turn footer — because in the app they are the same component,
 * and a second row renderer here would be two things to keep in step with one
 * screenshot. The panel and the conversation pane differ in what they contain,
 * not in how a row is drawn.
 */

/** A muted pill holding a one-line preview, as the app collapses long output. */
function PreviewPill({ children }: { children: React.ReactNode }) {
	return (
		<span className='min-w-0 truncate rounded-md bg-pane px-1.5 py-0.5 font-mono text-[9px] text-muted/75'>
			{children}
		</span>
	);
}

/** One run of an agent's prose. Code and file references render as chips. */
function Span({ span }: { span: InlineSpan }) {
	if (span.kind === 'strong') {
		return <strong className='font-semibold text-ink'>{span.text}</strong>;
	}

	if (span.kind === 'code') {
		return (
			<code className='rounded-[3px] bg-pane px-1 py-px font-mono text-[9px] text-ink/85'>
				{span.text}
			</code>
		);
	}

	if (span.kind === 'file') {
		return (
			<span className='inline-flex translate-y-px items-baseline gap-1 rounded-[3px] bg-pane px-1 py-px align-baseline'>
				<FileBadge badge={span.badge} className='size-3 self-center' />
				<code className='font-mono text-[9px] text-ink/85'>{span.text}</code>
			</span>
		);
	}

	return <>{span.text}</>;
}

export function Spans({ spans }: { spans: readonly InlineSpan[] }) {
	return spans.map((span, index) => (
		<Span key={`${span.kind}-${index}`} span={span} />
	));
}

export function TimelineRow({ entry }: { entry: TimelineEntry }) {
	if (entry.kind === 'user') {
		return (
			<div className='flex justify-end'>
				<p className='max-w-[85%] rounded-xl bg-pane px-3 py-2 text-[11px] leading-relaxed text-ink/90'>
					{entry.text}
				</p>
			</div>
		);
	}

	if (entry.kind === 'paragraph') {
		return (
			<p className='text-[11px] leading-[1.65] text-ink/80'>
				<Spans spans={entry.spans} />
			</p>
		);
	}

	if (entry.kind === 'list') {
		return (
			<ul className='flex flex-col gap-1.5'>
				{entry.items.map((item, index) => (
					<li
						className='flex gap-2 text-[11px] leading-[1.65] text-ink/80'
						key={item.map((span) => span.text).join('')}
					>
						<span aria-hidden='true' className='shrink-0 text-muted/50'>
							{index + 1}.
						</span>
						<span className='min-w-0'>
							<Spans spans={item} />
						</span>
					</li>
				))}
			</ul>
		);
	}

	if (entry.kind === 'turn-footer') {
		return (
			<div className='flex items-center gap-2 pt-0.5 text-muted/55'>
				<span className='font-mono text-[9px]'>{entry.duration}</span>
				<CopyIcon className='size-3' />
				<DotsIcon className='size-3 rotate-90' />
			</div>
		);
	}

	if (entry.kind === 'thinking') {
		return (
			<div className='flex min-w-0 items-center gap-2'>
				<InfoIcon className='size-3 shrink-0 text-muted/70' />
				<span className='shrink-0 text-[11px] text-muted/75'>Thinking</span>
				<PreviewPill>{entry.preview}</PreviewPill>
			</div>
		);
	}

	if (entry.kind === 'tool') {
		return (
			<div className='flex min-w-0 items-center gap-2'>
				<WrenchIcon className='size-3 shrink-0 text-muted/70' />
				<span className='truncate font-mono text-[10px] text-muted/75'>
					{entry.name}
				</span>
			</div>
		);
	}

	if (entry.kind === 'command') {
		return (
			<div className='flex min-w-0 items-center gap-2'>
				<PromptIcon className='size-3 shrink-0 text-muted/70' />
				<span className='shrink-0 text-[11px] text-muted/75'>
					{entry.label}
				</span>
				<PreviewPill>{entry.text}</PreviewPill>
			</div>
		);
	}

	return (
		<div className='flex min-w-0 items-center gap-2'>
			<PencilIcon className='size-3 shrink-0 text-muted/70' />
			<span className='shrink-0 text-[11px] text-muted/75'>{entry.label}</span>
			<span className='flex min-w-0 items-center gap-1.5 rounded-md bg-pane px-1.5 py-0.5'>
				<FileBadge badge={entry.badge} />
				<span className='truncate font-mono text-[9px] text-ink/70'>
					{entry.file}
				</span>
			</span>
			{entry.added === undefined ? null : (
				<span className='flex shrink-0 gap-1 font-mono text-[9px]'>
					<span className='text-ok'>+{entry.added}</span>
					<span className='text-danger'>-{entry.removed}</span>
				</span>
			)}
		</div>
	);
}

/**
 * The turn itself: rows stacked bottom-up under a fading cut edge.
 *
 * Taller than its frame on purpose. It is anchored to the bottom and overflows
 * upward, because that is where a live conversation sits — the newest turn
 * against the composer, the older ones cut off above. Fading that cut edge
 * reads as scrolled rather than clipped.
 */
export function MockTimeline({
	entries,
}: {
	entries: readonly TimelineEntry[];
}) {
	return (
		<div
			className='flex min-h-0 flex-1 flex-col justify-end gap-2.5 overflow-hidden px-3.5 py-3'
			style={{
				maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%)',
			}}
		>
			{entries.map((entry, index) => (
				<TimelineRow entry={entry} key={`${entry.kind}-${index}`} />
			))}
		</div>
	);
}
