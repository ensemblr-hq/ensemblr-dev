<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Facts about the app come from the app's repo

This repo is a marketing site for software that lives somewhere else:
**https://github.com/ensemblr-hq/ensemblr**. Nearly every concrete claim on the page — the release
you can download, what you need installed to run it, how it is signed, what its window looks like —
describes that repo and cannot be checked from inside this one.

So: **never state a fact about the app from memory.** Read it from the app repo in the same session
you write it down. Your training data is older than the product.

## The site offers two platforms, and they are not symmetrical

The app builds for **macOS on Apple silicon** and **Linux on x86-64**, and this site offers both. It
did not always: every surface here described the `.dmg` alone until Linux was announced, and the
copy was deliberately narrower than its source. That is over — `SITE.tagline`, both descriptions,
`REQUIREMENTS`, `DISTRIBUTION`, the hero, the download section and `structured-data.ts`'s
`operatingSystem` were all widened in one pass, and any future narrowing has to be one pass too.

**What has not changed is that the two builds are different products in the one way this page cares
about.** Do not write a sentence that covers both unless it is true of both:

- The `.dmg` is signed with a Developer ID, notarised, and stapled. **The `.AppImage` is unsigned** —
  `make:linux` runs in a CI job that skips `verify:signing`, and `notarizationEnabled` has always
  required darwin. `DISTRIBUTION.linux` says the word out loud and `IntegrityNote` draws a
  fingerprint rather than a shield for it. Do not soften either.
- macOS updates itself. **Linux is check-only** — ADR 0056: "an AppImage is a single file the user
  placed themselves, often on a read-only mount". The app reports a newer version and links to the
  release page; `public/update.sh` is the other end of that. A page that promises background updates
  to a Linux reader is promising something the app refuses to do on purpose.
- Secrets go to the macOS Keychain, or to gnome-keyring / KWallet through Electron's `safeStorage` on
  Linux. `TRUST_ITEMS` says both. "The Keychain" alone was true and is now a specific, checkable,
  wrong claim.

Three things enforce the split rather than trusting the copy:

- `macosAssets()` and `linuxAssets()` in `src/lib/release.ts` filter the live asset list by name
  before `findAsset` runs — `arm64` for one, `.appimage` plus `x86_64|x64` for the other. Until
  beta.19 the extension *was* the platform test; it is not one any more, and an artifact printed
  under the wrong label sits beside a digest that matches it, which is the worse failure: checkable,
  and still a lie. **The two spellings are both real** — the release asset says `x64` and the canary
  says `x86_64` — and a matcher must take both and never match `arm64`. `release.test.ts` asserts
  the partition in both directions.
- `scripts/check-install-scripts.ts` reads the asset test back out of `public/install.sh` and runs it
  against the pinned URLs, so the script and the download button cannot drift into looking for
  different files. It also parses both scripts with `dash` and rejects bashisms.
- `public/schemas/config.schema.json` is exempt from all of this: it is the app's file, republished
  byte-for-byte, and `appearance.titleBar` documents itself as Linux-only. Copy it verbatim.
  `check:schemas` compares bytes and a hand-edit would fail it.

One more rule that outlived the narrowing. **`Linux®` appears exactly once on the page**, on
`REQUIREMENTS[0].short`, and the legend sits in `THIRD_PARTY.attribution`. Both are what the Linux
Foundation's mark page asks for: the symbol on the first prominent appearance, the sentence at the
foot of the page, and nothing repeated in between. Adding a second ® is as wrong as dropping the
first.

## Before you touch the download surface

`FALLBACK_RELEASE` in `src/lib/release.ts` is not a developer convenience. It is what real visitors
download whenever the GitHub API is rate-limited at build time, and the page prints a SHA-256 beside
the link. A stale pin is a dead download link next to a digest that matches nothing, on a page whose
whole argument is that its claims are checkable.

Read the live release before you write anything down:

```bash
gh release list --repo ensemblr-hq/ensemblr --limit 5
gh release view <tag> --repo ensemblr-hq/ensemblr \
  --json tagName,publishedAt,isPrerelease,url,assets
```

