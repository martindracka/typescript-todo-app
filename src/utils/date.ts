import type { Todo } from '../types';

/**
 * Returns today's date as "YYYY-MM-DD" in the user's local time zone.
 * @returns today's date in ISO format
 */
export const todayISO = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

/**
 * Checks if a todo is overdue (Option 6).
 * A todo is overdue when it has a due date, the date is before today and it is not completed.
 * @param todo - the todo to check
 * @param today - today's date, defaults to the real date (can be overridden in tests)
 * @returns true when the todo is overdue
 */
export const isOverdue = (todo: Todo, today: string = todayISO()): boolean =>
  !todo.completed && todo.dueDate !== undefined && todo.dueDate < today;

/**
 * Formats "2026-11-13" into a short human readable date, e.g. "13 Nov 2026".
 * @param iso - date in ISO format
 */
export const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
