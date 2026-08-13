import { cn } from '@/lib/utils';

/**
 * The replica's stateless parts. No hooks, no `'use client'` — these render on
 * the server, which is what lets `sections/orchestration.tsx` borrow `Spinner`
 * and `StatusDot` for its control diagram without opening a client boundary.
 * `Region`, the one piece that does need one, lives in `./region`.
 */

const STATE_COLOR = {
	active: 'bg-accent',
	idle: 'bg-muted/40',
	review: 'bg-ok',
	running: 'bg-signal',
} as const;

export function StatusDot({
	state,
	pulse,
}: {
	state: keyof typeof STATE_COLOR;
	pulse?: boolean;
}) {
	return (
		<span
			aria-hidden='true'
			className={cn(
				'size-1.5 shrink-0 rounded-full',
				STATE_COLOR[state],
				pulse && 'animate-pulse motion-reduce:animate-none',
			)}
		/>
	);
}

export function MockTab({
	active,
	children,
	className,
}: {
	active?: boolean;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				'flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[11px] transition-colors',
				active ? 'bg-pane-strong text-ink' : 'text-muted/70 hover:text-muted',
				className,
			)}
		>
			{children}
		</span>
	);
}

/**
 * The app's working indicator: a spinning arc, not a bar.
 *
 * Neutral, because the app's is — `getWorkspaceSidebarState` returns
 * `text-muted-foreground` for every spinning state and keeps `status-danger`
 * for blocked merges and conflicts. A red spinner on a row that is merely busy
 * reads as a failure, which is the opposite of what it reports.
 */
export function Spinner({ className }: { className?: string }) {
	return (
		<span
			aria-hidden='true'
			className={cn(
				'size-3 shrink-0 animate-spin rounded-full border border-muted border-t-transparent motion-reduce:animate-none',
				className,
			)}
		/>
	);
}
