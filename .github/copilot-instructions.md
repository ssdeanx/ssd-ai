```instructions
[byterover-mcp]

# GitHub Copilot instructions — ssd-ai (byterover MCP)

This file documents repository-specific guidance to help AI coding agents be productive immediately.
It preserves the existing required Byterover tools and adds concise, actionable patterns, commands,
and examples tailored to this codebase.


## Quick repo orientation
- Entrypoint: `src/index.ts` — public exports for consumers.
- Main areas:
  - `src/lib/` — core domain libraries (e.g. `MemoryManager.ts`, `taskManager.ts`)
  - `src/tools/` — assistant tools grouped by capability (`prompt/`, `memory/`, `convention/`, `semantic/`, etc.)
  - `src/transports/` — transport implementations (e.g. `http.ts`)
  - `src/__tests__/` — unit tests (Vitest)

## Build / Run / Test (use these exact commands)
- Build: `npm run build` (runs `tsc`)
- Dev (stdio): `npm run dev:stdio` or `npm run dev` (sets `MCP_TRANSPORT`)
- Start HTTP server: `npm run start:http` or set `MCP_TRANSPORT=http` then `npm run build && node dist/index.js`
- Run all tests: `npm run test` (Vitest)
- Run a single test file: `npx vitest run <path/to/testfile>` (example: `npx vitest run src/__tests__/taskManager.test.ts`)
- Type-check: `tsc --noEmit`
- Format: `npx biome format --apply`
- Lint / checks: `npx biome check`

## Code & style conventions (repository-specific)
- TypeScript 5 targeting ES2022; prefer explicit return types on exported functions.
- Filenames: `camelCase.ts`; Types/Classes/Interfaces: `PascalCase` (no `I` prefix).
- Use `camelCase` for variables/functions; `PascalCase` for exported types/classes/interfaces.
- Avoid `any` — use `unknown` and narrow inputs.
- Error handling: prefer domain-specific errors (e.g., `McpError`) and rethrow typed errors.
- Logging: **no** `console.log` in library code; `console.error` only for entrypoints or failures.
- Prefer named exports and small testable functions (follow patterns in `src/lib/*`).

## Tests & PR checklist (must-do for code changes)
- Add unit tests in `src/__tests__/` for critical/new behavior.
- If adding a public API, export it from `src/index.ts` and add tests.
- Run `tsc --noEmit`, `npm run test`, `npx biome format --apply`, and `npx biome check` before opening a PR.
- Update `README.md` or docs under `docs/` when behavior or public API changes (see `.github/instructions/update-docs-on-code-change.instructions.md`).

## Semantic & navigation helpers
- Use `src/tools/semantic/findReferences.ts` and `findSymbol.ts` to locate symbol usage across the repo.
- Grep/search for patterns like `McpError`, `byterover-*`, and tool names (e.g., `saveMemory`, `MemoryManager`) for context.

## Integration points & patterns to watch
- Memory tools: `src/tools/memory/*` implement session persistence/recall patterns — add tests when changing behavior.
- Prompt & reasoning tools: `src/tools/prompt/` and `src/tools/reasoning/` contain higher-level logic used by agents — check tests and examples when altering logic.
- Transports: `src/transports/http.ts` may be used by runtime server; verify changes with integration runs (`npm run start:http`).

## Example: adding a new memory tool
1. Add file to `src/tools/memory/` (e.g. `myNewTool.ts`) following existing file patterns.
2. Add unit tests in `src/__tests__/myNewTool.test.ts` using Vitest.
3. Export utility where needed and update `src/index.ts` if it becomes public.
4. Run `tsc --noEmit`, `npm run test`, `npx biome format --apply`, `npx biome check`.
5. Use `byterover-store-knowledge` to save discovered patterns or the approach.

## When to call the Byterover tools
- ALWAYS run `byterover-retrieve-knowledge` at start of a non-trivial task to fetch relevant memories.
- Use `byterover-store-knowledge` immediately after you discover architectural rules, repeated fixes, or
  non-obvious debug steps so future agents know the same shortcuts.

## Where to look first (quick links)
- Architecture overview: `AGENTS.md` (contains build/test commands and repo conventions)
- Docs & policies: `.github/instructions/` (e.g. update-docs-on-code-change.instructions.md)
- Tests: `src/__tests__/` — copy style/patterns when adding new tests
- Semantic helpers: `src/tools/semantic/`

## Contact / clarifications
If guidance is ambiguous, check `AGENTS.md`, `README.md`, and `docs/`. For questions about intent, open an issue so maintainers can document decisions for future agents.

```