That second command returns each asset's `name`, `size`, `url` and `digest` — every field
`FALLBACK_RELEASE` needs, for all **three** of them: the Apple silicon `.dmg` and `.zip`, and the
Linux x86-64 `.AppImage`. Copy them out of the response. Do not retype a digest or a byte size, and
do not carry one over from a previous edit. `digest` is `sha256:<hex>`; the pin stores the bare hex,
the same stripping `toSha256()` does at runtime, and `bun test` rejects anything a reader could not
check with `shasum -a 256`.

Then confirm the pin agrees with the world:

```bash
bun run check:pin
```

Without `gh`, the same data is at
`https://api.github.com/repos/ensemblr-hq/ensemblr/releases?per_page=5` — 60 unauthenticated
requests an hour per IP, so expect to be refused if you lean on it. Note `/releases/latest` **404s**
for this repo: every Ensemblr build so far is a prerelease and that endpoint excludes prereleases.
The list endpoint is the only one that works.

The whole procedure is written out, paste-ready, in [`docs/re-pinning.md`](docs/re-pinning.md).
Nothing automates it — there is no bump PR, no cross-repo token and no dispatch from the app repo,
by decision. Read that file before re-pinning; do not rebuild the automation.

Two more things about that endpoint, both of which have already caused bugs:

- **Position is never the answer, and neither timestamp rescues it.** The order returned is not
  newest-first: read on 2026-08-21 it ran beta.12, beta.11, **beta.9, beta.10**, `nightly`, beta.8 —
  the older release ahead of the newer, and the rolling tag wedged between two releases. Sorting on
  a date is no better. The app force-moves `nightly` onto a new commit most mornings and re-uploads
  its assets onto the same release, so `published_at` is what freezes at the first publish while
  `created_at` follows the commit the tag now points at; that day it read `created_at`
  2026-08-20T19:14:31Z against `published_at` 2026-08-18T13:12:43Z. Pick by tag:
  `selectStableRelease` takes the newest `v<semver>` compared as *parsed* semver, and
  `selectNightly` takes the literal tag `nightly`. Both live in `src/lib/release.ts` and both are
  called by the page and by `check:pin`, so they cannot drift.
- **The nightly is pinned by URL only.** `FALLBACK_NIGHTLY` carries no size and no digest for either
  platform, because the bytes behind those fixed URLs are replaced most nights. The `Nightly` type
  has no field to put one in. Do not add one, and do not let the nightly row print a number it
  cannot stand behind — the row says why it has no digest instead. Note the canary AppImage is
  `Ensemblr-Canary-x86_64.AppImage` where the release one is `…-x64.AppImage`; the spellings differ
  and `release.test.ts` holds both.

## Before you touch the brew line

