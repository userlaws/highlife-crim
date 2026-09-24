# Minigame research and implementation

Researched September 23, 2026. The site contains original React/CSS/canvas browser recreations of the mechanics documented by these FiveM resources. It does not embed GTA Scaleform movies, textures, audio, FiveM native calls, or vendored upstream code. No generic npm minigame package accurately covers these four games.

| Game | Primary reference | Upstream licensing | Implemented behavior |
| --- | --- | --- | --- |
| DES Code Match | [DV-studios/mhacking](https://github.com/DV-studios/mhacking/blob/master/hack.html), [Lyrade/FiveM-Scripts](https://github.com/Lyrade/FiveM-Scripts) | No license found in inspected source; not copied | 18×9 grid, two fixed seven-character targets, 200 ms changing noise, independent cursors, WASD/Space and arrows/Enter, escalating 5-second mistake penalties |
| Data Crack | [utkuali/datacrack](https://github.com/utkuali/datacrack/blob/master/client.lua) | GPL-3.0; researched, not vendored | Seven moving split bars; cosine motion; progressively faster columns; left-to-right locking; Highlife-style first-bar miss ends the run; later misses unlock the previous column; source speed range 2–5 |
| Vault Drill | [meta-hub/fivem-drilling](https://github.com/meta-hub/fivem-drilling/blob/master/drilling.lua) | GPL-3.0; researched, not vendored | Continuous insertion and speed controls; heat accumulated while advancing; releasing pressure cools; full insertion succeeds; overheating fails |
| VOLTlab | [ultrahacx/ultra-voltlab](https://github.com/ultrahacx/ultra-voltlab) | CC BY-NC-SA 4.0; researched, not vendored | Three inputs from 1–8; randomized hidden multipliers 1, 10, 50; guaranteed-solvable target; result preview; irreversible one-to-one connections; six-segment countdown |

## Timing and fidelity

- DES defaults to 15 seconds based on the user's screenshot. The upstream timeout is configurable, and its example uses 35 seconds. The original startup introduction is replaced with a ready screen; no time is spent until Start game.
- Data Crack and drilling have no built-in countdown in the referenced resources. This trainer adds an adjustable 30-second default. Data Crack defaults to speed 5 based on the user's Highlife observation, not a verified server setting. The trainer offers only 5, 6, 7, 8, 9, and 10; values above 5 are trainer-only faster options beyond the public resource's documented 2–5 range. The motion phase speed for column i is `(0.02 + 0.005 * i) * 0.55 * difficulty * 10`; the normalized acceptance interval is 0.51–0.62. The upstream script keeps the player on the first column after a miss; this trainer instead ends the run on a first-column miss to match the user's report.
- VOLTlab has a configurable upstream timeout. This trainer defaults to 30 seconds. The screenshot's example is consistent with `6 × 50 + 6 × 10 + 5 × 1 = 365`.
- The drilling renderer is an original cutaway with four milestone pins. The underlying progress is continuous, as in the resource. The keyboard supports both WASD and arrows; pointer hold controls are added. A held-control simulation uses elapsed seconds and cooling, rather than native FiveM control events or Scaleform rendering.
- Controls on screen are browser/touch additions. The dark instrument displays intentionally stay dark when the surrounding site uses light mode.
- Highlife's exact server configuration and customizations have not been obtained. These are source-informed trainers, not a claim to ship Highlife's private code or pixel-identical GTA assets.

## Direct-source audit after screenshot feedback

- Read the actual Lua/HTML files, not just repository summaries. Original releases: [Data Crack by utkuali](https://forum.cfx.re/t/standalone-datacrack-hacking-mini-game/1066972), [mhacking by zr0iq](https://forum.cfx.re/t/release-simple-hacking-minigame/62095), and [VOLTlab by ultrahacx](https://forum.cfx.re/t/release-voltlab-hacking-minigame-cayo-perico-mission/3933171).
- Data Crack now uses the supplied full-screen reference proportions: purple desktop, blue window border, black crosshatched background, small white bar gaps, gold outline on the active column only, and bars drawn in front of the red stripe. Sprite center coordinates are kept separate from visible artwork bounds. The source's generous 0.51–0.62 acceptance range is preserved; the earlier oversized gaps were incorrect.
- DES target generation now permits separated sequences on the same row and matches the source's starting-column range. Confirmed sequences use the source's pale background/dark text treatment.
- VOLTlab starts with no output selected, blocks controls during its one-second connection animation, and waits one second after final connection before resolving. Its voltage numerals use seven-segment shapes. Original GTA textures/sounds and the source's startup cinematic remain absent; gameplay begins from the trainer's ready screen.
- Drilling's source was read directly and its tap impulses, held deltas, stalled-bit behavior, cooling, and terminal conditions were verified. Its four-pin cutaway is still an original illustration, not the native GTA Scaleform artwork.
- The drill controls are clickable/holdable as well as keyboard-driven. [Player feedback in the standalone drilling release](https://forum.cfx.re/t/standalone-drilling-minigame/5260531) reports that tapping W rapidly can finish very quickly without overheating; the trainer preserves the source's small fresh-press impulse instead of adding an unsupported anti-spam rule. This is feedback about a public resource, not verification of Highlife's private configuration.
- Escape/Backspace abort a running trainer. All animation loops, keyboard handlers, and pending voltage timers are cleaned up on leaving the game.
- Internal links use client navigation with prefetch. Data Crack animates transforms directly, without React renders per animation frame. Drilling simulation remains frame-based but readouts update at 20 Hz. Light is the initial theme; explicit choices persist under a new preference key so old automatically saved dark defaults do not override it.

## Local results

Personal best times are local to this browser, keyed by game and settings. They are not uploaded or added to the homepage's example community leaderboard. Only successful runs count. The countdown uses a wall-clock deadline, so backgrounding the tab does not extend a run.

The audited rules use score namespace v2; earlier prototype scores and manual verification runs in v1 are not mixed with these results.

## Validation

`node --experimental-strip-types --test tests/game-mechanics.test.mjs` verifies puzzle validity, code placement and cursor bounds, voltage solvability, Data Crack timing, drilling heat failure, cooling, and a winnable controlled run. Also run `npx tsc --noEmit` and `npm run build`.
