// DOM Elements
const timerDisplay = {
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    sessionType: document.getElementById('session-type'),
    progressBar: document.getElementById('progress-bar')
};

const timerControls = {
    start: document.getElementById('start-timer'),
    pause: document.getElementById('pause-timer'),
    reset: document.getElementById('reset-timer')
};

const todoElements = {
    newTaskInput: document.getElementById('new-task'),
    addTaskBtn: document.getElementById('add-task'),
    taskList: document.getElementById('task-list')
};

const settingsElements = {
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettings: document.getElementById('close-settings'),
    saveSettings: document.getElementById('save-settings'),
    colorOptions: document.querySelectorAll('.color-option'),
    quotesToggle: document.getElementById('quotes-toggle'),
    focusTime: document.getElementById('focus-time'),
    shortBreak: document.getElementById('short-break'),
    longBreak: document.getElementById('long-break')
};

const quoteElements = {
    quoteText: document.getElementById('quote-text'),
    quoteAuthor: document.getElementById('quote-author')
};

const moodElements = {
    moodOptions: document.querySelectorAll('.mood-option')
};

const waterElements = {
    waterGlasses: document.querySelectorAll('.water-glass'),
    waterCount: document.getElementById('water-count')
};

const gratitudeElements = {
    gratitudeInputs: document.querySelectorAll('.gratitude-item input')
};

const dateDisplay = document.getElementById('current-date');

// App State
const appState = {
    timer: {
        focusTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        currentMode: 'focus', // 'focus', 'shortBreak', 'longBreak'
        timeLeft: 25 * 60,
        originalTime: 25 * 60,
        isRunning: false,
        interval: null,
        pomodoroCount: 0
    },
    settings: {
        themeColor: 'var(--green-1)',
        showQuotes: true
    },
    quotes: [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "Your mind is a garden, your thoughts are the seeds.", author: "Unknown" },
        { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
        { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
        { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Nature does not hurry, yet everything is accomplished.", author: "Lao Tzu" }
    ],
    mood: {
        selected: null
    },
    water: {
        count: 0,
        filled: [] // array of indices (1-8) of filled glasses
    },
    gratitude: {
        items: ['', '', '']
    }
};

// Load saved data from localStorage
function loadSavedData() {
    // Load tasks
    const savedTasks = localStorage.getItem('studyNapTasks');
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        tasks.forEach(task => addTaskToDOM(task.text, task.completed));
    }

    // Load settings
    const savedSettings = localStorage.getItem('studyNapSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            appState.settings = { ...appState.settings, ...settings };
            
            // Update timer settings
            if (settings.focusTime) {
                appState.timer.focusTime = settings.focusTime;
                appState.timer.timeLeft = settings.focusTime * 60;
                appState.timer.originalTime = settings.focusTime * 60;
                settingsElements.focusTime.value = settings.focusTime;
            }
            
            if (settings.shortBreakTime) {
                appState.timer.shortBreakTime = settings.shortBreakTime;
                settingsElements.shortBreak.value = settings.shortBreakTime;
            }
            
            if (settings.longBreakTime) {
                appState.timer.longBreakTime = settings.longBreakTime;
                settingsElements.longBreak.value = settings.longBreakTime;
            }
        } catch (error) {
            console.error("Error loading settings:", error);
            // Reset to defaults if there was an error
            appState.settings = {
                themeColor: 'var(--green-1)',
                showQuotes: true,
                focusTime: 25,
                shortBreakTime: 5,
                longBreakTime: 15
            };
        }
    }

    // Load mood data
    const savedMood = localStorage.getItem('studyNapMood');
    if (savedMood) {
        try {
            const moodData = JSON.parse(savedMood);
            // Only load today's mood
            const today = new Date().toDateString();
            if (moodData.date === today && moodData.selected) {
                appState.mood.selected = moodData.selected;
                updateMoodDisplay();
            }
        } catch (error) {
            console.error("Error loading mood data:", error);
        }
    }

    // Load water data
    const savedWater = localStorage.getItem('studyNapWater');
    if (savedWater) {
        try {
            const waterData = JSON.parse(savedWater);
            // Only load today's water data
            const today = new Date().toDateString();
            if (waterData.date === today) {
                appState.water.count = waterData.count;
                appState.water.filled = waterData.filled;
                updateWaterDisplay();
            }
        } catch (error) {
            console.error("Error loading water data:", error);
        }
    }

    // Load gratitude data
    const savedGratitude = localStorage.getItem('studyNapGratitude');
    if (savedGratitude) {
        try {
            const gratitudeData = JSON.parse(savedGratitude);
            // Only load today's gratitude
            const today = new Date().toDateString();
            if (gratitudeData.date === today) {
                appState.gratitude.items = gratitudeData.items;
                updateGratitudeDisplay();
            }
        } catch (error) {
            console.error("Error loading gratitude data:", error);
        }
    }

    // Update timer display
    updateTimerDisplay();
    
    // Update current date
    updateDateDisplay();
}

