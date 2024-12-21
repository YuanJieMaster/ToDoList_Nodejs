// script.js

document.addEventListener("DOMContentLoaded", () => {
    console.log("执行");
    const taskList = document.getElementById("task-list");
    const filterTasks = document.getElementById("filter-tasks")
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

    // 从后端获取任务列表
    function fetchTasks(filter) {
        let url = "/api/tasks";

        if (filter === "completed") {
            url += "?status=completed";
        } else if (filter === "pending") {
            url += "?status=pending";
        }

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                tasks = data;
                renderTasks();
            })
            .catch(error => {
                console.error("获取任务失败:", error);
                alert("无法获取任务列表，请稍后再试。");
            });
    }

    // 从后端查询任务
    function fetchTask(id) {
        let url = "/api/tasks/:" + id;

        console.log(url);

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                tasks = data;
                renderTasks();
            })
            .catch(error => {
                console.error("查询任务失败:", error);
                alert("无法查询任务，请稍后再试。");
            });
    }

    // 向后端发送创建任务请求
    function createTask(newTask) {
        console.log("创建任务请求");
        const url = "/api/tasks";
        fetch(url, {
            method: "POST", // 使用 POST 方法
            headers: {
                "Content-Type": "application/json", // 指定请求体为 JSON 格式
            },
            body: JSON.stringify(newTask), // 将任务对象转换为 JSON 格式
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            })
            .then(() => {
                console.log("任务创建成功");
                alert("任务已成功创建！");
            })
            .catch((error) => {
                console.error("任务创建失败:", error);
                alert("任务创建失败，请稍后再试。");
            });
    }

    // 向后端发送修改任务请求
    function updateTask(newTask) {
        console.log("编辑任务请求");
        const url = `/api/tasks/${newTask.id}`;
        console.log(url);
        fetch(url, {
            method: "PUT", // 使用 POST 方法
            headers: {
                "Content-Type": "application/json", // 指定请求体为 JSON 格式
            },
            body: JSON.stringify(newTask), // 将任务对象转换为 JSON 格式
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            })
            .then(() => {
                console.log("任务更新成功");
                alert("任务已成功更新！");
            })
            .catch((error) => {
                console.error("任务更新失败:", error);
                alert("任务更新失败，请稍后再试。");
            });
    }

    // 向后端发送删除任务请求
    function deleteTask(id) {
        console.log("删除任务");
        const url = `/api/tasks/${id}`;
        console.log(url);
        fetch(url, {
            method: "DELETE",
        })
            .then((response) => {
                console.log("任务删除完成");
                alert("任务已成功删除！");
                fetchTasks();
            })
            .catch((error) => {
                console.error("任务删除失败:", error);
                alert("任务删除失败，请稍后再试。");
            });
    }

    // 显示任务列表
    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="task-content">
                <span class="task-title">${task.title}</span>
                <span class="task-deadline">（${formatDateTime(task.deadline)}）</span>
                <p class="task-description">${task.description || "暂无描述"}</p>
                <span class="task-priority">优先级：${task.priority}</span>
                <span class="task-status">${task.status === "completed" ? "✔️ 已完成" : "⏳ 待完成"}</span>
                </div>
                <div class="botton-container">
                    <button class="edit-button" data-index="${index}">✎</button>
                    <button class="delete-button" data-index="${index}">🗑️</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    // 前端添加任务
    createTaskButton.addEventListener("click", () => {
        createTaskModal.style.display = "flex";
        taskToEdit = null;
        document.getElementById("task-title").value = "";
        document.getElementById("task-description").value = "";
        document.getElementById("task-deadline").value = "";
        document.getElementById("task-priority").value = "low";
    });

    // 前端编辑任务
    taskList.addEventListener("click", (e) => {
        if (e.target.classList.contains("edit-button")) {
            taskToEdit = e.target.dataset.index;
            const task = tasks[taskToEdit];
            document.getElementById("task-title").value = task.title;
            document.getElementById("task-description").value = task.description;
            document.getElementById("task-deadline").value = formatDateTime(task.deadline);
            document.getElementById("task-priority").value = task.priority;
            createTaskModal.style.display = "flex";
        }
    })

    // 保存按钮 向后端发送创建/修改任务
    saveTaskButton.addEventListener("click", () => {
        console.log("保存按钮被点击");
        const id = tasks[taskToEdit].id;
        const title = document.getElementById("task-title").value;
        const description = document.getElementById("task-description").value;
        const deadline = document.getElementById("task-deadline").value;
        const priority = document.getElementById("task-priority").value;

        if (title && deadline) {
            if (taskToEdit !== null){
                // 校验输入
                if (!title || !deadline) {
                    alert("任务标题和截止日期是必填项！");
                    return;
                }
                // 更新现有任务
                tasks[taskToEdit] = { id, title, description, deadline, priority };
                console.log("编辑任务");
                console.log(taskToEdit);
                console.log(tasks[taskToEdit]);
                const newTask = {
                    id : tasks[taskToEdit].id,
                    title: title,
                    description: description,
                    deadline: deadline,
                    priority: priority,
                };
                updateTask(newTask);
            } else {
                tasks.push({ title, description, deadline, priority });
                // 创建任务对象
                console.log("增加任务");
                const newTask = {
                    title: title,
                    description: description,
                    deadline: deadline,
                    priority: priority,
                };
                // 调用向后端发送创建任务请求的函数
                createTask(newTask);
            }
            console.log(tasks);
            renderTasks();
            createTaskModal.style.display = "none";
        } else {
            alert("请输入标题和截止日期");
        }
    });

    // 取消按钮
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

    // 确认删除按钮
    confirmDeleteButton.addEventListener("click", () => {
        if (taskToDelete !== null) {
            const temp = tasks[taskToDelete].id;
            tasks.splice(taskToDelete, 1);
            renderTasks();
            deleteModal.style.display = "none";
            deleteTask(temp);
        }
    });

    cancelDeleteButton.addEventListener("click", () => {
        deleteModal.style.display = "none";
    });

    // 格式化 ISO 时间字符串为 datetime-local 可用的格式
    function formatDateTime(datetimeStr) {
        const date = new Date(datetimeStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // 监听筛选条件的变化
    filterTasks.addEventListener("change", (e) => {
        const filter = e.target.value;
        console.log("filter:" + filter);
        fetchTasks(filter);
    })

    // 初始化
    fetchTasks("all");
});
