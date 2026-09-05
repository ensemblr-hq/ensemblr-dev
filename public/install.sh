#!/bin/sh
#
# Install Ensemblr on Linux x86-64.
#
#   curl -fsSL https://www.ensemblr.dev/install.sh | sh
#
# The app ships a `.AppImage` and nothing else for Linux: no package, no
# launcher entry, no icon, and no self-update — an AppImage is a single file
# the user placed themselves, often on a read-only mount, so the app reports a
# newer version rather than writing over itself. This script is the missing
# half. It puts the file somewhere predictable, extracts the desktop entry and
# the icon ladder the AppImage already carries, and leaves a manifest so
# `--uninstall` removes exactly what it added and nothing else.
#
# Nothing here needs root and nothing is written outside $HOME.
#
#   ~/.local/share/ensemblr/Ensemblr-<version>-x64.AppImage
#   ~/.local/share/ensemblr/.version                        the installed tag
#   ~/.local/bin/ensemblr                                   symlink
#   ~/.local/share/applications/ensemblr.desktop            from the AppImage
#   ~/.local/share/icons/hicolor/<N>x<N>/apps/ensemblr.png  from the AppImage
#
# Re-running it is an update: `update.sh` is the same install, gated on a
# version comparison.
#
# POSIX sh. No bashisms — `scripts/check-install-scripts.ts` in the site repo
# parses this file and fails CI on one.

set -eu

REPO_OWNER='ensemblr-hq'
REPO_NAME='ensemblr'
NIGHTLY_TAG='nightly'

API_URL="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases?per_page=20"
RELEASES_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases"
DOWNLOAD_PREFIX="${RELEASES_URL}/download/"

# XDG with the specification's own defaults. `XDG_BIN_HOME` is not in the base
# directory spec, but `~/.local/bin` is what the spec's own userdirs note and
# every distribution use, and the variable is the conventional override.
DATA_HOME="${XDG_DATA_HOME:-${HOME}/.local/share}"
BIN_HOME="${XDG_BIN_HOME:-${HOME}/.local/bin}"

install_dir="${DATA_HOME}/ensemblr"
apps_dir="${DATA_HOME}/applications"
icons_dir="${DATA_HOME}/icons/hicolor"
bin_link="${BIN_HOME}/ensemblr"

want_tag=''
want_nightly='no'
want_desktop='yes'
want_uninstall='no'
want_print='no'

workdir=''

# ---------------------------------------------------------------- reporting --

note() {
	printf '%s\n' "$*"
}

warn() {
	printf 'warning: %s\n' "$*" >&2
}

die() {
	printf 'error: %s\n' "$*" >&2
	exit 1
}

have() {
	command -v "$1" >/dev/null 2>&1
}

cleanup() {
	if [ -n "${workdir}" ] && [ -d "${workdir}" ]; then
		rm -rf "${workdir}"
	fi
}

trap cleanup EXIT INT HUP TERM

usage() {
	cat <<'EOF'
Install Ensemblr on Linux x86-64.

  curl -fsSL https://www.ensemblr.dev/install.sh | sh
  curl -fsSL https://www.ensemblr.dev/install.sh | sh -s -- --nightly

Options
  --version <tag>   install a specific release, e.g. v0.1.3
  --nightly         install the rolling canary build, alongside a release
  --dir <path>      where the AppImage goes (default ~/.local/share/ensemblr)
  --no-desktop      skip the launcher entry and the icons
  --uninstall       remove everything a previous run of this script installed
  --print-latest    resolve the newest build and print `tag<TAB>sha256<TAB>url`,
                    install nothing; this is what update.sh compares against
  -h, --help        this

Environment
  XDG_DATA_HOME     default ~/.local/share
  XDG_BIN_HOME      default ~/.local/bin
  GITHUB_TOKEN      used for the release lookup if set; the API allows 60
                    unauthenticated requests an hour per address
EOF
}

# ------------------------------------------------------------------- options --

