# Project-X — low-poly 3D FPS roguelite

Client-only browser game. TypeScript + Vite + Three.js. No backend, no network calls.

[ARCHITECTURE.md](ARCHITECTURE.md) is the source of truth. Update it in the same PR as any change to structure, dependencies, or rules. This file is the short version — when in doubt, read the full section there.

## Commands

Node ≥ 20. First run: `npm i && npm run assets`.

- `npm run dev` — vite dev server
- `npm run test` — vitest (pure logic only)
- `npm run lint` / `npm run typecheck` — must pass before commit
- `npm run assets` — rebuild GLBs from tools/build-assets/

## Rules (always apply)

- `src/engine/` is game-agnostic; it must compile without `src/game/`. Game code touches the engine only through `EngineContext`.
- One module = one folder in `src/game/`, composed in `main.ts`. Never import another module's internals (lint-enforced).
- Events are the only trigger mechanism; services are the only read mechanism. Event names: `domain:pastTenseVerb` (`weapon:fired`). Entity spawn/despawn defers to end of frame.
- `vfx/`, `audio/`, `hud/` are listener-only. Deleting any of them must not break compilation.
- System update order: input/player 0–19, gameplay 20–59, reactions 60+.
- No allocation in the hot loop — pool projectiles, vfx, pickups (`engine/Pool.ts`). Enemies render via `InstancedMesh` per type.
- Randomness in `game/` comes from the seeded `Rng` service (`Math.random` is lint-banned). No wall-clock reads in gameplay — runs must be reproducible from their seed.
- Content is data: one def per file in a `defs/` folder, typed helper, string-id cross-references, validated at boot by `Registry.validateAll()`. No silent fallbacks.
- Runtime deps are pinned to four npm packages: `three`, `three-mesh-bvh`, `postprocessing`, `zzfx`, plus vendored ZzFXM source (not on npm, ARCHITECTURE.md §7). Adding any dep needs prior approval (ARCHITECTURE.md §9).
- Never hand-edit `public/assets/models/` — GLBs are build outputs. Fix assets in `tools/build-assets/` and rerun `npm run assets`. A runtime scale hack means the pipeline is broken.

## Adding content

Weapon, enemy, behavior, perk, sound, wave: one new file in the matching `defs/` (or `behaviors/`) folder, zero shared files touched. Full table: ARCHITECTURE.md §8.

## Tests

Vitest, pure logic only (stats, perks, wave curves, save migration, registry validation). No rendering or WebGL mocks. Fixed Rng seeds, no real time. SaveStore input is untrusted — test corrupt and migration paths.