// Update the current date display
function updateDateDisplay() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString('en-US', options);
}

// Timer Functions
function updateTimerDisplay() {
    const minutes = Math.floor(appState.timer.timeLeft / 60);
    const seconds = appState.timer.timeLeft % 60;
    
    timerDisplay.minutes.textContent = minutes.toString().padStart(2, '0');
    timerDisplay.seconds.textContent = seconds.toString().padStart(2, '0');
    
    // Update progress bar width
    const progressPercent = (1 - appState.timer.timeLeft / appState.timer.originalTime) * 100;
    timerDisplay.progressBar.style.width = `${progressPercent}%`;
}

function startTimer() {
    if (appState.timer.isRunning) return;
    
    appState.timer.isRunning = true;
    timerControls.start.disabled = true;
    timerControls.pause.disabled = false;
    
    appState.timer.interval = setInterval(() => {
        appState.timer.timeLeft--;
        updateTimerDisplay();
        
        if (appState.timer.timeLeft <= 0) {
            completeTimer();
        }
    }, 1000);
}

function pauseTimer() {
    if (!appState.timer.isRunning) return;
    
    appState.timer.isRunning = false;
    clearInterval(appState.timer.interval);
    
    timerControls.start.disabled = false;
    timerControls.pause.disabled = true;
}

function resetTimer() {
    pauseTimer();
    
    switch (appState.timer.currentMode) {
        case 'focus':
            appState.timer.timeLeft = appState.timer.focusTime * 60;
            break;
        case 'shortBreak':
            appState.timer.timeLeft = appState.timer.shortBreakTime * 60;
            break;
        case 'longBreak':
            appState.timer.timeLeft = appState.timer.longBreakTime * 60;
            break;
    }
    
    appState.timer.originalTime = appState.timer.timeLeft;
    updateTimerDisplay();
    timerControls.start.disabled = false;
    timerControls.pause.disabled = true;
}

function completeTimer() {
    clearInterval(appState.timer.interval);
    const sound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3');
    sound.play();
    
    // Move to the next timer mode
    if (appState.timer.currentMode === 'focus') {
        appState.timer.pomodoroCount++;
        
        if (appState.timer.pomodoroCount % 4 === 0) {
            switchTimerMode('longBreak');
        } else {
            switchTimerMode('shortBreak');
        }
    } else {
        switchTimerMode('focus');
    }
}

function switchTimerMode(mode) {
    appState.timer.currentMode = mode;
    appState.timer.isRunning = false;
    
    switch (mode) {
        case 'focus':
            appState.timer.timeLeft = appState.timer.focusTime * 60;
            timerDisplay.sessionType.textContent = 'Focus Session';
            break;
        case 'shortBreak':
            appState.timer.timeLeft = appState.timer.shortBreakTime * 60;
            timerDisplay.sessionType.textContent = 'Short Break';
            break;
        case 'longBreak':
            appState.timer.timeLeft = appState.timer.longBreakTime * 60;
            timerDisplay.sessionType.textContent = 'Long Break';
            break;
    }
    
    appState.timer.originalTime = appState.timer.timeLeft;
    updateTimerDisplay();
    
    timerControls.start.disabled = false;
    timerControls.pause.disabled = true;
}

// Todo List Functions
function addTask() {
    const taskText = todoElements.newTaskInput.value.trim();
    if (taskText === '') return;
    
    addTaskToDOM(taskText, false);
    saveTasksToLocalStorage();
    
    todoElements.newTaskInput.value = '';
}

