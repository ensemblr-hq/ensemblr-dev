# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: a macOS developer on Apple silicon who already runs coding agents
daily — Pi, Claude Code, or both — and has hit the ceiling of doing it in one
checkout. They understand git worktrees and branches; they are not looking to be
taught what an agent is. They arrive frustrated that parallel agent work
collides: one working tree, one branch, sessions stepping on each other, no
place to review what an agent actually did before it lands.

They visit to answer one question: does this shell give each stream of work its
own isolated copy of the repo, and can I trust it with my credentials and my
machine. Then they download.

Not the audience for this site: agent-skeptics who need the concept explained,
teams evaluating for procurement, and anyone on Intel Macs, Linux, or Windows.

## Product Purpose

Ensemblr is a native macOS workbench for isolated, multi-agent coding workflows.
Every stream of work gets its own workspace: its own git worktree, its own
branch, its own agent sessions, its own terminals, its own review path. The user
drives it with the agent CLIs they already installed, reviews the diff in the
same place they produced it, and opens the PR without leaving the app.

This repository is the marketing site at https://www.ensemblr.dev. Its job is
narrow and measurable: a developer who fits the profile above lands, believes
the isolation and trust claims, and downloads the current build.

Success = downloads of the latest release by developers who then actually run a
workspace. Not signups, not newsletter capture — the email-capture page this
repo started as has been removed.

## Positioning

The mechanism a neighbouring product cannot truthfully copy: **isolation is git,
not a sandbox abstraction.** A workspace is a real git worktree on the user's
disk on a real branch. Two agents can edit the same file at the same time and
never see each other, and nothing about that arrangement is proprietary or
reversible — the user can walk away and their branches are still branches.

Second differentiator: **Ensemblr ships no agent binary.** It drives the Pi and
`claude` CLIs the user installed, so provider credentials never enter Ensemblr's
world. GitHub data is read through the user's own authenticated `gh`; Linear is
OAuth with the token in the macOS Keychain; session history is local SQLite.
Nothing is uploaded to run the app.

Third: it is a **native macOS app, MIT-licensed, source public** at
`ensemblr-hq/ensemblr`.

## Operating Context

The visitor is at a desk, on the machine they will install on, usually mid-task
or between tasks. They are likely arriving from GitHub, a link from another
developer, or a post. Dark environments and dark editors are the norm for this
audience.

The product's own operating loop, which the site depicts:

1. Point Ensemblr at a repository.
2. Start a workspace from a branch, a GitHub PR, or a Linear issue.
3. Run agent sessions inside it (Pi and/or Claude Code), plus real PTY terminals
   and repository-declared run scripts from `.ensemblr/settings.toml`.
4. Review the diff in place, comment on lines, resolve, discard.
5. Open the PR; watch checks; archive the workspace.

A kanban board moves work from Backlog to Done across workspaces.

## Capabilities and Constraints

Site scope, confirmed: **one landing page plus the download path.** No docs,
changelog, blog, or pricing surface is planned. Everything deeper lives on
GitHub — README, CHANGELOG.md, releases, LICENSE.

Product facts the site must state accurately:

- Requirements, hard gates: macOS on Apple silicon (arm64-only builds); at least
  one agent runtime CLI (Pi, Claude Code, or both); git; the GitHub CLI (`gh`),
  authenticated — PR and check data reads through it and no GitHub tokens are
  stored.
- Requirements, optional: a Linear account, OAuth only, token in the macOS
  Keychain.
- Status: public beta, pre-1.0. The current build is a prerelease. The site says
  so plainly and invites bug reports rather than implying stability.
- License: MIT. Repository public.

Technical constraints of this site:

- Distribution facts (version, asset names, sizes, notes URL) come from the
  public GitHub releases API at build time. `/releases/latest` is useless here
  because every Ensemblr build so far is a prerelease; the list endpoint is
  read instead. A pinned fallback release must always keep the download CTA
  real when the API rate-limits or fails.
- `GITHUB_TOKEN` is optional and only raises the unauthenticated 60-req/hour
  rate limit at build time.
- Existing stack is settled by the codebase: Next.js App Router, React,
  TypeScript, Tailwind v4, Biome, bun. Dev command `bun dev`.

## Brand Commitments

- Name: Ensemblr. Domain and canonical URL: https://www.ensemblr.dev.
- Wordmark exists in `src/components/brand/wordmark.tsx`.
- The site's palette and radii are derived from the app's own dark theme
  (`--ensemblr-*` in the product's `src/renderer/styles/index.css`), and the app
  replica on the page is lit by the product's real token values. The app is the
  colour authority; the page runs the same hue family deeper so the replica
  reads as an object on it.
- JetBrains Mono is the product's terminal and code face and is used for the
  site's micro-typography for that reason. Geist is the text face.
- Voice: precise, unhedged, engineer-to-engineer. States limits out loud
  ("still pre-1.0", "expect rough edges, and file them") rather than smoothing
  them. British spelling in prose.
- Dark only — `colorScheme: 'dark'` is declared. No light theme is committed.

## Evidence on Hand

Real and usable:

- Real app screenshots / captures from `ensemblr-hq/ensemblr` are available or
  obtainable.
- A hand-built, high-fidelity replica of the app shell in
  `src/components/app-mock/`, driven by the product's own tokens.
- Public GitHub releases, README, CHANGELOG.md, LICENSE, and the app's
  `docs/product/current-shell-inventory.md`, which is the source of the
  long-tail capability copy in `src/lib/features.ts`.

Explicitly absent — must never be fabricated:

- No user quotes or testimonials.
- No customer logos.
- No usage numbers, download counts, star counts, benchmarks, or "trusted by"
  metrics of any kind.
- No pricing, no plans, no enterprise tier.

## Product Principles

1. **Every claim is checkable.** The audience will open the repo. Copy comes
   from the product's own README, inventory doc, and release data — never from
   marketing invention.
2. **Isolation is the story.** Whatever else a surface says, the visitor must
   leave understanding that a workspace is a real git worktree on their disk.
3. **Trust is stated as mechanism, not adjective.** "Your runtimes, your keys",
   "OAuth only, Keychain", "local SQLite" — never "secure" or "private".
4. **Say the beta out loud.** Pre-1.0 status, prerelease builds, and Apple
   silicon-only are stated where a visitor meets them, not buried.
5. **The product is the hero.** The app's own surface, palette, and typography
   lead; the site is its frame, not a competing visual world.

## Accessibility & Inclusion

No product-specific standard has been established beyond ordinary web practice.
The site is dark-only by commitment, so contrast against the dark palette — not
a light arm — is where the burden falls. A reduced-motion path already exists
(`src/components/motion/`) and must be preserved.
