import { SectionHeading } from '@/components/brand/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { TRUST_ITEMS } from '@/lib/features';

export function Trust() {
	return (
		<section
			className='mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20'
			id='trust'
		>
			<SectionHeading
				eyebrow='Credentials'
				lede='Ensemblr is a workbench, not a service. There is no account, no sync, and nothing to sign into on our side — because there is no our side.'
				title={
					<>
						Your machine. Your <span className='text-accent'>credentials</span>.
					</>
				}
			/>

			{/*
			 * The reveal is on the grid, not on the cells. These four share hairline
			 * dividers made of the parent showing through a 1px gap, and a staggered
			 * per-cell lift slides each cell off those shared lines independently —
			 * so mid-scroll the rules break into offset segments and the whole block
			 * reads as a rendering fault. One entrance for the set keeps them rigid.
			 */}
			{/*
			 * Four across from `lg`, not two. At two the cells were 40rem wide
			 * carrying two lines of prose each, so every card was mostly empty
			 * floor and the block read as a spreadsheet — the most generic shape
			 * a set of four claims can take. Four narrow columns put the measure
			 * back under 40ch and let the set read as one band.
			 */}
			<Reveal className='mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4'>
				{/*
				 * These four carried the smallest headings on the page while making
				 * its second-strongest argument, and a section that whispers its
				 * differentiator is a section the reader skims. They now sit a clear
				 * step above body copy and each takes the accent dot the section
				 * eyebrows use, so the weight matches the claim.
				 */}
				{TRUST_ITEMS.map((item) => (
					<article
						className='flex flex-col gap-3 bg-canvas p-6'
						key={item.title}
					>
						<span
							aria-hidden='true'
							className='size-1.5 shrink-0 bg-accent shadow-[0_0_12px_var(--accent)]'
						/>
						<h3 className='text-balance font-medium text-[1.0625rem] text-ink leading-snug'>
							{item.title}
						</h3>
						<p className='text-pretty text-[0.875rem] text-muted leading-relaxed'>
							{item.body}
						</p>
					</article>
				))}
			</Reveal>
		</section>
	);
}
