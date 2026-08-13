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
    // Nondeterminism is banned in game/ — runs must be reproducible from their seed (engine/Rng.ts).
    files: ['src/game/**/*.ts'],
    rules: {
      'no-restricted-properties': ['error',
        {
          object: 'Math',
          property: 'random',
          message: 'Use the seeded Rng service (engine/Rng.ts) instead of Math.random in game/.',
        },
        {
          object: 'Date',
          property: 'now',
          message: 'No wall-clock reads in game/ — runs must be reproducible from their seed.',
        },
        {
          object: 'performance',
          property: 'now',
          message: 'No wall-clock reads in game/ — runs must be reproducible from their seed.',
        },
        {
          object: 'crypto',
          property: 'getRandomValues',
          message: 'Use the seeded Rng service (engine/Rng.ts) instead of crypto randomness in game/.',
        },
      ],
      'no-restricted-syntax': ['error',
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: 'No wall-clock reads in game/ — runs must be reproducible from their seed.',
        },
        {
          selector: "MemberExpression[object.type='MemberExpression'][object.property.name='Math'][property.name='random']",
          message: 'Use the seeded Rng service (engine/Rng.ts) instead of Math.random in game/.',
        },
      ],
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
        // The engine surface game code may import (ARCHITECTURE.md §3.1): EngineContext types + Pool.
        { pattern: 'src/engine/types.ts', category: 'engine-public' },
        { pattern: 'src/engine/Pool.ts', category: 'engine-public' },
      ],
    },
    rules: {
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        // Unclassified local files must not become invisible import targets.
        checkUnknownLocals: true,
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
                { file: { categories: ['engine-public', 'game-shared'] } },
              ],
            },
          },
          {
            // vfx/, audio/, hud/ are listener-only: they may react, not reach into other modules
            from: { element: { type: 'listener' } },
            allow: {
              to: { file: { categories: ['engine-public', 'game-shared'] } },
            },
          },
          {
            from: { file: { categories: 'game-shared' } },
            allow: { to: { file: { categories: 'engine-public' } } },
          },
        ],
      }],
    },
  },
)
