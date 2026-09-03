#!/bin/sh
#
# Update an Ensemblr install on Linux x86-64.
#
#   curl -fsSL https://www.ensemblr.dev/update.sh | sh
#   curl -fsSL https://www.ensemblr.dev/update.sh | sh -s -- --check
#
# Ensemblr does not update itself on Linux, by design: an AppImage is a single
# file the user placed themselves, often on a read-only mount or under a
# launcher that would be overwritten behind its back. The app reports a newer
# version and links to the release page. This is the other end of that — the
# thing the app is pointing at.
#
# Thin on purpose. It holds no copy of the installer and no second copy of the
# "which release is newest" rule: it fetches `install.sh`, asks it what the
# newest build is with `--print-latest`, compares that against what is on disk,
# and — unless `--check` — runs that same file. One implementation, two verbs.
#
# POSIX sh. No bashisms — `scripts/check-install-scripts.ts` in the site repo
# parses this file and fails CI on one.

set -eu

SITE_URL='https://www.ensemblr.dev'
INSTALL_URL="${SITE_URL}/install.sh"

DATA_HOME="${XDG_DATA_HOME:-${HOME}/.local/share}"
install_dir="${DATA_HOME}/ensemblr"

want_check='no'
want_desktop='yes'
passthrough_dir='no'

workdir=''

# `--check` found something to install. Distinct from 1, which is an error, so
# a caller can tell "you are behind" from "the lookup failed".
EXIT_UPDATE_AVAILABLE=10

note() {
	printf '%s\n' "$*"
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
Update an Ensemblr install on Linux x86-64.

  curl -fsSL https://www.ensemblr.dev/update.sh | sh
  curl -fsSL https://www.ensemblr.dev/update.sh | sh -s -- --check

Options
  --check           report what is installed and what is available, change
                    nothing. Exits 0 when current, 10 when an update is out
  --dir <path>      where the AppImage lives (default ~/.local/share/ensemblr)
  --no-desktop      passed through: do not touch the launcher entry or icons
  -h, --help        this

The channel comes from the install itself: an install made with --nightly
updates against the canary, everything else against the newest release.
EOF
}

while [ "$#" -gt 0 ]; do
	case "$1" in
	--check)
		want_check='yes'
		shift
		;;
	--dir)
		[ "$#" -ge 2 ] || die '--dir needs a path'
		install_dir="$2"
		passthrough_dir='yes'
		shift 2
		;;
	--dir=*)
		install_dir="${1#--dir=}"
		passthrough_dir='yes'
		shift
		;;
	--no-desktop)
		want_desktop='no'
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

have curl || die 'curl is required and was not found on PATH'

version_file="${install_dir}/.version"
digest_file="${install_dir}/.digest"
channel_file="${install_dir}/.channel"

if [ ! -f "${version_file}" ]; then
	die "no Ensemblr install found in ${install_dir}.
  Install it first:  curl -fsSL ${INSTALL_URL} | sh"
fi

installed_tag="$(cat "${version_file}")"
installed_digest=''
if [ -f "${digest_file}" ]; then
	installed_digest="$(cat "${digest_file}")"
fi
channel='release'
if [ -f "${channel_file}" ]; then
	channel="$(cat "${channel_file}")"
fi

workdir="$(mktemp -d)"
installer="${workdir}/install.sh"

curl -fsSL --retry 3 -o "${installer}" "${INSTALL_URL}" ||
	die "could not fetch ${INSTALL_URL}"

# A truncated or intercepted download is a syntax error far more often than it
# is a working script that does the wrong thing, and this is the one check
# available before handing the file to a shell.
sh -n "${installer}" ||
	die "${INSTALL_URL} did not parse as a shell script; nothing was run"

channel_flag=''
if [ "${channel}" = 'nightly' ]; then
	channel_flag='--nightly'
fi

if [ -n "${channel_flag}" ]; then
	latest="$(sh "${installer}" --print-latest "${channel_flag}")"
else
	latest="$(sh "${installer}" --print-latest)"
fi

[ -n "${latest}" ] || die 'the release lookup returned nothing'

latest_tag="$(printf '%s' "${latest}" | cut -f1)"
latest_digest="$(printf '%s' "${latest}" | cut -f2)"

# Two different questions, because the two channels version themselves
# differently. A release is identified by its tag. The canary is one tag that
# never moves, re-uploaded most nights, so the tag says nothing and the digest
# of the file behind it says everything.
if [ "${channel}" = 'nightly' ]; then
	if [ -z "${latest_digest}" ]; then
		note "Installed: ${installed_tag} (canary)"
		note 'GitHub published no digest for tonight’s canary, so there is nothing to compare.'
		note 'Re-installing is the only way to be current:'
		note "  curl -fsSL ${INSTALL_URL} | sh -s -- --nightly"
		exit 0
	fi
	current='no'
	if [ -n "${installed_digest}" ] && [ "${installed_digest}" = "${latest_digest}" ]; then
		current='yes'
	fi
	note "Installed: ${installed_tag} (canary) ${installed_digest:-no digest recorded}"
	note "Available: ${latest_tag} (canary) ${latest_digest}"
else
	current='no'
	if [ "${installed_tag}" = "${latest_tag}" ]; then
		current='yes'
	fi
	note "Installed: ${installed_tag}"
	note "Available: ${latest_tag}"
fi

if [ "${current}" = 'yes' ]; then
	note 'Ensemblr is up to date.'
	exit 0
fi

if [ "${want_check}" = 'yes' ]; then
	note ''
	note 'An update is available. Install it:'
	note "  curl -fsSL ${INSTALL_URL} | sh"
	exit "${EXIT_UPDATE_AVAILABLE}"
fi

note ''
note 'Updating…'

# Every flag that changes *where* or *how much* is installed goes through, so an
# update lands on the same install the check just read rather than beside it.
set --
if [ -n "${channel_flag}" ]; then
	set -- "$@" "${channel_flag}"
fi
if [ "${passthrough_dir}" = 'yes' ]; then
	set -- "$@" --dir "${install_dir}"
fi
if [ "${want_desktop}" = 'no' ]; then
	set -- "$@" --no-desktop
fi

sh "${installer}" "$@"