while [ "$#" -gt 0 ]; do
	case "$1" in
	--version)
		[ "$#" -ge 2 ] || die '--version needs a tag, e.g. --version v0.1.3'
		want_tag="$2"
		shift 2
		;;
	--version=*)
		want_tag="${1#--version=}"
		shift
		;;
	--nightly)
		want_nightly='yes'
		shift
		;;
	--dir)
		[ "$#" -ge 2 ] || die '--dir needs a path'
		install_dir="$2"
		shift 2
		;;
	--dir=*)
		install_dir="${1#--dir=}"
		shift
		;;
	--no-desktop)
		want_desktop='no'
		shift
		;;
	--uninstall)
		want_uninstall='yes'
		shift
		;;
	--print-latest)
		want_print='yes'
		shift
		;;
	-h | --help)
		usage
		exit 0
		;;
	*)
		die "unknown option: $1 (try --help)"
		;;
	esac
done

if [ "${want_nightly}" = 'yes' ] && [ -n "${want_tag}" ]; then
	die '--nightly and --version name two different builds; pass one'
fi

manifest="${install_dir}/.installed"
version_file="${install_dir}/.version"
digest_file="${install_dir}/.digest"
channel_file="${install_dir}/.channel"

# ----------------------------------------------------------------- uninstall --

# Only ever removes paths this script recorded installing. A desktop file or an
# icon that arrived from a package manager shares these directories, and an
# uninstaller that swept a directory by glob would take it with them.
remove_recorded() {
	if [ ! -f "${manifest}" ]; then
		return 0
	fi
	while IFS= read -r recorded; do
		[ -n "${recorded}" ] || continue
		if [ -L "${recorded}" ] || [ -e "${recorded}" ]; then
			rm -f "${recorded}"
			note "removed ${recorded}"
		fi
	done <"${manifest}"
}

if [ "${want_uninstall}" = 'yes' ]; then
	if [ ! -d "${install_dir}" ]; then
		note "Nothing to uninstall: ${install_dir} does not exist."
		exit 0
	fi
	remove_recorded
	rm -rf "${install_dir}"
	note "removed ${install_dir}"
	if have update-desktop-database; then
		update-desktop-database "${apps_dir}" >/dev/null 2>&1 || true
	fi
	note 'Ensemblr is uninstalled. Your workspaces and ~/.config/ensemblr were left alone.'
	exit 0
fi

# ------------------------------------------------------------------- gating --

kernel="$(uname -s)"
machine="$(uname -m)"

if [ "${kernel}" != 'Linux' ]; then
	if [ "${kernel}" = 'Darwin' ]; then
		die "this installs the Linux AppImage; on macOS take the .dmg from ${RELEASES_URL} or run: brew install --cask ${REPO_OWNER}/tap/${REPO_NAME}"
	fi
	die "Ensemblr builds for Linux and macOS only; this is ${kernel}"
fi

case "${machine}" in
x86_64 | amd64) ;;
*)
	die "the Linux build is x86-64 only; this machine reports ${machine}"
	;;
esac

have curl || die 'curl is required and was not found on PATH'

# A digest printed beside a download is what makes the download checkable, and
# checking it here rather than telling the reader to is the whole argument for
# piping this script into a shell. Refusing to run without a hashing tool is
# therefore correct: an unverified install is not the cheaper version of this,
# it is a different thing.
#
# Checked before the 144 MB rather than after it, and skipped for
# `--print-latest`, which downloads nothing to hash.
if have sha256sum; then
	sha256_of() { sha256sum "$1" | cut -d' ' -f1; }
elif have shasum; then
	sha256_of() { shasum -a 256 "$1" | cut -d' ' -f1; }
elif have openssl; then
	sha256_of() { openssl dgst -sha256 "$1" | sed 's/^.*= *//'; }
else
	sha256_of() { die 'unreachable: no SHA-256 tool'; }
	if [ "${want_print}" = 'no' ]; then
		die 'no SHA-256 tool found — install coreutils (sha256sum), perl (shasum) or openssl'
	fi
fi

# --------------------------------------------------------- release selection --

