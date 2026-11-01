
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const filters = document.getElementById("filters");
const emptyState = document.getElementById("emptyState");
const clearBtn = document.getElementById("clearCompleted");

let tasks = [];

try {
    const saved = JSON.parse(localStorage.getItem("tasks"));
    tasks = Array.isArray(saved) ? saved : [];
} catch {
    tasks = [];
}

let currentFilter = "all";

// Save tasks
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Create a unique ID
function createId() {
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString() + Math.random().toString(36);
}

// CREATE TASK
function addTask(text) {
    const task = {
        id: createId(),
        text: text,
        completed: false
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
}

// DELETE TASK
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// UPDATE TASK
function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    const newText = prompt("Edit your task:", task.text);

    if (newText === null) return;

    const trimmed = newText.trim();

    if (!trimmed) {
        alert("Task cannot be empty!");
        return;
    }

    if (trimmed.length > 150) {
        alert("Task must be 150 characters or fewer.");
        return;
    }

    task.text = trimmed;
    saveTasks();
    renderTasks();
}

// TOGGLE COMPLETE / ACTIVE
function toggleTask(id) {
    const task = tasks.find(task => task.id === id);

    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// READ AND DISPLAY TASKS
function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        li.dataset.id = task.id;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Toggle task completion");

        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.dataset.action = "edit";
        editBtn.textContent = "✏️";
        editBtn.setAttribute("aria-label", "Edit task");

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.dataset.action = "delete";
        deleteBtn.textContent = "🗑️";
        deleteBtn.setAttribute("aria-label", "Delete task");

        actions.append(editBtn, deleteBtn);
        li.append(checkbox, span, actions);
        taskList.appendChild(li);
    });

    emptyState.hidden = filteredTasks.length !== 0;
    emptyState.style.display = filteredTasks.length === 0
        ? "block" : "none";

    updateStats();
}

// UPDATE STATISTICS
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    document.getElementById("totalCount").textContent =
        `${total} Total`;

    document.getElementById("activeCount").textContent =
        `${active} Active`;

    document.getElementById("completedCount").textContent =
        `${completed} Completed`;

    document.getElementById("remainingText").textContent =
        `${active} task${active === 1 ? "" : "s"} remaining`;

    clearBtn.disabled = completed === 0;
}

// ADD TASK EVENT
taskForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const text = taskInput.value.trim();

    if (!text) return;

    addTask(text);
    taskInput.value = "";
    taskInput.focus();
});

// EVENT DELEGATION FOR EDIT AND DELETE
taskList.addEventListener("click", function(e) {
    const button = e.target.closest("button[data-action]");

    if (!button) return;

    const item = button.closest(".task-item");
    if (!item) return;

    const id = item.dataset.id;

    if (button.dataset.action === "edit") {
        editTask(id);
    }

    if (button.dataset.action === "delete") {
        deleteTask(id);
    }
});

// EVENT DELEGATION FOR CHECKBOXES
taskList.addEventListener("change", function(e) {
    if (!e.target.matches(".task-checkbox")) return;

    const item = e.target.closest(".task-item");
    if (item) {
        toggleTask(item.dataset.id);
    }
});

// FILTER TASKS
filters.addEventListener("click", function(e) {
    const button = e.target.closest("[data-filter]");
    if (!button) return;

    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn === button);
    });

    renderTasks();
});

// CLEAR COMPLETED TASKS
clearBtn.addEventListener("click", function() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

// INITIAL DISPLAY
renderTasks();
