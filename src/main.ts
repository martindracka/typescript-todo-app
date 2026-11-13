/**
 * main.ts - entry point of the app.
 *
 * The code is split into MODULES:
 *  - types.ts            - interfaces, type aliases and union types
 *  - TodoStore.ts        - class that holds the data and saves it to localStorage
 *  - ui/render.ts        - functions that draw the todos in the DOM
 *  - ui/theme.ts         - dark / light mode
 *  - utils/date.ts       - due date helpers (overdue check, formatting)
 *  - utils/validation.ts - input validation
 *
 * main.ts only connects everything: it reads the HTML elements,
 * listens to events, updates the store and re-renders.
 */
import './style.css';
import { TodoStore } from './TodoStore';
import { CATEGORIES, isCategory, isCategoryFilter, isFilterStatus, isPriority, isSortOption } from './types';
import type { StorageLike, Theme, TodoChanges, ViewOptions } from './types';
import { CATEGORY_LABEL, renderProgress, renderTodos } from './ui/render';
import type { TodoHandlers } from './ui/render';
import { applyTheme, getInitialTheme, toggleTheme } from './ui/theme';
import { validateTodoText } from './utils/validation';

// Step 1: get references to HTML elements

/**
 * Finds an element and throws a clear error if it is missing.
 * GENERIC function: the caller says which element type it expects.
 */
