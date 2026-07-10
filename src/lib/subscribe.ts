import { z } from 'zod';

/**
 * Validation for the coming-soon email capture.
 * Shared by the client `SubscribeForm` and the `/api/subscribe` route so the
 * client-side and server-side rules can never drift apart.
 */
export const subscribeSchema = z.object({
	email: z.string().trim().pipe(z.email()),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

/** Lowercases an already-validated email for consistent storage / dedup. */
export function normalizeEmail(email: string): string {
	return email.toLowerCase();
}
