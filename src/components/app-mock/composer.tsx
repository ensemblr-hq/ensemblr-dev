import {
	ArrowIcon,
	BarsIcon,
	BookIcon,
	GaugeIcon,
	PlugIcon,
	PlusIcon,
	SparkIcon,
} from './icons';

/**
 * The composer's controls, in the app's order: model, thinking strength and
 * plan mode on the left; MCP servers, the context gauge and attachments beside
 * the submit button on the right. The thinking chip tints amber once thinking
 * is on, which is the one piece of colour the row carries.
 *
 * Takes its three strings rather than reading `COMPOSER` directly, because the
 * Concierge panel draws the same row with its own placeholder and its own
 * model — `app.concierge` is a top-level setting beside `app.models`, not a key
 * inside it. Same control row, different address.
 */
export function MockComposer({
	model,
	placeholder,
	thinking,
}: {
	model: string;
	placeholder: string;
	thinking: string;
}) {
	return (
		<div className='shrink-0 p-2.5'>
			<div className='rounded-lg border border-line bg-surface p-2.5'>
				<span className='text-[11px] text-muted/80'>{placeholder}</span>
				{/* Same guard as the breadcrumb: the submit button sits behind
				    `ml-auto`, and without a clip of its own this row put it over the
				    dock's terminal output the moment the column got tight. The chips
				    give way first — they are the labels, the button is the control. */}
				<div className='mt-8 flex min-w-0 items-center gap-1 overflow-hidden'>
					<span className='flex min-w-0 items-center gap-1 rounded-md px-1 py-0.5 text-[10px] text-muted'>
						<SparkIcon className='size-3 shrink-0' />
						<span className='truncate'>{model}</span>
					</span>
					<span className='flex min-w-0 items-center gap-1 rounded-md bg-warning/10 px-1.5 py-0.5 text-[10px] text-warning'>
						<BarsIcon className='size-3 shrink-0' />
						<span className='truncate'>{thinking}</span>
					</span>
					{/* Plan mode and the context gauge are the two the row can lose
					    without changing what it says: the model, the thinking strength
					    and the submit button are the sentence. */}
					<BookIcon className='@max-[16rem]:hidden size-3.5 shrink-0 text-muted/65' />
					<span className='ml-auto flex shrink-0 items-center gap-2'>
						<PlugIcon className='size-3.5 text-muted/65' />
						<GaugeIcon className='@max-[16rem]:hidden size-3.5 text-muted/65' />
						<PlusIcon className='size-3.5 text-muted/65' />
						<span className='grid size-5 place-items-center rounded-md bg-pane-strong'>
							<ArrowIcon className='size-3 -rotate-90 text-ink/70' />
						</span>
					</span>
				</div>
			</div>
		</div>
	);
}
