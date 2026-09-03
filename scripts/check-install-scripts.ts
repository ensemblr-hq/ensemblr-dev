/**
 * Holds `public/install.sh` and `public/update.sh` to what they claim to be.
 *
 * These two files are the only executable code this site serves, and the page
 * prints them as a `curl … | sh` line — which is a thing a reader is asked to
 * trust. Three properties earn that, and none of them is visible in a diff:
 *
 *   - they parse as POSIX `sh`, in a real POSIX shell rather than in bash's
 *     compatibility mode, so a reader on dash or busybox gets what a reader on
 *     bash gets
 *   - they carry no bashism, for the same reason
 *   - the asset they look for is the asset this site actually pins, so the
 *     script and the download button cannot drift into naming different files
 *
 * The third is the one that would rot silently. `install.sh` picks its download
 * by matching an extension against the GitHub releases payload; the site pins a
 * URL. Nothing else in the repository compares the two, so an app repo that
 * renamed the artifact would break the script months before anyone noticed —
 * and the failure is a reader piping a script that finds nothing.
 *
 * Everything asserted about the shell is *derived from the file*, never
 * duplicated: the repo owner, the download prefix and the extension pattern are
 * read back out of the source and re-applied to the pinned URLs. Reword one of
 * those lines and this fails, which is the point — it is a line whose wording
 * is load-bearing.
 */

// biome-ignore-all lint/suspicious/noTemplateCurlyInString: this file quotes
// shell syntax — `${VAR}`, `${var,,}`, `${var//…}` — inside single-quoted
// strings on purpose. They are the constructs being described, not template
// literals someone forgot to backtick.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { FALLBACK_NIGHTLY, FALLBACK_RELEASE } from '../src/lib/release';
import { REPO, SITE } from '../src/lib/site';

const ROOT = join(import.meta.dir, '..');
const SCRIPTS = ['public/install.sh', 'public/update.sh'] as const;

const problems: string[] = [];

function fault(file: string, message: string): void {
	problems.push(`${file}: ${message}`);
}

function read(path: string): string {
	return readFileSync(join(ROOT, path), 'utf8');
}

/**
 * Comment lines only. A bashism named in a comment is not one, and both files
 * discuss the shells they have to survive.
 */
