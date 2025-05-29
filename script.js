    // Game State Management
    const gameState = {
        xp: 0,
        level: 1,
        heroName: 'Вы',
        treeStage: 1,
        streaks: {
            sleepHygiene: 0,
            rowing: 0,
            noMeat: 0,
            gratitude: 0
        },
        badges: [],
        tasksCompleted: 0,
        currentMood: null,
        xpBoost: 0,
        skipTokens: 0,
        monthlyReviewsCount: 0,
        dailyData: {
            water: 0,
            rowingMinutes: 0,
            sleepTime: null,
            weight: null,
            mood: null
        },
        history: {
            moods: [],
            sleep: [],
            activity: [],
            weight: []
        }
    };
const translations = {
    en: {
        dashboard: "Dashboard",
        progress: "Progress",
        rewards: "Rewards Shop",
        medical: "I. Medical",
        sleep: "II. Sleep Master",
        nutrition: "III. Alchemist's Kitchen",
        activity: "IV. Energy",
        habits: "V. Inner Citadel",
        vitamins: "VI. Supplements",
        review: "VII. Sage Journal",
        achievements: "My Achievements"
    },
    ru: {
        dashboard: "Командный Центр",
        progress: "Мой Прогресс",
        rewards: "Магазин Наград",
        medical: "I. Мед. Консультация",
        sleep: "II. Повелитель Сна",
        nutrition: "III. Кухня Алхимика",
        activity: "IV. Энергия Движения",
        habits: "V. Внутренняя Цитадель",
        vitamins: "VI. Витамины и БАДы",
        review: "VII. Журнал Мудреца",
        achievements: "Мои Достижения"
    }
};
function setLanguage(lang) {
    const t = translations[lang] || translations.ru;
    document.getElementById("link-dashboard").innerText = t.dashboard;
    document.getElementById("link-progress").innerText = t.progress;
    document.getElementById("link-rewards").innerText = t.rewards;
    document.getElementById("link-medical").innerText = t.medical;
    document.getElementById("link-sleep").innerText = t.sleep;
    document.getElementById("link-nutrition").innerText = t.nutrition;
    document.getElementById("link-activity").innerText = t.activity;
    document.getElementById("link-habits").innerText = t.habits;
    document.getElementById("link-vitamins").innerText = t.vitamins;
    document.getElementById("link-review").innerText = t.review;
    document.querySelector(".achievements-preview h3").innerHTML = `<span class="icon">🏆</span>${t.achievements}`;
    document.documentElement.lang = lang;
    localStorage.setItem("hqLang", lang);
}


    // Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
    initializeGame();
    populateFocusTasks();
    updateAllUI();
    setupEventListeners();
    const toggle = document.getElementById("menu-toggle");
    if (toggle) {
        toggle.addEventListener("click", () => {
            document.querySelector(".sidebar").classList.toggle("open");
        });
    }
    const lang = localStorage.getItem("hqLang") || "ru";
    setLanguage(lang);
    const langSelect = document.getElementById("language-select");
    if (langSelect) {
        langSelect.value = lang;
        langSelect.addEventListener("change", (e) => setLanguage(e.target.value));
    }

    const savedTheme = localStorage.getItem("hqTheme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }
});
    // Initialize game
    function initializeGame() {
        const savedState = JSON.parse(localStorage.getItem('healthQuestState') || '{}');
        Object.assign(gameState, savedState);
        updateQuotes();
    }

    // Save game state
    function saveGameState() {
        localStorage.setItem('healthQuestState', JSON.stringify(gameState));
    }

    // Update all UI elements
    function updateAllUI() {
        updateXPDisplay();
        updateLevelDisplay();
        updateTreeDisplay();
        updateStreakDisplays();
        updateBadgeDisplay();
        updateProgressCards();
        updateCharts();
        updateStats();
    }

    // XP and Level Management  
    function addXP(amount) {
        const boost = gameState.xpBoost > 0 ? 1.1 : 1;
        const xpGained = Math.round(amount * boost);
        
        gameState.xp += xpGained;
        if (gameState.xpBoost > 0) gameState.xpBoost--;
        
        showNotification(`+${xpGained} XP!`, 'success');
        checkLevelUp();
        updateXPDisplay();
        saveGameState();
    }

    function checkLevelUp() {
        const xpForNextLevel = gameState.level * 100;
        while (gameState.xp >= xpForNextLevel) {
            gameState.xp -= xpForNextLevel;
            gameState.level++;
            levelUp();
        }
    }

    function levelUp() {
        showNotification(`🎉 Поздравляем! Вы достигли уровня ${gameState.level}!`, 'success');
        document.getElementById('health-tree').classList.add('level-up-animation');
        setTimeout(() => {
            document.getElementById('health-tree').classList.remove('level-up-animation');
        }, 800);
        
        // Check level badges
        if (gameState.level === 5) unlockBadge('badge-level-5');
        if (gameState.level === 10) unlockBadge('badge-level-10');
        
        // Update tree growth
        if (gameState.level % 2 === 0 && gameState.treeStage < 5) {
            gameState.treeStage++;
            updateTreeDisplay();
        }
    }

    // Display Update Functions
