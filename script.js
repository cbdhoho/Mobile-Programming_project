// Timer variables
let timer;
let seconds = 0;
let totalSeconds = 0;  // Total time across all sessions
let isTimerRunning = false;

// DOM elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const timerDisplay = document.getElementById('timerDisplay');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const totalTimeDisplay = document.getElementById('totalTime');
const clearDataBtn = document.getElementById('clearDataBtn');

// Initialize timer display to 00:00:00
function initTimerDisplay() {
    timerDisplay.textContent = '00:00:00';  // Initialize the timer display in hh:mm:ss format
}

// Start timer
startBtn.addEventListener('click', () => {
    if (!isTimerRunning) {
        isTimerRunning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        timer = setInterval(updateTimer, 1000);  // Update every second
    }
});

// Stop timer
stopBtn.addEventListener('click', () => {
    clearInterval(timer);
    isTimerRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    saveSessionTime(seconds);  // Save the session time
    updateTotalTime();  // Update total time
});

// Update the timer display
function updateTimer() {
    seconds++;
    totalSeconds++;  // Increase the total time across all sessions
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    timerDisplay.textContent = `${formatTime(hours)}:${formatTime(remainingMinutes)}:${formatTime(remainingSeconds)}`;
    updateTotalTime();  // Update the total time in real-time
}

// Format time to hh:mm:ss
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// Add a task
addTaskBtn.addEventListener('click', () => {
    const task = taskInput.value.trim();
    if (task) {
        const li = document.createElement('li');
        
        // Create a checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        
        // Add the task text
        const taskText = document.createElement('span');
        taskText.textContent = task;

        // Append checkbox and task text to the list item
        li.appendChild(checkbox);
        li.appendChild(taskText);

        // When checkbox is clicked, toggle the completion status
        checkbox.addEventListener('click', () => {
            taskText.classList.toggle('completed');
            saveTasks();  // Save tasks with their updated completion status
        });

        taskList.appendChild(li);
        taskInput.value = '';
        saveTask(task);
    }
});

// Save task to localStorage
function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ task, completed: false });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();  // Reload tasks to ensure they appear properly with event listeners
}

// Load tasks from localStorage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    taskList.innerHTML = '';  // Clear existing tasks
    tasks.forEach(taskData => {
        const li = document.createElement('li');
        
        // Create a checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = taskData.completed;  // Check if the task is completed

        // Add the task text
        const taskText = document.createElement('span');
        taskText.textContent = taskData.task;

        // Add 'completed' class if the task is marked as completed
        if (taskData.completed) {
            taskText.classList.add('completed');
        }

        // Append checkbox and task text to the list item
        li.appendChild(checkbox);
        li.appendChild(taskText);

        // When checkbox is clicked, toggle the completion status
        checkbox.addEventListener('click', () => {
            taskText.classList.toggle('completed');
            saveTasks();  // Save tasks with their updated completion status
        });

        taskList.appendChild(li);
    });
}

// Save all tasks with their completion status to localStorage
function saveTasks() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach(task => {
        const checkbox = task.querySelector('input[type="checkbox"]');
        const taskText = task.querySelector('span');
        tasks.push({
            task: taskText.textContent,
            completed: checkbox.checked
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));  // Save the tasks to localStorage
}

// Save session time to localStorage
function saveSessionTime(timeSpent) {
    let sessions = JSON.parse(localStorage.getItem('studySessions')) || [];
    sessions.push(timeSpent);  // Add the new session time to the array
    localStorage.setItem('studySessions', JSON.stringify(sessions));  // Save the updated array to localStorage
}

// Update total study time in real-time
function updateTotalTime() {
    const sessions = JSON.parse(localStorage.getItem('studySessions')) || [];
    const totalTime = sessions.reduce((total, session) => total + session, totalSeconds);  // Sum all session times, including current time
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    const seconds = totalTime % 60;
    totalTimeDisplay.textContent = `Total Time: ${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
}

// Clear all data (tasks, sessions)
clearDataBtn.addEventListener('click', () => {
    localStorage.clear();
    taskList.innerHTML = '';
    totalTimeDisplay.textContent = `Total Time: 00:00:00`;
});

// Load data when the page loads
window.addEventListener('load', () => {
    loadTasks();
    updateTotalTime();
    initTimerDisplay();  // Initialize the timer display to 00:00:00
});
