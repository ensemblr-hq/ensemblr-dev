import { NextResponse } from 'next/server';

import { notifyNewSignup } from '@/lib/notify';
import { normalizeEmail, subscribeSchema } from '@/lib/subscribe';

/**
 * Coming-soon email capture → self-hosted NocoDB.
 *
 * Inserts one record per signup via the NocoDB REST API v2:
 *   POST {NOCODB_API_URL}/api/v2/tables/{NOCODB_TABLE_ID}/records
 *   header: xc-token: <NOCODB_API_TOKEN>
 *   body:   [{ [NOCODB_EMAIL_FIELD]: email }]
 *
 * Env (secrets live in .env.local, which is gitignored):
 *   - NOCODB_API_URL      Base URL, e.g. https://nocodb.theswisscheese.com
 *   - NOCODB_API_TOKEN    NocoDB API token (sent as the `xc-token` header)
 *   - NOCODB_TABLE_ID     Target table id
 *   - NOCODB_EMAIL_FIELD  Column name holding the email (optional, default "Email")
 *
 * If URL / token / table id are not all set, the route degrades gracefully:
 * it validates + logs the signup server-side and returns `pending`, so
 * submissions are never dropped with a user-facing error during setup.
 */

const DEFAULT_EMAIL_FIELD = 'Email';

export async function POST(request: Request) {
	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return NextResponse.json(
			{ ok: false, error: 'Invalid request body.' },
			{ status: 400 },
		);
	}

	const parsed = subscribeSchema.safeParse(raw);
	if (!parsed.success) {
		return NextResponse.json(
			{ ok: false, error: 'Enter a valid email address.' },
			{ status: 400 },
		);
	}

	const email = normalizeEmail(parsed.data.email);

	const baseUrl = process.env.NOCODB_API_URL?.replace(/\/+$/, '');
	const token = process.env.NOCODB_API_TOKEN;
	const tableId = process.env.NOCODB_TABLE_ID;
	const emailField = process.env.NOCODB_EMAIL_FIELD || DEFAULT_EMAIL_FIELD;

	if (!baseUrl || !token || !tableId) {
		console.info(
			`[subscribe] captured (not persisted, NocoDB not configured): ${email}`,
		);
		return NextResponse.json({ ok: true, pending: true });
	}

	const recordsUrl = `${baseUrl}/api/v2/tables/${tableId}/records`;
	const headers = { 'Content-Type': 'application/json', 'xc-token': token };

	try {
		// Best-effort dedup: skip the insert if this email is already stored.
		// Any failure here (e.g. wrong field name) falls through to the insert.
		const where = encodeURIComponent(`(${emailField},eq,${email})`);
		const existing = await fetch(`${recordsUrl}?where=${where}&limit=1`, {
			headers,
		});
		if (existing.ok) {
			const body = (await existing.json().catch(() => null)) as {
				list?: unknown[];
			} | null;
			if (body?.list && body.list.length > 0) {
				return NextResponse.json({ ok: true, duplicate: true });
			}
		}

		const insert = await fetch(recordsUrl, {
			method: 'POST',
			headers,
			body: JSON.stringify([{ [emailField]: email }]),
		});

		if (!insert.ok) {
			const detail = await insert.text().catch(() => '');
			console.error(
				`[subscribe] NocoDB insert failed (${insert.status}): ${detail}`,
			);
			return NextResponse.json(
				{
					ok: false,
					error: 'Could not save your email right now. Please try again.',
				},
				{ status: 502 },
			);
		}

		console.info(`[subscribe] stored in NocoDB: ${email}`);
		// New signup persisted — fire the best-effort notification (never throws).
		await notifyNewSignup(email);
		return NextResponse.json({ ok: true });
	} catch (err) {
		console.error('[subscribe] NocoDB request threw:', err);
		return NextResponse.json(
			{
				ok: false,
				error: 'Could not save your email right now. Please try again.',
			},
			{ status: 502 },
		);
	}
}
