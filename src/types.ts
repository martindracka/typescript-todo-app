/**
 * types.ts
 * All shared types and interfaces for the Todo app live in this module,
 * so every other file can `import type { ... } from './types'`.
 */

/** Priority level of a todo – a UNION of string literal types. */
export type Priority = 'low' | 'medium' | 'high';

/** Which todos the user wants to see (Option 4: filter by status). */
export type FilterStatus = 'all' | 'active' | 'completed';

/** How the list is sorted (Option 5 + Option 7). */
export type SortOption = 'created' | 'priority' | 'dueDate' | 'status';

/** Light or dark theme (Option 11). */
export type Theme = 'light' | 'dark';

/**
 * The shape of one todo item.
 * `dueDate` is an OPTIONAL property (`?`) – a todo does not need a due date.
 * `id` and `createdAt` are `readonly` – they can never change after creation.
 */
export interface Todo {
  readonly id: number;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // ISO format "YYYY-MM-DD"
  readonly createdAt: number;
}

/** Data needed to create a new todo – only `text` is required. */
export interface NewTodoInput {
  text: string;
  priority?: Priority;
  dueDate?: string;
}

/** The fields a user is allowed to change when editing a todo. */
export type TodoChanges = Partial<Pick<Todo, 'text' | 'priority' | 'dueDate'>>;

/** Current view settings chosen in the toolbar. */
export interface ViewOptions {
  filter: FilterStatus;
  search: string;
  sort: SortOption;
}

/** Result of the progress calculation (Option 10). */
export interface Progress {
  completed: number;
  total: number;
  percent: number;
}

/**
 * Minimal contract of a key/value storage.
 * The browser's `localStorage` matches it, and in tests we can pass a fake one.
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Result of validating user input (Option 16).
 * A DISCRIMINATED UNION – the `ok` property tells TypeScript which variant we have.
 */
export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

/** Type guard: turns any string into a FilterStatus safely. */
export const isFilterStatus = (value: string | undefined): value is FilterStatus =>
  value === 'all' || value === 'active' || value === 'completed';

/** Type guard for priorities. */
export const isPriority = (value: string | undefined): value is Priority =>
  value === 'low' || value === 'medium' || value === 'high';

/** Type guard for sort options. */
export const isSortOption = (value: string | undefined): value is SortOption =>
  value === 'created' || value === 'priority' || value === 'dueDate' || value === 'status';
