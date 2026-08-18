# Re-pinning the release

The site shows two downloads. Only one of them needs anything from you when a release ships.

| Row | Selected by | Pinned in `src/lib/release.ts` | Needs updating |
| --- | --- | --- | --- |
| Stable | newest tag matching `v<semver>` | `FALLBACK_RELEASE` — tag, date, both assets' url, size, digest | **every release** |
| Nightly | the literal tag `nightly` | `FALLBACK_NIGHTLY` — url only | never |

The nightly's tag never moves off `nightly` and its asset names carry no version, so its pinned URL
is the same URL a live lookup returns. Its bytes change most nights, which is exactly why no size or
digest is pinned for it and why the page says so on the row rather than leaving a gap.

There is **no automation**. Nothing in this repository or in `ensemblr-hq/ensemblr` opens a bump PR,
fires a `repository_dispatch`, or holds a cross-repo token. Re-pinning is a manual ask, once per
release. That was a deliberate decision (THE-195): the site is re-pinned a handful of times a month,
and a cross-repo token plus an auto-merging bump PR was more machinery than the chore was worth.

## The ask

Open an agent session in this repo and paste this:

> Ensemblr shipped a new release. Re-pin the site: read the newest `v*` release from
> `ensemblr-hq/ensemblr` with `gh`, copy its values into `FALLBACK_RELEASE` in `src/lib/release.ts`,
> and prove it with `bun run check:pin && bun test`. Do not retype any digest or byte size — copy
> them out of the API response. Follow `docs/re-pinning.md`.

## What that agent should do

```bash
gh release list --repo ensemblr-hq/ensemblr --limit 5
gh release view <tag> --repo ensemblr-hq/ensemblr \
  --json tagName,publishedAt,isPrerelease,url,assets
```

The second command returns each asset's `name`, `size`, `url` and `digest` — every field the pin
needs. Copy them into `FALLBACK_RELEASE`:

- `tag` / `version` — the tag, and the tag with its leading `v` removed
- `publishedAt` — `publishedAt` verbatim
- `notesUrl` — `${REPO.releasesUrl}/tag/<tag>`
- `dmg` and `zip` — each one's `url`, `sizeBytes` from `size`, and `sha256` from `digest` with the
  `sha256:` prefix stripped

Digests and sizes are copied, never retyped. `bun test` rejects a digest a reader could not check
with `shasum -a 256`, and `check:pin` compares all six copied values against the live release — but
neither can save you from a plausible-looking digest for the wrong build.

```bash
bun run check:pin   # tag matches, every copied value matches, both .dmg URLs resolve
bun test            # the pin is self-consistent offline
```

## What the checks actually assert

`scripts/check-pinned-release.ts` runs on every PR and on the daily `pin` job in
`.github/workflows/ci.yml` (07:17 UTC, after the app's nightly cron at 04:00). It fails when:

- the newest `v*` release is not the pinned tag
- any pinned url, size, digest or publish date disagrees with that release
- the pinned stable `.dmg` or the pinned nightly `.dmg` stops resolving

It warns and passes when GitHub cannot be reached at all. *Cannot verify* is not *is stale*, and a
flaky guard gets disabled, which is worse than not having one.

A freshly published nightly is **not** drift and must never turn that job red. Selection is by tag
in `selectStableRelease` and `selectNightly` — never by position in `/releases`, which GitHub orders
by `created_at`, and the nightly's `created_at` is frozen at whenever its tag was first cut because
the tag is force-moved rather than recreated. The page and the checker call the same two functions,
so they cannot drift into disagreeing.
