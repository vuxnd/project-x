import type * as THREE from 'three'

export interface System {
  /** dt is the fixed timestep in seconds (1/60), never milliseconds. */
  update(dt: number): void
}

export interface GameModule {
  id: string
  register(ctx: EngineContext): void
}

export interface EventBus {}

export interface Registry {}

export interface AssetLoader {}

export interface Collision {}

export interface Input {}

export interface Rng {}

export interface Services {}

export interface EngineContext {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  bus: EventBus
  registry: Registry
  assets: AssetLoader
  collision: Collision
  input: Input
  rng: Rng
  services: Services
  addSystem(sys: System, order: number): void
}
