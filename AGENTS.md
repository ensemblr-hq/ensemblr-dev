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
`FALLBACK_RELEASE` needs. Copy them out of the response. Do not retype a digest or a byte size, and
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

- **It is ordered by `created_at`, not `published_at`, and position is never the answer.** The app
  publishes a rolling `nightly` tag most mornings, force-moved rather than recreated, so its
  `created_at` is frozen at whenever the tag was first cut and it can tie with a release outright.
  Pick by tag: `selectStableRelease` takes the newest `v<semver>` compared as *parsed* semver, and
  `selectNightly` takes the literal tag `nightly`. Both live in `src/lib/release.ts` and both are
  called by the page and by `check:pin`, so they cannot drift.
- **The nightly is pinned by URL only.** `FALLBACK_NIGHTLY` carries no size and no digest, because
  the bytes behind that fixed URL are replaced most nights. The `Nightly` type has no field to put
  one in. Do not add one, and do not let the nightly row print a number it cannot stand behind — the
  row says why it has no digest instead.

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
| `FALLBACK_RELEASE` in `src/lib/release.ts` | the newest published `v*` release |
| `FALLBACK_NIGHTLY` in `src/lib/release.ts` | the rolling `nightly` tag — URL only, never its bytes |
| the nightly copy in `src/components/download/nightly-download.tsx` | `.github/workflows/nightly.yml` |
| `REQUIREMENTS`, `DISTRIBUTION` in `src/lib/site.ts` | the app's README and its signing/notarisation setup |
| `FEATURE_GROUPS` in `src/lib/features.ts` | the app's README and `docs/product/current-shell-inventory.md` |
| `TRUST_ITEMS` in `src/lib/features.ts` | the README's "What it stores, and where", and `SECURITY.md` |
| `SITE.tagline`, `SITE.description`, the h1 and the Control section | the README's opening block and `docs/agent-control.md` |
| `GUARDRAILS`, `TOOLS` in `src/components/sections/orchestration.tsx` | `docs/agent-control.md` and the README's orchestration paragraph |
| `src/components/app-mock/data.ts` | `docs/product/current-shell-inventory.md`, and the running app |
| the oklch tokens in `src/app/globals.css` | the app's own token sheet |
| `src/app/icon.svg`, `src/app/apple-icon.png` | `assets/icon.svg`, `assets/icon.png` — copy verbatim, then `bun run gen:favicon` |
| `REPO` links in `src/lib/site.ts` | the changelog and licence paths those URLs point at |

If you cannot reach the app repo, say the claim is unverified rather than writing a number.
*Cannot verify* is not *is unchanged* — the same distinction `scripts/check-pinned-release.ts`
already draws between failing and skipping.
