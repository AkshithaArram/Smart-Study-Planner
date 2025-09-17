// Get HTML elements
const taskTitle = document.getElementById('taskTitle');
const taskPriority = document.getElementById('taskPriority');
const taskReminder = document.getElementById('taskReminder');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const progressBarInner = document.getElementById('progressBarInner');
const progressText = document.getElementById('progressText');
const suggestBtn = document.getElementById('suggestBtn');
const suggestionText = document.getElementById('suggestionText');
const streakText = document.getElementById('streakText');

// Load tasks & streak on page load
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  setRemindersForAll();
  updateStreak();
});

// Add task
addTaskBtn.addEventListener('click', addTask);
suggestBtn.addEventListener('click', suggestNextTask);

function addTask() {
  const title = taskTitle.value.trim();
  const priority = taskPriority.value;
  const reminder = taskReminder.value;

  if (!title) return alert("Please enter a task.");

  const task = { title, completed: false, priority, reminder };
  saveTaskToLocal(task);
  addTaskToUI(task);
  taskTitle.value = "";
  taskPriority.value = "Medium";
  taskReminder.value = "";
  updateProgress();

  if (reminder) setTaskReminder(task);
}

// Display task
function addTaskToUI(task) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span class="${task.completed ? 'complete' : ''}">${task.title} <small>(${task.priority})</small></span>
    <div class="task-actions">
      <button class="done" onclick="toggleComplete(this)">✔</button>
      <button class="delete" onclick="deleteTask(this)">🗑</button>
    </div>
  `;

  if (task.priority === "High") li.style.borderLeft = "5px solid #dc3545";
  else if (task.priority === "Medium") li.style.borderLeft = "5px solid #ffc107";
  else li.style.borderLeft = "5px solid #28a745";

  taskList.appendChild(li);
  // Fade-in effect for new task
li.style.opacity = 0;
setTimeout(() => {
  li.style.opacity = 1;
}, 50);

}

// Complete / delete tasks
function toggleComplete(btn) {
  const li = btn.closest('li');
  const span = li.querySelector('span');
  span.classList.toggle('complete');
  updateLocalTasks();
  updateProgress();
}

function deleteTask(btn) {
  const li = btn.closest('li');
  li.remove();
  updateLocalTasks();
  updateProgress();
}

// LocalStorage
function saveTaskToLocal(task) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(addTaskToUI);
  updateProgress();
}

function updateLocalTasks() {
  const allLi = document.querySelectorAll('#taskList li');
  const tasks = [];
  allLi.forEach(li => {
    const title = li.querySelector('span').innerText.replace(/\s\(\w+\)$/, "");
    const completed = li.querySelector('span').classList.contains('complete');
    const priorityMatch = li.querySelector('span small') ? li.querySelector('span small').innerText.replace(/[()]/g,'') : 'Medium';
    const reminder = ""; // reminder only on new input
    tasks.push({ title, completed, priority: priorityMatch, reminder });
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Progress bar
function updateProgress() {
  const allLi = document.querySelectorAll('#taskList li');
  if (!allLi.length) {
    progressBarInner.style.width = '0%';
    progressText.textContent = '0% completed';
    return;
  }
  const completedCount = Array.from(allLi).filter(li => li.querySelector('span').classList.contains('complete')).length;
  const percent = Math.round((completedCount / allLi.length) * 100);
  progressBarInner.style.width = percent + '%';
  progressText.textContent = `${percent}% completed`;
  if (percent < 50) progressBarInner.style.background = '#dc3545'; // red
else if (percent < 80) progressBarInner.style.background = '#ffc107'; // yellow
else progressBarInner.style.background = '#28a745'; // green

}

// Suggestion
function suggestNextTask() {
  const incompleteTasks = Array.from(document.querySelectorAll('#taskList li span'))
    .filter(span => !span.classList.contains('complete'))
    .map(span => span.innerText.replace(/\s\(\w+\)$/, ""));
  suggestionText.textContent = incompleteTasks.length === 0 ? "All tasks completed! 🎉" :
    incompleteTasks[Math.floor(Math.random() * incompleteTasks.length)];
}

// Reminders
function setTaskReminder(task) {
  const now = new Date();
  const [hours, minutes] = task.reminder.split(":").map(Number);
  const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

  let delay = reminderTime - now;
  if (delay < 0) delay += 24*60*60*1000;

  setTimeout(() => alert(`Reminder: Time to study "${task.title}"!`), delay);
}

function setRemindersForAll() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  tasks.forEach(task => { if (task.reminder && !task.completed) setTaskReminder(task); });
}

// Streak tracking
function updateStreak() {
  const today = new Date().toISOString().slice(0,10);
  const lastVisit = localStorage.getItem('lastVisit');
  let streak = parseInt(localStorage.getItem('streak')) || 0;

  if (lastVisit === today) {}
  else if (lastVisit === getYesterday()) streak += 1;
  else streak = 1;

  localStorage.setItem('lastVisit', today);
  localStorage.setItem('streak', streak);
  streakText.textContent = `${streak} day${streak>1?'s':''}`;
}

function getYesterday() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate()-1);
  return yesterday.toISOString().slice(0,10);
}
