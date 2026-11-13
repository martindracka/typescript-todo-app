# TypeScript Todo App

A todo app written in TypeScript and built with Vite. It started from
[kristian-wittrup/2024-todo-TS-app-bde](https://github.com/kristian-wittrup/2024-todo-TS-app-bde),
and I finished it by adding features from the optional features list.

## Implemented features

| # | Feature | Where in the code |
|---|---------|-------------------|
| 1 | Toggle completed status (checkbox) | `TodoStore.toggle`, `ui/render.ts` |
| 2 | Clear all completed todos, toggle all | `TodoStore.clearCompleted`, `TodoStore.toggleAll` |
| 3 | Edit a todo inline with Save / Cancel (Enter / Esc) | `renderEditItem` in `ui/render.ts`, `TodoStore.update` |
| 4 | Filter by status (All / Active / Completed) | `TodoStore.getVisible`, `isFilterStatus` |
| 5 | Sort by status | `TodoStore.sort` |
| 6 | Due date, shown next to the todo, overdue todos highlighted | `utils/date.ts` |
| 7 | Priority (Low / Medium / High), sort by priority | `Priority` type, `PRIORITY_WEIGHT` |
| 8 | Search | `TodoStore.getVisible` |
| 10 | Progress bar | `TodoStore.getProgress`, `renderProgress` |
| 11 | Dark mode toggle (saved) | `ui/theme.ts`, CSS variables |
| 14 | Local storage: save, load on page load, clear all | `TodoStore.save / load / clearAll` |
| 15 | JSDoc comments | all files |
| 16 | Input validation with red border and an error message | `utils/validation.ts` |

## Project structure

```
src/
  main.ts              entry point: reads the DOM, handles events, re-renders the page
  types.ts             interfaces, type aliases, union types, type guards
  TodoStore.ts         class that holds the todos (private / public / readonly) and saves them to localStorage
  ui/render.ts         draws the todo list and progress bar
  ui/theme.ts          dark / light mode
  utils/date.ts        due date helpers
  utils/validation.ts  input validation (discriminated union result)
  main.test.ts         Vitest unit tests
manual-compile/
  basics.ts            standalone file used to show compiling with tsc, without Vite
```

## Run it

```bash
npm install
npm run dev             # start the Vite dev server
npm test                # run the unit tests
npm run build           # type-check with tsc, then build with Vite
npm run compile:manual  # compile manual-compile/basics.ts with tsc and run it with node
```
