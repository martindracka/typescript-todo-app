import { Selector } from 'testcafe';

// BASE_URL is set by the pipeline (test / production). Locally we test `vite preview`.
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4174/';

fixture('Smoke test - basic todo flow')
  .page(BASE_URL)
  .beforeEach(async (t) => {
    // start every test with an empty list
    await t.eval(() => localStorage.clear());
    await t.eval(() => location.reload());
  });

const todoInput = Selector('#todo-input');
const addButton = Selector('.btn-add');
const todoItems = Selector('.todo-item');
const progressText = Selector('#progress-text');

test('User can add a new todo', async (t) => {
  // Arrange
  const text = 'Buy milk';

  // Act
  await t.typeText(todoInput, text).click(addButton);

  // Assert
  await t.expect(todoItems.count).eql(1);
  await t.expect(todoItems.nth(0).find('.todo-text').innerText).eql(text);
});

test('Completing a todo updates the progress bar', async (t) => {
  // Arrange
  await t.typeText(todoInput, 'Write report').click(addButton);
  await t.typeText(todoInput, 'Clean room').click(addButton);

  // Act
  await t.click(todoItems.nth(0).find('.todo-toggle'));

  // Assert
  await t.expect(progressText.innerText).eql('1 of 2 completed (50%)');
});
