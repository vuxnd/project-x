import * as THREE from 'three'

// Visual single source of truth. Recipes import colors, materials, and budgets
// from here; build.ts must reject any mesh whose colors fall outside PALETTE
// (gate not wired yet — build.ts is a stub until the GLB pipeline lands).

export const PALETTE = {
  // neutrals
  ink: 0x1a1c22,
  gunmetal: 0x3d434f,
  steel: 0x6a7280,
  silver: 0x9aa3ad,
  concrete: 0x7d7a72,
  // organics
  dirt: 0x5b4a38,
  wood: 0x8a5f3c,
  leather: 0x6e4630,
  rust: 0xa14e2a,
  bone: 0xd9cfb4,
  // accents
  blood: 0x9c1f2e,
  toxin: 0x5fae3f,
  hazard: 0xd9a13b,
  scrap: 0xc47f2f,
  energy: 0x3fc1c9,
  arcane: 0x7b4fd0,
} as const

export type PaletteName = keyof typeof PALETTE

const PALETTE_VALUES = new Set<number>(Object.values(PALETTE))

export function assertPaletteColor(hex: number, context: string): void {
  if (!PALETTE_VALUES.has(hex)) {
    throw new Error(`${context}: #${hex.toString(16).padStart(6, '0')} is not a PALETTE color (tools/build-assets/style.ts)`)
  }
}

// The three sanctioned looks. Recipes never construct materials directly.
// Cached instances are frozen and shared — clone() one for a one-off variant.
const cache = new Map<string, THREE.MeshStandardMaterial>()

function cached(key: string, make: () => THREE.MeshStandardMaterial): THREE.MeshStandardMaterial {
  let m = cache.get(key)
  if (!m) {
    m = make()
    m.name = key
    Object.freeze(m.color)
    Object.freeze(m.emissive)
    Object.freeze(m)
    cache.set(key, m)
  }
  return m
}

export function mat(name: PaletteName): THREE.MeshStandardMaterial {
  return cached(`mat:${name}`, () => new THREE.MeshStandardMaterial({
    color: PALETTE[name], flatShading: true, roughness: 0.9, metalness: 0.0,
  }))
}

export function metalMat(name: PaletteName): THREE.MeshStandardMaterial {
  return cached(`metal:${name}`, () => new THREE.MeshStandardMaterial({
    color: PALETTE[name], flatShading: true, roughness: 0.45, metalness: 0.8,
  }))
}

// Pickups and energy accents only.
export function glowMat(name: PaletteName, intensity = 1.5): THREE.MeshStandardMaterial {
  return cached(`glow:${name}:${intensity}`, () => new THREE.MeshStandardMaterial({
    color: PALETTE[name], emissive: PALETTE[name], emissiveIntensity: intensity,
    flatShading: true, roughness: 1.0, metalness: 0.0,
  }))
}

// Real-world meters, baked into recipes; runtime never rescales (ARCHITECTURE.md §3.5).
export const DIM = {
  playerEyeHeight: 1.6,
  doorwayHeight: 2.2,
  enemyHeight: 1.8,
  oneHandWeaponLength: 0.35,
  twoHandWeaponLength: 0.9,
  pickupMaxSize: 0.4,
} as const

// Hard ceilings per asset class; build.ts fails the build above these.
export const TRI_BUDGET = {
  pickup: 200,
  prop: 600,
  weapon: 800,
  enemy: 1500,
  arenaPiece: 2000,
} as const
