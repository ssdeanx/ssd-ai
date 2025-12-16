```instructions
[byterover-mcp]

# GitHub Copilot instructions — ssd-ai (byterover MCP)

**Elevator pitch:** A TypeScript/Node.js collection of MCP server components and AI-assistant tools (memory, prompt, reasoning). Designed for testable, small utilities and extensible transport plugins.

**Tech stack:** TypeScript 5 (ES2022), Node.js, Vitest, Biome (formatter), Model Context Protocol (MCP).

## Required quick actions
- ALWAYS run `byterover-retrieve-knowledge` at the start of any non-trivial task.
- Run `byterover-store-knowledge` when you discover reusable patterns, fixes, or architecture rules.

## Quick repo orientation
- Entrypoint: `src/index.ts` — public exports for consumers.
- Main areas:
  - `src/lib/` — core domain libraries (ContextCompressor, MemoryManager, taskManager)
  - `src/tools/` — assistant tools (`prompt/`, `memory/`, `convention/`, `semantic/`, `thinking/`)
  - `src/transports/` — transport implementations (`http.ts`)
  - `src/__tests__/` — unit tests and fixtures (Vitest)
  - `docs/` — developer docs and server reference

## Build / Run / Test (copy-and-paste)
- Build: `npm run build` (runs `tsc`)
- Dev (stdio): `npm run dev:stdio` or `npm run dev` (use CLI flags: `--transport=stdio`)
- Start HTTP server: `npm run start:http` (script uses CLI flags: `--transport=http --port=3000 --hostname=localhost`)
- Run all tests: `npm run test` (Vitest)
- Run a single test file: `npx vitest run <path/to/testfile>` (example: `npx vitest run src/__tests__/taskManager.test.ts`)
- Type-check only: `tsc --noEmit`
- Format: `npx biome format --apply`
- Lint / checks: `npx biome check`

Notes: For Smithery compatibility add optional npm scripts to `package.json`:
- `dev:smithery`: `npx smithery dev` (interactive playground)
- `build:http`: `npx smithery build` (Smithery HTTP build)
- `start:http:smithery`: `node .smithery/index.cjs` (run the Smithery-built HTTP bundle)

## Automation & resources
- MCP inspector / runtime: use `npm run start:http` for integration testing of transports.
- Smithery notes: Export a default `createServer({ config })` function and an optional `configSchema` (zod) from `src/index.ts` for automatic Smithery HTTP deployments. Ensure `package.json` has a `module` field pointing to `src/index.ts` and consider adding `smithery` scripts (`dev:smithery`, `build:http`, `start:http:smithery`).
- Semantic helpers: `src/tools/semantic/findReferences.ts`, `findSymbol.ts` — use them before global renames.
- Look for scripts under `package.json` and `scripts/` (if present) for repo automation.

## Code & style conventions (repository-specific)
- Prefer explicit return types on exported functions and small focused functions.
- Filenames: `camelCase.ts`; exported types/classes: `PascalCase` (no `I` prefix).
- Avoid `any`; accept `unknown` and narrow.
- Error handling: prefer domain errors (e.g., `McpError`) and rethrow typed errors; use `instanceof Error` for message access.
- Logging: **no** `console.log` in library code; `console.error` only at entrypoints/failures.
- Naming & exports: prefer named exports; keep public API surface small and explicit.
- Scan for `TODO`/`HACK` comments — prefer documenting or creating issues for long-lived workarounds.

## Tests & PR checklist (must-do)
- Add unit tests in `src/__tests__/` for new/critical behavior; follow existing test patterns.
- If adding a public API, export it from `src/index.ts` and add tests and docs.
- Run: `tsc --noEmit`, `npm run test`, `npx biome format --apply`, `npx biome check` before creating a PR.
- Update `README.md` or `docs/` when changing contract or behavior; add changelog entry for user-facing changes.

## Semantic & navigation helpers
- Use `src/tools/semantic/*` to find references and symbols before renames.
- Search for `McpError`, `byterover-*`, `saveMemory`, `MemoryManager`, or `TODO` to find important patterns.

## Integration points & patterns to watch
- Memory tools: `src/tools/memory/*` implement session persistence and recall; add tests when changing behavior.
- Prompt & reasoning: `src/tools/prompt/` and `src/tools/reasoning/` contain higher-level orchestration — test flows end-to-end.
- Transports: `src/transports/http.ts` provides HTTP transport; verify CORS, header exposure, and DNS rebinding protection if modified.

## Transport modes & configuration (no env vars)
- This repository supports both **STDIO** and **HTTP** transports. When running locally, prefer CLI flags:
  - STDIO: `node dist/index.js --transport=stdio` (default when running `node dist/index.js` without flags)
  - HTTP: `node dist/index.js --transport=http --port=3000 --hostname=localhost`
- **No environment variables for runtime configuration.** Use CLI flags for local runs or Smithery `configSchema` for cloud deployments.
- Smithery: export `createServer({ config })` and `configSchema` (zod) from `src/index.ts`; Smithery injects session config during HTTP deployments.

## Example: adding a new memory tool (concrete steps)
1. Add `src/tools/memory/myNewTool.ts` following existing module patterns.
2. Add `src/__tests__/myNewTool.test.ts` (Vitest) and include edge cases.
3. Export from `src/index.ts` if it becomes part of the public API.
4. Run `tsc --noEmit && npm run test && npx biome format --apply && npx biome check`.
5. Call `byterover-store-knowledge` summarizing decisions and patterns discovered.

## File-type rules
- To add path-specific guidance, create `.github/instructions/*.instructions.md` with `applyTo:` front matter.

## Where to look first (quick links)
- `AGENTS.md` — architecture, build/test commands and repo conventions
- `.github/instructions/` — file-type-specific rules and policies
- `src/__tests__/` — canonical testing patterns and fixtures
- `src/tools/semantic/` — symbol search helpers

## Contact / clarifications
If guidance is ambiguous, open an issue and reference `AGENTS.md` and `README.md`. For maintainers: add short notes to `docs/` when introducing patterns agents should depend on.

```