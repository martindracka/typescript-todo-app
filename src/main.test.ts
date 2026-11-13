import { describe, it, expect, beforeEach } from 'vitest';
import { TodoStore } from './TodoStore';
import type { StorageLike, Todo } from './types';
import { isOverdue } from './utils/date';
import { validateTodoText } from './utils/validation';

/** A fake storage that lives in memory – implements the same interface as localStorage. */
class MemoryStorage implements StorageLike {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
}

describe('TodoStore', () => {
  let storage: MemoryStorage;
  let store: TodoStore;

  beforeEach(() => {
    storage = new MemoryStorage();
    store = new TodoStore(storage);
  });

  it('adds a todo with default priority', () => {
    const todo = store.add({ text: 'Test Todo' });
    expect(store.getAll()).toHaveLength(1);
    expect(todo.priority).toBe('medium');
    expect(todo.completed).toBe(false);
    expect(todo.dueDate).toBeUndefined();
  });

  it('toggles a todo (Option 1)', () => {
    const todo = store.add({ text: 'Test' });
    store.toggle(todo.id);
    expect(store.getAll()[0].completed).toBe(true);
  });

  it('removes a todo', () => {
    const todo = store.add({ text: 'Test' });
    store.remove(todo.id);
    expect(store.getAll()).toHaveLength(0);
  });

  it('edits a todo (Option 3)', () => {
    const todo = store.add({ text: 'Old' });
    store.update(todo.id, { text: 'New', priority: 'high', dueDate: '2030-01-01' });
    expect(store.getAll()[0]).toMatchObject({ text: 'New', priority: 'high', dueDate: '2030-01-01' });
  });

  it('clears completed todos and toggles all (Option 2)', () => {
    store.add({ text: 'A' });
    store.add({ text: 'B' });
    store.toggleAll();
    expect(store.getAll().every((t) => t.completed)).toBe(true);
    expect(store.clearCompleted()).toBe(2);
    expect(store.getAll()).toHaveLength(0);
  });

  it('filters, searches and sorts (Options 4, 5, 7, 8)', () => {
    const low = store.add({ text: 'Buy milk', priority: 'low' });
    store.add({ text: 'Write report', priority: 'high' });
    store.toggle(low.id);

    expect(store.getVisible({ filter: 'active', search: '', sort: 'created' }).map((t) => t.text)).toEqual(['Write report']);
    expect(store.getVisible({ filter: 'all', search: 'MILK', sort: 'created' })).toHaveLength(1);
    expect(store.getVisible({ filter: 'all', search: '', sort: 'priority' })[0].priority).toBe('high');
  });

  it('calculates progress (Option 10)', () => {
    const a = store.add({ text: 'A' });
    store.add({ text: 'B' });
    store.toggle(a.id);
    expect(store.getProgress()).toEqual({ completed: 1, total: 2, percent: 50 });
  });

  it('saves to and loads from storage (Option 14)', () => {
    store.add({ text: 'Persist me' });
    const reloaded = new TodoStore(storage);
    expect(reloaded.getAll()[0].text).toBe('Persist me');
  });

  it('survives broken JSON in storage', () => {
    storage.setItem('ts-todo-app.todos', '{not json');
    expect(new TodoStore(storage).getAll()).toEqual([]);
  });
});

describe('helpers', () => {
  const base: Todo = { id: 1, text: 'x', completed: false, priority: 'low', createdAt: 1 };

  it('detects overdue todos (Option 6)', () => {
    expect(isOverdue({ ...base, dueDate: '2020-01-01' }, '2026-11-13')).toBe(true);
    expect(isOverdue({ ...base, dueDate: '2030-01-01' }, '2026-11-13')).toBe(false);
    expect(isOverdue({ ...base, dueDate: '2020-01-01', completed: true }, '2026-11-13')).toBe(false);
    expect(isOverdue(base, '2026-11-13')).toBe(false);
  });

  it('validates input (Option 16)', () => {
    expect(validateTodoText('   ')).toEqual({ ok: false, error: 'Please enter a todo item.' });
    expect(validateTodoText('  hello ')).toEqual({ ok: true, value: 'hello' });
    expect(validateTodoText('a'.repeat(81)).ok).toBe(false);
  });
});