function addTaskToDOM(text, completed) {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    if (completed) taskItem.classList.add('task-completed');
    
    const checkbox = document.createElement('input');
    checkbox.className = 'task-checkbox';
    checkbox.type = 'checkbox';
    checkbox.checked = completed;
    checkbox.addEventListener('change', toggleTaskCompletion);
    
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = text;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.addEventListener('click', deleteTask);
    
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(deleteBtn);
    
    todoElements.taskList.appendChild(taskItem);
}

function toggleTaskCompletion(e) {
    const taskItem = e.target.parentElement;
    
    if (e.target.checked) {
        taskItem.classList.add('task-completed');
    } else {
        taskItem.classList.remove('task-completed');
    }
    
    saveTasksToLocalStorage();
}

function deleteTask(e) {
    const taskItem = e.target.closest('.task-item');
    taskItem.classList.add('fade-out');
    
    setTimeout(() => {
        taskItem.remove();
        saveTasksToLocalStorage();
    }, 300);
}

function saveTasksToLocalStorage() {
    const tasks = [];
    
    document.querySelectorAll('.task-item').forEach(item => {
        tasks.push({
            text: item.querySelector('.task-text').textContent,
            completed: item.querySelector('.task-checkbox').checked
        });
    });
    
    localStorage.setItem('studyNapTasks', JSON.stringify(tasks));
}

// Quote Functions
function displayRandomQuote() {
    // Only try to display if we have quote elements
    if (!quoteElements.quoteText || !quoteElements.quoteAuthor) return;
    
    // If quotes are disabled in settings, hide the section
    if (!appState.settings.showQuotes) {
        document.getElementById('quote-section').style.display = 'none';
        return;
    } else {
        document.getElementById('quote-section').style.display = 'block';
    }
    
    // Check if it's a new day
    const lastQuoteDate = localStorage.getItem('studyNapLastQuoteDate');
    const today = new Date().toDateString();
    
    if (lastQuoteDate !== today) {
        // New day, show a new quote
        const randomIndex = Math.floor(Math.random() * appState.quotes.length);
        const quote = appState.quotes[randomIndex];
        
        quoteElements.quoteText.textContent = quote.text;
        quoteElements.quoteAuthor.textContent = quote.author;
        
        // Save the date and quote
        localStorage.setItem('studyNapLastQuoteDate', today);
        localStorage.setItem('studyNapCurrentQuote', JSON.stringify(quote));
    } else {
        // Same day, show the same quote
        const savedQuote = localStorage.getItem('studyNapCurrentQuote');
        if (savedQuote) {
            const quote = JSON.parse(savedQuote);
            quoteElements.quoteText.textContent = quote.text;
            quoteElements.quoteAuthor.textContent = quote.author;
        } else {
            // Fallback if no quote was saved
            const randomIndex = Math.floor(Math.random() * appState.quotes.length);
            const quote = appState.quotes[randomIndex];
            
            quoteElements.quoteText.textContent = quote.text;
            quoteElements.quoteAuthor.textContent = quote.author;
            
            localStorage.setItem('studyNapCurrentQuote', JSON.stringify(quote));
        }
    }
}

// Mood Tracker Functions
function selectMood(e) {
    const moodOption = e.target.closest('.mood-option');
    if (!moodOption) return;
    
    const mood = moodOption.dataset.mood;
    
    // Clear previous selection
    moodElements.moodOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Set new selection
    moodOption.classList.add('selected');
    appState.mood.selected = mood;
    
    // Save to localStorage
    const today = new Date().toDateString();
    localStorage.setItem('studyNapMood', JSON.stringify({
        date: today,
        selected: mood
    }));
    
    // Animation
    moodOption.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(1)' }
    ], {
        duration: 300,
        easing: 'ease-in-out'
    });
}

function updateMoodDisplay() {
    if (!appState.mood.selected) return;
    
    moodElements.moodOptions.forEach(option => {
        if (option.dataset.mood === appState.mood.selected) {
            option.classList.add('selected');
        }
    });
}

