import type { ValidationResult } from '../types';

/** Maximum allowed length of a todo text. */
export const MAX_TODO_LENGTH = 80;

/**
 * Validates the text of a todo (Option 16: error handling).
 * @param raw - the raw value from the input field
 * @returns `{ ok: true, value }` with trimmed text, or `{ ok: false, error }` with a message
 */
export const validateTodoText = (raw: string): ValidationResult => {
  const value = raw.trim();

  if (value === '') {
    return { ok: false, error: 'Please enter a todo item.' };
  }
  if (value.length > MAX_TODO_LENGTH) {
    return { ok: false, error: `A todo can have at most ${MAX_TODO_LENGTH} characters.` };
  }
  return { ok: true, value };
};
