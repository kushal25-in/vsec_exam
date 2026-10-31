(() => {
  const { createTask, toggleTask, removeTask, filterTasks } = window.TaskStore;
  const storageKey = "focusboard.tasks.v1";
  const taskList = document.querySelector("#task-list");
  const taskForm = document.querySelector("#task-form");
  const titleInput = document.querySelector("#task-title");
  const dateInput = document.querySelector("#task-date");
  const priorityInput = document.querySelector("#task-priority");
  const emptyState = document.querySelector("#empty-state");
  const formMessage = document.querySelector("#form-message");
  const today = localDateString(new Date());
  let activeFilter = "inbox";
  let messageTimer;
  let tasks = loadTasks();

  function localDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(saved)) return saved;
    } catch {
      localStorage.removeItem(storageKey);
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return [
      createTask({ title: "Sketch the first idea, not the perfect one", dueDate: today, priority: "High", category: "Inbox" }),
      createTask({ title: "Send the project notes to the team", dueDate: today, priority: "Normal", category: "Inbox" }),
      createTask({ title: "Take a proper lunch break", dueDate: localDateString(tomorrow), priority: "Low", category: "Personal" })
    ];
  }

  function saveTasks() {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }

  function dateLabel(dateValue) {
    if (!dateValue) return "No due date";
    if (dateValue === today) return "Today";
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(`${dateValue}T12:00:00`));
  }

  function createTaskRow(task) {
    const item = document.createElement("li");
    item.className = `task-row${task.completed ? " is-complete" : ""}`;
    const checkbox = document.createElement("button");
    checkbox.className = "task-check";
    checkbox.type = "button";
    checkbox.setAttribute("aria-label", task.completed ? `Mark ${task.title} as not done` : `Complete ${task.title}`);
    checkbox.setAttribute("aria-pressed", String(task.completed));
    checkbox.addEventListener("click", () => { tasks = toggleTask(tasks, task.id); saveTasks(); render(); });

    const details = document.createElement("div");
    details.className = "task-details";
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    const metadata = document.createElement("span");
    metadata.className = "task-meta";
    const due = document.createElement("span");
    due.className = `task-due${task.dueDate === today ? " due-today" : ""}`;
    due.textContent = dateLabel(task.dueDate);
    const category = document.createElement("span");
    category.className = "task-category";
    category.textContent = task.category;
    metadata.append(due, category);
    details.append(title, metadata);

    const priority = document.createElement("span");
    priority.className = `priority priority-${task.priority.toLowerCase()}`;
    priority.textContent = task.priority;
    const removeButton = document.createElement("button");
    removeButton.className = "remove-task";
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", `Remove ${task.title}`);
    removeButton.addEventListener("click", () => { tasks = removeTask(tasks, task.id); saveTasks(); render(); });
    item.append(checkbox, details, priority, removeButton);
    return item;
  }

  function updateCounts() {
    const counts = {
      inbox: filterTasks(tasks, "inbox", today).length,
      today: filterTasks(tasks, "today", today).length,
      upcoming: filterTasks(tasks, "upcoming", today).length,
      completed: filterTasks(tasks, "completed", today).length
    };
    Object.entries(counts).forEach(([name, count]) => { document.querySelector(`[data-count="${name}"]`).textContent = count; });
    const done = tasks.filter((task) => task.completed).length;
    const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    document.querySelector("#progress-label").textContent = `${done} of ${tasks.length} done`;
    document.querySelector("#progress-fill").style.width = `${percent}%`;
    document.querySelector("#progress-bar").setAttribute("aria-valuenow", String(percent));
    document.querySelector("#heading-count").textContent = filterTasks(tasks, activeFilter, today).length;
    document.querySelector("#footer-count").textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  }

  function render() {
    const visibleTasks = filterTasks(tasks, activeFilter, today);
    taskList.replaceChildren(...visibleTasks.map(createTaskRow));
    emptyState.hidden = visibleTasks.length > 0;
    updateCounts();
  }

  function setActiveFilter(filter) {
    activeFilter = filter;
    const button = document.querySelector(`[data-filter="${filter}"]`);
    const label = button.querySelector("span:nth-child(2)").textContent;
    document.querySelector("#list-title").textContent = label;
    document.querySelector("#breadcrumb-view").textContent = label.toUpperCase();
    document.querySelectorAll("[data-filter]").forEach((item) => item.removeAttribute("aria-current"));
    button.setAttribute("aria-current", "page");
  }

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveFilter(button.dataset.filter);
      render();
    });
  });

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      tasks = [createTask({ title: titleInput.value, dueDate: dateInput.value, priority: priorityInput.value }), ...tasks];
      saveTasks();
      taskForm.reset();
      setActiveFilter("inbox");
      formMessage.textContent = "Task added to your inbox.";
      clearTimeout(messageTimer);
      messageTimer = setTimeout(() => { formMessage.textContent = ""; }, 2500);
      render();
      titleInput.focus();
    } catch (error) {
      formMessage.textContent = error.message;
      titleInput.focus();
    }
  });

  document.querySelector("#today-label").textContent = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
  document.querySelector("#topbar-date").textContent = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date());
  saveTasks();
  render();
})();