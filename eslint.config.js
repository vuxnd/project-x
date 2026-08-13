import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import boundaries from 'eslint-plugin-boundaries'

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'public/assets/models/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Placeholder service interfaces — real shapes land in the engine-core step.
    files: ['src/engine/types.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
    },
  },
  {
    // Math.random is banned in game/ — gameplay must be reproducible from its seed (engine/Rng.ts).
    files: ['src/game/**/*.ts'],
    rules: {
      'no-restricted-properties': ['error', {
        object: 'Math',
        property: 'random',
        message: 'Use the seeded Rng service (engine/Rng.ts) instead of Math.random in game/.',
      }],
    },
  },
  {
    // ARCHITECTURE.md §8: engine/game direction, module isolation, listener-only folders.
    files: ['src/engine/**/*.ts', 'src/game/**/*.ts'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { node: { extensions: ['.ts', '.js'] } },
      'boundaries/elements': [
        { type: 'listener', pattern: 'src/game/(vfx|audio|hud)/**' },
        { type: 'game-module', pattern: 'src/game/*/**', capture: ['module'] },
        { type: 'engine', pattern: 'src/engine/**' },
      ],
      'boundaries/files': [
        { pattern: 'src/game/events.ts', category: 'game-shared' },
        { pattern: 'src/game/stats.ts', category: 'game-shared' },
      ],
    },
    rules: {
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        policies: [
          {
            // engine/ must not import game/
            from: { element: { type: 'engine' } },
            allow: { to: { element: { type: 'engine' } } },
          },
          {
            // one game/<module> folder must not import another, except events.ts/stats.ts
            from: { element: { type: 'game-module' } },
            allow: {
              to: [
                { element: { type: 'game-module', captured: { module: '{{from.element.captured.module}}' } } },
                { element: { type: 'engine' } },
                { file: { categories: 'game-shared' } },
              ],
            },
          },
          {
            // vfx/, audio/, hud/ are listener-only: they may react, not reach into other modules
            from: { element: { type: 'listener' } },
            allow: {
              to: [
                { element: { type: 'engine' } },
                { file: { categories: 'game-shared' } },
              ],
            },
          },
          {
            from: { file: { categories: 'game-shared' } },
            allow: { to: { element: { type: 'engine' } } },
          },
        ],
      }],
    },
  },
)
