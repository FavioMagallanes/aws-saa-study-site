# Agent Guidelines

Reusable defaults for TypeScript frontend projects. Apply React-specific rules only when React is used. Prefer correctness, accessibility, maintainability, and user experience over stylistic shortcuts.

## Working agreement

- Before editing, read the applicable `AGENTS.md` files, project documentation, package manifests, lockfile, relevant configuration, and nearby implementation and tests. More specific repository instructions take precedence within their scope.
- Apply these defaults to new and materially changed code. Do not rename, reformat, migrate, or refactor unrelated code to enforce them.
- For non-trivial work, briefly describe the approach, affected feature, and meaningful risks. Ask about consequential ambiguity; state reasonable low-risk assumptions and proceed.
- Make the smallest complete change. Reuse existing capabilities before introducing alternatives, and preserve unrelated work and uncommitted changes.
- Respect framework requirements. Surface conflicts with these defaults and use the narrowest necessary exception; do not silently weaken standards or redesign the application.
- Do not invent APIs, package versions, scripts, or verification results. Consult documentation matching the installed version when needed.

## Language and naming

- Write identifiers, developer documentation, comments, test descriptions, and commit messages in English. Keep user-facing copy in the product's required language and localization system. Communicate with the user in their requested language.
- Use `kebab-case` for authored files and directories: `checkout-form.tsx`, `use-checkout.ts`, `calculate-total.ts`. Preserve required framework filenames, route syntax, generated names, and standard files such as `AGENTS.md`.
- Use `PascalCase` for components and types; `camelCase` for functions, variables, and hooks. Hook names must start with `use` followed by a capital letter: `useCheckout`.
- Use descriptive domain names. Avoid vague modules such as `helpers.ts`, `common.ts`, or `manager.ts` when a specific name is available.

## Type safety

- Use TypeScript with `strict` enabled. For new project configuration, also enable `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Propose a scoped migration before enabling stricter options in an existing project.
- Type component props, domain models, external contracts, and non-trivial exported function boundaries. Use inference for obvious local values and component return types; do not add redundant annotations.
- Do not introduce `any`, `@ts-ignore`, unjustified non-null assertions, or double assertions to bypass checking. Use `unknown` and narrow it. Isolate unavoidable third-party typing gaps in a small adapter with an explanation.
- Validate untrusted data at entry boundaries, including API responses, persisted data, and URL input, using existing tools or focused guards. Do not treat a type assertion as runtime validation or repeatedly validate already trusted internal data.
- Model meaningful states explicitly, using discriminated unions where they prevent invalid combinations. Handle nullability and error cases rather than hiding them behind casts or misleading defaults.
- Prefer readonly inputs where mutation is not intended, and use type-only imports where appropriate. Keep generics and utility types understandable; do not build speculative type frameworks.

## Code style and design

- Use arrow functions assigned to `const` for authored functions and hooks. Use functional components declared as named exports: `export const CheckoutForm = (...) => ...`.
- Avoid default exports except when an integration requires them. In that case, keep a named `const` implementation and add the required default export when supported. Retain a non-arrow or class-based implementation only when an API genuinely requires it.
- Prefer concise expressions and implicit returns when readable. A one-line implementation is a preference, not a goal. Follow the formatter; do not compress JSX, nest ternaries, or combine unrelated operations to save lines.
- Give each component, hook, function, and module one cohesive responsibility. Extract around meaningful concepts, not arbitrary line limits or a mandatory one-function-per-file rule.
- Apply DRY to duplicated knowledge and business rules. Allow small duplication when the alternatives would couple unrelated features or require a premature abstraction.
- Apply SOLID pragmatically through cohesive modules, small contracts, explicit dependencies, and composition. Introduce a design pattern only to solve an identifiable current problem; do not create speculative layers, factories, repositories, or dependency-injection containers.
- Prefer pure functions, composition, immutable inputs, and explicit data flow. Do not mutate props, React state, or shared data. Local mutation of newly created values is acceptable when contained and clearer or more efficient.
- Prefer clear control flow and early returns. Do not force `reduce`, function pipelines, or abstractions where a straightforward loop or conditional is easier to understand.

## Feature-based architecture

- Organize product code around business capabilities under `src/features/<feature-name>`, rather than global buckets of components, hooks, and services. Keep framework routing and application composition in their required locations.
- Keep feature UI, React orchestration, domain logic, data access, types, and tests within the owning feature. Separate these concerns when there is actual code to separate; do not generate empty scaffolding.
- Keep domain calculations and business rules independent of React and rendering. Put network and storage interactions in focused boundary modules, hooks, or framework facilities appropriate to the task.
- Place genuinely reusable, domain-independent code in `src/shared`. Do not promote code merely because it might be reused someday, or move business rules there to avoid defining ownership.
- Keep dependencies directional: application composition may use features and shared code; features may use shared code; shared code must not depend on features or application composition.
- Avoid direct feature-to-feature coupling by composing at the application level. When a cross-feature dependency is genuinely necessary, use a deliberate public contract, never another feature's private internals. Do not introduce cycles or blanket barrel exports.

Example placement, not a scaffold to generate:

```text
src/
  app/
    tests/
      integration/
  features/
    checkout/
      components/
        checkout-form.tsx
      hooks/
        use-checkout.ts
      model/
        checkout.types.ts
        calculate-total.ts
      services/
        submit-order.ts
      tests/
        unit/
          calculate-total.test.ts
        integration/
          checkout-form.test.tsx
  shared/
    ui/
      button/
        button.tsx
        tests/
          button.test.tsx
