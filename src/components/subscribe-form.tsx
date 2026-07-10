'use client';

import { type FormEvent, useState } from 'react';

import { subscribeSchema } from '@/lib/subscribe';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const COPY = {
	invalid: 'Enter a valid email address.',
	error: 'Something went wrong. Please try again.',
	success: "You're on the list — we'll be in touch.",
} as const;

export function SubscribeForm({ className }: { className?: string }) {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<Status>('idle');
	const [message, setMessage] = useState('');

	const busy = status === 'submitting';
	const done = status === 'success';

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (busy || done) {
			return;
		}

		if (!subscribeSchema.safeParse({ email }).success) {
			setStatus('error');
			setMessage(COPY.invalid);
			return;
		}

		setStatus('submitting');
		setMessage('');

		try {
			const response = await fetch('/api/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});
			const payload = (await response.json().catch(() => null)) as {
				ok?: boolean;
				error?: string;
			} | null;

			if (!response.ok || !payload?.ok) {
				setStatus('error');
				setMessage(payload?.error ?? COPY.error);
				return;
			}

			setStatus('success');
			setMessage(COPY.success);
		} catch {
			setStatus('error');
			setMessage(COPY.error);
		}
	}

	return (
		<form
			className={cn('flex w-full max-w-sm flex-col gap-3', className)}
			noValidate
			onSubmit={handleSubmit}
		>
			<div className='flex flex-col gap-2 sm:flex-row'>
				<label className='sr-only' htmlFor='subscribe-email'>
					Email address
				</label>
				<input
					autoComplete='email'
					className='flex-1 rounded-md border border-foreground/15 bg-foreground/5 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus-visible:border-accent-cyan focus-visible:ring-2 focus-visible:ring-accent-cyan/40 disabled:opacity-60'
					disabled={busy || done}
					id='subscribe-email'
					inputMode='email'
					name='email'
					onChange={(event) => {
						setEmail(event.target.value);
						if (status === 'error') {
							setStatus('idle');
							setMessage('');
						}
					}}
					placeholder='you@example.com'
					type='email'
					value={email}
				/>
				<button
					className='rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan disabled:cursor-not-allowed disabled:opacity-60'
					disabled={busy || done}
					type='submit'
				>
					{busy ? 'Joining…' : done ? 'Joined' : 'Notify me'}
				</button>
			</div>
			<output
				aria-live='polite'
				className={cn(
					'block min-h-5 text-sm transition-colors',
					done && 'text-accent-cyan',
					status === 'error' && 'text-accent-pink',
					status !== 'error' && !done && 'text-transparent',
				)}
			>
				{message || ' '}
			</output>
		</form>
	);
}
