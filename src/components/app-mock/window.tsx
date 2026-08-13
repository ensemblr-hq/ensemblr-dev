import { cn } from '@/lib/utils';

import { MockConversation } from './conversation';
import { MockDock } from './dock';
import { Region } from './region';
import { MockReviewPanel } from './review-panel';
import { MockSidebar } from './sidebar';

/**
 * A DOM replica of the Ensemblr workbench, laid out from the running app: no
 * native title bar, traffic lights in the sidebar, and the script dock stacked
 * under the review panel rather than running the full width.
 *
 * `app-chrome` is what makes it read as the product rather than as a diagram —
 * it re-points every colour token inside this subtree at the app's own dark
 * cut, which sits three steps lighter than the page. The window is lit by the
 * product's palette; the page keeps its own.
 *
 * Regions are wrapped so the showcase can move a highlight through the shell
 * as the reader scrolls, rather than cutting between screenshots.
 */
interface AppWindowProps {
	className?: string;
	/**
	 * `full` is the desktop shell — sidebar, conversation, review, dock.
	 *
	 * `narrow` is for viewports too small to hold three panes. It keeps the
	 * sidebar and the review panel and drops the conversation, which is the
	 * opposite of what the responsive rules used to do: they hid the sidebar
	 * below `lg` and the review panel below `md`, so a phone was shown the
	 * conversation alone — a chat box, the one picture that makes this look like
	 * every other agent wrapper. The workspace list *is* the isolation argument
	 * and the diff *is* the review argument; on a small screen those are the two
	 * panes worth keeping and the chat is the one to lose.
	 */
	variant?: 'full' | 'narrow';
}

export function AppWindow({ className, variant = 'full' }: AppWindowProps) {
	const narrow = variant === 'narrow';
	return (
		<div
			aria-label='The Ensemblr workbench: project sidebar, agent conversation, review panel, and script dock.'
			className={cn(
				'app-chrome overflow-hidden rounded-xl bg-canvas',
				// A hairline of light along the top edge and a wide, very soft drop:
				// the two things that read as "a window above the page" rather than
				// "a bordered box drawn on it".
				'ring-1 ring-line/80 ring-inset',
				'shadow-[0_1px_0_0_oklch(1_0_0/0.06)_inset,0_40px_90px_-30px_oklch(0_0_0/0.85),0_8px_24px_-12px_oklch(0_0_0/0.6)]',
				className,
			)}
			role='img'
		>
			{/*
			 * Sized off the running app's proportions rather than to a convenient
			 * band of the page. The workbench is roughly 8:5, and its chrome —
			 * two 3rem headers, a 2.5rem tab strip — is fixed height. Squash the
			 * window and that chrome takes a quarter of it, which is what made
			 * the earlier replica read as a toolbar with a sliver of app under it.
			 */}
			<div className='flex h-[24rem] sm:h-[28rem] lg:h-[34rem] xl:h-[38rem]'>
				<Region
					className={narrow ? 'block shrink-0' : 'hidden lg:block'}
					region='sidebar'
				>
					{/*
					 * Narrower on a phone, because the two panes have ~350px between
					 * them there. The rows already truncate — this is the width the
					 * real sidebar collapses to, not a special mobile drawing.
					 */}
					<MockSidebar className={narrow ? 'w-[9.5rem]' : undefined} />
				</Region>

				{narrow ? null : (
					<Region className='flex min-w-0 flex-1' region='conversation'>
						<MockConversation />
					</Region>
				)}

				<div
					className={cn(
						'flex-col border-line border-l',
						narrow
							? 'flex min-w-0 flex-1'
							: 'hidden w-[19rem] shrink-0 md:flex',
					)}
				>
					<Region className='flex min-h-0 flex-1 flex-col' region='review'>
						<MockReviewPanel />
					</Region>
					<Region region='dock'>
						<MockDock />
					</Region>
				</div>
			</div>
		</div>
	);
}