function updateXPDisplay() {
        document.getElementById('xp-value').textContent = gameState.xp;
        const xpForNextLevel = gameState.level * 100;
        const xpProgress = (gameState.xp / xpForNextLevel) * 100;
        document.getElementById('level-xp-bar').style.width = xpProgress + '%';
        document.getElementById('xp-to-next-level').textContent = xpForNextLevel - gameState.xp;
    }

    function updateLevelDisplay() {
        document.getElementById('level-value').textContent = gameState.level;
        document.getElementById('hero-name').textContent = gameState.heroName;
    }

    function updateTreeDisplay() {
        const tree = document.getElementById('health-tree');
        const treeStages = ['🌱', '🌿', '🌳', '🌲', '🌴'];
        tree.textContent = treeStages[gameState.treeStage - 1];
        tree.className = `health-tree tree-stage-${gameState.treeStage}`;
    }

    function updateStreakDisplays() {
        // Dashboard streaks
        document.getElementById('dash-sleep-hygiene-streak').textContent = gameState.streaks.sleepHygiene;
        document.getElementById('dash-rowing-streak').textContent = gameState.streaks.rowing;
        document.getElementById('dash-no-meat-streak').textContent = gameState.streaks.noMeat;
        document.getElementById('dash-gratitude-streak').textContent = gameState.streaks.gratitude;
        
        // Section-specific streaks
        const sleepHygieneEl = document.getElementById('sleep-hygiene-streak-sleep');
        if (sleepHygieneEl) sleepHygieneEl.textContent = gameState.streaks.sleepHygiene;
        
        const rowingEl = document.getElementById('rowing-streak-activity');
        if (rowingEl) rowingEl.textContent = gameState.streaks.rowing;
        
        const noMeatEl = document.getElementById('no-meat-streak-nutrition');
        if (noMeatEl) noMeatEl.textContent = gameState.streaks.noMeat;
    }

    function updateBadgeDisplay() {
        const badges = document.querySelectorAll('.badge');
        badges.forEach(badge => {
            if (gameState.badges.includes(badge.dataset.badgeId)) {
                badge.classList.add('earned');
            }
        });
    }

    function updateProgressCards() {
        // Sleep time
        if (gameState.dailyData.sleepTime) {
            document.getElementById('sleep-time-avg').textContent = gameState.dailyData.sleepTime;
        }
        
        // Water intake
        document.getElementById('water-avg').textContent = gameState.dailyData.water + 'л';
        
        // Activity minutes
        document.getElementById('activity-today').textContent = gameState.dailyData.rowingMinutes + 'м';
        
        // Habits score
        const habitCheckboxes = document.querySelectorAll('.checklist input[type="checkbox"]:checked');
        const totalHabits = document.querySelectorAll('.checklist input[type="checkbox"]').length;
        const habitsScore = totalHabits > 0 ? Math.round((habitCheckboxes.length / totalHabits) * 100) : 0;
        document.getElementById('habits-score').textContent = habitsScore + '%';
    }

    function updateCharts() {
        // Mood Chart
        const moodChart = document.getElementById('mood-chart');
        if (moodChart) {
            moodChart.innerHTML = '';
            const last7Moods = gameState.history.moods.slice(-7);
            last7Moods.forEach((mood, index) => {
                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                bar.style.height = (mood.value * 20) + '%';
                bar.style.background = getMoodColor(mood.value);
                bar.title = `День ${index + 1}: ${mood.emoji}`;
                moodChart.appendChild(bar);
            });
        }
        
        // Sleep Chart
        const sleepChart = document.getElementById('sleep-chart');
        if (sleepChart) {
            sleepChart.innerHTML = '';
            const last7Sleep = gameState.history.sleep.slice(-7);
            last7Sleep.forEach((sleep, index) => {
                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                const sleepHour = parseInt(sleep.split(':')[0]);
                const targetHour = 23;
                const diff = Math.abs(sleepHour - targetHour);
                const height = Math.max(20, 100 - (diff * 10));
                bar.style.height = height + '%';
                bar.title = `День ${index + 1}: ${sleep}`;
                moodChart.appendChild(bar);
            });
        }
        
        // Activity Chart
        const activityChart = document.getElementById('activity-chart');
        if (activityChart) {
            activityChart.innerHTML = '';
            const last7Activity = gameState.history.activity.slice(-7);
            last7Activity.forEach((minutes, index) => {
                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                bar.style.height = Math.min(100, (minutes / 30) * 100) + '%';
                bar.style.background = 'linear-gradient(180deg, #30cfd0 0%, #330867 100%)';
                bar.title = `День ${index + 1}: ${minutes} минут`;
                activityChart.appendChild(bar);
            });
        }
        
        // Weight Chart
        const weightChart = document.getElementById('weight-chart');
        if (weightChart) {
            weightChart.innerHTML = '';
            const lastWeights = gameState.history.weight.slice(-7);
            if (lastWeights.length > 0) {
                const maxWeight = Math.max(...lastWeights.map(w => w.value));
                const minWeight = Math.min(...lastWeights.map(w => w.value));
                const range = maxWeight - minWeight || 1;
                
                lastWeights.forEach((weight, index) => {
                    const bar = document.createElement('div');
                    bar.className = 'chart-bar';
                    const height = ((weight.value - minWeight) / range) * 80 + 20;
                    bar.style.height = height + '%';
                    bar.style.background = 'linear-gradient(180deg, #fa709a 0%, #fee140 100%)';
                    bar.title = `${weight.value} кг`;
                    weightChart.appendChild(bar);
                });
            }
        }
    }

    function updateStats() {
        document.getElementById('total-xp-earned').textContent = gameState.xp + (gameState.level - 1) * 100;
        document.getElementById('total-tasks-completed').textContent = gameState.tasksCompleted;
        document.getElementById('best-streak').textContent = Math.max(...Object.values(gameState.streaks));
        
        const startDate = new Date(gameState.startDate || Date.now());
        const currentDate = new Date();
        const daysInQuest = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        document.getElementById('days-in-quest').textContent = daysInQuest;
    }

    // Task Handling Functions
    function handleTaskChange(checkbox, badgeId) {
        const xp = parseInt(checkbox.parentElement.dataset.xp);
        
        if (checkbox.checked) {
            checkbox.parentElement.classList.add('completed');
            addXP(xp);
            gameState.tasksCompleted++;
            
            if (badgeId) {
                checkBadgeProgress(badgeId);
            }
        } else {
            checkbox.parentElement.classList.remove('completed');
            gameState.xp -= xp;
            gameState.tasksCompleted--;
            updateXPDisplay();
        }
        
        saveGameState();
    }

    function handleSleepHygieneTaskChange(checkbox) {
        handleTaskChange(checkbox, 'badge-sleep-hygiene-master');
        
        // Check if all sleep hygiene tasks are completed
        const allTasks = document.querySelectorAll('#sleep-hygiene-tasks-sleep input[type="checkbox"]');
        const completedTasks = document.querySelectorAll('#sleep-hygiene-tasks-sleep input[type="checkbox"]:checked');
        
        if (allTasks.length === completedTasks.length && allTasks.length > 0) {
            unlockBadge('badge-sleep-hygiene-master');
        }
    }

    function checkAllSleepHygiene() {
        const allTasks = document.querySelectorAll('#sleep-hygiene-tasks-sleep input[type="checkbox"]');
        const completedTasks = document.querySelectorAll('#sleep-hygiene-tasks-sleep input[type="checkbox"]:checked');
        
        if (allTasks.length === completedTasks.length && allTasks.length > 0) {
            gameState.streaks.sleepHygiene++;
            addXP(10);
            
            if (gameState.streaks.sleepHygiene >= 7) {
                unlockBadge('badge-7day-streak-sleep');
            }
            
            updateStreakDisplays();
            saveGameState();
        } else {
            showNotification('Пожалуйста, выполните все задачи гигиены сна', 'warning');
        }
    }

    function resetSleepHygieneStreakConfirm() {
        if (confirm('Вы уверены, что хотите сбросить серию гигиены сна?')) {
            gameState.streaks.sleepHygiene = 0;
            updateStreakDisplays();
            saveGameState();
            showNotification('Серия гигиены сна сброшена', 'warning');
        }
    }

    function handleNoMeatDay(checkbox) {
        if (checkbox.checked) {
            gameState.streaks.noMeat++;
            addXP(15);
            
            if (gameState.streaks.noMeat >= 3) {
                unlockBadge('badge-no-meat-streak-3');
            }
        } else {
            gameState.streaks.noMeat = 0;
            gameState.xp -= 15;
            updateXPDisplay();
        }
        
        updateStreakDisplays();
        saveGameState();
    }

    // Data Logging Functions
    function selectMood(button) {
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        gameState.currentMood = {
            value: parseInt(button.dataset.value),
            emoji: button.dataset.mood
        };
    }

    function logMood() {
        if (!gameState.currentMood) {
            showNotification('Пожалуйста, выберите настроение', 'warning');
            return;
        }
        
        const note = document.getElementById('mood-note').value;
        gameState.history.moods.push({
            date: new Date().toISOString(),
            value: gameState.currentMood.value,
            emoji: gameState.currentMood.emoji,
            note: note
        });
        
        gameState.dailyData.mood = gameState.currentMood;
        addXP(5);
        updateCharts();
        saveGameState();
        
        document.getElementById('mood-note').value = '';
        showNotification('Настроение записано!', 'success');
    }

    function logWeight() {
        const weight = parseFloat(document.getElementById('weight-input').value);
        if (!weight || weight < 50 || weight > 150) {
            showNotification('Пожалуйста, введите корректный вес', 'warning');
            return;
        }
        
        gameState.history.weight.push({
            date: new Date().toISOString(),
            value: weight
        });
        
        gameState.dailyData.weight = weight;
        addXP(5);
        updateCharts();
        saveGameState();
        
        document.getElementById('weight-input').value = '';
        showNotification('Вес записан!', 'success');
    }

    function logRowingActivity() {
        const duration = parseInt(document.getElementById('rowing-duration').value);
        if (!duration || duration < 0) {
            showNotification('Пожалуйста, введите длительность гребли', 'warning');
            return;
        }
        
        gameState.history.activity.push(duration);
        gameState.dailyData.rowingMinutes = duration;
        
        if (duration >= 15) {
            gameState.streaks.rowing++;
            addXP(10 + Math.floor(duration / 5));
            
            if (gameState.streaks.rowing >= 5) {
                unlockBadge('badge-rowing-streak-5');
            }
        } else {
            gameState.streaks.rowing = 0;
            addXP(5);
        }
        
        updateStreakDisplays();
        updateProgressCards();
        saveGameState();
        
        showNotification(`Гребля записана: ${duration} минут!`, 'success');
    }

    function trackSleepTime(time) {
        gameState.dailyData.sleepTime = time;
        gameState.history.sleep.push(time);
        updateProgressCards();
        saveGameState();
    }

    function checkDinnerTime(time) {
        const hour = parseInt(time.split(':')[0]);
        if (!time) {
            showNotification("Введите время", "warning");
            return;
        }
        if (hour <= 19) {
            addXP(5);
            showNotification('Отлично! Ужин вовремя!', 'success');
        }
    }

    function checkWaterIntake(liters) {
        gameState.dailyData.water = parseFloat(liters);
        if (gameState.dailyData.water < 0 || gameState.dailyData.water > 10) {
            showNotification("Введите корректное количество воды", "warning");
            return;
        }
        updateProgressCards();
        
        if (gameState.dailyData.water >= 2) {
            addXP(5);
            unlockBadge('badge-hydration-hero');
        }
        
        saveGameState();
    }

    // Save Functions
    function saveMedicalNotes() {
        const notes = document.getElementById('medical-notes').value;
        if (notes) {
            gameState.medicalNotes = notes;
            addXP(5);
            saveGameState();
            showNotification('Заметки сохранены!', 'success');
        }
    }

    function saveHabitReflection() {
        const reflection = document.getElementById('habit-reflection').value;
        if (reflection) {
            gameState.habitReflection = reflection;
            addXP(10);
            saveGameState();
            showNotification('Размышления сохранены!', 'success');
        }
    }

    function saveSupplementsList() {
        const supplements = document.getElementById('supplements-list').value;
        if (supplements) {
            gameState.supplements = supplements;
            addXP(5);
            saveGameState();
            showNotification('Список добавок сохранен!', 'success');
        }
    }

    function saveDailyGratitude() {
        const gratitude = document.getElementById('daily-gratitude').value;
        if (gratitude) {
            gameState.streaks.gratitude++;
            addXP(10);
            updateStreakDisplays();
            saveGameState();
            document.getElementById('daily-gratitude').value = '';
            showNotification('Благодарность записана!', 'success');
        }
    }

    function saveMonthlyReview() {
        const date = document.getElementById('monthly-review-date').value;
        const successes = document.getElementById('monthly-successes').value;
        const challenges = document.getElementById('monthly-challenges').value;
        const adjustments = document.getElementById('monthly-adjustments').value;
        
        if (date && (successes || challenges || adjustments)) {
            gameState.monthlyReviewsCount++;
            addXP(50);
            
            if (gameState.monthlyReviewsCount >= 3) {
                unlockBadge('badge-reflection-pro');
            }
            
            saveGameState();
            showNotification('Месячный обзор сохранен!', 'success');
        } else {
            showNotification('Пожалуйста, заполните дату и хотя бы одно поле', 'warning');
        }
    }

    // Focus Tasks
    function populateFocusTasks() {
        const container = document.getElementById('focusable-tasks-container');
        const tasks = [
            { id: 'focus-sleep-hygiene', text: 'Полная гигиена сна', xp: 15 },
            { id: 'focus-rowing', text: '30 минут гребли', xp: 20 },
            { id: 'focus-no-meat', text: 'День без мяса', xp: 15 },
            { id: 'focus-water', text: 'Выпить 2+ литра воды', xp: 10 },
            { id: 'focus-work', text: 'Сфокусированная работа (2+ часа)', xp: 20 },
            { id: 'focus-partner', text: 'Качественное время с партнером', xp: 15 }
        ];
        
        container.innerHTML = '';
        tasks.forEach(task => {
            const div = document.createElement('div');
            div.className = 'focus-task-item';
            div.innerHTML = `
                <input type="checkbox" id="${task.id}" data-xp="${task.xp}">
                <label for="${task.id}">${task.text} (+${task.xp} XP)</label>
            `;
            container.appendChild(div);
        });
    }

    function setFocusTasks() {
        const selected = document.querySelectorAll('#focusable-tasks-container input:checked');
        if (selected.length > 3) {
            showNotification('Выберите не более 3 фокусных задач', 'warning');
            return;
        }
        
        if (selected.length === 0) {
            showNotification('Выберите хотя бы одну фокусную задачу', 'warning');
            return;
        }
        
        selected.forEach(checkbox => {
            checkbox.parentElement.classList.add('selected');
        });
        
        addXP(10);
        showNotification('Фокусные задачи установлены!', 'success');
    }

    // Rewards
    function purchaseReward(button) {
        const rewardId = button.dataset.rewardId;
        const cost = parseInt(button.dataset.cost);
        
        if (gameState.xp < cost) {
            showNotification('Недостаточно XP!', 'error');
            return;
        }
        
        gameState.xp -= cost;
        
        switch(rewardId) {
            case 'new_quote':
                updateQuotes();
                showNotification('Новая цитата добавлена!', 'success');
                break;
            case 'xp_boost':
                gameState.xpBoost = 3;
                showNotification('XP Boost активирован на 3 задачи!', 'success');
                break;
            case 'skip_task':
                gameState.skipTokens++;
                showNotification('Пропуск задачи добавлен!', 'success');
                break;
            case 'tree_fertilizer':
                if (gameState.treeStage < 5) {
                    gameState.treeStage++;
                    updateTreeDisplay();
                    showNotification('Дерево выросло!', 'success');
                } else {
                    showNotification('Дерево уже максимального размера!', 'warning');
                }
                break;
            case 'hero_rename':
                const newName = prompt('Введите новое имя героя:');
                if (newName && newName.trim()) {
                    gameState.heroName = newName.trim();
                    updateLevelDisplay();
                    showNotification('Имя героя изменено!', 'success');
                }
                break;
        }
        
        updateXPDisplay();
        saveGameState();
    }

    // Utility Functions
    function calculateNextSleepShift() {
        const currentBedtime = document.getElementById('current-bedtime').value;
        const [hours, minutes] = currentBedtime.split(':').map(Number);
        
        let newHours = hours;
        let newMinutes = minutes - 20;
        
        if (newMinutes < 0) {
            newMinutes += 60;
            newHours -= 1;
            if (newHours < 0) newHours += 24;
        }
        
        const nextBedtime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
        const info = document.getElementById('next-sleep-shift-info');
        info.textContent = `Следующий рекомендуемый сдвиг: ложиться в ${nextBedtime} (на 20 минут раньше)`;
    }

    function getMoodColor(value) {
        const colors = {
            1: 'linear-gradient(180deg, #e74c3c 0%, #c0392b 100%)',
            2: 'linear-gradient(180deg, #e67e22 0%, #d35400 100%)',
            3: 'linear-gradient(180deg, #f39c12 0%, #e67e22 100%)',
            4: 'linear-gradient(180deg, #2ecc71 0%, #27ae60 100%)',
            5: 'linear-gradient(180deg, #3498db 0%, #2980b9 100%)'
        };
        return colors[value] || colors[3];
    }

    function unlockBadge(badgeId) {
        if (!gameState.badges.includes(badgeId)) {
            gameState.badges.push(badgeId);
            const badge = document.querySelector(`[data-badge-id="${badgeId}"]`);
            if (badge) {
                badge.classList.add('earned');
                showNotification(`🏆 Достижение разблокировано: ${badge.textContent}!`, 'success');
            }
            saveGameState();
        }
    }

    function checkBadgeProgress(badgeId) {
        // Additional badge checks based on specific conditions
        const completedMedicalTasks = document.querySelectorAll('#medical .checklist input:checked').length;
        if (badgeId === 'badge-medical-check' && completedMedicalTasks === 4) {
            unlockBadge('badge-medical-check');
        }
        
        const completedFocusTasks = document.querySelectorAll('#habits .checklist input:checked').length;
        if (badgeId === 'badge-focused-work-master' && completedFocusTasks >= 5) {
            unlockBadge('badge-focused-work-master');
        }
    }

    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Data Export/Import
    function exportData() {
        const blob = new Blob([JSON.stringify(gameState)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "health-quest-save.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    function handleImport(input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            importData(reader.result);
        };
        reader.readAsText(file);
    }

    function importData(json) {
        try {
            const data = JSON.parse(json);
            Object.assign(gameState, data);
            updateAllUI();
            saveGameState();
            showNotification("Данные импортированы", "success");
        } catch (e) {
            showNotification("Ошибка импорта", "error");
        }
    }

    // Navigation
    function setupEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.dataset.target;
                
                // Update active nav
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Show target section
                document.querySelectorAll('.page-section').forEach(section => {
                    section.classList.remove('active');
                });
                document.getElementById(target).classList.add('active');
            });
        });
    }

    // Quotes
    function updateQuotes() {
        const quotes = [
            "Начните там, где вы есть. Используйте то, что у вас есть. Делайте то, что можете. - Артур Эш",
            "Успех - это сумма маленьких усилий, повторяемых изо дня в день. - Роберт Кольер",
            "Забота о себе - это не роскошь, а необходимость.",
            "Каждый день - это новая возможность изменить свою жизнь.",
            "Прогресс, а не совершенство.",
            "Ваше тело - это храм, но только если вы относитесь к нему соответственно.",
            "Дисциплина - это мост между целями и достижениями.",
            "Здоровье - это не все, но все без здоровья - ничто.",
            "Мотивация заставляет начать. Привычка заставляет продолжать.",
            "Будьте терпеливы с собой. Самоизменение - это постоянная работа."
        ];
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        document.getElementById('quote-display').textContent = randomQuote;
    }

    // Initialize start date if not exists
    if (!gameState.startDate) {
        gameState.startDate = new Date().toISOString();
        saveGameState();
    }

    function toggleTheme() {
        const dark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('hqTheme', dark ? 'dark' : 'light');
    }

    function resetGame() {
        if (confirm('Вы уверены, что хотите сбросить все данные?')) {
            localStorage.removeItem('healthQuestState');
            localStorage.removeItem('hqTheme');
            location.reload();
        }
    }
