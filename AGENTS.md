# Repository Guidelines

## Project Structure & Module Organization

This Vue 3, TypeScript, and uni-app application targets H5 and WeChat Mini Program. Feature pages live in `src/pages/<feature>/`; declare metadata with `definePage`. Shared UI belongs in `src/components`, composition logic in `src/hooks`, Pinia stores in `src/store`, and navigation in `src/router` and `src/tabbar`. Keep API adapters in `src/api` and HTTP infrastructure in `src/http`. `src/service` is OpenAPI-generated and must not be edited manually. Assets live in `src/static`; tests are colocated with source files.

## Build, Test, and Development Commands

Use the Node.js and pnpm versions declared in `package.json`.

- `pnpm install` installs dependencies and initializes generated base files.
- `pnpm dev:h5` starts H5 development at `http://localhost:9000/`.
- `pnpm dev:mp` builds in watch mode to `dist/dev/mp-weixin` for WeChat DevTools.
- `pnpm build:h5` and `pnpm build:mp` create production platform bundles.
- `pnpm type-check` runs `vue-tsc`; `pnpm lint` runs ESLint and format checks.
- `pnpm test:run` runs the Vitest suite once; use `pnpm test` while developing.
- `pnpm openapi` regenerates `src/service` from the configured schema.

## Coding Style & Naming Conventions

Follow `.editorconfig`: UTF-8, LF endings, two-space indentation, final newlines, and no trailing whitespace. ESLint enforces Vue/TypeScript and UnoCSS conventions, including SFC order: `script`, `template`, `style`. Use PascalCase for components (`TabbarItem.vue`), camelCase for utilities, `useXxx.ts` for composables, and lowercase feature directories. Keep platform-specific code inside uni-app conditional compilation boundaries. Do not commit generated `src/pages.json`, `src/manifest.json`, or build output.

## Testing Guidelines

Vitest runs in `jsdom` with shared uni-app mocks from `src/test-setup.ts`. Name tests `*.test.ts` or `*.spec.ts` under `src`. Add focused tests for changed stores, hooks, utilities, and interactive components; reset mutable state and mock platform APIs. Before opening a PR, run `pnpm type-check`, `pnpm lint`, and `pnpm test:run`. For UI changes, smoke-test `/`, authentication, and tab navigation on H5; test Mini Program-specific behavior in WeChat DevTools.

## Commit & Pull Request Guidelines

Commitlint enforces Conventional Commits. Use messages such as `feat(auth): add password login` or `fix(tabbar): preserve selected item`. Keep commits scoped and include a Changeset when published behavior requires versioning. PRs should explain intent, list verification commands and target platforms, link relevant issues, and include screenshots or recordings for UI changes. Never commit credentials or place secrets in client-visible `VITE_*` variables; use ignored local overrides for machine-specific configuration.

## Wot UI Workflow

- This app uses the npm installation mode. Import composition APIs, types, and utilities from `@wot-ui/ui`.
- Prefer the repository-level `wot-ui-v2` and `wot-ui-cli` skills. Query component knowledge in this order: `list` -> `info` -> `demo` -> `doc` -> `token`.
- After project changes, run `pnpm wot:doctor`, `pnpm wot:usage`, and `pnpm wot:lint`; `pnpm wot:check` may run all three. Do not depend on a globally installed `wot` executable.
- Do not run open-wot maintenance commands such as `extract`, source-mode, or debug commands in this application. Do not copy `llms-full.txt` or entire Cursor/Trae rule sets into the repository.
- Do not add `@wot-ui/ui/global` to `tsconfig.json`: Wot UI 2.2.0 pulls source SFC type errors into this project. Keep component typing with the existing resolver-generated declarations.
- MCP is optional and is not required to start the application. Missing MCP dependencies must not block Codex work.
