// script.js

document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");
    const createTaskButton = document.getElementById("create-task-button");
    const createTaskModal = document.getElementById("create-task-modal");
    const saveTaskButton = document.getElementById("save-task-button");
    const cancelTaskButton = document.getElementById("cancel-task-button");
    const deleteModal = document.getElementById("delete-modal");
    const confirmDeleteButton = document.getElementById("confirm-delete-button");
    const cancelDeleteButton = document.getElementById("cancel-delete-button");

    let tasks = [];
    let taskToDelete = null;
    let taskToEdit = null;  // 新增用于记录当前编辑的任务

    // 显示任务列表
    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${task.title}（${task.deadline}）</span>
                <div class="botton-container">
                    <button class="edit-button" data-index="${index}">✎</button>
                    <button class="delete-button" data-index="${index}">🗑️</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    // 添加任务
    createTaskButton.addEventListener("click", () => {
        createTaskModal.style.display = "flex";
        taskToEdit = null;
        document.getElementById("task-title").value = "";
        document.getElementById("task-description").value = "";
        document.getElementById("task-deadline").value = "";
        document.getElementById("task-priority").value = "low";
    });

    // 编辑任务
    taskList.addEventListener("click", (e) => {
        if (e.target.classList.contains("edit-button")) {
            taskToEdit = e.target.dataset.index;
            const task = tasks[taskToEdit];
            document.getElementById("task-title").value = task.title;
            document.getElementById("task-description").value = task.description;
            document.getElementById("task-deadline").value = task.deadline;
            document.getElementById("task-priority").value = "low";
            createTaskModal.style.display = "flex";
        }
    })

    saveTaskButton.addEventListener("click", () => {
        const title = document.getElementById("task-title").value;
        const description = document.getElementById("task-description").value;
        const deadline = document.getElementById("task-deadline").value;
        const priority = document.getElementById("task-priority").value;

        if (title && deadline) {
            if (taskToEdit !== null){
                // 更新现有任务
                tasks[taskToEdit] = { title, description, deadline, priority };
            } else {
                tasks.push({ title, description, deadline, priority });
            }
            renderTasks();
            createTaskModal.style.display = "none";
        } else {
            alert("请输入标题和截止日期");
        }
    });

    cancelTaskButton.addEventListener("click", () => {
        createTaskModal.style.display = "none";
    });

    // 删除任务
    taskList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-button")) {
            taskToDelete = e.target.dataset.index;
            deleteModal.style.display = "flex";
        }
    });

    confirmDeleteButton.addEventListener("click", () => {
        if (taskToDelete !== null) {
            tasks.splice(taskToDelete, 1);
            renderTasks();
            deleteModal.style.display = "none";
        }
    });

    cancelDeleteButton.addEventListener("click", () => {
        deleteModal.style.display = "none";
    });

    // 初始化
    renderTasks();
});
