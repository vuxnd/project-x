import { mkdirSync, readdirSync } from 'node:fs'

const modelsDir = new URL('../../public/assets/models/', import.meta.url)
mkdirSync(modelsDir, { recursive: true })

const recipesDir = new URL('./recipes/', import.meta.url)
const recipeCount = readdirSync(recipesDir).filter((f) => f.endsWith('.ts')).length

console.log(`${recipeCount} recipe(s) found`)
