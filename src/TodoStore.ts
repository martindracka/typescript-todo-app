import type {
  NewTodoInput,
  Priority,
  Progress,
  StorageLike,
  Todo,
  TodoChanges,
  ViewOptions,
} from './types';
import { isPriority } from './types';

/** Numeric weight of every priority – used for sorting (Option 7). */
const PRIORITY_WEIGHT: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

/**
 * TodoStore – a CLASS that owns the list of todos.
 *
 * - `private todos` can only be changed through the public methods below.
 * - `readonly storageKey` is set once in the constructor and never changes.
 * - Every change is saved to storage automatically (Option 14: Local Storage).
 */
export class TodoStore {
  private todos: Todo[] = [];
  private readonly storage: StorageLike | null;
  public readonly storageKey: string;

  /**
   * @param storage - where to save todos (`localStorage` in the browser, a fake in tests, or null)
   * @param storageKey - the key used in storage
   */
  constructor(storage: StorageLike | null, storageKey: string = 'ts-todo-app.todos') {
    this.storage = storage;
    this.storageKey = storageKey;
    this.todos = this.load();
  }

  /** Returns a read-only copy of all todos. */
  public getAll(): readonly Todo[] {
    return [...this.todos];
  }

  /**
   * Adds a new todo.
   * @param input - text is required, priority and dueDate are optional
   * @returns the created todo
   */
  public add(input: NewTodoInput): Todo {
    const newTodo: Todo = {
      id: Date.now() + Math.random(), // unique even if two todos are added in the same ms
      text: input.text,
      completed: false,
      priority: input.priority ?? 'medium', // default value if priority was not given
      dueDate: input.dueDate || undefined, // empty string from the date input => no due date
      createdAt: Date.now(),
    };
    this.todos.push(newTodo);
    this.save();
    return newTodo;
  }

  /** Removes the todo with the given id. */
  public remove(id: number): void {
    this.todos = this.todos.filter((todo) => todo.id !== id);
    this.save();
  }

  /** Option 1: toggles the completed status of one todo. */
  public toggle(id: number): void {
    this.todos = this.todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
    this.save();
  }

  /**
   * Option 2/3: toggles all todos.
   * If every todo is already completed, all become active – otherwise all become completed.
   */
  public toggleAll(): void {
    const allCompleted = this.todos.every((todo) => todo.completed);
    this.todos = this.todos.map((todo) => ({ ...todo, completed: !allCompleted }));
    this.save();
  }

  /**
   * Option 3: updates (edits) a todo.
   * @param id - which todo to edit
   * @param changes - only the fields that should change
   */
  public update(id: number, changes: TodoChanges): void {
    this.todos = this.todos.map((todo) =>
      todo.id === id ? { ...todo, ...changes, dueDate: changes.dueDate || undefined } : todo,
    );
    this.save();
  }

  /**
   * Option 2: removes all completed todos.
   * @returns how many todos were removed
   */
  public clearCompleted(): number {
    const before = this.todos.length;
    this.todos = this.todos.filter((todo) => !todo.completed);
    this.save();
    return before - this.todos.length;
  }

  /** Option 14: removes every todo and deletes the key from storage. */
  public clearAll(): void {
    this.todos = [];
    this.storage?.removeItem(this.storageKey);
  }

  /**
   * Returns the todos that should be displayed – filtered, searched and sorted.
   * Options 4, 5, 7 and 8.
   */
  public getVisible(options: ViewOptions): Todo[] {
    const query = options.search.trim().toLowerCase();

    const visible = this.todos
      .filter((todo) => {
        if (options.filter === 'active') return !todo.completed;
        if (options.filter === 'completed') return todo.completed;
        return true; // 'all'
      })
      .filter((todo) => todo.text.toLowerCase().includes(query));

    return this.sort(visible, options.sort);
  }

  /** Option 10: how many todos are completed, in numbers and percent. */
  public getProgress(): Progress {
    const total = this.todos.length;
    const completed = this.todos.filter((todo) => todo.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, percent };
  }

  // ---------- private helpers ----------

  /** Sorts a copy of the list – never mutates the original array. */
  private sort(list: Todo[], sortBy: ViewOptions['sort']): Todo[] {
    const sorted = [...list];
    switch (sortBy) {
      case 'priority':
        return sorted.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
      case 'dueDate':
        // todos without a due date go to the end
        return sorted.sort((a, b) => (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31'));
      case 'status':
        // active todos first, completed last
        return sorted.sort((a, b) => Number(a.completed) - Number(b.completed));
      case 'created':
      default:
        return sorted.sort((a, b) => a.createdAt - b.createdAt);
    }
  }

  /** Saves the todos as JSON into storage. */
  private save(): void {
    try {
      this.storage?.setItem(this.storageKey, JSON.stringify(this.todos));
    } catch (error) {
      console.error('Could not save todos:', error);
    }
  }

  /** Loads todos from storage. Broken or missing data gives an empty list. */
  private load(): Todo[] {
    try {
      const json = this.storage?.getItem(this.storageKey);
      if (!json) return [];

      const data: unknown = JSON.parse(json); // `unknown` forces us to check the data before using it
      if (!Array.isArray(data)) return [];

      return data
        .filter((item): item is Todo => typeof item?.id === 'number' && typeof item?.text === 'string')
        .map((item) => ({
          ...item,
          completed: Boolean(item.completed),
          priority: isPriority(item.priority) ? item.priority : 'medium',
          createdAt: typeof item.createdAt === 'number' ? item.createdAt : item.id,
        }));
    } catch (error) {
      console.error('Could not load todos:', error);
      return [];
    }
  }
}