function withoutComments(
	source: string,
): ReadonlyArray<readonly [number, string]> {
	return source
		.split('\n')
		.map((line, index) => [index + 1, line] as const)
		.filter(([, line]) => !/^\s*#/.test(line));
}

/**
 * The constructs a POSIX shell does not have.
 *
 * Each pattern is tight enough not to fire on the embedded `awk` programs,
 * which are quoted shell strings rather than shell: `function` is required to
 * be followed by an empty parameter list, which awk's never is, and `==` is
 * required to sit inside a `[ … ]` test.
 */
const BASHISMS: ReadonlyArray<readonly [RegExp, string]> = [
	// `\s` after the brackets, so the POSIX character classes the embedded awk
	// programs are full of — `[[:space:]]` — are not mistaken for the keyword.
	[/\[\[\s/, '`[[ … ]]` is a bash keyword; use `[ … ]`'],
	[/\[\s[^\]]*\s==\s/, '`==` inside `[ … ]`; POSIX `test` spells equality `=`'],
	[/^\s*local\s/, '`local` is not in POSIX sh'],
	[/^\s*declare\s/, '`declare` is a bash builtin'],
	[/^\s*function\s+[A-Za-z_][A-Za-z0-9_]*\s*\(\)/, '`function name()` is bash'],
	[/^\s*(source|\.)\s+\S*\.bashrc/, 'sourcing a bash rc file'],
	[/^\s*source\s/, '`source` is bash; POSIX spells it `.`'],
	[/\becho\s+-[en]\b/, '`echo -e`/`echo -n` is not portable; use `printf`'],
	[/&>/, '`&>` is bash redirection; use `>… 2>&1`'],
	[/<<</, '`<<<` here-strings are bash'],
	[/\$'/, "`$'…'` ANSI-C quoting is bash"],
	[/\bpipefail\b/, '`set -o pipefail` is not in POSIX sh'],
	[/^\s*(pushd|popd)\b/, '`pushd`/`popd` are bash builtins'],
	[/\$\{!/, '`${!var}` indirection is bash'],
	[/\$\{[A-Za-z_][A-Za-z0-9_]*(,,|\^\^)/, '`${var,,}`/`${var^^}` are bash'],
	[/\$\{[A-Za-z_][A-Za-z0-9_]*\/\//, '`${var//…}` substitution is bash'],
	[/^\s*[A-Za-z_][A-Za-z0-9_]*\+=/, '`+=` assignment is bash'],
	[/^\s*[A-Za-z_][A-Za-z0-9_]*=\(/, 'array assignment is bash'],
	[/\b(mapfile|readarray)\b/, 'bash-only builtin'],
	[/\bread\s+-a\b/, '`read -a` is bash'],
	[/^\s*select\s+[A-Za-z_]/, '`select` loops are bash/ksh'],
];

/** The POSIX shells to parse with, best first. */
function shells(): string[] {
	const found: string[] = [];
	for (const shell of ['dash', 'busybox', 'sh']) {
		const probe = spawnSync('command', ['-v', shell], { shell: '/bin/sh' });
		if (probe.status === 0) {
			found.push(shell);
		}
	}
	return found;
}

function parseCheck(path: string): void {
	const available = shells();
	// `dash` is the one that means something: on macOS `/bin/sh` is bash in
	// POSIX mode and accepts most of what this file forbids. `busybox ash` is
	// the same standard from the other end and is what an Alpine reader runs.
	const shell = available.find((name) => name !== 'sh') ?? 'sh';
	const args = shell === 'busybox' ? ['sh', '-n', path] : ['-n', path];
	const result = spawnSync(shell, args, { cwd: ROOT, encoding: 'utf8' });

	if (result.error) {
		fault(path, `could not run \`${shell} -n\`: ${result.error.message}`);
		return;
	}
	if (result.status !== 0) {
		fault(path, `\`${shell} -n\` rejected it:\n${result.stderr.trim()}`);
		return;
	}
	if (shell === 'sh') {
		console.warn(
			`⚠ ${path} parsed with \`sh -n\` — install dash for a real POSIX check.`,
		);
	}
}

function shapeCheck(path: string, source: string): void {
	if (!source.startsWith('#!/bin/sh\n')) {
		fault(path, 'must begin with the `#!/bin/sh` shebang');
	}
	if (!/^set -eu$/m.test(source)) {
		fault(path, 'must `set -eu`');
	}
	if (source.includes('\r')) {
		fault(path, 'carries CRLF line endings; a shell served these fails oddly');
	}
	if (!source.endsWith('\n')) {
		fault(path, 'must end with a newline');
	}
}

function bashismCheck(path: string, source: string): void {
	for (const [number, line] of withoutComments(source)) {
		for (const [pattern, why] of BASHISMS) {
			if (pattern.test(line)) {
				fault(path, `line ${number}: ${why}\n    ${line.trim()}`);
			}
		}
	}
}

/**
 * The asset test `install.sh` applies, read back out of the file and run
 * against the URLs this site pins.
 *
 * Both halves are extracted rather than restated. If the repo constants move,
 * the prefix moves with them; if the extension pattern is reworded, this stops
 * finding it and says so rather than passing on a stale copy of it.
 */
function assetCheck(path: string, source: string): void {
	const owner = /^REPO_OWNER='([^']+)'$/m.exec(source)?.[1];
	const name = /^REPO_NAME='([^']+)'$/m.exec(source)?.[1];

	if (owner !== REPO.owner || name !== REPO.name) {
		fault(
			path,
			`names ${owner}/${name}, but src/lib/site.ts says ${REPO.owner}/${REPO.name}`,
		);
		return;
	}

	if (!/^DOWNLOAD_PREFIX="\$\{RELEASES_URL\}\/download\/"$/m.test(source)) {
		fault(
			path,
			'DOWNLOAD_PREFIX is no longer `${RELEASES_URL}/download/`; re-read this check against it',
		);
		return;
	}
	const prefix = `${REPO.releasesUrl}/download/`;

	const extension = /tolower\(url\) !~ \/([^/]+)\//.exec(source)?.[1];
	if (!extension) {
		fault(
			path,
			'could not find the `tolower(url) !~ /…/` extension test; re-read this check against the awk',
		);
		return;
	}
	const extensionPattern = new RegExp(extension);

	const pinned = [
		['FALLBACK_RELEASE.appImage', FALLBACK_RELEASE.appImage?.url],
		['FALLBACK_NIGHTLY.appImage', FALLBACK_NIGHTLY.appImage?.url],
	] as const;

	for (const [label, url] of pinned) {
		if (!url) {
			fault(path, `${label} is null — there is nothing for the script to find`);
			continue;
		}
		if (!url.startsWith(prefix)) {
			fault(
				path,
				`${label} does not start with the prefix the script matches\n    pinned: ${url}\n    prefix: ${prefix}`,
			);
		}
		if (!extensionPattern.test(url.toLowerCase())) {
			fault(
				path,
				`${label} does not satisfy the script's /${extension}/ test\n    pinned: ${url}`,
			);
		}
		// The script splits the tag off the segment after the prefix and needs a
		// `/` after it — a URL with the file at the root of `/download/` resolves
		// to no tag at all and is skipped in silence.
		const rest = url.slice(prefix.length);
		if (!rest.includes('/') || rest.startsWith('/')) {
			fault(path, `${label} has no tag segment the script could read: ${rest}`);
		}
	}
}

function crossScriptCheck(install: string, update: string): void {
	// `update.sh` fetches `install.sh` from this domain and drives it through a
	// flag. Both halves of that contract are asserted, because a rename on
	// either side is a live 404 or a script that runs with no arguments.
	const siteUrl = /^SITE_URL='([^']+)'$/m.exec(update)?.[1];
	if (siteUrl !== SITE.url) {
		fault(
			'public/update.sh',
			`SITE_URL is ${siteUrl}, but src/lib/site.ts says ${SITE.url}`,
		);
	}
	if (!update.includes('/install.sh')) {
		fault('public/update.sh', 'no longer fetches /install.sh');
	}
	if (!install.includes('--print-latest')) {
		fault(
			'public/install.sh',
			'dropped `--print-latest`, which update.sh calls to resolve the newest build',
		);
	}
	if (!update.includes('--print-latest')) {
		fault(
			'public/update.sh',
			'no longer asks install.sh for the newest build; it must not grow a second copy of that rule',
		);
	}
}

const sources = new Map<string, string>();

for (const path of SCRIPTS) {
	const source = read(path);
	sources.set(path, source);
	shapeCheck(path, source);
	parseCheck(path);
	bashismCheck(path, source);
}

assetCheck('public/install.sh', sources.get('public/install.sh') as string);
crossScriptCheck(
	sources.get('public/install.sh') as string,
	sources.get('public/update.sh') as string,
);

if (problems.length > 0) {
	console.error('✗ The served shell scripts did not check out.\n');
	for (const problem of problems) {
		console.error(`  ${problem}`);
	}
	process.exit(1);
}

console.log(
	`✓ ${SCRIPTS.join(' and ')} parse as POSIX sh, carry no bashism, and look for the asset this site pins.`,
);
