/**
 * To-Do List Life Dashboard
 * Constraint: Single JavaScript file inside js/ (Vanilla JS, No frameworks)
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. LOCAL STORAGE KEYS & INITIAL DATA
     ========================================================================== */
  const STORAGE_KEYS = {
    THEME: 'life_dashboard_theme',
    USER_NAME: 'life_dashboard_username',
    TASKS: 'life_dashboard_tasks',
    LINKS: 'life_dashboard_links',
    POMODORO_MINS: 'life_dashboard_pomodoro_mins',
    TASK_SORT: 'life_dashboard_task_sort'
  };

  const DEFAULT_LINKS = [
    { id: '1', name: 'Google', url: 'https://www.google.com' },
    { id: '2', name: 'Gmail', url: 'https://mail.google.com' },
    { id: '3', name: 'Calendar', url: 'https://calendar.google.com' }
  ];

  /* ==========================================================================
     2. CHALLENGE 1: LIGHT / DARK THEME TOGGLE
     ========================================================================== */
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');

  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    applyTheme(savedTheme);
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      themeIcon.textContent = '☀️';
      themeText.textContent = 'Light Mode';
    } else {
      document.body.classList.remove('dark-mode');
      themeIcon.textContent = '🌙';
      themeText.textContent = 'Dark Mode';
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    applyTheme(isDark ? 'light' : 'dark');
  });

  /* ==========================================================================
     3. MVP & CHALLENGE 2: CLOCK, DATE, GREETING & CUSTOM NAME
     ========================================================================== */
  const clockDisplay = document.getElementById('clockDisplay');
  const dateDisplay = document.getElementById('dateDisplay');
  const greetingPrefix = document.getElementById('greetingPrefix');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const editNameBtn = document.getElementById('editNameBtn');

  function initGreetingAndUser() {
    const savedName = localStorage.getItem(STORAGE_KEYS.USER_NAME) || 'Alex';
    userNameDisplay.textContent = savedName;

    function handleNameChange() {
      const currentName = userNameDisplay.textContent.trim();
      const newName = prompt('Enter your name for the greeting:', currentName);
      if (newName !== null && newName.trim() !== '') {
        const trimmed = newName.trim();
        userNameDisplay.textContent = trimmed;
        localStorage.setItem(STORAGE_KEYS.USER_NAME, trimmed);
      }
    }

    userNameDisplay.addEventListener('click', handleNameChange);
    editNameBtn.addEventListener('click', handleNameChange);

    updateClock();
    setInterval(updateClock, 1000);
  }

  function updateClock() {
    const now = new Date();

    // Digital Clock Format (HH:MM:SS)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;

    // Full Date Format (e.g. Tuesday, January 27, 2026)
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString('en-US', dateOptions);

    // Dynamic Greeting based on time of day
    const hour = now.getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) {
      greeting = 'Good Afternoon';
    } else if (hour >= 17 && hour < 22) {
      greeting = 'Good Evening';
    } else if (hour >= 22 || hour < 5) {
      greeting = 'Good Night';
    }
    greetingPrefix.textContent = greeting;
  }

  /* ==========================================================================
     4. MVP & CHALLENGE 3: FOCUS TIMER & CHANGE POMODORO TIME
     ========================================================================== */
  const timerDisplay = document.getElementById('timerDisplay');
  const timerStatus = document.getElementById('timerStatus');
  const timerStartBtn = document.getElementById('timerStartBtn');
  const timerStopBtn = document.getElementById('timerStopBtn');
  const timerResetBtn = document.getElementById('timerResetBtn');
  const presetButtons = document.querySelectorAll('.preset-btn[data-minutes]');
  const customTimerBtn = document.getElementById('customTimerBtn');

  let defaultDurationMinutes = parseInt(localStorage.getItem(STORAGE_KEYS.POMODORO_MINS), 10) || 25;
  let timerDurationSeconds = defaultDurationMinutes * 60;
  let remainingSeconds = timerDurationSeconds;
  let timerInterval = null;
  let isTimerRunning = false;

  function initTimer() {
    updateActivePresetButton(defaultDurationMinutes);
    renderTimer();

    timerStartBtn.addEventListener('click', startTimer);
    timerStopBtn.addEventListener('click', stopTimer);
    timerResetBtn.addEventListener('click', resetTimer);

    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const minutes = parseInt(btn.dataset.minutes, 10);
        changeTimerDuration(minutes);
      });
    });

    customTimerBtn.addEventListener('click', () => {
      const input = prompt('Enter custom timer duration in minutes (1 - 120):', Math.round(timerDurationSeconds / 60));
      if (input !== null) {
        const parsed = parseInt(input, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 120) {
          changeTimerDuration(parsed, true);
        } else {
          alert('Please enter a valid number between 1 and 120.');
        }
      }
    });
  }

  function changeTimerDuration(minutes, isCustom = false) {
    stopTimer();
    defaultDurationMinutes = minutes;
    timerDurationSeconds = minutes * 60;
    remainingSeconds = timerDurationSeconds;
    localStorage.setItem(STORAGE_KEYS.POMODORO_MINS, minutes);
    updateActivePresetButton(minutes, isCustom);
    renderTimer();
    timerStatus.textContent = 'Ready';
  }

  function updateActivePresetButton(minutes, isCustom = false) {
    presetButtons.forEach(b => b.classList.remove('active'));
    customTimerBtn.classList.remove('active');

    if (isCustom) {
      customTimerBtn.classList.add('active');
      customTimerBtn.textContent = `${minutes}m`;
    } else {
      let matched = false;
      presetButtons.forEach(b => {
        if (parseInt(b.dataset.minutes, 10) === minutes) {
          b.classList.add('active');
          matched = true;
        }
      });
      customTimerBtn.textContent = 'Custom';
      if (!matched) {
        customTimerBtn.classList.add('active');
        customTimerBtn.textContent = `${minutes}m`;
      }
    }
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function renderTimer() {
    timerDisplay.textContent = formatTime(remainingSeconds);
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    timerStatus.textContent = 'Focusing...';
    timerStartBtn.disabled = true;

    timerInterval = setInterval(() => {
      if (remainingSeconds > 0) {
        remainingSeconds--;
        renderTimer();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        isTimerRunning = false;
        timerStartBtn.disabled = false;
        timerStatus.textContent = 'Completed!';
        playTimerSound();
        setTimeout(() => {
          alert('⏰ Focus time is up! Great work!');
          resetTimer();
        }, 100);
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (isTimerRunning) {
      isTimerRunning = false;
      timerStatus.textContent = 'Paused';
    }
    timerStartBtn.disabled = false;
  }

  function resetTimer() {
    stopTimer();
    remainingSeconds = timerDurationSeconds;
    timerStatus.textContent = 'Ready';
    renderTimer();
  }

  // Web Audio API beep for timer completion
  function playTimerSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  }

  /* ==========================================================================
     5. MVP & CHALLENGES 4 & 5: TO-DO LIST (ADD, EDIT, DONE, DELETE, DUP CHECK, SORT)
     ========================================================================== */
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const taskList = document.getElementById('taskList');
  const taskErrorMsg = document.getElementById('taskErrorMsg');
  const taskSortSelect = document.getElementById('taskSortSelect');

  let tasks = loadTasks();

  function loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading tasks:', e);
    }
    // Default initial tasks matching assignment demo
    return [
      { id: 't-1', text: 'belanja', completed: false, createdAt: Date.now() - 2000 },
      { id: 't-2', text: 'belajar', completed: false, createdAt: Date.now() - 1000 }
    ];
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  function initTasks() {
    // Load saved sort preference
    const savedSort = localStorage.getItem(STORAGE_KEYS.TASK_SORT) || 'default';
    taskSortSelect.value = savedSort;

    taskForm.addEventListener('submit', handleAddTask);
    taskSortSelect.addEventListener('change', () => {
      localStorage.setItem(STORAGE_KEYS.TASK_SORT, taskSortSelect.value);
      renderTasks();
    });

    renderTasks();
  }

  // Challenge 4: Prevent Duplicate Tasks
  function isDuplicateTask(newText, excludeId = null) {
    const normalized = newText.trim().toLowerCase();
    return tasks.some(t => t.id !== excludeId && t.text.trim().toLowerCase() === normalized);
  }

  function showTaskError(msg) {
    taskErrorMsg.textContent = msg;
    taskErrorMsg.classList.add('visible');
    setTimeout(() => {
      taskErrorMsg.classList.remove('visible');
    }, 3500);
  }

  function handleAddTask(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    if (isDuplicateTask(text)) {
      showTaskError('⚠️ This task already exists! Duplicates are not allowed.');
      return;
    }

    const newTask = {
      id: 'task_' + Date.now(),
      text: text,
      completed: false,
      createdAt: Date.now()
    };

    tasks.push(newTask);
    saveTasks();
    taskInput.value = '';
    taskErrorMsg.classList.remove('visible');
    renderTasks();
  }

  // Challenge 5: Sort Tasks
  function getSortedTasks() {
    const sortType = taskSortSelect.value;
    const copied = [...tasks];

    switch (sortType) {
      case 'az':
        return copied.sort((a, b) => a.text.localeCompare(b.text));
      case 'za':
        return copied.sort((a, b) => b.text.localeCompare(a.text));
      case 'active':
        return copied.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
      case 'completed':
        return copied.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? -1 : 1));
      case 'default':
      default:
        return copied.sort((a, b) => a.createdAt - b.createdAt);
    }
  }

  function renderTasks() {
    taskList.innerHTML = '';
    const sortedTasks = getSortedTasks();

    if (sortedTasks.length === 0) {
      taskList.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
      return;
    }

    sortedTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.dataset.id = task.id;

      // Left area (Checkbox & Task Text)
      const leftDiv = document.createElement('div');
      leftDiv.className = 'task-left';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', `Mark "${task.text}" as done`);
      checkbox.addEventListener('change', () => toggleTaskDone(task.id));

      const spanText = document.createElement('span');
      spanText.className = 'task-text';
      spanText.textContent = task.text;
      spanText.title = 'Double-click to edit';
      spanText.addEventListener('dblclick', () => startEditingTask(task.id, li, spanText));

      leftDiv.appendChild(checkbox);
      leftDiv.appendChild(spanText);

      // Actions (Edit, Delete)
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'task-actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn btn-ghost btn-sm';
      editBtn.textContent = 'Edit';
      editBtn.setAttribute('aria-label', `Edit "${task.text}"`);
      editBtn.addEventListener('click', () => startEditingTask(task.id, li, spanText));

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn btn-danger btn-sm';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', `Delete "${task.text}"`);
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      li.appendChild(leftDiv);
      li.appendChild(actionsDiv);
      taskList.appendChild(li);
    });
  }

  function toggleTaskDone(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    }
  }

  function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
  }

  // Inline Task Editing
  function startEditingTask(taskId, liElement, spanElement) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const leftDiv = liElement.querySelector('.task-left');
    const actionsDiv = liElement.querySelector('.task-actions');

    // Create edit input
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'task-edit-input';
    editInput.value = task.text;

    // Replace text element with input
    spanElement.style.display = 'none';
    leftDiv.appendChild(editInput);
    editInput.focus();

    // Replace action buttons with Save & Cancel
    actionsDiv.innerHTML = '';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-primary btn-sm';
    saveBtn.textContent = 'Save';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-ghost btn-sm';
    cancelBtn.textContent = 'Cancel';

    function finishEdit(shouldSave) {
      if (shouldSave) {
        const updated = editInput.value.trim();
        if (!updated) {
          showTaskError('Task name cannot be empty.');
          // Focus kembali ke input edit dan select text
          editInput.focus();
          editInput.select();
          return;
        }
        if (isDuplicateTask(updated, taskId)) {
          showTaskError('⚠️ Another task already has this name!');
          editInput.focus();
          editInput.select();
          return;
        }
        task.text = updated;
        saveTasks();
      }
      renderTasks();
    }

    saveBtn.addEventListener('click', () => finishEdit(true));
    cancelBtn.addEventListener('click', () => finishEdit(false));

    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') finishEdit(true);
      if (e.key === 'Escape') finishEdit(false);
    });

    actionsDiv.appendChild(saveBtn);
    actionsDiv.appendChild(cancelBtn);
  }

  /* ==========================================================================
     6. MVP: QUICK LINKS (ADD, OPEN, DELETE, PERSIST)
     ========================================================================== */
  const quickLinkForm = document.getElementById('quickLinkForm');
  const linkNameInput = document.getElementById('linkNameInput');
  const linkUrlInput = document.getElementById('linkUrlInput');
  const quickLinksContainer = document.getElementById('quickLinksContainer');
  const linkErrorMsg = document.getElementById('linkErrorMsg');

  let links = loadLinks();

  function loadLinks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LINKS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading links:', e);
    }
    return [...DEFAULT_LINKS];
  }

  function saveLinks() {
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
  }

  function initQuickLinks() {
    quickLinkForm.addEventListener('submit', handleAddLink);
    renderLinks();
  }

  function showLinkError(msg) {
    linkErrorMsg.textContent = msg;
    linkErrorMsg.classList.add('visible');
    setTimeout(() => {
      linkErrorMsg.classList.remove('visible');
    }, 3500);
  }

  function normalizeUrl(url) {
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    return clean;
  }

  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  function handleAddLink(e) {
    e.preventDefault();
    const name = linkNameInput.value.trim();
    let url = linkUrlInput.value.trim();

    if (!name || !url) return;

    url = normalizeUrl(url);

    if (!isValidUrl(url)) {
      showLinkError('Please enter a valid URL.');
      return;
    }

    const newLink = {
      id: 'link_' + Date.now(),
      name: name,
      url: url
    };

    links.push(newLink);
    saveLinks();
    linkNameInput.value = '';
    linkUrlInput.value = '';
    linkErrorMsg.classList.remove('visible');
    renderLinks();
  }

  function deleteLink(linkId) {
    links = links.filter(l => l.id !== linkId);
    saveLinks();
    renderLinks();
  }

  function renderLinks() {
    quickLinksContainer.innerHTML = '';

    if (links.length === 0) {
      quickLinksContainer.innerHTML = '<span class="empty-state">No quick links saved. Add your favorite sites above!</span>';
      return;
    }

    links.forEach(link => {
      const chip = document.createElement('div');
      chip.className = 'link-chip';

      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.className = 'link-chip-text';
      anchor.textContent = link.name;
      anchor.title = `Open ${link.name} (${link.url})`;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'link-chip-remove';
      removeBtn.innerHTML = '&times;';
      removeBtn.setAttribute('aria-label', `Remove ${link.name}`);
      removeBtn.title = `Remove ${link.name}`;
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteLink(link.id);
      });

      chip.appendChild(anchor);
      chip.appendChild(removeBtn);
      quickLinksContainer.appendChild(chip);
    });
  }

  /* ==========================================================================
     INITIALIZATION CALLS
     ========================================================================== */
  initTheme();
  initGreetingAndUser();
  initTimer();
  initTasks();
  initQuickLinks();
});
