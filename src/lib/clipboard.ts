/**
 * Getting a command onto the reader's clipboard, and what to do when the
 * browser refuses.
 *
 * `navigator.clipboard` is not something a page may assume. It is absent
 * outside a secure context — plain `http://` on a LAN address, which is how
 * anyone previewing this site from a second machine sees it — and `writeText`
 * *rejects* rather than throwing where the browser denies the permission or the
 * document is not focused. Both failures are invisible to a caller that does
 * not ask, and a button that claims to have copied when it has not is worse
 * than no button at all: the reader pastes whatever was on the clipboard
 * before, into a shell.
 *
 * Hence two halves. `writeClipboard` answers whether the write actually
 * happened, and `selectTextOf` is what the caller reaches for when it did not —
 * the command highlighted in place, one keystroke from the clipboard, needing
 * no permission and no secure context.
 */

/** The one method of the Clipboard API this site uses. */
export type ClipboardWriter = Partial<Pick<Clipboard, 'writeText'>>;

/**
 * Writes `text` to the clipboard.
 *
 * @param text - The exact string to place on the clipboard.
 * @param clipboard - The writer to use; defaults to the browser's, and is a
 *   parameter so the failure paths can be tested without one.
 * @returns Whether the clipboard now holds `text`.
 */
export async function writeClipboard(
	text: string,
	clipboard: ClipboardWriter | undefined = globalThis.navigator?.clipboard,
): Promise<boolean> {
	if (typeof clipboard?.writeText !== 'function') {
		return false;
	}

	try {
		await clipboard.writeText(text);
		return true;
	} catch {
		/*
		 * Not swallowed — the `false` is the error, and it is the half of this
		 * module the caller can act on. A `DOMException` from a denied permission
		 * carries nothing a visitor could use, this site ships no logger, and the
		 * caller's answer to every rejection is the same one: select the text and
		 * say so.
		 */
		return false;
	}
}

/**
 * Selects an element's text, so that ⌘C copies what the button could not.
 *
 * @param element - The node holding the command, or `null` before it mounts.
 * @returns Whether a selection was made.
 */
export function selectTextOf(element: Node | null): boolean {
	const selection = globalThis.getSelection?.();

	if (!element || !selection) {
		return false;
	}

	const range = document.createRange();
	range.selectNodeContents(element);
	selection.removeAllRanges();
	selection.addRange(range);
	return true;
}
