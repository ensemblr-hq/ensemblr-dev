# Re-pinning the release

The site shows two downloads. Only one of them needs anything from you when a release ships.

| Row | Selected by | Pinned in `src/lib/release.ts` | Needs updating |
| --- | --- | --- | --- |
| Stable | newest tag matching `v<semver>` | `FALLBACK_RELEASE` — tag, date, all three assets' url, size, digest | **every release** |
| Nightly | the literal tag `nightly` | `FALLBACK_NIGHTLY` — urls only | never |

The nightly's tag never moves off `nightly` and its asset names carry no version, so its pinned URLs
are the same URLs a live lookup returns. Its bytes change most nights, which is exactly why no size
or digest is pinned for it and why the page says so on the row rather than leaving a gap.

The stable pin copies **three** assets, not two: the Apple silicon `.dmg` and `.zip`, and the Linux
x86-64 `.AppImage` the page has offered since Linux was announced. The nightly pins two URLs, one
per platform.

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
- `dmg`, `zip` and `appImage` — each one's `url`, `sizeBytes` from `size`, and `sha256` from
  `digest` with the `sha256:` prefix stripped

**Watch the arch spelling.** The release AppImage is `Ensemblr-<version>-x64.AppImage` and the
canary is `Ensemblr-Canary-x86_64.AppImage` — Forge names one after its `--arch=x64` and the nightly
workflow renames the other to the `uname -m` spelling. `linuxAssets` accepts both; a pin that
assumes one spelling for both is a 404.

Digests and sizes are copied, never retyped. `bun test` rejects a digest a reader could not check
with `shasum -a 256`, and `check:pin` compares all nine copied values against the live release — but
neither can save you from a plausible-looking digest for the wrong build.

```bash
bun run check:pin   # tag matches, every copied value matches, all four URLs resolve
bun test            # the pin is self-consistent offline
```

## What the checks actually assert

`scripts/check-pinned-release.ts` runs on every PR and on every push to `master`, in the `check`
job in `.github/workflows/ci.yml`, and nowhere else. There is no scheduled run: a release that ships
in a week nobody opens a PR goes uncaught until someone does, which is the trade for re-pinning
being a manual ask in the first place. Run `bun run check:pin` yourself if you want to know sooner.
It fails when:

- the newest `v*` release is not the pinned tag
- any pinned url, size, digest or publish date disagrees with that release
- `FALLBACK_RELEASE` carries no `.dmg` or no `.AppImage` — one of the two download buttons would
  have nothing real to point at
- any of the pinned stable `.dmg`, stable `.AppImage`, nightly `.dmg` or nightly `.AppImage` stops
  resolving

It warns and passes when GitHub cannot be reached at all. *Cannot verify* is not *is stale*, and a
flaky guard gets disabled, which is worse than not having one.

A freshly published nightly is **not** drift and must never turn that job red. Selection is by tag
in `selectStableRelease` and `selectNightly` — never by position in `/releases`, which GitHub orders
by `created_at`, and the nightly's `created_at` is frozen at whenever its tag was first cut because
the tag is force-moved rather than recreated. The page and the checker call the same two functions,
so they cannot drift into disagreeing.