// Water Balance Functions
function toggleWaterGlass(e) {
    const waterGlass = e.target.closest('.water-glass');
    if (!waterGlass) return;
    
    const index = parseInt(waterGlass.dataset.index);
    
    if (waterGlass.classList.contains('filled')) {
        // Remove filled state
        waterGlass.classList.remove('filled');
        appState.water.count--;
        appState.water.filled = appState.water.filled.filter(i => i !== index);
    } else {
        // Add filled state
        waterGlass.classList.add('filled');
        appState.water.count++;
        appState.water.filled.push(index);
    }
    
    // Update counter
    waterElements.waterCount.textContent = appState.water.count;
    
    // Save to localStorage
    const today = new Date().toDateString();
    localStorage.setItem('studyNapWater', JSON.stringify({
        date: today,
        count: appState.water.count,
        filled: appState.water.filled
    }));
    
    // Animation
    waterGlass.animate([
        { transform: 'translateY(0)' },
        { transform: 'translateY(-5px)' },
        { transform: 'translateY(0)' }
    ], {
        duration: 300,
        easing: 'ease-out'
    });
}

function updateWaterDisplay() {
    waterElements.waterCount.textContent = appState.water.count;
    
    waterElements.waterGlasses.forEach(glass => {
        const index = parseInt(glass.dataset.index);
        if (appState.water.filled.includes(index)) {
            glass.classList.add('filled');
        }
    });
}

// Gratitude Journal Functions
function updateGratitude(e) {
    const input = e.target;
    const index = Array.from(gratitudeElements.gratitudeInputs).indexOf(input);
    
    appState.gratitude.items[index] = input.value;
    
    // Save to localStorage
    const today = new Date().toDateString();
    localStorage.setItem('studyNapGratitude', JSON.stringify({
        date: today,
        items: appState.gratitude.items
    }));
}

function updateGratitudeDisplay() {
    gratitudeElements.gratitudeInputs.forEach((input, index) => {
        input.value = appState.gratitude.items[index] || '';
    });
}

// Settings Functions
function toggleSettings() {
    console.log("Opening settings modal");
    
    // Ensure we have the elements before trying to set their properties
    if (settingsElements.quotesToggle) {
        settingsElements.quotesToggle.checked = appState.settings.showQuotes;
        console.log("Set quotes toggle to:", appState.settings.showQuotes);
    }
    
    // Set active color option
    if (settingsElements.colorOptions.length > 0) {
        settingsElements.colorOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.color === appState.settings.themeColor) {
                option.classList.add('active');
            }
        });
    }
    
    // Show modal if it exists
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('active');
    } else {
        console.error("Settings modal not found!");
    }
}

function closeSettings() {
    settingsElements.settingsModal.classList.remove('active');
}

// Modified settings save function
function saveSettings() {
    console.log("Saving settings");
    
    // Get values directly from form elements
    const showQuotes = settingsElements.quotesToggle ? settingsElements.quotesToggle.checked : true;
    
    console.log("Settings values before save - Show quotes:", appState.settings.showQuotes);
    console.log("New settings values - Show quotes:", showQuotes);
    
    // Save settings to app state
    appState.settings.showQuotes = showQuotes;
    
    // Get selected color
    const activeColor = document.querySelector('.color-option.active');
    if (activeColor) {
        appState.settings.themeColor = activeColor.dataset.color;
    }
    
    // Get timer values
    appState.settings.focusTime = parseInt(settingsElements.focusTime.value, 10) || 25;
    appState.settings.shortBreakTime = parseInt(settingsElements.shortBreak.value, 10) || 5;
    appState.settings.longBreakTime = parseInt(settingsElements.longBreak.value, 10) || 15;
    
    // Update timer state
    appState.timer.focusTime = appState.settings.focusTime;
    appState.timer.shortBreakTime = appState.settings.shortBreakTime;
    appState.timer.longBreakTime = appState.settings.longBreakTime;
    
    // Reset timer if not running
    if (!appState.timer.isRunning) {
        resetTimer();
    }
    
    // Apply theme color directly
    document.documentElement.style.setProperty('--accent', appState.settings.themeColor);
    
    // Apply quote visibility directly
    const quoteSection = document.getElementById('quote-section');
    if (quoteSection) {
        if (showQuotes) {
            quoteSection.style.display = 'block';
            displayRandomQuote();
        } else {
            quoteSection.style.display = 'none';
        }
    }
    
    // Save to localStorage
    localStorage.setItem('studyNapSettings', JSON.stringify(appState.settings));
    
    // Close modal
    closeSettings();
}

