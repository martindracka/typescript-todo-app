# TypeScript Todo App

School project - a todo app in TypeScript + Vite.
Based on the starter code from [kristian-wittrup/2024-todo-TS-app-bde](https://github.com/kristian-wittrup/2024-todo-TS-app-bde).

## Features I added

- Mark a todo as completed (checkbox)
- Toggle all / clear completed
- Edit a todo with Save and Cancel (Enter / Esc also work)
- Filter: All / Active / Completed
- Sort by created, priority, due date or status
- Due date, overdue todos are shown in red
- Priority: Low / Medium / High
- Search
- Category tags (Work / School / Personal / Shopping) + filter by category
- Progress bar
- Dark mode
- Todos are saved in localStorage
- JSDoc comments
- Input validation with an error message

## Files

- `src/main.ts` - starts the app, event listeners
- `src/types.ts` - interfaces and types
- `src/TodoStore.ts` - class with the todo list + localStorage
- `src/ui/render.ts` - renders the list
- `src/ui/theme.ts` - dark mode
- `src/utils/` - date and validation helpers
- `manual-compile/basics.ts` - example for compiling with tsc without Vite

## How to run

```
npm install
npm run dev
```

Other commands: `npm test`, `npm run build`, `npm run compile:manual`

## Tests

- `npm test` - unit tests (Vitest)
- `npm run build && npm run test:e2e` - end-to-end tests (TestCafé, headless Chrome) in `tests/e2e/`

## Workflow

- **Gitflow:** `main` (production), `develop` (test), `feature/*`, `release/*`
- **Conventional commits**, e.g. `feat(categories): filter todos by category`
- Every feature has a GitHub issue and is merged into `develop` with a reviewed pull request
- **CI/CD** (`.github/workflows/pipeline.yml`): build + tests on every push, `develop` is deployed to the [test environment](https://martindracka.github.io/typescript-todo-app/test/), `main` to [production](https://martindracka.github.io/typescript-todo-app/)
