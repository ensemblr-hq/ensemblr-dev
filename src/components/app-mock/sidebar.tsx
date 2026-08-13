import { cn } from '@/lib/utils';

import { NAV_ROWS, REPOSITORIES } from './data';
import {
	ClockIcon,
	GearIcon,
	LayoutIcon,
	PanelIcon,
	PlusIcon,
	PlusSquareIcon,
} from './icons';
import { Spinner } from './primitives';

const NAV_ICONS = [LayoutIcon, ClockIcon, GearIcon] as const;

const TRAFFIC_LIGHTS = ['#ff5f57', '#febc2e', '#28c840'] as const;

function WorkspaceRow({
	active,
	added,
	branch,
	dockActive,
	name,
	removed,
	running,
}: {
	active?: boolean;
	added: number;
	branch: string;
	dockActive?: boolean;
	name: string;
	removed: number;
	running: boolean;
}) {
	return (
		<div
			className={cn(
				'mx-1.5 flex items-start gap-2 rounded-md px-2 py-1.5',
				active && 'bg-pane-strong',
			)}
		>
			{/* The app parks the state icon in a fixed box so a spinner and a dot
			    put the name on the same baseline. */}
			<span className='mt-px grid size-3.5 shrink-0 place-items-center'>
				{running ? (
					<Spinner className='size-2.5' />
				) : (
					<span
						aria-hidden='true'
						className='size-1.5 rounded-full bg-muted/50'
					/>
				)}
			</span>
			<div className='flex min-w-0 flex-1 flex-col gap-0.5'>
				<div className='flex items-center gap-1.5'>
					<span
						className={cn(
							'truncate text-[11px]',
							active ? 'font-medium text-ink' : 'text-ink/85',
						)}
					>
						{name}
					</span>
					<span className='ml-auto flex shrink-0 items-center gap-1 font-mono text-[9px]'>
						<span className='text-ok'>+{added}</span>
						<span className='text-danger'>-{removed}</span>
					</span>
					{dockActive ? (
						<span
							aria-hidden='true'
							className='size-1.5 shrink-0 rounded-full bg-ok'
						/>
					) : null}
				</div>
				<span className='truncate font-mono text-[9px] text-muted/60'>
					{branch}
				</span>
			</div>
		</div>
	);
}

/**
 * Left rail. The traffic lights live here rather than in a title bar of their
 * own — the app hides the native chrome and lets the sidebar run to the top.
 */
export function MockSidebar({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				'flex h-full w-[13.5rem] shrink-0 flex-col border-line border-r bg-sidebar',
				className,
			)}
		>
			{/* Matched to the header beside it: the app hides the native title bar,
			    so the traffic lights have to land on the breadcrumb's baseline. */}
			<div className='flex h-12 shrink-0 items-center px-3'>
				<div className='flex gap-1.5'>
					{TRAFFIC_LIGHTS.map((color) => (
						<span
							className='size-2.5 rounded-full'
							key={color}
							style={{ backgroundColor: color }}
						/>
					))}
				</div>
				<PanelIcon className='ml-auto size-3.5 text-muted/60' />
			</div>

			<nav className='flex flex-col gap-0.5 border-line/70 border-b px-1.5 pb-2'>
				{NAV_ROWS.map((row, index) => {
					const NavIcon = NAV_ICONS[index];
					return (
						<span
							className='flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[11px] text-ink/80'
							key={row}
						>
							<NavIcon className='size-3.5 shrink-0 text-muted' />
							{row}
						</span>
					);
				})}
			</nav>

			<div className='mt-3 flex items-center px-3 pb-1'>
				<span className='text-[10px] text-muted/70'>Repositories</span>
				<PlusSquareIcon className='ml-auto size-3.5 text-muted/60' />
			</div>

			{REPOSITORIES.map((repository) => (
				<div className='flex flex-col' key={repository.name}>
					<div className='flex items-center gap-2 px-3 py-1.5'>
						<span
							aria-hidden='true'
							className='grid size-3.5 shrink-0 place-items-center rounded-[3px] bg-pane-strong font-mono text-[8px] text-muted'
						>
							E
						</span>
						<span className='truncate text-[11px] text-ink/85'>
							{repository.name}
						</span>
						<PlusIcon className='ml-auto size-3 shrink-0 text-muted/60' />
					</div>
					{repository.workspaces.map((workspace) => (
						<WorkspaceRow
							active={workspace.active}
							added={workspace.added}
							branch={workspace.branch}
							dockActive={workspace.dockActive}
							key={workspace.name}
							name={workspace.name}
							removed={workspace.removed}
							running={workspace.state === 'running'}
						/>
					))}
				</div>
			))}
		</div>
	);
}
