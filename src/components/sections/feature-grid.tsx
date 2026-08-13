import { SectionHeading } from '@/components/brand/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { FEATURE_GROUPS } from '@/lib/features';

export function FeatureGrid() {
	return (
		<section className='mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20'>
			<SectionHeading
				eyebrow='The rest of it'
				lede='The parts that do not need a diagram, but are the reason the app is usable all day.'
				title='Everything else in the box.'
			/>

			<div className='mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3'>
				{FEATURE_GROUPS.map((group, groupIndex) => (
					<Reveal
						className='flex flex-col gap-4'
						index={groupIndex}
						key={group.label}
					>
						<h3 className='eyebrow border-line/70 border-b pb-3 text-ink/70'>
							{group.label}
						</h3>
						<ul className='flex flex-col gap-2.5'>
							{group.items.map((item) => (
								<li
									className='flex gap-3 text-[0.875rem] leading-relaxed text-muted/85'
									key={item}
								>
									<span
										aria-hidden='true'
										className='mt-[0.5rem] size-1 shrink-0 bg-accent/50'
									/>
									{item}
								</li>
							))}
						</ul>
					</Reveal>
				))}
			</div>
		</section>
	);
}
