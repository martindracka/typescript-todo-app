/**
 * basics.ts - a small standalone file used to show MANUAL compiling with `tsc`
 * (without Vite) and some TypeScript basics.
 *
 * Compile:  npx tsc manual-compile/basics.ts --outDir manual-compile/dist --target ES2020
 * Run:      node manual-compile/dist/basics.js
 * (or simply: npm run compile:manual)
 */

// Explicit vs implicit types (type annotation vs type inference)
const explicitName: string = 'Todo App'; // explicit: we write the type ourselves
let implicitCount = 3; // implicit: TypeScript INFERS `number`
// implicitCount = 'three'; // error: Type 'string' is not assignable to type 'number'

// any vs unknown
let anything: any = 'hello';
anything = 42; // `any` turns type checking OFF - no errors, but also no safety
let notSure: unknown = 'hello';
// notSure.toUpperCase(); // error: we must check the type first
if (typeof notSure === 'string') {
  console.log('unknown narrowed to string:', notSure.toUpperCase());
}
notSure = anything;

// Arrays & objects
const tags: string[] = ['school', 'work'];
const scores: Array<number> = [10, 20, 30];
const user: { name: string; age?: number } = { name: 'Martin' }; // age is optional

// Type alias, interface, union
type Status = 'todo' | 'doing' | 'done'; // union of literal types

interface Task {
  readonly id: number;
  title: string;
  status: Status;
  note?: string; // optional property
}

// Function signatures
type Formatter = (task: Task) => string; // function type
const formatTask: Formatter = (task) => `#${task.id} ${task.title} [${task.status}]${task.note ? ' - ' + task.note : ''}`;

function sum(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0);
}

// Class + constructor, public / private / readonly
class TaskList {
  private tasks: Task[] = [];
  public readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  public add(title: string, status: Status = 'todo'): Task {
    const task: Task = { id: this.tasks.length + 1, title, status };
    this.tasks.push(task);
    return task;
  }

  public print(): void {
    console.log(`${this.name}:`);
    this.tasks.map(formatTask).forEach((line) => console.log('  ' + line));
  }
}

const list = new TaskList('My tasks');
list.add('Record video', 'doing');
list.add('Push to GitHub');
// list.tasks = []; // error: 'tasks' is private
// list.name = 'x'; // error: 'name' is read-only
list.print();

console.log(explicitName, implicitCount, tags, scores, user, 'sum =', sum(...scores));
