function createTask({ title, dueDate = "", priority = "Normal", category = "Inbox" }, id = globalThis.crypto.randomUUID()) {
  const cleanTitle = String(title ?? "").trim();
  if (!cleanTitle) {
    throw new Error("A task needs a title.");
  }

  return {
    id,
    title: cleanTitle,
    dueDate,
    priority: ["Low", "Normal", "High"].includes(priority) ? priority : "Normal",
    category,
    completed: false,
    createdAt: new Date().toISOString()
  };
}

function toggleTask(tasks, id) {
  return tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
}

function removeTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

function filterTasks(tasks, filter, today = new Date().toISOString().slice(0, 10)) {
  switch (filter) {
    case "today":
      return tasks.filter((task) => !task.completed && task.dueDate === today);
    case "upcoming":
      return tasks.filter((task) => !task.completed && task.dueDate > today);
    case "completed":
      return tasks.filter((task) => task.completed);
    case "inbox":
      return tasks.filter((task) => !task.completed && task.category === "Inbox");
    default:
      return tasks.filter((task) => !task.completed);
  }
}

const taskStore = { createTask, toggleTask, removeTask, filterTasks };

if (typeof module !== "undefined" && module.exports) {
  module.exports = taskStore;
}

if (typeof window !== "undefined") {
  window.TaskStore = taskStore;
}