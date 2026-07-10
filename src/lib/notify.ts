import { Resend } from 'resend';

/**
 * Best-effort "new signup" notification, sent via Resend.
 *
 * This NEVER throws: a failed notification must not fail the signup, which has
 * already been persisted to NocoDB by the time this runs.
 *
 * Env:
 *   - RESEND_API_KEY          Required. A `sending_access` (send-only) key is
 *                             enough — this only sends email, never manages data.
 *   - NOTIFICATIONS_RECIPIENT Required. Where the alert is sent.
 *   - NOTIFICATIONS_FROM      Optional. Defaults to Resend's shared onboarding
 *                             sender; set a verified-domain sender for reliable
 *                             delivery to arbitrary recipients.
 */
export async function notifyNewSignup(email: string): Promise<void> {
	const apiKey = process.env.RESEND_API_KEY;
	const to = process.env.NOTIFICATIONS_RECIPIENT;
	if (!apiKey || !to) {
		return;
	}

	const from =
		process.env.NOTIFICATIONS_FROM || 'Ensemblr <onboarding@resend.dev>';
	const safeEmail = escapeHtml(email);

	try {
		const resend = new Resend(apiKey);
		const { error } = await resend.emails.send(
			{
				from,
				to,
				subject: `New Ensemblr signup: ${email}`,
				text: `${email} just joined the Ensemblr waitlist.`,
				html: `<p><strong>${safeEmail}</strong> just joined the Ensemblr waitlist.</p>`,
			},
			// Same email → same key → Resend won't send a duplicate notification.
			{ idempotencyKey: `signup-notify/${email}` },
		);
		if (error) {
			console.error('[notify] Resend emails.send failed:', error);
		}
	} catch (err) {
		console.error('[notify] Resend request threw:', err);
	}
}

/** Minimal HTML escaping for interpolating an email into the notification body. */
function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
