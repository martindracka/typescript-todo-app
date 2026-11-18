import { Selector } from 'testcafe';

// Feature: Category tags (Option 9) - issue #2
// BASE_URL is set by the pipeline (test / production). Locally we test `vite preview`.
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4174/';

fixture('Category tags')
  .page(BASE_URL)
  .beforeEach(async (t) => {
    // start every test with an empty list
    await t.eval(() => localStorage.clear());
    await t.eval(() => location.reload());
  });

const todoInput = Selector('#todo-input');
const categorySelect = Selector('#category-select');
const addButton = Selector('.btn-add');
const categoryFilter = Selector('#category-filter');
const todoItems = Selector('.todo-item');

/** Helper: adds a todo with the given category through the UI. */
const addTodo = async (t: TestController, text: string, category: string): Promise<void> => {
  await t
    .typeText(todoInput, text)
    .click(categorySelect)
    .click(categorySelect.find('option').withAttribute('value', category))
    .click(addButton);
};

test('A new todo shows a tag with the chosen category', async (t) => {
  // Arrange
  const text = 'Finish TypeScript assignment';

  // Act
  await addTodo(t, text, 'school');

  // Assert
  const tag = todoItems.nth(0).find('.tag');
  await t.expect(tag.innerText).eql('School');
  await t.expect(tag.hasClass('tag-school')).ok();
});

test('A todo without a chosen category gets the default "Personal" tag', async (t) => {
  // Arrange - nothing is chosen in the category select

  // Act
  await t.typeText(todoInput, 'Go for a run').click(addButton);

  // Assert
  await t.expect(todoItems.nth(0).find('.tag').innerText).eql('Personal');
});

test('Filtering by category shows only todos from that category', async (t) => {
  // Arrange
  await addTodo(t, 'Write report', 'work');
  await addTodo(t, 'Buy milk', 'shopping');
  await addTodo(t, 'Call the boss', 'work');

  // Act
  await t.click(categoryFilter).click(categoryFilter.find('option').withAttribute('value', 'work'));

  // Assert
  await t.expect(todoItems.count).eql(2);
  await t.expect(todoItems.withText('Buy milk').exists).notOk();
  await t.expect(categoryFilter.find('option').withAttribute('value', 'work').innerText).eql('Work (2)');
});

test('The category of a todo can be changed while editing', async (t) => {
  // Arrange
  await addTodo(t, 'Groceries', 'personal');

  // Act
  const editCategory = Selector('.edit-category');
  await t
    .click(todoItems.nth(0).find('.btn-edit'))
    .click(editCategory)
    .click(editCategory.find('option').withAttribute('value', 'shopping'))
    .click(Selector('.btn-save'));

  // Assert
  await t.expect(todoItems.nth(0).find('.tag').innerText).eql('Shopping');
});