// Modified event listener setup
function setupEventListeners() {
    // Timer controls
    timerControls.start.addEventListener('click', startTimer);
    timerControls.pause.addEventListener('click', pauseTimer);
    timerControls.reset.addEventListener('click', resetTimer);
    
    // Todo controls
    todoElements.addTaskBtn.addEventListener('click', addTask);
    todoElements.newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // Mood tracker
    moodElements.moodOptions.forEach(option => {
        option.addEventListener('click', selectMood);
    });
    
    // Water tracker
    waterElements.waterGlasses.forEach(glass => {
        glass.addEventListener('click', toggleWaterGlass);
    });
    
    // Gratitude journal
    gratitudeElements.gratitudeInputs.forEach(input => {
        input.addEventListener('input', updateGratitude);
    });
    
    // Settings controls
    settingsElements.settingsBtn.addEventListener('click', toggleSettings);
    settingsElements.closeSettings.addEventListener('click', closeSettings);
    settingsElements.saveSettings.addEventListener('click', saveSettings);
    
    // Add direct toggle event handlers
    if (settingsElements.quotesToggle) {
        settingsElements.quotesToggle.addEventListener('change', function() {
            // Apply quote visibility directly when clicked
            const quoteSection = document.getElementById('quote-section');
            if (quoteSection) {
                quoteSection.style.display = this.checked ? 'block' : 'none';
            }
            console.log("Quote toggle changed directly, new state:", this.checked);
        });
    }
    
    // Color picker
    settingsElements.colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            settingsElements.colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Apply color preview immediately
            document.documentElement.style.setProperty('--accent', option.dataset.color);
        });
    });
    
    // Modal click outside
    settingsElements.settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsElements.settingsModal) {
            closeSettings();
        }
    });
}

// Modified initialization function
function initApp() {
    console.log("Initializing app");
    
    // Initialize DOM elements first
    initDOMElements();
    
    // Load saved data
    loadSavedData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Also apply quotes visibility
    const quoteSection = document.getElementById('quote-section');
    if (quoteSection) {
        quoteSection.style.display = appState.settings.showQuotes ? 'block' : 'none';
    }
    
    console.log("Initialization complete");
}

// Start the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// DOM Elements - Make sure all elements are found
function initDOMElements() {
    console.log("Initializing DOM elements");
    
    // Try to get all necessary elements and log errors if not found
    timerDisplay.minutes = document.getElementById('minutes');
    timerDisplay.seconds = document.getElementById('seconds');
    timerDisplay.sessionType = document.getElementById('session-type');
    timerDisplay.progressBar = document.getElementById('progress-bar');
    
    timerControls.start = document.getElementById('start-timer');
    timerControls.pause = document.getElementById('pause-timer');
    timerControls.reset = document.getElementById('reset-timer');
    
    todoElements.newTaskInput = document.getElementById('new-task');
    todoElements.addTaskBtn = document.getElementById('add-task');
    todoElements.taskList = document.getElementById('task-list');
    
    settingsElements.settingsBtn = document.getElementById('settings-btn');
    settingsElements.settingsModal = document.getElementById('settings-modal');
    settingsElements.closeSettings = document.getElementById('close-settings');
    settingsElements.saveSettings = document.getElementById('save-settings');
    settingsElements.colorOptions = document.querySelectorAll('.color-option');
    settingsElements.quotesToggle = document.getElementById('quotes-toggle');
    settingsElements.focusTime = document.getElementById('focus-time');
    settingsElements.shortBreak = document.getElementById('short-break');
    settingsElements.longBreak = document.getElementById('long-break');
    
    // Log any missing elements
    for (const key in timerDisplay) {
        if (!timerDisplay[key]) console.error(`Element not found: timerDisplay.${key}`);
    }
    
    for (const key in timerControls) {
        if (!timerControls[key]) console.error(`Element not found: timerControls.${key}`);
    }
    
    for (const key in todoElements) {
        if (!todoElements[key]) console.error(`Element not found: todoElements.${key}`);
    }
    
    for (const key in settingsElements) {
        if (key === 'colorOptions') {
            if (settingsElements.colorOptions.length === 0) {
                console.error('No color options found');
            }
        } else if (!settingsElements[key]) {
            console.error(`Element not found: settingsElements.${key}`);
        }
    }
    
    // Check important elements for toggles
    console.log("Quotes toggle:", settingsElements.quotesToggle);
} 