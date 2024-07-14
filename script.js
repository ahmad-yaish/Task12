document.addEventListener("DOMContentLoaded", function() {
    const startButton = document.getElementById("start-button");
    const startSection = document.getElementById("start-section");
    const userInfoSection = document.getElementById("user-info-section");
    const userInfoForm = document.getElementById("user-info-form");
    const routineSection = document.getElementById("routine-section");
    const routineForm = document.getElementById("routine-form");
    const addRoutineButton = document.getElementById("add-routine-button");
    const additionalRoutines = document.getElementById("additional-routines");
    const taskSection = document.getElementById("task-section");
    const taskForm = document.getElementById("task-form");
    const completeTasksButton = document.getElementById("complete-tasks-button");
    const calendarSection = document.getElementById("calendar-section");
    const finishButton = document.getElementById("finish-button");
    const calendarDiv = document.getElementById("calendar");
    const backToStartButton = document.getElementById("back-to-start-button");
    const backToUserInfoButton = document.getElementById("back-to-user-info-button");
    const backToRoutineButton = document.getElementById("back-to-routine-button");
    const backToTasksButton = document.getElementById("back-to-tasks-button");
    const mainSection = document.getElementById("main-section");

    let routineCount = 0;

    startButton.addEventListener("click", function() {
        startSection.style.display = "none";
        userInfoSection.style.display = "block";
    });

    userInfoForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const age = document.getElementById("age").value;
        localStorage.setItem('username', username);
        localStorage.setItem('age', age);
        document.getElementById("user-initial").innerText = username.charAt(0);
        document.getElementById("user-fullname").innerText = username;
        userInfoSection.style.display = "none";
        routineSection.style.display = "block";
    });

    addRoutineButton.addEventListener("click", function() {
        routineCount++;
        const routineDiv = document.createElement("div");
        routineDiv.classList.add("routine");

        routineDiv.innerHTML = `
            <label for="routine-name-${routineCount}">اسم الروتين:</label>
            <input type="text" id="routine-name-${routineCount}" required>
            <label for="routine-start-time-${routineCount}">وقت بدء الروتين (24 ساعة):</label>
            <input type="time" id="routine-start-time-${routineCount}" required>
            <label for="routine-end-time-${routineCount}">وقت انتهاء الروتين (24 ساعة):</label>
            <input type="time" id="routine-end-time-${routineCount}" required>
        `;

        additionalRoutines.appendChild(routineDiv);
    });

    routineForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const sleepTime = document.getElementById("sleep-time").value;
        const wakeTime = document.getElementById("wake-time").value;
        const routines = [];

        for (let i = 1; i <= routineCount; i++) {
            const routineName = document.getElementById(`routine-name-${i}`).value;
            const routineStartTime = document.getElementById(`routine-start-time-${i}`).value;
            const routineEndTime = document.getElementById(`routine-end-time-${i}`).value;

            routines.push({
                name: routineName,
                startTime: routineStartTime,
                endTime: routineEndTime
            });
        }

        const dailyRoutine = {
            sleepTime,
            wakeTime,
            routines
        };

        localStorage.setItem('dailyRoutine', JSON.stringify(dailyRoutine));
        alert("تم حفظ الروتين اليومي.");
        routineSection.style.display = "none";
        taskSection.style.display = "block";
    });

    taskForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const taskName = document.getElementById("task-name").value;
        const taskDuration = document.getElementById("task-duration").value;
        const taskCount = document.getElementById("task-count").value;

        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const task = {
    name: taskName,
    duration: parseInt(taskDuration),
    count: parseInt(taskCount),
    completed: false
};
tasks.push(task);
localStorage.setItem('tasks', JSON.stringify(tasks));
alert("تم إضافة المهمة.");
taskForm.reset();
});

completeTasksButton.addEventListener("click", function() {
    taskSection.style.display = "none";
    calendarSection.style.display = "block";
    renderCalendar();
});

finishButton.addEventListener("click", function() {
    alert("تم إعداد الجدول الشهري بنجاح!");
    calendarSection.style.display = "none";
    mainSection.style.display = "block";
    renderTasks();
});

backToStartButton.addEventListener("click", function() {
    userInfoSection.style.display = "none";
    startSection.style.display = "block";
    localStorage.removeItem('tasks');
    localStorage.removeItem('dailyRoutine');
    resetRoutineForm();
});

backToUserInfoButton.addEventListener("click", function() {
    routineSection.style.display = "none";
    userInfoSection.style.display = "block";
    localStorage.removeItem('tasks');
    localStorage.removeItem('dailyRoutine');
    resetRoutineForm();
});

backToRoutineButton.addEventListener("click", function() {
    taskSection.style.display = "none";
    routineSection.style.display = "block";
    localStorage.removeItem('tasks');
    localStorage.removeItem('dailyRoutine');
    resetRoutineForm();
});

