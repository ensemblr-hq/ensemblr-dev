import { EnsemblrWordmark } from '@/components/ensemblr-wordmark';
import { SubscribeForm } from '@/components/subscribe-form';

export default function Home() {
	return (
		<main className='relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-foreground'>
			<div className='flex w-full max-w-xl flex-col items-center gap-8 text-center'>
				<EnsemblrWordmark />
				<div className='flex flex-col items-center gap-3'>
					<p className='font-mono text-xs uppercase tracking-[0.35em] text-foreground/50'>
						Coming soon
					</p>
					<h1 className='max-w-md text-balance text-sm text-foreground/70 sm:text-base'>
						Something is being composed. Join the list for early access.
					</h1>
				</div>
				<SubscribeForm className='mt-2' />
			</div>
			<footer className='pointer-events-none absolute inset-x-0 bottom-6 text-center font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground/25'>
				Ensemblr
			</footer>
		</main>
	);
}
