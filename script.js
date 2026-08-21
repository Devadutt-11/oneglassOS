// =========================================================
// UNIVERSAL DRAGGABLE FUNCTIONALITY
// =========================================================
function makeDraggable(elmnt, dragHandle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;

    dragHandle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        isDragging = false;
        
        document.onmouseup = stopDragging;
        document.onmousemove = elementDrag;
        
        if (elmnt.classList.contains('main-window') || elmnt.classList.contains('glass-widget')) {
            document.querySelectorAll('.main-window, .glass-widget').forEach(el => el.style.zIndex = "50");
            elmnt.style.zIndex = "100";
        }
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        isDragging = true;
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function stopDragging() {
        document.onmouseup = null;
        document.onmousemove = null;
        elmnt.setAttribute('data-dragged', isDragging ? 'true' : 'false');
    }
}

// Attach dragging to windows and widgets
document.querySelectorAll('.main-window').forEach(win => {
    const header = win.querySelector('.title-bar');
    if (header) makeDraggable(win, header);
});

document.querySelectorAll('.glass-widget').forEach(widget => {
    const header = widget.querySelector('.widget-header');
    if (header) makeDraggable(widget, header);
});

document.querySelectorAll('.desktop-icon').forEach(icon => {
    makeDraggable(icon, icon);
});


// =========================================================
// DESKTOP & LAUNCH CONTROLS
// =========================================================
const welcomeWindow = document.getElementById("welcome-window");
const blurOverlay = document.getElementById("desktop-blur-overlay");

function enterDesktop() {
    welcomeWindow.style.display = "none";
    if (blurOverlay) blurOverlay.style.display = "none";
}

document.getElementById("close-welcome-btn").addEventListener("click", enterDesktop);
document.getElementById("launch-app-btn").addEventListener("click", enterDesktop);

function openApp(appId) {
    const targetWin = document.getElementById(`${appId}-window`);
    if (targetWin) {
        targetWin.style.display = "flex";
        document.querySelectorAll('.main-window, .glass-widget').forEach(el => el.style.zIndex = "50");
        targetWin.style.zIndex = "100";
    }
}

// Desktop Icons Click Handlers
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        if (icon.getAttribute('data-dragged') === 'true') return;
        openApp(icon.getAttribute('data-app'));
    });
});

// Dock Click Handlers
document.querySelectorAll('.dock-slot').forEach(slot => {
    slot.addEventListener('click', () => {
        openApp(slot.getAttribute('data-dock-app'));
    });
});

// Window Close Buttons
document.getElementById("close-focus-btn").onclick = () => document.getElementById("focus-window").style.display = "none";
document.getElementById("close-terminal-btn").onclick = () => document.getElementById("terminal-window").style.display = "none";
document.getElementById("close-weather-btn").onclick = () => document.getElementById("weather-window").style.display = "none";
document.getElementById("close-settings-btn").onclick = () => document.getElementById("settings-window").style.display = "none";

// Fullscreen toggle buttons
document.querySelectorAll('.fullscreen-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const win = e.target.closest('.main-window');
        if (win) win.classList.toggle('fullscreen');
    });
});


// =========================================================
// GLASS TERMINAL ENGINE
// =========================================================
const termInput = document.getElementById("terminal-input");
const termOutput = document.getElementById("terminal-output");

function switchTermView(viewId, btn) {
    document.querySelectorAll('.term-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.term-tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    btn.classList.add('active');
}

function printTermLine(text, isError = false) {
    const line = document.createElement("div");
    line.className = "term-line";
    if (isError) line.style.color = "#f87171";
    line.innerText = text;
    termOutput.appendChild(line);
    termOutput.scrollTop = termOutput.scrollHeight;
}

if (termInput) {
    termInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const raw = termInput.value.trim();
            termInput.value = "";
            if (!raw) return;

            printTermLine(`user@oneglass-os:~$ ${raw}`);
            const parts = raw.split(" ");
            const cmd = parts[0].toLowerCase();
            const arg = parts.slice(1).join(" ");

            switch (cmd) {
                case "help":
                    printTermLine("Available: help, clear, time, open [app], echo [text], theme [dark/glass], about");
                    break;
                case "clear":
                    termOutput.innerHTML = "";
                    break;
                case "time":
                    printTermLine(`System Time: ${new Date().toLocaleString()}`);
                    break;
                case "open":
                    if (["focus", "terminal", "weather", "settings"].includes(arg.toLowerCase())) {
                        openApp(arg.toLowerCase());
                        printTermLine(`Launching ${arg}...`);
                    } else {
                        printTermLine(`Unknown app '${arg}'. Try: open focus, open weather, open settings`, true);
                    }
                    break;
                case "echo":
                    printTermLine(arg || "");
                    break;
                case "about":
                    printTermLine("One Glass OS v1.0.5 — Frosted Web Desktop Environment");
                    break;
                case "theme":
                    if (arg === "dark") {
                        document.body.style.filter = "brightness(0.7)";
                        printTermLine("Applied dark filter theme.");
                    } else {
                        document.body.style.filter = "none";
                        printTermLine("Restored default glass theme.");
                    }
                    break;
                default:
                    printTermLine(`Command not found: '${cmd}'. Type 'help' for command list.`, true);
            }
        }
    });
}


