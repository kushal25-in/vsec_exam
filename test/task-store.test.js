const test = require("node:test");
const assert = require("node:assert/strict");
const { createTask, toggleTask, removeTask, filterTasks } = require("../src/task-store.js");

test("createTask trims the title and applies defaults", () => {
  const task = createTask({ title: "  Ship the release  " }, "task-1");

  assert.equal(task.id, "task-1");
  assert.equal(task.title, "Ship the release");
  assert.equal(task.priority, "Normal");
  assert.equal(task.category, "Inbox");
  assert.equal(task.completed, false);
});

test("createTask rejects a blank title", () => {
  assert.throws(() => createTask({ title: "  " }), /needs a title/);
});

test("toggleTask returns a changed copy and leaves the original untouched", () => {
  const tasks = [{ id: "task-1", completed: false }];
  const changed = toggleTask(tasks, "task-1");

  assert.equal(changed[0].completed, true);
  assert.equal(tasks[0].completed, false);
  assert.notEqual(changed, tasks);
});

test("removeTask removes only the requested task", () => {
  const tasks = [{ id: "one" }, { id: "two" }];

  assert.deepEqual(removeTask(tasks, "one"), [{ id: "two" }]);
});

test("filterTasks selects today's open tasks and completed tasks", () => {
  const tasks = [
    { id: "today", dueDate: "2026-10-31", completed: false },
    { id: "done", dueDate: "2026-10-31", completed: true },
    { id: "later", dueDate: "2026-11-01", completed: false }
  ];

  assert.deepEqual(filterTasks(tasks, "today", "2026-10-31").map((task) => task.id), ["today"]);
  assert.deepEqual(filterTasks(tasks, "completed").map((task) => task.id), ["done"]);
});