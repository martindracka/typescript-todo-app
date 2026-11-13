import type { Priority, Progress, Todo, TodoChanges } from '../types';
import { isPriority } from '../types';
import { formatDate, isOverdue } from '../utils/date';
import { validateTodoText } from '../utils/validation';

/**
 * Callback functions the list needs. Rendering does not change data itself -
 * it only tells main.ts what the user did (FUNCTION SIGNATURES in an interface).
 */
export interface TodoHandlers {
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
  onStartEdit: (id: number) => void;
  onSave: (id: number, changes: TodoChanges) => void;
  onCancelEdit: () => void;
}

const PRIORITY_LABEL: Record<Priority, string> = { low: 'Low', medium: 'Medium', high: 'High' };

/**
 * Small helper that creates an element with an optional class and text.
 * Using `textContent` (not innerHTML) protects against HTML injection from user input.
 */
const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

/** Builds the <select> with the three priority options. */
export const createPrioritySelect = (selected: Priority): HTMLSelectElement => {
  const select = createElement('select', 'edit-priority');
  (Object.keys(PRIORITY_LABEL) as Priority[]).forEach((priority) => {
    const option = createElement('option', undefined, PRIORITY_LABEL[priority]);
    option.value = priority;
    option.selected = priority === selected;
    select.appendChild(option);
  });
  return select;
};

/** One todo in normal (view) mode. */
const renderViewItem = (todo: Todo, handlers: TodoHandlers): HTMLLIElement => {
  const overdue = isOverdue(todo);
  const li = createElement('li', `todo-item priority-${todo.priority}`);
  li.classList.toggle('completed', todo.completed);
  li.classList.toggle('overdue', overdue);

  // Option 1: checkbox that toggles completed
  const checkbox = createElement('input', 'todo-toggle');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.completed ? 'active' : 'completed'}`);
  checkbox.addEventListener('change', () => handlers.onToggle(todo.id));

  const content = createElement('div', 'todo-content');
  content.appendChild(createElement('span', 'todo-text', todo.text));

  // Option 6 + 7: show priority and due date next to the todo
  const meta = createElement('div', 'todo-meta');
  meta.appendChild(createElement('span', `badge badge-${todo.priority}`, PRIORITY_LABEL[todo.priority]));
  if (todo.dueDate) {
    const due = createElement('span', 'todo-due', `Due: ${formatDate(todo.dueDate)}`);
    meta.appendChild(due);
    if (overdue) meta.appendChild(createElement('span', 'badge badge-overdue', 'Overdue'));
  }
  content.appendChild(meta);

  const actions = createElement('div', 'todo-actions');
  const editButton = createElement('button', 'btn btn-edit', 'Edit');
  editButton.type = 'button';
  editButton.addEventListener('click', () => handlers.onStartEdit(todo.id));
  const removeButton = createElement('button', 'btn btn-remove', 'Remove');
  removeButton.type = 'button';
  removeButton.addEventListener('click', () => handlers.onRemove(todo.id));
  actions.append(editButton, removeButton);

  li.append(checkbox, content, actions);
  return li;
};

/** Option 3: one todo in edit mode - input field, Save and Cancel buttons. */
const renderEditItem = (todo: Todo, handlers: TodoHandlers): HTMLLIElement => {
  const li = createElement('li', 'todo-item editing');

  const textInput = createElement('input', 'edit-text');
  textInput.type = 'text';
  textInput.value = todo.text;
  textInput.setAttribute('aria-label', 'Edit todo text');

  const prioritySelect = createPrioritySelect(todo.priority);
  const dateInput = createElement('input', 'edit-date');
  dateInput.type = 'date';
  dateInput.value = todo.dueDate ?? '';

  const error = createElement('p', 'edit-error');

  const save = (): void => {
    const result = validateTodoText(textInput.value);
    if (!result.ok) {
      // TypeScript knows `result.error` exists here, because ok === false
      textInput.classList.add('input-error');
      error.textContent = result.error;
      textInput.focus();
      return;
    }
    const priority = isPriority(prioritySelect.value) ? prioritySelect.value : todo.priority;
    handlers.onSave(todo.id, { text: result.value, priority, dueDate: dateInput.value });
  };

  // Keyboard: Enter = save, Escape = cancel
  li.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !(event.target instanceof HTMLButtonElement)) save();
    if (event.key === 'Escape') handlers.onCancelEdit();
  });

  const saveButton = createElement('button', 'btn btn-save', 'Save');
  saveButton.type = 'button';
  saveButton.addEventListener('click', save);
  const cancelButton = createElement('button', 'btn btn-cancel', 'Cancel');
  cancelButton.type = 'button';
  cancelButton.addEventListener('click', handlers.onCancelEdit);

  const fields = createElement('div', 'edit-fields');
  fields.append(textInput, prioritySelect, dateInput);
  const actions = createElement('div', 'todo-actions');
  actions.append(saveButton, cancelButton);

  li.append(fields, actions, error);
  queueMicrotask(() => textInput.focus()); // focus after the element is in the DOM
  return li;
};

/**
 * Renders the whole list.
 * @param list - the <ul> element
 * @param todos - todos to show (already filtered and sorted)
 * @param editingId - id of the todo being edited, or null when nothing is edited
 * @param handlers - callbacks for user actions
 */
export const renderTodos = (
  list: HTMLUListElement,
  todos: Todo[],
  editingId: number | null,
  handlers: TodoHandlers,
): void => {
  list.replaceChildren(
    ...todos.map((todo) =>
      todo.id === editingId ? renderEditItem(todo, handlers) : renderViewItem(todo, handlers),
    ),
  );
};

/** Option 10: updates the progress bar and the text under it. */
export const renderProgress = (fill: HTMLElement, label: HTMLElement, progress: Progress): void => {
  fill.style.width = `${progress.percent}%`;
  fill.parentElement?.setAttribute('aria-valuenow', String(progress.percent));
  label.textContent =
    progress.total === 0
      ? 'No todos yet'
      : `${progress.completed} of ${progress.total} completed (${progress.percent}%)`;
};