// =========================================================
// WEATHER APP LOGIC
// =========================================================
const weatherSearchBtn = document.getElementById("weather-search-btn");
const weatherInput = document.getElementById("weather-city-input");

function updateWeather(city, temp, cond, icon, humidity, wind) {
    document.getElementById("weather-city-name").innerText = city;
    document.getElementById("weather-temp").innerText = `${temp}°C`;
    document.getElementById("weather-condition").innerText = cond;
    document.getElementById("weather-icon").innerText = icon;
    document.getElementById("weather-humidity").innerText = `${humidity}%`;
    document.getElementById("weather-wind").innerText = `${wind} km/h`;
}

if (weatherSearchBtn) {
    weatherSearchBtn.addEventListener("click", () => {
        const query = weatherInput.value.trim();
        if (!query) return;

        // Realistic Mock Weather Generator for fast demo
        const temps = [22, 26, 29, 31, 18];
        const conds = ["Clear Sky", "Partly Cloudy", "Light Rain", "Sunny"];
        const icons = ["☀️", "🌤️", "🌧️", "🌤️"];
        
        const rand = Math.floor(Math.random() * conds.length);
        updateWeather(query, temps[rand], conds[rand], icons[rand], 65 + rand * 3, 10 + rand * 2);
    });
}


// =========================================================
// SETTINGS APP LOGIC (VOLUME & BRIGHTNESS DIMMER)
// =========================================================
const dimmerInput = document.getElementById("setting-dimmer");
const brightnessOverlay = document.getElementById("brightness-overlay");
const dimmerVal = document.getElementById("dimmer-val");
const volumeInput = document.getElementById("setting-volume");
const volumeVal = document.getElementById("volume-val");

if (dimmerInput) {
    dimmerInput.addEventListener("input", (e) => {
        const val = e.target.value;
        dimmerVal.innerText = `${val}%`;
        brightnessOverlay.style.background = `rgba(0, 0, 0, ${val / 100})`;
    });
}

if (volumeInput) {
    volumeInput.addEventListener("input", (e) => {
        volumeVal.innerText = `${e.target.value}%`;
    });
}


// =========================================================
// CLOCK & CALENDAR UPDATES
// =========================================================
function updateClocks() {
    const timeString = new Date().toLocaleTimeString();
    document.getElementById("welcome-time").innerText = timeString;
    document.getElementById("clock-display").innerText = timeString;
}
setInterval(updateClocks, 1000);
updateClocks();

function updateWidgetCalendar() {
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    document.getElementById("cal-day").innerText = days[now.getDay()];
    document.getElementById("cal-date").innerText = now.getDate();
    document.getElementById("cal-month").innerText = months[now.getMonth()];
}
updateWidgetCalendar();


// =========================================================
// POMODORO & TASK LIST LOGIC
// =========================================================
let timerInterval = null;
let secondsLeft = 1500;
const timerDisplay = document.getElementById("timer-display");

function renderTimer() {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

document.getElementById("start-timer-btn").onclick = () => {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        if (secondsLeft > 0) { secondsLeft--; renderTimer(); } 
        else { clearInterval(timerInterval); timerInterval = null; alert("Pomodoro complete!"); }
    }, 1000);
};

document.getElementById("pause-timer-btn").onclick = () => { clearInterval(timerInterval); timerInterval = null; };
document.getElementById("reset-timer-btn").onclick = () => { clearInterval(timerInterval); timerInterval = null; secondsLeft = 1500; renderTimer(); };

function switchTab(tabId, btn) {
    document.querySelectorAll('#focus-window .tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#focus-window .nav-tab').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

function toggleWidget(widgetId) {
    const widget = document.getElementById(widgetId);
    widget.style.display = (widget.style.display === "none" || widget.style.display === "") ? "block" : "none";
}

function closeWidget(widgetId) {
    document.getElementById(widgetId).style.display = "none";
}

document.getElementById("add-task-btn").onclick = () => {
    const input = document.getElementById("task-input");
    const text = input.value.trim();
    if (!text) return;
    const li = document.createElement("li");
    li.innerText = text;
    li.onclick = () => li.classList.toggle("done");
    document.getElementById("task-list").appendChild(li);
    input.value = "";
};