`HOMEBREW` in `src/lib/site.ts` is copied from a cask in a *second* repository,
[`ensemblr-hq/homebrew-tap`](https://github.com/ensemblr-hq/homebrew-tap) — not from the app repo,
and not from `brew info`, which reports whatever the reader's own tap has fetched:

```bash
gh api "repos/ensemblr-hq/homebrew-tap/contents/Casks/ensemblr.rb?ref=main" --jq '.content' | base64 -d
```

Every claim the page makes beside the command is a line in that file: `depends_on arch:`,
`depends_on macos:`, `auto_updates`. Read them there before you restate them.

**The command carries no version, and nothing beside it may print one.** The cask resolves its own
version from the tap and the app's release workflow rewrites it there, so a tag repeated on this
page is a second thing to bump on every release — the exact chore the tap was built to remove. Add
one and it goes stale on the next release with nothing to catch it: `check:pin` watches
`FALLBACK_RELEASE`, not this. The `sha256` in the cask is the tap's business for the same reason;
the digest this page prints belongs to `IntegrityNote` and describes the `.dmg` the button links to.

## Before you touch the install scripts

`public/install.sh` and `public/update.sh` are the only executable code this site serves, and the
page prints them as a `curl … | sh` line. Three things make that defensible, and all three are
checked by `bun run check:scripts`:

- they parse in a **real POSIX shell** (`dash`), not in bash's compatibility mode
- they carry **no bashism** — no `[[`, no `local`, no `${var//…}`, no arrays
- the asset `install.sh` looks for is the asset `FALLBACK_RELEASE` pins, derived from the script's
  own source rather than restated

`install.sh` verifies the SHA-256 GitHub published before it moves anything into place, and a
mismatch is fatal. That verification is the argument for the `curl | sh` line existing at all; do not
make it a warning, and do not add a flag that skips it.

Two more rules the checker enforces because a rename breaks them silently:

- `update.sh` holds **no second copy** of the "which release is newest" rule. It fetches `install.sh`
  and calls it with `--print-latest`. One implementation, two verbs — keep it that way.
- the SemVer comparison inside `install.sh` is `selectStableRelease`'s rule restated in `awk`, §11 of
  the spec and all. It is never position in the `/releases` list and never a timestamp, for exactly
  the reasons written out below.

Neither script is copied from the app repo — they are this site's own — but every fact in them is:
the AppImage layout, the `.desktop` basename, the `hicolor` ladder. Read `forge.config.ts` and ADR
0056 before changing what they extract, and prefer enumerating what the bundle actually holds over
hardcoding a list of sizes.

## Before you touch the published schemas

`public/schemas/*.schema.json` are the app's own JSON Schemas, republished here because each one
declares a canonical `$id` on this domain. They are copies, and the only ones in this repo that are
byte-for-byte checked — Biome is told to leave them alone in `biome.json` for exactly that reason.

Never hand-edit one. Re-copy it:

```bash
gh api "repos/ensemblr-hq/ensemblr/contents/schemas/config.schema.json?ref=master" \
  --jq '.content' | base64 -d > public/schemas/config.schema.json
bun run check:schemas
```

`check:schemas` fails on any difference and skips when GitHub is unreachable. Adding or retiring a
schema means editing `SCHEMAS` in `src/lib/schemas.ts` too — the manifest drives the page, the
response headers in `next.config.ts`, the tests and that check, and `schemas.test.ts` fails on a
file the manifest does not list.

## The other things copied from the app repo

Each of these is a copy with no automated link back to its source. Re-read the source before
editing, and prefer re-copying to hand-editing:

| Here | Source of truth in the app repo |
| --- | --- |
| `public/schemas/*.schema.json` | `schemas/*.schema.json` — copy verbatim, then `bun run check:schemas` |
| `FALLBACK_RELEASE` in `src/lib/release.ts` | the newest published `v*` release — **three** assets now: `.dmg`, `.zip`, `.AppImage` |
| `FALLBACK_NIGHTLY` in `src/lib/release.ts` | the rolling `nightly` tag — URLs only, never its bytes |
| the nightly copy in `src/components/download/nightly-download.tsx` | `.github/workflows/nightly.yml` — note the signing clause is the macOS job's alone |
| `REQUIREMENTS`, `DISTRIBUTION` in `src/lib/site.ts` | the app's README, its signing/notarisation setup, and `docs/adr/0056-ship-a-linux-amd64-appimage.md` |
| `public/install.sh`, `public/update.sh` | the README's Linux section, ADR 0056, and `forge.config.ts`'s AppImage maker — what the bundle actually contains |
| `HOMEBREW` in `src/lib/site.ts` | **a different repo:** `Casks/ensemblr.rb` in [`ensemblr-hq/homebrew-tap`](https://github.com/ensemblr-hq/homebrew-tap) |
| `FEATURE_GROUPS` in `src/lib/features.ts` | the app's README and `docs/ux-conventions.md` |
| `TRUST_ITEMS` in `src/lib/features.ts` | the README's "What it stores, and where", and `SECURITY.md` |
| `SITE.tagline`, `SITE.description`, the h1 and the Control section | the README's opening block and `docs/agent-control.md` |
| `GUARDRAILS`, `TOOLS` in `src/components/sections/orchestration.tsx` | `docs/agent-control.md` and the README's orchestration paragraph |
| `src/components/app-mock/data.ts` | `docs/ux-conventions.md`'s "Current Shell Contract", and the running app |
| the oklch tokens in `src/app/globals.css` | the app's own token sheet |
| `src/app/icon.svg`, `src/app/apple-icon.png` | `assets/icon.svg`, `assets/icon.png` — copy verbatim, then `bun run gen:favicon` |
| `REPO` links in `src/lib/site.ts` | the changelog and licence paths those URLs point at |

If you cannot reach the app repo, say the claim is unverified rather than writing a number.
*Cannot verify* is not *is unchanged* — the same distinction `scripts/check-pinned-release.ts`
already draws between failing and skipping.
