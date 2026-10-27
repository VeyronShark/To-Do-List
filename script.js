const tasksContainer = document.getElementById("tasks");
const editTaskDialog = document.getElementById("change-task");
const changeTaskBtn = document.getElementById("change-task-btn");
const newTaskInput = document.getElementById("new-task-text");
const clearCompletedBtn = document.getElementById("clear-completed-btn");
const addTaskBtn = document.getElementById("add-task-btn");
const addTaskDialog = document.getElementById("add-task");
const addTask = document.getElementById("add-task-modal-btn");
const cancel = document.getElementById("cancel");
const searchBar = document.getElementById("search");
const filters = document.querySelectorAll(".filter");
const dateP = document.querySelector(".heading p");

let currentlyEditingTaskId = 0;
let lastId = 0;
let activeSlug = "";
let activeFilter = "all";

const tasksObj = JSON.parse(localStorage.getItem("tasks")) || { tasks: [] };

sortTasks();

dateP.textContent = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
});

filters.forEach((filter) => {
    filter.addEventListener("click", () => {
        filters.forEach((subfilter) => {
            subfilter.classList.remove("active");
        });

        filter.classList.add("active");
        activeFilter = filter.dataset.filtername;

        renderTasks(activeSlug, activeFilter);
    });
});

searchBar.addEventListener("keydown", (e) => {
    const slug = searchBar.value.trim();
    activeSlug = slug;

    renderTasks(activeSlug, activeFilter);
});

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasksObj));
}

function getLastId() {
    return tasksObj.tasks.reduce(
        (max, task) => (task.id > max ? task.id : max),
        0,
    );
}

cancel.addEventListener("click", () => {
    addTaskDialog.close();
});

addTask.addEventListener("click", () => {
    const text = document.getElementById("task-text").value.trim();

    if (text === "") return;

    tasksObj.tasks.push({
        id: getLastId() + 1,
        name: text,
        complete: false,
    });

    sortTasks();
    addTaskDialog.close();
});

addTaskBtn.addEventListener("click", () => {
    addTaskDialog.showModal();
});

clearCompletedBtn.addEventListener("click", () => {
    tasksObj.tasks = tasksObj.tasks.filter((task) => !task.complete);
    sortTasks();
});

changeTaskBtn.addEventListener("click", () => {
    const updatedText = newTaskInput.value.trim();

    const toUpdateTask = tasksObj.tasks.find(
        (task) => task.id === parseInt(currentlyEditingTaskId),
    );

    toUpdateTask.name = updatedText;

    sortTasks();
    editTaskDialog.close();
});

function renderTasks(slug = "", filter = "all") {
    tasksContainer.innerHTML = "";

    for (const task of tasksObj.tasks) {
        if (!task.name.includes(slug)) continue;
        if (filter === "incomplete" && task.complete) continue;
        if (filter === "complete" && !task.complete) continue;

        const taskEl = document.createElement("div");
        taskEl.classList.add("task");
        taskEl.id = task.id;
        if (task.complete) taskEl.classList.add("completed");

        taskEl.innerHTML = `
            <input type='checkbox' id='${task.id}' ${task.complete ? "checked" : ""}>
            ${task.name}
            <i class='fa-solid fa-pen edit-btn icon fa-xs'></i>
            <i class="fa-solid fa-trash delete-btn icon fa-xs"></i>
        `;

        tasksContainer.appendChild(taskEl);
    }

    // tasksObj.tasks.forEach((task) => {

    //     const taskEl = document.createElement("div");
    //     taskEl.classList.add("task");
    //     taskEl.id = task.id;
    //     if (task.complete) taskEl.classList.add("completed");

    //     taskEl.innerHTML = `
    //         <input type='checkbox' id='${task.id}' ${task.complete ? "checked" : ""}>
    //         ${task.name}
    //         <i class='fa-solid fa-pen edit-btn icon fa-xs'></i>
    //         <i class="fa-solid fa-trash delete-btn icon fa-xs"></i>
    //     `;

    //     tasksContainer.appendChild(taskEl);
    // });

    assignEventListeners();
}

function assignEventListeners() {
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    const deleteBtns = document.querySelectorAll(".delete-btn");
    const editBtns = document.querySelectorAll(".edit-btn");

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("click", () => {
            toggleCompleted(checkbox.parentElement.id);
            checkbox.parentElement.classList.toggle("completed");

            setTimeout(sortTasks, 1000);
        });
    });

    deleteBtns.forEach((deleteBtn) => {
        deleteBtn.addEventListener("click", () => {
            deleteTaskWithId(deleteBtn.parentElement.id);
        });
    });

    editBtns.forEach((editBtn) => {
        editBtn.addEventListener("click", () => {
            editTaskDialog.showModal();
            currentlyEditingTaskId = editBtn.parentElement.id;
            newTaskInput.value = tasksObj.tasks.find(
                (task) => task.id === parseInt(currentlyEditingTaskId),
            ).name;
            console.log(currentlyEditingTaskId);
        });
    });
}

function toggleCompleted(id) {
    const toUpdateTask = tasksObj.tasks.find(
        (task) => task.id === parseInt(id),
    );
    toUpdateTask.complete = toUpdateTask.complete ? false : true;
}

function sortTasks() {
    saveTasks();

    tasksObj.tasks = tasksObj.tasks
        .sort((a, b) => {
            if (a.id < b.id) return -1;
            else return 1;
        })
        .sort((a, b) => {
            if (!a.complete && b.complete) return -1;
            else return 0;
        });

    renderTasks(activeSlug, activeFilter);
}

function deleteTaskWithId(id) {
    tasksObj.tasks = tasksObj.tasks.filter((task) => task.id !== parseInt(id));
    sortTasks();
}
