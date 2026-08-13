import { DOCK_FOOTER, DOCK_OUTPUT } from './data';
import {
	BoxIcon,
	ChevronIcon,
	ExternalIcon,
	PlusIcon,
	RefreshIcon,
	WrenchIcon,
} from './icons';
import { Spinner } from './primitives';

/**
 * The dock is not a full-width bar: it sits under the review panel, in the
 * right column, with the fixed Setup and Run output panes as tabs.
 */
export function MockDock() {
	return (
		<div className='flex h-[11rem] shrink-0 flex-col border-line border-t'>
			<div className='flex h-9 shrink-0 items-center gap-2 px-2.5'>
				<ChevronIcon className='size-3 shrink-0 rotate-90 text-muted/65' />
				<span className='flex items-center gap-1.5 rounded-md bg-pane-strong px-1.5 py-0.5 text-[10px] text-ink'>
					<WrenchIcon className='size-3' />
					Setup
				</span>
				<span className='flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] text-muted'>
					<Spinner className='size-2.5' />
					Run
				</span>
				<PlusIcon className='size-3 shrink-0 text-muted/65' />
				<span className='ml-auto flex items-center gap-1.5'>
					<span className='flex items-center gap-1 rounded-md border border-line px-1.5 py-0.5 font-mono text-[9px] text-muted/75'>
						<ExternalIcon className='size-2.5' />
						:3000
					</span>
					<BoxIcon className='size-3 text-muted/65' />
				</span>
			</div>

			{/* Anchored to the bottom, like a terminal that has been running: the
			    newest line sits against the footer and the install scrolls off the
			    top, rather than the log stopping half a line short of the frame. */}
			<div
				className='flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-3 font-mono text-[9px] leading-[1.9]'
				style={{
					maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%)',
				}}
			>
				{DOCK_OUTPUT.map((line) => (
					<div className='flex gap-1.5' key={line}>
						<span className='text-ok'>+</span>
						<span className='truncate text-ink/70'>{line.slice(2)}</span>
					</div>
				))}
			</div>

			<div className='flex items-center gap-2 px-3 py-2'>
				<span className='truncate font-mono text-[9px] text-muted/55'>
					{DOCK_FOOTER}
				</span>
				<span className='ml-auto flex shrink-0 items-center gap-1 rounded-md border border-line px-1.5 py-0.5 text-[9px] text-muted/75'>
					<RefreshIcon className='size-2.5' />
					Rerun setup
				</span>
			</div>
		</div>
	);
}
