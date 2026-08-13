import { cn } from '@/lib/utils';

import { CHANGES, type ChangeStatus, REVIEW_HEADER, REVIEW_TABS } from './data';
import { FileBadge } from './file-badge';
import {
	DotSquareIcon,
	DotsIcon,
	EyeIcon,
	ListIcon,
	MinusSquareIcon,
	PlusSquareIcon,
} from './icons';
import { Spinner } from './primitives';

/**
 * A row's letter is the app's short git status. `modified` gets none — it is
 * the state a changed file is already assumed to be in, so a letter there
 * would be on nearly every row and tell you nothing.
 */
const STATUS_LETTER: Record<ChangeStatus, string | null> = {
	added: 'A',
	deleted: 'D',
	modified: null,
	renamed: 'R',
	untracked: 'U',
};

/**
 * The trailing square marks how the file changed: a plus for new files, a
 * centred dot for edits in place, a minus for deletions. It is a status mark
 * rather than a control, which is why it carries the status colour and not the
 * row's own.
 */
const STATUS_MARK: Record<
	ChangeStatus,
	{ readonly Icon: typeof DotSquareIcon; readonly className: string }
> = {
	added: { Icon: PlusSquareIcon, className: 'text-ok/70' },
	deleted: { Icon: MinusSquareIcon, className: 'text-danger/70' },
	modified: { Icon: DotSquareIcon, className: 'text-warning/70' },
	renamed: { Icon: DotSquareIcon, className: 'text-warning/70' },
	untracked: { Icon: PlusSquareIcon, className: 'text-ok/70' },
};

const STATUS_TONE: Record<ChangeStatus, string> = {
	added: 'text-ok',
	deleted: 'text-danger',
	modified: 'text-muted',
	renamed: 'text-accent',
	untracked: 'text-warning',
};

function ChangeRow({ change }: { change: (typeof CHANGES)[number] }) {
	const letter = STATUS_LETTER[change.status];
	const { Icon: StatusMark, className: markTone } = STATUS_MARK[change.status];

	return (
		<div className='flex items-center gap-2 px-3 py-[0.3125rem]'>
			<FileBadge badge={change.badge} />
			<span className='min-w-0 flex-1 truncate font-mono text-[10px]'>
				<span className='text-muted/70'>{change.path}</span>
				<span className='text-ink'>{change.file}</span>
			</span>
			{letter ? (
				<span
					className={cn(
						'shrink-0 font-mono text-[9px]',
						STATUS_TONE[change.status],
					)}
				>
					{letter}
				</span>
			) : null}
			{/* A deleted file has no additions and a new one has no deletions. The
			    app omits the number rather than printing a zero, so a row's width
			    tracks what actually happened to it. */}
			{change.added > 0 ? (
				<span className='shrink-0 font-mono text-[9px] text-ok'>
					+{change.added}
				</span>
			) : null}
			{change.removed > 0 ? (
				<span className='shrink-0 font-mono text-[9px] text-danger'>
					-{change.removed}
				</span>
			) : null}
			<StatusMark className={cn('size-3 shrink-0', markTone)} />
		</div>
	);
}

/**
 * The header above the review sidebar: the workspace's git state resolved to
 * one line, and the primary action on the right — which an agent turn replaces
 * with a spinner, because whatever that action would commit or merge is about
 * to move under it. At this width the app's container query has already
 * dropped the spinner's label, leaving the arc alone.
 */
function ReviewHeader() {
	return (
		<div className='flex h-12 shrink-0 items-center gap-2 border-line border-b px-3'>
			<span className='min-w-0 truncate text-[11px] text-ink'>
				{REVIEW_HEADER.label}
			</span>
			<Spinner className='ml-auto size-3 shrink-0' />
		</div>
	);
}

/** Right column, upper half: status header, review tabs, changed files. */
export function MockReviewPanel() {
	return (
		<div className='flex min-h-0 flex-1 flex-col'>
			<ReviewHeader />

			<div className='flex h-10 shrink-0 items-center gap-1 border-line border-b px-3 text-muted'>
				{REVIEW_TABS.map((tab) => (
					<span
						className={cn(
							'flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px]',
							tab.label === 'Changes'
								? 'bg-pane-strong text-ink'
								: 'text-muted',
						)}
						key={tab.label}
					>
						{tab.label}
						{tab.count ? (
							<span className='font-mono text-[9px] text-muted/70 tabular-nums'>
								{tab.count}
							</span>
						) : null}
					</span>
				))}
				<span className='ml-auto flex shrink-0 items-center gap-2'>
					<span className='flex items-center gap-1 whitespace-nowrap text-[10px] text-accent'>
						<EyeIcon className='size-3' />
						Review
					</span>
					<ListIcon className='size-3 shrink-0 text-muted/55' />
					<DotsIcon className='size-3 shrink-0 text-muted/55' />
				</span>
			</div>

			{/* More rows than fit, faded at the cut. A list that ends on a half-drawn
			    row reads as clipped; one that fades reads as a list you can scroll. */}
			<div
				className='flex min-h-0 flex-1 flex-col overflow-hidden py-1'
				style={{
					maskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
				}}
			>
				{CHANGES.map((change) => (
					<ChangeRow change={change} key={change.path + change.file} />
				))}
			</div>
		</div>
	);
}
