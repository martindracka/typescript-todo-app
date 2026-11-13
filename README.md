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
