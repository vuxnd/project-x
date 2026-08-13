---
name: new-module
description: Add a new gameplay mechanic or system to Project-X as a game module — a new folder in src/game/ composed in main.ts. Use when the user asks for a new mechanic, system, or ability that is not just content ("add a dash", "grappling hook", "shield system", "minimap"), even if they never say "module".
argument-hint: <module-name>  (e.g. grapple)
---

# new-module

Adds one game module: a new folder in `src/game/` plus exactly one line in `main.ts` — that is the contract (ARCHITECTURE.md §3.2, §8). A module addition also changes the structure tree, so ARCHITECTURE.md §1 must be updated in the same PR (§1 header rule). If you find yourself editing any other shared file, stop: it is either content (add-def), a stat key, or the approach is wrong.

## Workflow

1. **Confirm it is a module.** Route away first:
   - Weapon, enemy, behavior, perk, sound, wave → `/add-def` (zero shared files).
   - New stat key → `stats.ts` + consuming system, normal edit (§8 table).
   - Game-agnostic capability (loop, collision, pooling, saves) → `src/engine/`, different rules; flag it and confirm before proceeding.

2. **Read the ground truth:** ARCHITECTURE.md §3.2, `src/main.ts`, `src/game/events.ts`, and one existing module of the same kind — gameplay (`pickups/`) or listener-only (`vfx/`). Mirror its file layout, module export, and service registration exactly. If no modules exist yet (pre-scaffold), stop and report that.

3. **Create the folder** `src/game/<name>/` with a module entry exporting `GameModule { id, register(ctx) }`. Everything the module owns lives in this folder.

4. **Declare its events in its own files** via TS declaration merging on the core event map — never edit `events.ts`. Naming: `domain:pastTenseVerb` (`grapple:attached`), events state what happened, never command what should happen.

5. **Expose reads as a service** (read-only queries on `ctx.services`) only if other modules need them. No side effects in service methods.

6. **Register systems** with `ctx.addSystem(sys, order)` in the correct band: input/player 0–19, gameplay 20–59, reactions 60+. Place within the band by data flow (after what it consumes, before what consumes it — see §2 diagram).

7. **Compose it:** one line in `main.ts`, positioned with its band neighbors.

8. **Self-check against the rules lint cannot see:**
   - Triggers only via events; reads only via services; no import of another module's internals.
   - Randomness via `ctx.rng`, never `Math.random`; no wall-clock reads.
   - No allocation in per-frame update paths — pool anything spawned repeatedly (`engine/Pool.ts`).
   - Entity spawn/despawn deferred to end of frame, not mid-dispatch.
   - If the module is reaction-only (vfx/audio/hud-like): listener-only, deleting it must not break compilation.

9. **Validate:** `npm run typecheck && npm run lint && npm run test`. Add colocated tests for any pure logic (curves, timers, state machines) — fixed Rng seed, no real time. Then run the **architecture-reviewer** subagent on the diff before commit.

10. **Update ARCHITECTURE.md:** add the folder to the §1 tree with a one-line comment; extend the §2 diagram only if the module joins the core data flow.

## Report

Name the folder created, the `main.ts` line and order number, events declared, services exposed, the ARCHITECTURE.md sections touched, and the typecheck/lint/test + reviewer result.
