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
requests an hour per IP, so expect to be refused if you lean on it.

## The other things copied from the app repo

Each of these is a copy with no automated link back to its source. Re-read the source before
editing, and prefer re-copying to hand-editing:

| Here | Source of truth in the app repo |
| --- | --- |
| `FALLBACK_RELEASE` in `src/lib/release.ts` | the newest published release |
| `REQUIREMENTS`, `DISTRIBUTION` in `src/lib/site.ts` | the app's README and its signing/notarisation setup |
| `FEATURE_GROUPS` in `src/lib/features.ts` | the app's README and `docs/product/current-shell-inventory.md` |
| `src/components/app-mock/data.ts` | `docs/product/current-shell-inventory.md`, and the running app |
| the oklch tokens in `src/app/globals.css` | the app's own token sheet |
| `src/app/icon.svg`, `src/app/apple-icon.png` | `assets/icon.svg`, `assets/icon.png` — copy verbatim, then `bun run gen:favicon` |
| `REPO` links in `src/lib/site.ts` | the changelog and licence paths those URLs point at |

If you cannot reach the app repo, say the claim is unverified rather than writing a number.
*Cannot verify* is not *is unchanged* — the same distinction `scripts/check-pinned-release.ts`
already draws between failing and skipping.
