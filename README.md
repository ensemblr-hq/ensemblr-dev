# ensemblr.dev

The marketing site for [Ensemblr](https://github.com/ensemblr-hq/ensemblr) — a macOS orchestrator for
isolated, multi-agent coding workflows.

One route. It explains the product, shows a recreation of the app's workbench, and hands over two
macOS builds: the newest release, and the rolling nightly.

## Stack

- Next.js 16 (App Router, Cache Components) + React 19
- TypeScript
- Tailwind CSS 4
- [Motion](https://motion.dev) for scroll and reveal animation
- Biome for lint and format

## Run locally

```bash
bun install
bun dev
```

Open http://localhost:3000.

## Environment

`GITHUB_TOKEN` is optional locally and expected in deployment.

The download rows read the releases list from the public GitHub API, which allows 60 unauthenticated
requests per hour **per IP**. On your own machine that budget is yours alone. On a hosted build the
address is shared, so an unauthenticated lookup is likely to be refused — and the failure is quiet:
it falls back to the copies pinned in `src/lib/release.ts`, `cacheLife('hours')` caches that
fallback exactly as durably as a success, and the build stays green while serving a stale version,
size and digest for the whole revalidation window.

```bash
# .env.local — any classic token with no scopes will do
GITHUB_TOKEN="ghp_..."
```

## The two builds the page shows

Everything under the download button — tag, date, size, SHA-256 — describes a real published release
of the app in [ensemblr-hq/ensemblr](https://github.com/ensemblr-hq/ensemblr). Check it there before
you write it down here:

```bash
gh release list --repo ensemblr-hq/ensemblr --limit 5
gh release view <tag> --repo ensemblr-hq/ensemblr \
  --json tagName,publishedAt,isPrerelease,url,assets
```

Both rows are selected **by tag** and never by list position: the stable download is the newest tag
matching `v<semver>`, compared as parsed semver so `v0.1.0-beta.10` outranks `v0.1.0-beta.9`, and
the nightly is the literal tag `nightly`. `/releases` is ordered by `created_at`, and the app's
nightly tag is force-moved rather than recreated, so its `created_at` never advances and the two can
tie outright — position would be right by luck. `selectStableRelease` and `selectNightly` in
`src/lib/release.ts` are the only place either rule is written, and `check:pin` calls the same two.

The nightly is pinned by URL alone. Its assets are renamed to fixed, version-free filenames before
upload, so that URL never moves — while the bytes behind it are replaced most nights, which is why
no size or digest is pinned for it and why the row on the page says so rather than leaving a gap.

The release pin is checked rather than trusted. `bun run check:pin` fails when the newest `v*`
release no longer matches it, when any value it copied disagrees with that release, or when either
pinned `.dmg` stops resolving; CI runs it on every PR and once a day on a schedule, because a
release can ship on a week nobody opens one. If GitHub cannot be reached the check warns and passes,
because *cannot verify* is not *is stale*.

Nothing updates the pin automatically — no bump PR, no cross-repo token, no dispatch from the app
repo. It is a manual ask, once per release, and **[`docs/re-pinning.md`](docs/re-pinning.md) is the
paste-ready version of it.**

The release is not the only thing this site copies from the app repo — requirements, distribution
claims, feature copy, palette tokens, icons and the workbench replica all come from there too.
`AGENTS.md` lists each one against its source. Same rule for all of them: read the source, don't
recall it.

## The brew line

The download section and the hero both offer the tap as an alternative to the `.dmg`:

```bash
brew install --cask ensemblr-hq/tap/ensemblr
```

It lives once, in `HOMEBREW` in `src/lib/site.ts`, and both surfaces read it from there. The cask
itself is in a second repository, [`ensemblr-hq/homebrew-tap`](https://github.com/ensemblr-hq/homebrew-tap),
and so is everything the page says about it — the architecture and macOS floor it declares, and the
`auto_updates` flag that keeps `brew upgrade` out of a bundle the app updates itself.

That command deliberately carries **no version**. The cask resolves its own from the tap, bumped
there by the app's release workflow; a tag printed here would be a second thing to update on every
release, and nothing in this repo checks it. `check:pin` covers `FALLBACK_RELEASE` and nothing else.

## How it is put together

```
scripts/          the pinned-release check CI runs, and the favicon generator
src/app/          route, metadata, icons, OG image, robots, sitemap
src/components/
  app-mock/       DOM recreation of the Ensemblr workbench
  brand/          wordmark, pixel field, section headings
  chrome/         nav and footer
  download/       release-aware download button
  icons/          icons the site draws — nav, footer, hero, download
  motion/         LazyMotion provider and the shared reveal
  sections/       one file per page section
src/lib/          site facts, feature copy, glyph bitmaps, release lookup
```

Five things are worth knowing before editing:

**The palette is the app's palette.** The oklch tokens in `src/app/globals.css` are copied from the
desktop app's own token sheet. Keep them in sync — the recreated window only reads as the product
because the colours are the product's.

**The wordmark is a 5×7 bitmap.** `src/lib/glyphs.ts` holds the glyph table, shared by the animated
SVG wordmark and the OG image. Pixel positions must stay deterministic; per-pixel flicker timing is
generated after mount so server and client markup match.

**The app icons come from the app.** `src/app/icon.svg` and `src/app/apple-icon.png` are copied
verbatim from `assets/icon.svg` and `assets/icon.png` in the app repo — re-copy them when the app's
icon changes rather than editing them here. `src/app/favicon.ico` cannot be a copy: downsampling a
1024px mark whose detail is a dot grid and a sub-pixel chromatic split produces a smudge at 16px, so
`scripts/generate-favicon.ts` redraws it at 16, 32 and 48 on whole pixels, using that icon's own
constants. The `.ico` is generated but committed, and `generate-favicon.test.ts` fails if the two
drift apart.

**Nothing in `app-mock/` is a screenshot.** It is real DOM built from
`docs/product/current-shell-inventory.md` in the app repo. All of its content lives in
`src/components/app-mock/data.ts`. It draws its own glyphs in `app-mock/icons.tsx`; icons the *site*
uses belong in `components/icons/site.tsx`, so a nav or footer never imports from the mock.

**The release is fetched once per subtree and passed down.** `Hero`, `SiteNav`, `SiteFooter` and the
`Download` section each await `getSiteReleases()` and hand the result to their children as a prop.
That is what guarantees the digest `IntegrityNote` prints describes the file `DownloadButton` links
to — an invariant worth holding in the code rather than in the cache. The nightly is a different
type from a release, with no size or digest field anywhere on it, so a component cannot print a
stale digest for it even by accident.

## Scripts

```bash
bun dev            # local dev server
bun build          # production build
bun start          # run the production server
bun lint           # Biome check
bun format         # Biome format
bun typecheck      # tsc --noEmit
bun test           # unit tests for the release and glyph logic
bun run check:pin  # fail if the pinned fallback release has gone stale
bun run gen:favicon  # redraw src/app/favicon.ico from the glyph table
```