```

## Components, hooks, and state

- Default to presentational components with typed props. Keep business decisions, data access, and complex orchestration outside them.
- Keep simple view-specific state, event handlers, and inexpensive derived values in the component when extraction would add indirection without improving cohesion, reuse, or testability.
- Extract a custom hook for cohesive React-dependent behavior, not merely to move lines out of a component. Use an ordinary function for logic that does not need React hooks.
- Follow the Rules of React and the configured hook lint rules. Keep rendering pure and define components at module scope, not inside other components.
- Use effects to synchronize with external systems, not to derive render data or handle actions that belong in event handlers. Keep dependencies accurate and clean up subscriptions, timers, and pending work where needed.
- Keep state close to its consumers. Distinguish local UI state, URL state, and server state; reuse the existing data-fetching and caching approach instead of creating parallel sources of truth.
- Use stable keys based on identity. Do not use random keys or array indexes for lists whose ordering or membership can change.
- Respect server/client boundaries when applicable. Do not move work to the client or add a client boundary without an actual requirement.

## User experience, errors, and security

- Handle applicable loading, empty, success, error, and disabled states. Preserve user input on recoverable failures and provide actionable feedback instead of silent catches.
- Prevent duplicate submissions and stale async results where relevant. Support cancellation or ignore outdated responses; do not retry non-idempotent operations blindly.
- Reuse established UI primitives, design tokens, and responsive conventions. Do not introduce a parallel design system or styling approach for an isolated task.
- Never expose secrets in client code, public environment variables, logs, fixtures, or committed files. Do not treat client-side authorization checks as the security boundary.
- Avoid raw HTML injection and unsafe DOM APIs. For necessary untrusted rich content, use an approved sanitization solution; do not build an ad hoc sanitizer.

## Accessibility

- Target WCAG 2.2 AA for affected UI. Prefer semantic HTML and native interactive elements before adding ARIA or custom behavior.
- Provide accessible names, associated labels, useful alternative text, and programmatically associated error messages. Do not rely on color alone to communicate meaning.
- Support keyboard operation, logical focus order, visible focus, and appropriate focus management for dialogs, navigation, and validation failures.
- Preserve contrast, zoom and reflow usability, usable target sizes, and reduced-motion preferences.
- Verify relevant interactions manually as well as with available automated checks. Do not claim accessibility conformance solely because an automated scan passes.

## Performance

- Design for efficient loading and interaction from the start: avoid unnecessary client JavaScript, duplicated requests, avoidable request waterfalls, and expensive repeated work.
- Use framework-supported code splitting and defer non-critical work where useful. Size images appropriately, reserve layout space, and do not lazy-load content critical to initial rendering.
- Keep state updates localized and derived data out of redundant state. Consider pagination or virtualization for genuinely large lists, using existing capabilities first.
- Do not add `memo`, `useMemo`, or `useCallback` routinely. Use manual memoization for an identified expensive computation or meaningful identity requirement, and verify the benefit. Account for the project's compiler setup when applicable.
- For performance-sensitive changes, compare before and after with representative data and production-like conditions. Respect documented budgets for loading, responsiveness, layout stability, and bundle size.
- Never trade correctness, accessibility, or maintainability for an unmeasured micro-optimization. Report what was measured and what remains unverified.

## Risk-based testing

- Add unit and integration tests where failures can materially harm users: incorrect business results, lost data, broken critical workflows, privacy or permission mistakes, inaccessible interactions, and misleading error or success states.
- Choose test depth using user impact, failure likelihood, and change complexity. Use unit tests for significant isolated rules and integration tests for meaningful interactions between UI, state, and data boundaries. Do not require both for every change.
- Test observable behavior rather than private implementation details. Prefer accessible queries and realistic interactions; mock external boundaries rather than the internal behavior being verified.
- Cover important failure paths and edge cases, not only the happy path. Add a regression test for user-impacting bug fixes when feasible; explain any meaningful coverage gap.
- Do not add trivial render tests, large snapshots, or tests that merely duplicate static type checks to increase coverage. Do not remove valuable tests or lower existing quality gates to fit this policy.
- Keep feature tests in `src/features/<feature-name>/tests/`, with `unit/` and `integration/` subfolders as needed. Keep fixtures and mocks in that test subtree. No loose test files among production modules.
- Keep shared-module tests in the shared module's own `tests/` directory. Place cross-feature integration tests in `src/app/tests/integration/` or the framework's equivalent application test directory.
- Keep tests deterministic and isolated. Reuse the existing runner and test utilities; do not add test dependencies or E2E infrastructure without approval.

## Dependencies and tooling

- Do not add, remove, upgrade, or replace a package or tool unless explicitly included in the user's request or an approved plan. This includes development dependencies, scaffolding tools, and transient downloads through commands such as `npx` or `dlx`.
- Before proposing a dependency, explain its purpose, why existing capabilities are insufficient, the selected version, compatibility, and relevant maintenance, security, and bundle-size tradeoffs. Wait for approval before installing it.
- For an approved addition or upgrade, verify the latest stable release against the package registry and official release information at execution time. Check runtime requirements, peer dependencies, and framework compatibility. Do not assume `latest` guarantees stability or compatibility.
- If the latest stable release is incompatible or has a known relevant security issue, stop that installation and present alternatives. Do not silently install an older release, upgrade the stack, use prereleases, or force dependency resolution.
- Existing dependency restoration is not an upgrade: use the repository's package manager and lockfile-preserving install mode when setup is authorized. Preserve pinned versions and the existing manifest version-range policy.
- Update the manifest and lockfile together for approved dependency changes. Do not mix package managers, hand-edit resolved dependency data, or run broad update or automatic audit-fix commands outside the approved scope.

## Comments and documentation

- Prefer expressive names and straightforward code. Add comments only for non-obvious intent, constraints, invariants, important tradeoffs, or necessary workarounds.
- Do not narrate obvious code, add decorative section comments, or leave commented-out implementations. Keep documentation aligned with changed behavior and contracts.

## Verification and delivery

- Discover and run the repository's relevant formatting, lint, type-check, test, and build commands. Start with targeted checks and expand according to the change's impact and project requirements.
- Review the final diff for unrelated changes, accidental dependency edits, unsafe typing, missing user states, and relevant accessibility or performance regressions.
- Do not disable rules, weaken type checking, or delete assertions merely to make checks pass. Distinguish pre-existing failures from regressions introduced by the change.
- If a check cannot run, state the exact limitation and remaining risk. Never report an unexecuted check as passing.
- Finish with a brief summary of changes, verification actually performed, and outstanding risks or decisions. Explain why tests were unnecessary when that is a meaningful judgment call.
- Use Conventional Commits in English when a commit is requested: `<type>[optional scope][!]: <description>`. Put a provided scope in parentheses, for example `fix(checkout): prevent duplicate submissions`. Mark breaking changes with `!` or a `BREAKING CHANGE:` footer.
- Do not create commits, push, publish, deploy, or perform destructive Git operations unless requested.

## Project-specific configuration

**Project**: "Arquitecto", a personal reading-only study site for AWS Certified Solutions Architect - Associate (SAA-C03). Product brief and decisions live in Engram (`aws-saa-study-site/brief`, `aws-saa-study-site/stack`). Design source: Penpot file "Nuevo Archivo 9".

**Stack**: pnpm 12 workspaces, Node >=22.12, TypeScript 6.0.3 (pinned below 6.1 because `typescript-eslint` does not yet support TS 7).

- `apps/web`: Vite, React 19, TanStack Router (file-based), TanStack Query (server state), Zustand (UI state only), MDX content, CSS Modules with BEM, design tokens in `src/shared/styles/tokens.css`.
- `apps/api`: Express 5, Drizzle ORM, Postgres (Neon in production). No login: single global reading progress; `PUT`/`DELETE` require the `x-write-key` header matching `WRITE_KEY`.
- `packages/contracts`: shared Zod schemas (`./progress`, `./content`).

**Content rules**

- User-facing copy is Spanish (AWS service names stay in English). Content comes only from the official exam guide and docs.aws.amazon.com, explained in our own words.
- Every page is `apps/web/content/pages/<kind>/<id>.mdx` and exports `meta` (validated by `pageMetaSchema`). Page bodies currently say "Contenido pendiente."
- No exam topic may be left out: every bullet in `content/exam-guide.json` must be in some page's `covers`, and every in-scope service needs a service page. The test `src/features/content/tests/integration/content-coverage.test.ts` enforces this.
- The glossary lives in `apps/web/content/glossary.json` (schema `glossaryEntrySchema`). Every entry cites a `docs.aws.amazon.com` source whose page must contain the English expansion. The guide's out-of-scope services (for example AWS CDK, Amazon MWAA, AWS FIS, Amazon IVS, DLAMI) are not exam topics and must not be added.
- No mocked data: use the real content and the real API with a real Postgres.

**Commands** (run from the repository root)

- `pnpm lint`, `pnpm format:check`, `pnpm -r typecheck`
- `pnpm --filter @arquitecto/web test`, `pnpm --filter @arquitecto/contracts test`, `pnpm --filter @arquitecto/api test`
- `pnpm --filter @arquitecto/web build`
- Local Postgres: `docker compose up -d --wait` (tests use the `arquitecto_test` database, created automatically)
- API database: `pnpm --filter @arquitecto/api db:generate` and `db:migrate` (needs `apps/api/.env`, see `.env.example`)

**Conventions specific to this repository**

- Tests live in `src/features/<feature>/tests/{unit,integration}`; in `apps/api` they live in `tests/`.
- Local imports in `packages/contracts` and `apps/api` use explicit `.ts` extensions (`allowImportingTsExtensions`).
- Route files under `apps/web/src/routes` are required by TanStack Router; `routeTree.gen.ts` is generated and ignored by lint and format.
- Penpot pending items: mobile menu, empty state, tablet screens, and verification of sample texts against AWS docs.

**Approved exceptions**: `@types/pg` was installed together with `pg` (needed for typing). The pnpm 12 `ignored build scripts` warning for esbuild is unresolved and not approved.
