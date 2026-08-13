---
name: add-def
description: Add or tweak game content in Project-X — weapon, enemy, AI behavior, perk, sound, wave/boss. Content is data-driven, so use this skill whenever the user asks to add, create, buff, nerf, or adjust any game content ("add a shotgun", "new skeleton enemy", "perk that boosts fire rate", "make reload faster"), even if they never say "def".
argument-hint: <type> <id>  (e.g. weapon shotgun)
---

# add-def

Adds one content def. One new file, zero shared files touched — that is the contract (ARCHITECTURE.md §3.3, §8). If you find yourself editing a shared file, stop: either the request is a new stat/system (different workflow, see "Out of scope") or the approach is wrong.

## Workflow

1. **Resolve type and target folder:**

   | Type | File | Kind |
   |-|-|-|
   | weapon | `src/game/weapons/defs/<id>.ts` | data |
   | enemy | `src/game/enemies/defs/<id>.ts` | data |
   | behavior | `src/game/enemies/behaviors/<id>.ts` | code |
   | perk | `src/game/perks/defs/<id>.ts` | data |
   | sound | `src/game/audio/defs/<id>.ts` | data (ZzFX params) |
   | wave | `src/game/waves/defs/<id>.ts` | data |

2. **Read the typed helper** (`defineWeapon`, `defineEnemy`, …) **and one existing def in the target folder.** The helper's type is the authoritative field list — the examples below show shape, not truth. For balance values, copy the nearest existing def and adjust from there.

3. **Verify every cross-reference before writing.** All refs are string ids and there are no silent fallbacks — a dangling id fails `Registry.validateAll()` at boot:
   - `model: 'x'` → `public/assets/models/x.glb` must exist. If not, add a recipe in `tools/build-assets/recipes/` or a pack import config in `tools/build-assets/import/`, then run `npm run assets`. Never drop a GLB in by hand and never scale-hack at runtime.
   - `sound: 'x'` → an audio def with that id must exist (create it first if needed).
   - enemy `behavior: 'x'` → a behavior with that id must exist. Prefer reusing one.
   - wave entries → every enemy id must exist.

4. **Write the file.** `export default define<Type>({ id: '<id>', ... })`. The file is auto-discovered via `import.meta.glob` — no registration anywhere.

5. **Validate:** `npm run typecheck && npm run test`. If a dev server check is wanted, boot it — `Registry.validateAll()` names the failing file and field.

## Per-type notes

- **weapon** — reference: damage, pellets, spread, rof, mag, reload (see `weapons/defs/pistol.ts`). Needs a model id and a fire-sound id.
- **enemy** — needs a model id (rendered via InstancedMesh per type) and a behavior id. New rigged models should reuse the shared animation clips.
- **behavior** — this is code, not data: `enemies/behaviors/<id>.ts`. Read an existing behavior first. Randomness only via the seeded `Rng` service; no allocation per frame; no wall-clock reads.
- **perk** — stat modifiers as data: `{ stat: 'rof', mul: 1.15 }` or flat adds. The stat key must already exist in `game/stats.ts`. Pipeline: `final = (base + Σ flat) × Π multipliers`.
- **sound** — a ZzFX parameter array. Author it at sfxr.me and paste the params; do not invent parameters by hand.
- **wave** — composition curve over existing enemy ids; bosses are wave defs too.

## Out of scope (different workflow)

- New **stat key**: touches `stats.ts` plus a consuming system (1–2 shared files) — do it as a normal edit, then a perk def can use it.
- New **mechanic/system**: new module folder + one line in `main.ts` — not a def.

## Report

Name the file created, ids referenced (and any assets/sounds created to satisfy them), and the typecheck/test result.
