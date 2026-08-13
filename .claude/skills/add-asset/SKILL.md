---
name: add-asset
description: Produce a GLB asset for Project-X — procedural recipe or CC0 pack import in tools/build-assets/. Use when a def needs a model id that doesn't exist yet, or the user asks to model, import, or fix a 3D asset ("model a crate", "import the skeleton pack", "the pistol is too big").
argument-hint: <id>  (e.g. crate)
context: fork
agent: asset-modeler
---

# add-asset

Produces one GLB via the asset pipeline (ARCHITECTURE.md §3.5). The output is always `public/assets/models/<id>.glb` built by `npm run assets` — never a hand-placed file. If `tools/build-assets/` does not exist yet, stop and report that the pipeline scaffold is missing.

## Workflow

1. **Pick the source path:**
   - Original prop, weapon, pickup, arena piece → **procedural recipe** in `tools/build-assets/recipes/<id>.ts`.
   - Rigged or animated character → **CC0 pack import** config in `tools/build-assets/import/` (Quaternius, KayKit, Kenney — see ARCHITECTURE.md §5). Do not hand-model rigged characters.

2. **Recipe path:** read `build.ts`, one existing recipe, `STYLE.md`, and `style.ts` first. All colors and materials come from `style.ts` tokens — no hardcoded hex. Bake real scale (meters), origin, and forward orientation into the recipe; a runtime fixup means the recipe is wrong.

3. **Import path:** per-pack config only (scale, rotation, animation clip renames). Verify the license is CC0 for the specific model and record source + license in the import config — unverified assets do not ship (§7).

4. **Build and check:** `npm run assets`. Confirm the GLB is emitted. If the contact-sheet script exists (`npm run assets:sheet`), render it and confirm the new asset reads as part of the family.

5. **Hand off, don't wire:** report the model id for the def that needs it. Creating or editing game defs is `/add-def`'s job in the main session — never touch `src/game/` from here.

## Report

Files created (recipe or import config), output GLB, triangle count and dimensions, license record for imports, and the model id to reference.
