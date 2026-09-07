/**
 * The two shell scripts this site serves, and the commands that run them.
 *
 * They are the only executable code on this domain. The app ships Linux as a
 * bare `.AppImage` — no package, no launcher entry and no icon — and
 * `install.sh` closes that gap; `update.sh` is the same install gated on a
 * version comparison.
 *
 * `update.sh` is no longer the only way up. ADR 0065 amended 0056 at 0.1.6: a
 * build running as an AppImage in a directory it can write installs its own
 * updates. What is left for the script is what the app still declines — a
 * read-only or root-owned location, a copy not running as an AppImage, a
 * release with no published digest, and updates switched off — which is what
 * the check-only fallback points a Linux user at.
 *
 * Deliberately free of Next imports, for the same reason `schemas.ts` is:
 * `next.config.ts` reads this file to build the response headers, and it is
 * loaded by Next's own config loader rather than compiled with the app.
 *
 * The commands are derived from `SITE.url` rather than typed out. A `curl` line
 * printed with the wrong host is the one string on this page where a typo is
 * executed rather than read.
 */

import { SITE } from './site';

export interface ServedScript {
	/** The path this site serves it at, and the file under `public/`. */
	readonly path: string;
	/** What it does, for the header comment and the page. */
	readonly summary: string;
}

export const INSTALL_SCRIPT_PATH = '/install.sh';
export const UPDATE_SCRIPT_PATH = '/update.sh';

export const SHELL_SCRIPTS: readonly ServedScript[] = [
	{
		path: INSTALL_SCRIPT_PATH,
		summary:
			'Installs the Linux x86-64 AppImage under ~/.local, with the desktop entry and icons the AppImage already carries.',
	},
	{
		path: UPDATE_SCRIPT_PATH,
		summary:
			'Compares the installed tag against the newest release and re-runs install.sh when it is behind.',
	},
];

/**
 * `text/x-shellscript`, which is what these are.
 *
 * Next infers `application/octet-stream` for an unknown extension under
 * `public/`, and `text/plain` would render them in a browser tab — the friendly
 * option, and a lie about what the bytes are. A reader who wants to read one
 * before running it pipes it to a pager, which is the same act as running it
 * minus the shell, and `nosniff` keeps a browser from guessing either way.
 */
export const SHELL_SCRIPT_CONTENT_TYPE = 'text/x-shellscript; charset=utf-8';

/**
 * Five minutes, where the schemas take an hour.
 *
 * The difference is what the file is for. A stale schema completes an editor
 * against a key that shipped last week; a stale installer is executed. Whatever
 * window this sets is how long a bad script keeps reaching people after it has
 * been fixed, so it is set to the shortest value that still absorbs a burst.
 */
export const SHELL_SCRIPT_CACHE_CONTROL = 'public, max-age=300';

/**
 * The Linux install path, as the two lines the page prints.
 *
 * `HOMEBREW` is the macOS counterpart and the rules are the same: no version in
 * either command, nothing beside them printing one. There is no tap to resolve
 * a version from here — the script resolves the newest release itself, by the
 * same SemVer rule `selectStableRelease` applies — so a tag written next to
 * this would be a second thing to bump on every release and the first to go
 * stale.
 */
export const LINUX_INSTALL = {
	install: `curl -fsSL ${SITE.url}${INSTALL_SCRIPT_PATH} | sh`,
	update: `curl -fsSL ${SITE.url}${UPDATE_SCRIPT_PATH} | sh`,
} as const;