const getElement = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Element "${selector}" was not found in index.html`);
  return element;
};

const todoForm = getElement<HTMLFormElement>('.todo-form');
const todoInput = getElement<HTMLInputElement>('#todo-input');
const prioritySelect = getElement<HTMLSelectElement>('#priority-select');
const categorySelect = getElement<HTMLSelectElement>('#category-select');
const dueDateInput = getElement<HTMLInputElement>('#due-date-input');
const errorMessage = getElement<HTMLParagraphElement>('#error-message');
const todoList = getElement<HTMLUListElement>('#todo-list');
const emptyState = getElement<HTMLParagraphElement>('#empty-state');
const searchInput = getElement<HTMLInputElement>('#search-input');
const filterButtons = document.querySelectorAll<HTMLButtonElement>('[data-filter]');
const categoryFilter = getElement<HTMLSelectElement>('#category-filter');
const sortSelect = getElement<HTMLSelectElement>('#sort-select');
const progressFill = getElement<HTMLDivElement>('#progress-fill');
const progressText = getElement<HTMLSpanElement>('#progress-text');
const toggleAllButton = getElement<HTMLButtonElement>('#toggle-all-btn');
const clearCompletedButton = getElement<HTMLButtonElement>('#clear-completed-btn');
const clearAllButton = getElement<HTMLButtonElement>('#clear-all-btn');
const themeButton = getElement<HTMLButtonElement>('#theme-toggle');

// Step 2: application state

/** localStorage can be blocked (e.g. private mode) - then we just don't save. */
const getStorage = (): StorageLike | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const storage = getStorage();
const store = new TodoStore(storage); // Option 14: todos are loaded from localStorage here

const view: ViewOptions = { filter: 'all', search: '', sort: 'created', category: 'all' };
let editingId: number | null = null; // UNION with null: either an id or "nothing is being edited"
let theme: Theme = getInitialTheme(storage);

// Step 3: render

/** Re-draws everything that depends on the data. */
const render = (): void => {
  const visibleTodos = store.getVisible(view);
  renderTodos(todoList, visibleTodos, editingId, handlers);
  renderProgress(progressFill, progressText, store.getProgress());

  const hasTodos = store.getAll().length > 0;
  emptyState.hidden = visibleTodos.length > 0;
  emptyState.textContent = hasTodos ? 'No todos match your filter/search.' : 'Nothing to do yet - add your first todo!';

  const progress = store.getProgress();
  toggleAllButton.disabled = !hasTodos;
  clearCompletedButton.disabled = progress.completed === 0;
  clearAllButton.disabled = !hasTodos;

  // Option 9: show how many todos are in every category, e.g. "Work (2)"
  const counts = store.countByCategory();
  CATEGORIES.forEach((category) => {
    const option = categoryFilter.querySelector<HTMLOptionElement>(`option[value="${category}"]`);
    if (option) option.textContent = `${CATEGORY_LABEL[category]} (${counts[category]})`;
  });

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === view.filter;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

/** What happens when the user clicks on things inside a todo item. */
const handlers: TodoHandlers = {
  onToggle: (id) => {
    store.toggle(id);
    render();
  },
  onRemove: (id) => {
    store.remove(id);
    if (editingId === id) editingId = null;
    render();
  },
  onStartEdit: (id) => {
    editingId = id;
    render();
  },
  onSave: (id: number, changes: TodoChanges) => {
    store.update(id, changes);
    editingId = null;
    render();
  },
  onCancelEdit: () => {
    editingId = null;
    render();
  },
};

// Step 4: error handling for the form (Option 16)

const showError = (message: string): void => {
  todoInput.classList.add('input-error');
  todoInput.setAttribute('aria-invalid', 'true');
  errorMessage.textContent = message;
  errorMessage.hidden = false;
};

const clearError = (): void => {
  todoInput.classList.remove('input-error');
  todoInput.removeAttribute('aria-invalid');
  errorMessage.hidden = true;
};

// Step 5: event listeners

todoForm.addEventListener('submit', (event: SubmitEvent) => {
  event.preventDefault();

  const result = validateTodoText(todoInput.value);
  if (!result.ok) {
    showError(result.error);
    todoInput.focus();
    return;
  }

  clearError();
  store.add({
    text: result.value,
    priority: isPriority(prioritySelect.value) ? prioritySelect.value : 'medium',
    dueDate: dueDateInput.value, // may be "" - store turns it into undefined
    category: isCategory(categorySelect.value) ? categorySelect.value : 'personal', // Option 9
  });

  todoInput.value = '';
  dueDateInput.value = '';
  prioritySelect.value = 'medium';
  todoInput.focus();
  render();
});

// remove the red border as soon as the user starts typing again
todoInput.addEventListener('input', () => {
  if (todoInput.value.trim() !== '') clearError();
});

// Option 8: search
searchInput.addEventListener('input', () => {
  view.search = searchInput.value;
  render();
});

// Option 4: filter by status
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.filter; // string | undefined
    if (isFilterStatus(value)) {
      view.filter = value; // type guard narrowed `value` to FilterStatus
      render();
    }
  });
});

// Option 9: filter by category
categoryFilter.addEventListener('change', () => {
  if (isCategoryFilter(categoryFilter.value)) {
    view.category = categoryFilter.value;
    render();
  }
});

// Option 5 + 7: sort
sortSelect.addEventListener('change', () => {
  if (isSortOption(sortSelect.value)) {
    view.sort = sortSelect.value;
    render();
  }
});

// Option 2: toggle all + clear completed
toggleAllButton.addEventListener('click', () => {
  store.toggleAll();
  render();
});

clearCompletedButton.addEventListener('click', () => {
  const removed = store.clearCompleted();
  console.log(`Removed ${removed} completed todo(s)`);
  render();
});

// Option 14: clear everything from localStorage
clearAllButton.addEventListener('click', () => {
  if (confirm('Delete ALL todos from local storage?')) {
    store.clearAll();
    editingId = null;
    render();
  }
});

// Option 11: dark mode
themeButton.addEventListener('click', () => {
  theme = toggleTheme(theme, themeButton, storage);
});

// Step 6: initial render
applyTheme(theme, themeButton);
render();

/**
 * Optional features list (from the starter project) - what I implemented:
 *
 * [x] Option 1: Toggle the completed status of a todo item
 * [x] Option 2: Clear all completed todos + toggle all todos
 * [x] Option 3: Edit a todo item (input field, Save, Cancel)
 * [x] Option 4: Filter todos by status
 * [x] Option 5: Sort todos by status
 * [x] Option 6: Due date for todos + highlight overdue todos
 * [x] Option 7: Priority levels + sort by priority
 * [x] Option 8: Search functionality
 * [x] Option 9: Category tags (tag on every todo + filter by category)
 * [x] Option 10: Progress indicator
 * [x] Option 11: Dark mode toggle
 * [ ] Option 12: Export/Import todos
 * [ ] Option 13: Notifications
 * [x] Option 14: Local storage
 * [x] Option 15: JSDoc comments
 * [x] Option 16: Handle errors (input validation)
 *
 * Unit tests: src/main.test.ts (run with `npm test`)
 */