backToTasksButton.addEventListener("click", function() {
    calendarSection.style.display = "none";
    taskSection.style.display = "block";
    localStorage.removeItem('tasks');
});

function resetRoutineForm() {
    document.getElementById("sleep-time").value = '';
    document.getElementById("wake-time").value = '';
    additionalRoutines.innerHTML = '';
    routineCount = 0;
}

function renderCalendar() {
    const routine = JSON.parse(localStorage.getItem('dailyRoutine'));
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let tableHTML = "<table><tr><th>اليوم</th><th>التاريخ</th><th>المهام</th></tr>";
    const today = new Date();
    for (let day = 0; day < 30; day++) {
        const date = new Date(today);
        date.setDate(today.getDate() + day);
        tableHTML += `<tr><td>${date.toLocaleDateString('ar-EG', { weekday: 'long' })}</td><td>${date.toLocaleDateString('ar-EG')}</td><td id="day-${day}"></td></tr>`;
    }
    tableHTML += "</table>";
    calendarDiv.innerHTML = tableHTML;
    distributeTasksForMonth(tasks, routine);
}

function distributeTasksForMonth(tasks, routine) {
    const calendarCells = document.querySelectorAll("#calendar td[id^='day-']");
    let usedTimes = Array(calendarCells.length).fill().map(() => []);

    tasks.forEach(task => {
        let taskCount = task.count;
        while (taskCount > 0) {
            const days = Array.from(calendarCells.keys());
            shuffleArray(days);
            for (const day of days) {
                if (taskCount <= 0) break;
                const cell = calendarCells[day];
                const taskTime = getNextAvailableTime(task, routine, usedTimes[day]);

                if (taskTime) {
                    const taskId = `task-${task.name}-${day}-${taskCount}`;
                    cell.innerHTML += `<div><input type="checkbox" id="${taskId}" class="task-checkbox"><label for="${taskId}" class="task-checkbox-label">${task.name} (${taskTime.start.format('HH:mm')} - ${taskTime.end.format('HH:mm')})</label></div>`;
                    document.getElementById(taskId).addEventListener('change', function() {
                        task.completed = this.checked;
                        localStorage.setItem('tasks', JSON.stringify(tasks));
                    });
                    usedTimes[day].push(taskTime);
                    taskCount--;
                }
            }
        }
    });
}

function getNextAvailableTime(task, routine, usedTimes) {
    // بدء اليوم في وقت عشوائي بين الساعة 8 صباحًا و8 مساءً
    let currentTime = moment().startOf('day').add(Math.floor(Math.random() * 12) + 8, 'hours');
    let endTime = moment().endOf('day').subtract(task.duration, 'minutes');

    while (currentTime.isBefore(endTime)) {
        if (isAvailable(currentTime, task.duration, routine, usedTimes)) {
            return {
                start: currentTime,
                end: currentTime.clone().add(task.duration, 'minutes')
            };
        }
        currentTime.add(30, 'minutes'); // التحقق كل 30 دقيقة
    }
    return null; // في حال لم يتم العثور على وقت مناسب
}

function isAvailable(time, duration, routine, usedTimes) {
    const end = time.clone().add(duration, 'minutes');

    // تحقق من عدم التعارض مع وقت النوم والاستيقاظ
    if (routine.sleepTime && routine.wakeTime) {
        const sleepTime = moment(routine.sleepTime, 'HH:mm');
        const wakeTime = moment(routine.wakeTime, 'HH:mm');
        if (time.isBetween(sleepTime, wakeTime, null, '[)') || end.isBetween(sleepTime, wakeTime, null, '(]')) {
            return false;
        }
    }

    // تحقق من عدم التعارض مع الروتينات الأخرى
    for (const routineItem of routine.routines) {
        const routineStartTime = moment(routineItem.startTime, 'HH:mm');
        const routineEndTime = moment(routineItem.endTime, 'HH:mm');
        if (time.isBetween(routineStartTime, routineEndTime, null, '[)') || end.isBetween(routineStartTime, routineEndTime, null, '(]')) {
            return false;
        }
    }

    // تحقق من عدم التعارض مع الأوقات المستخدمة الأخرى في نفس اليوم
    for (const usedTime of usedTimes) {
        if (time.isBetween(usedTime.start, usedTime.end, null, '[)') || end.isBetween(usedTime.start, usedTime.end, null, '(]')) {
            return false;
        }
    }

    return true;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function renderTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const tasksList = document.getElementById('tasks');
    tasksList.innerHTML = '';
    tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${task.name}
            <div class="task-progress-bar">
                <div class="task-progress" style="width: ${task.completed ? '100%' : '0%'}"></div>
                <span>${task.count}</span>
            </div>
        `;
        tasksList.appendChild(listItem);
    });
}
});