fetch_releases() {
	token="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
	if [ -n "${token}" ]; then
		curl -fsSL --retry 3 \
			-H 'Accept: application/vnd.github+json' \
			-H 'X-GitHub-Api-Version: 2022-11-28' \
			-H "Authorization: Bearer ${token}" \
			"${API_URL}"
	else
		curl -fsSL --retry 3 \
			-H 'Accept: application/vnd.github+json' \
			-H 'X-GitHub-Api-Version: 2022-11-28' \
			"${API_URL}"
	fi
}

# Every `.AppImage` in the payload, as `tag<TAB>digest<TAB>url`.
#
# The `body` line goes first: release notes are one JSON-escaped line and could
# quote any key this reads. Dropping it removes the only place in the payload
# where prose and structure share a namespace.
#
# `digest` is reset at each asset's `name` and read before that asset's
# `browser_download_url` — the order GitHub emits them in — so a digest can
# never be carried over from the asset before it.
list_appimages() {
	grep -v '^[[:space:]]*"body"[[:space:]]*:' |
		awk -v prefix="${DOWNLOAD_PREFIX}" '
		/"name"[[:space:]]*:/ { digest = "" }
		/"digest"[[:space:]]*:[[:space:]]*"sha256:/ {
			digest = $0
			sub(/^.*"sha256:/, "", digest)
			sub(/".*$/, "", digest)
		}
		/"browser_download_url"[[:space:]]*:/ {
			url = $0
			sub(/^.*"browser_download_url"[[:space:]]*:[[:space:]]*"/, "", url)
			sub(/".*$/, "", url)
			if (index(url, prefix) != 1) { next }
			if (tolower(url) !~ /\.appimage$/) { next }
			rest = substr(url, length(prefix) + 1)
			slash = index(rest, "/")
			if (slash < 2) { next }
			printf "%s\t%s\t%s\n", substr(rest, 1, slash - 1), digest, url
		}
	'
}

# The newest `v<semver>` tag among them, by SemVer 2.0.0 precedence.
#
# Never by list position and never by a date. `/releases` is ordered by
# `created_at`, which is not tag order — read on 2026-08-21 it ran beta.12,
# beta.11, beta.9, beta.10 — and the nightly's tag is force-moved rather than
# recreated, so its timestamps sit wherever the tag was first cut. This is the
# rule `selectStableRelease` applies on the website, restated here: §11 of the
# spec, so `beta.10` outranks `beta.9` where a string sort has it the other way
# round.
newest_release_line() {
	awk -F '\t' '
		function is_num(s) { return s ~ /^[0-9]+$/ }

		function cmp_id(a, b,   an, bn) {
			an = is_num(a); bn = is_num(b)
			if (an && bn) { return (a + 0) - (b + 0) }
			# "Numeric identifiers always have lower precedence than alphanumeric
			# identifiers", so beta.2 sits below beta.rc rather than above it.
			if (an != bn) { return an ? -1 : 1 }
			if (a == b) { return 0 }
			return (a < b) ? -1 : 1
		}

		function cmp_pre(a, b,   aa, bb, na, nb, i, m, r) {
			na = (a == "") ? 0 : split(a, aa, ".")
			nb = (b == "") ? 0 : split(b, bb, ".")
			# An absent prerelease outranks any present one: 1.0.0 > 1.0.0-beta.1.
			if (na == 0 || nb == 0) {
				if (na == nb) { return 0 }
				return (na == 0) ? 1 : -1
			}
			m = (na < nb) ? na : nb
			for (i = 1; i <= m; i++) {
				r = cmp_id(aa[i], bb[i])
				if (r != 0) { return r }
			}
			# Every shared identifier is equal, so the longer set wins.
			return na - nb
		}

		# Fills v_major/v_minor/v_patch/v_pre; returns 0 when the tag is not
		# a `v<semver>` at all, which is how `nightly` and `latest` are excluded.
		function parse(tag,   core, build, dash, parts, n, i, id) {
			if (substr(tag, 1, 1) != "v") { return 0 }
			core = substr(tag, 2)
			build = index(core, "+")
			# Build metadata is parsed and then ignored, as the spec requires.
			if (build > 0) { core = substr(core, 1, build - 1) }
			dash = index(core, "-")
			v_pre = ""
			if (dash > 0) {
				v_pre = substr(core, dash + 1)
				core = substr(core, 1, dash - 1)
			}
			if (split(core, parts, ".") != 3) { return 0 }
			for (i = 1; i <= 3; i++) {
				if (parts[i] !~ /^(0|[1-9][0-9]*)$/) { return 0 }
			}
			v_major = parts[1] + 0; v_minor = parts[2] + 0; v_patch = parts[3] + 0
			if (v_pre != "") {
				n = split(v_pre, parts, ".")
				if (n == 0) { return 0 }
				for (i = 1; i <= n; i++) {
					id = parts[i]
					if (id !~ /^(0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)$/) { return 0 }
				}
			}
			return 1
		}

		{
			if (!parse($1)) { next }
			major = v_major; minor = v_minor; patch = v_patch; pre = v_pre
			if (!have_best) {
				have_best = 1
				b_major = major; b_minor = minor; b_patch = patch; b_pre = pre
				best = $0
				next
			}
			r = major - b_major
			if (r == 0) { r = minor - b_minor }
			if (r == 0) { r = patch - b_patch }
			if (r == 0) { r = cmp_pre(pre, b_pre) }
			if (r > 0) {
				b_major = major; b_minor = minor; b_patch = patch; b_pre = pre
				best = $0
			}
		}

		END { if (have_best) { print best } }
	'
}

if [ "${want_print}" = 'no' ]; then
	note 'Looking up the release…'
fi

workdir="$(mktemp -d)"
payload_file="${workdir}/releases.json"

if ! fetch_releases >"${payload_file}" 2>/dev/null; then
	die "could not reach the GitHub releases API. It allows 60 unauthenticated requests an hour per address — set GITHUB_TOKEN, or take the AppImage by hand from ${RELEASES_URL}"
fi

candidates="$(list_appimages <"${payload_file}")"

if [ -z "${candidates}" ]; then
	die "no .AppImage found in the newest releases — see ${RELEASES_URL}"
fi

if [ "${want_nightly}" = 'yes' ]; then
	selected="$(printf '%s\n' "${candidates}" | awk -F '\t' -v tag="${NIGHTLY_TAG}" '$1 == tag { print; exit }')"
	[ -n "${selected}" ] || die "the ${NIGHTLY_TAG} tag carries no .AppImage right now — the canary skips a night the branch did not move"
elif [ -n "${want_tag}" ]; then
	selected="$(printf '%s\n' "${candidates}" | awk -F '\t' -v tag="${want_tag}" '$1 == tag { print; exit }')"
	[ -n "${selected}" ] || die "${want_tag} is not among the 20 newest releases, or it carries no .AppImage — see ${RELEASES_URL}"
else
	selected="$(printf '%s\n' "${candidates}" | newest_release_line)"
	[ -n "${selected}" ] || die "no published v<semver> release carries an .AppImage — see ${RELEASES_URL}"
fi

tag="$(printf '%s' "${selected}" | cut -f1)"
digest="$(printf '%s' "${selected}" | cut -f2)"
url="$(printf '%s' "${selected}" | cut -f3)"
asset="$(basename "${url}")"

# The lookup as its own verb, so `update.sh` can ask what the newest build is
# without carrying a second copy of the selection rule. One implementation of
# "which release is newest", used by both scripts.
if [ "${want_print}" = 'yes' ]; then
	printf '%s\t%s\t%s\n' "${tag}" "${digest}" "${url}"
	exit 0
fi

note "Found ${tag} — ${asset}"

# ------------------------------------------------------------------ download --

download="${workdir}/${asset}"

if [ -t 2 ]; then
	curl -fL --retry 3 --progress-bar -o "${download}" "${url}" ||
		die "download failed: ${url}"
else
	curl -fsSL --retry 3 -o "${download}" "${url}" ||
		die "download failed: ${url}"
fi

# The verification the page's printed digest promises, done here so the reader
# does not have to. A mismatch is fatal and never a warning: a binary that is
# not the one GitHub published is not a binary this script may put on a PATH.
if [ -n "${digest}" ]; then
	actual="$(sha256_of "${download}")"
	if [ "${actual}" != "${digest}" ]; then
		die "SHA-256 mismatch for ${asset}
  expected ${digest}
  got      ${actual}
  Nothing was installed. Re-run, and if it fails again report it at ${RELEASES_URL}"
	fi
	note "SHA-256 verified: ${digest}"
else
	# Assets uploaded before GitHub published per-asset digests carry none. Say
	# so rather than printing a tick over a check that did not happen.
	warn "GitHub published no digest for ${asset}; it was downloaded but not verified"
fi

# ------------------------------------------------------------------- install --

mkdir -p "${install_dir}" "${BIN_HOME}"

target="${install_dir}/${asset}"
chmod +x "${download}"
mv -f "${download}" "${target}"

# Everything this run puts outside `install_dir`, so `--uninstall` can remove
# exactly that and leave a distribution's own files where they are.
: >"${manifest}"
record() {
	printf '%s\n' "$1" >>"${manifest}"
}

# Older AppImages in the same directory, which a re-run has just superseded.
# Scoped to this script's own naming and never to the directory at large.
for previous in "${install_dir}"/*.AppImage "${install_dir}"/*.appimage; do
	if [ -f "${previous}" ] && [ "${previous}" != "${target}" ]; then
		rm -f "${previous}"
		note "removed the previous build: $(basename "${previous}")"
	fi
done

ln -sfn "${target}" "${bin_link}"
record "${bin_link}"

printf '%s\n' "${tag}" >"${version_file}"
printf '%s\n' "${digest}" >"${digest_file}"
if [ "${want_nightly}" = 'yes' ]; then
	printf '%s\n' 'nightly' >"${channel_file}"
else
	printf '%s\n' 'release' >"${channel_file}"
fi

note "Installed ${target}"
note "Linked ${bin_link}"

# ---------------------------------------------------- desktop entry and icons --

# The AppImage already carries a freedesktop entry and a full `hicolor` ladder;
# nothing on a stock Linux desktop extracts them, which is why a downloaded
# AppImage has no launcher entry and no icon. `--appimage-extract` needs no FUSE
# and no root, so this is just a copy out of a file the user already has.
install_desktop() {
	extract_dir="${workdir}/extract"
	mkdir -p "${extract_dir}"

	if ! (cd "${extract_dir}" && "${target}" --appimage-extract >/dev/null 2>&1); then
		warn 'could not extract the AppImage, so no launcher entry or icon was installed. The app itself runs: '"${bin_link}"
		return 0
	fi

	root="${extract_dir}/squashfs-root"
	[ -d "${root}" ] || {
		warn 'the AppImage extracted to an unexpected layout; skipping the launcher entry'
		return 0
	}

	desktop_src=''
	for candidate in "${root}"/*.desktop; do
		if [ -f "${candidate}" ]; then
			desktop_src="${candidate}"
			break
		fi
	done
	if [ -z "${desktop_src}" ]; then
		for candidate in "${root}"/usr/share/applications/*.desktop; do
			if [ -f "${candidate}" ]; then
				desktop_src="${candidate}"
				break
			fi
		done
	fi

	if [ -z "${desktop_src}" ]; then
		warn 'the AppImage carries no .desktop file; skipping the launcher entry'
	else
		mkdir -p "${apps_dir}"
		desktop_dst="${apps_dir}/$(basename "${desktop_src}")"

		# `Exec` and `TryExec` point at the AppImage in the bundle it was read
		# from, which is a path inside a mount that only exists while the app is
		# running. Both are rewritten to the installed file — the file itself and
		# not the symlink, so a launcher entry survives `~/.local/bin` being
		# reordered or cleared.
		#
		# Only the first token of `Exec` is replaced: what follows it is the field
		# code the entry needs to receive a URL, and this app registers
		# `x-scheme-handler/ensemblr`.
		#
		# `Exec` is double-quoted so a path with a space survives; `TryExec` is
		# not, and the asymmetry is load-bearing. The spec defines the quoting
		# mechanism for `Exec` alone — "the double quotes, escaping, etc. are
		# defined in The Exec key section, so they don't apply to any other keys".
		# A quoted `TryExec` is therefore a path holding literal `"` characters:
		# the file is never found, and KDE rejects the whole entry as invalid
		# rather than merely hiding it. `TryExec` takes the bare path, which needs
		# no quoting because it is a single string that is never word-split.
		has_try='0'
		if grep -q '^TryExec=' "${desktop_src}"; then
			has_try='1'
		fi

		# Every group's `Exec`, not just the entry's: a `[Desktop Action]` that
		# still pointed at `AppRun` would be a launcher right-click item that
		# does nothing. `TryExec` is inserted only in `[Desktop Entry]`, which is
		# the one group the specification allows it in.
		awk -v target="${target}" -v has_try="${has_try}" '
			/^\[/ { in_entry = ($0 == "[Desktop Entry]"); print; next }
			/^Exec=/ {
				value = substr($0, 6)
				space = index(value, " ")
				tail = (space > 0) ? substr(value, space) : ""
				printf "Exec=\"%s\"%s\n", target, tail
				if (in_entry && has_try == "0") { printf "TryExec=%s\n", target }
				next
			}
			/^TryExec=/ { printf "TryExec=%s\n", target; next }
			{ print }
		' "${desktop_src}" >"${desktop_dst}"

		chmod 644 "${desktop_dst}"
		record "${desktop_dst}"
		note "Installed ${desktop_dst}"
	fi

	# The whole ladder, at whatever sizes this build shipped. Enumerated rather
	# than hardcoded: a build that adds or drops a size should install what it
	# has, not what this script remembers.
	icon_root="${root}/usr/share/icons/hicolor"
	icon_count='0'
	if [ -d "${icon_root}" ]; then
		for icon_src in "${icon_root}"/*/apps/*.png "${icon_root}"/*/apps/*.svg; do
			[ -f "${icon_src}" ] || continue
			size_dir="$(basename "$(dirname "$(dirname "${icon_src}")")")"
			icon_dst_dir="${icons_dir}/${size_dir}/apps"
			mkdir -p "${icon_dst_dir}"
			icon_dst="${icon_dst_dir}/$(basename "${icon_src}")"
			cp -f "${icon_src}" "${icon_dst}"
			chmod 644 "${icon_dst}"
			record "${icon_dst}"
			icon_count=$((icon_count + 1))
		done
	fi

	if [ "${icon_count}" -gt 0 ]; then
		note "Installed ${icon_count} icons under ${icons_dir}"
	else
		warn 'the AppImage carries no hicolor icons; the launcher will draw a placeholder'
	fi

	# Both optional, both best-effort. A desktop that indexes on its own — or a
	# session that has not been restarted yet — is not an install failure.
	if have update-desktop-database; then
		update-desktop-database "${apps_dir}" >/dev/null 2>&1 || true
	fi
	if have gtk-update-icon-cache; then
		gtk-update-icon-cache -f -t "${icons_dir}" >/dev/null 2>&1 || true
	fi
}

if [ "${want_desktop}" = 'yes' ]; then
	install_desktop
fi

# --------------------------------------------------------------------- next --

case ":${PATH}:" in
*":${BIN_HOME}:"*) ;;
*)
	warn "${BIN_HOME} is not on your PATH, so \`ensemblr\` will not resolve as a command."
	printf '  Add it:  echo '\''export PATH="%s:$PATH"'\'' >> ~/.profile\n' "${BIN_HOME}" >&2
	;;
esac

note ''
note "Ensemblr ${tag} is installed. Start it with \`ensemblr\`, or from your launcher."
note 'It needs git, an authenticated gh, and either the Pi or the Claude Code CLI.'
note 'Ensemblr does not update itself on Linux. To update:'
note '  curl -fsSL https://www.ensemblr.dev/update.sh | sh'
