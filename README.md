# Highlife Crim

Practice the Highlife RP minigames in your browser, then post your best time.

Four browser recreations of the minigames — **DES Code Match**, **Vault Drill**, **Data Crack**, and **VOLTlab** — plus video guides and a community leaderboard.

## Stack

- **Next.js 16** (App Router)
- **Neon** — Postgres for leaderboard times, and a Neon Function serving the API next to the database
- **Tailwind CSS 4** + shadcn/ui components

## Running locally

```bash
npm install
npm run dev          # http://localhost:3000
```

The leaderboard points at the deployed Neon Function by default, so it works
with no configuration. To aim it at your own branch, set:

```
NEON_FUNCTION_API_BASE_URL=https://<your-branch>-api.<region>.aws.neon.tech
```

`neon link` writes this (and `DATABASE_URL`) into `.env.local` for you.

Other scripts:

```bash
npm run build        # production build
npm run lint
node tests/game-mechanics.test.mjs
npm exec --package=playwright -- node tests/browser-smoke.cjs   # needs a server running
```

## Leaderboard API

A Neon Function (`neon-functions/api.ts`, declared in `neon.ts`) serves:

| Method | Route | Notes |
| --- | --- | --- |
| `GET` | `/scores?game=&limit=` | One row per player per game — their personal best, fastest first |
| `POST` | `/scores` | `{ player, game, ms }`; validated and rate limited per IP |
| `GET` | `/health` | Liveness check |

`game` is one of `code`, `drill`, `data`, `volt`. Deploy changes with `neon deploy`.

Times are submitted from the success panel after you finish a run — enter a name
and hit Submit. The name is remembered in `localStorage` for later runs.

## Background collage

The toggle in the header tiles the page with screenshots. Tiles are laid out on a
measured grid sized to the page, so they always fill it and never overlap or repeat.

Source screenshots live in a `background/` folder alongside this repo (not checked
in, since they're large). To regenerate the optimized tiles after adding images:

```bash
node scripts/build-collage.mjs [sourceDir]
```

That converts each image to webp, skips byte-identical duplicates, and rewrites
`lib/collage-photos.ts`.

## Credits

The minigames are original recreations of mechanics documented by several FiveM
resources — see [docs/game-sources.md](docs/game-sources.md) for references,
upstream licensing, and exactly what behavior each one implements. No upstream
code, textures, or audio is vendored.

Video guides link to their creators on YouTube.
