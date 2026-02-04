// Enhanced Production-Ready Neon Tasks Application
class NeonTasksProduction {
    constructor() {
        this.tasks = this.loadTasks();
        this.categories = this.loadCategories();
        this.settings = this.loadSettings();
        this.taskIdCounter = parseInt(localStorage.getItem('sumoTaskCounter')) || 0;
        this.selectedTasks = new Set();
        this.currentView = 'list';
        this.filters = {
            search: '',
            category: 'all',
            priority: 'all',
            status: 'all'
        };
        
        this.initializeElements();
        this.init();
    }
    
    initializeElements() {
        // Core elements
        this.taskInput = document.getElementById('task-input');
        this.addBtn = document.getElementById('add-btn');
        this.taskList = document.getElementById('task-list');
        this.clearCompletedBtn = document.getElementById('clear-completed');
        this.taskCount = document.getElementById('task-count');
        
        // Enhanced elements
        this.searchInput = document.getElementById('search-input');
        this.filterCategory = document.getElementById('filter-category');
        this.filterPriority = document.getElementById('filter-priority');
        this.filterStatus = document.getElementById('filter-status');
        this.taskCategory = document.getElementById('task-category');
        this.taskPriority = document.getElementById('task-priority');
        this.taskDueDate = document.getElementById('task-due-date');
        
        // View controls
        this.viewListBtn = document.getElementById('view-list');
        this.viewBoardBtn = document.getElementById('view-board');
        this.viewCalendarBtn = document.getElementById('view-calendar');
        
        // Bulk actions
        this.selectAllBtn = document.getElementById('select-all');
        this.bulkCompleteBtn = document.getElementById('bulk-complete');
        this.bulkDeleteBtn = document.getElementById('bulk-delete');
        
        // Header controls
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.settingsBtn = document.getElementById('settings-btn');
        this.analyticsBtn = document.getElementById('analytics-btn');
        this.exportBtn = document.getElementById('export-btn');
        
        // Status elements
        this.systemStatus = document.getElementById('system-status');
        this.syncStatus = document.getElementById('sync-status');
        this.systemInfo = document.getElementById('system-info');
        this.productivityRing = document.getElementById('productivity-ring');
        this.productivityPercent = document.getElementById('productivity-percent');
        
        // Modals
        this.settingsModal = document.getElementById('settings-modal');
        this.analyticsModal = document.getElementById('analytics-modal');
        
        // Loading screen
        this.loadingScreen = document.getElementById('loading-screen');
        this.app = document.getElementById('app');
    }
    
    async init() {
        await this.showLoadingScreen();
        this.bindEvents();
        this.setupKeyboardShortcuts();
        this.initializeServiceWorker();
        this.setupTheme();
        this.render();
        this.updateTaskCount();
        this.updateProductivityRing();
        this.startPeriodicUpdates();
        await this.hideLoadingScreen();
    }
    
    async showLoadingScreen() {
        const loadingProgress = document.querySelector('.loading-progress');
        const loadingStatus = document.querySelector('.loading-status');
        
        const steps = [
            'LOADING CORE SYSTEMS...',
            'INITIALIZING DATABASE...',
            'SETTING UP INTERFACE...',
            'APPLYING THEME...',
            'SYSTEM READY'
        ];
        
        for (let i = 0; i < steps.length; i++) {
            loadingStatus.textContent = steps[i];
            loadingProgress.style.width = `${(i + 1) * 20}%`;
            await this.delay(300);
        }
    }
    
    async hideLoadingScreen() {
        await this.delay(500);
        this.loadingScreen.style.opacity = '0';
        await this.delay(500);
        this.loadingScreen.style.display = 'none';
        this.app.classList.remove('hidden');
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    bindEvents() {
        // Core functionality
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        // Search and filters
        this.searchInput.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.applyFilters();
        });
        
        this.filterCategory.addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });
        
        this.filterPriority.addEventListener('change', (e) => {
            this.filters.priority = e.target.value;
            this.applyFilters();
        });
        
        this.filterStatus.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });
        
        // View controls
        this.viewListBtn.addEventListener('click', () => this.switchView('list'));
        this.viewBoardBtn.addEventListener('click', () => this.switchView('board'));
        this.viewCalendarBtn.addEventListener('click', () => this.switchView('calendar'));
        
        // Bulk actions
        this.selectAllBtn.addEventListener('click', () => this.selectAllTasks());
        this.bulkCompleteBtn.addEventListener('click', () => this.bulkComplete());
        this.bulkDeleteBtn.addEventListener('click', () => this.bulkDelete());
        
        // Header controls
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.analyticsBtn.addEventListener('click', () => this.openAnalytics());
        this.exportBtn.addEventListener('click', () => this.showExportOptions());
        
        // Quick action templates
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.target.dataset.template;
                this.useTemplate(template);
            });
        });
        
        // Modal events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });
        
        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Additional backup/import buttons
        document.getElementById('backup-data')?.addEventListener('click', () => this.backupData());
        document.getElementById('import-data')?.addEventListener('click', () => this.importData());
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        this.taskInput.focus();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.searchInput.focus();
                        break;
                    case 'a':
                        e.preventDefault();
                        this.selectAllTasks();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                    case 's':
                        e.preventDefault();
                        this.save();
                        this.showNotification('Data saved successfully!', 'success');
                        break;
                    case 'e':
                        e.preventDefault();
                        this.showExportOptions();
                        break;
                }
            }
            
            // Escape key to close modals
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    }
    
    createTask(text, category = 'personal', priority = 'medium', dueDate = null) {
        return {
            id: ++this.taskIdCounter,
            text: text.trim(),
            category: category,
            priority: priority,
            dueDate: dueDate,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: this.extractTags(text),
            subtasks: [],
            status: 'todo' // todo, progress, completed
        };
    }
    
    extractTags(text) {
        const tagRegex = /#(\w+)/g;
        const tags = [];
        let match;
        while ((match = tagRegex.exec(text)) !== null) {
            tags.push(match[1].toLowerCase());
        }
        return tags;
    }
    
    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;
        
        const category = this.taskCategory.value;
        const priority = this.taskPriority.value;
        const dueDate = this.taskDueDate.value || null;
        
        const task = this.createTask(text, category, priority, dueDate);
        this.tasks.unshift(task);
        
        // Clear inputs
        this.taskInput.value = '';
        this.taskDueDate.value = '';
        
        this.save();
        this.render();
        this.updateTaskCount();
        this.updateProductivityRing();
        
        // Visual feedback
        this.addBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.addBtn.style.transform = '';
        }, 150);
        
        this.showNotification(`Task "${text}" added successfully!`, 'success');
    }
    
    useTemplate(template) {
        const templates = {
            meeting: 'Schedule team meeting for project review',
            call: 'Call client to discuss requirements',
            email: 'Send follow-up email to stakeholders',
            review: 'Review and approve pending documents'
        };
        
        if (templates[template]) {
            this.taskInput.value = templates[template];
            this.taskInput.focus();
        }
    }
    
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.updatedAt = new Date().toISOString();
            task.status = task.completed ? 'completed' : 'todo';
            this.save();
            this.render();
            this.updateTaskCount();
            this.updateProductivityRing();
        }
    }
    
    deleteTask(id) {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            const task = this.tasks[taskIndex];
            this.tasks.splice(taskIndex, 1);
            this.save();
            this.render();
            this.updateTaskCount();
            this.updateProductivityRing();
            this.showNotification(`Task "${task.text}" deleted`, 'warning');
        }
    }
    
    applyFilters() {
        this.render();
    }
    
    filterTasks() {
        return this.tasks.filter(task => {
            const matchesSearch = !this.filters.search || 
                task.text.toLowerCase().includes(this.filters.search.toLowerCase()) ||
                task.tags.some(tag => tag.includes(this.filters.search.toLowerCase()));
            
            const matchesCategory = this.filters.category === 'all' || task.category === this.filters.category;
            const matchesPriority = this.filters.priority === 'all' || task.priority === this.filters.priority;
            
            let matchesStatus = true;
            if (this.filters.status === 'completed') matchesStatus = task.completed;
            else if (this.filters.status === 'active') matchesStatus = !task.completed;
            else if (this.filters.status === 'overdue') {
                matchesStatus = task.dueDate && 
                    new Date(task.dueDate) < new Date() && 
                    !task.completed;
            }
            
            return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
        });
    }
    
    switchView(view) {
        this.currentView = view;
        
        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`view-${view}`).classList.add('active');
        
        // Update view containers
        document.querySelectorAll('.tasks-view').forEach(container => {
            container.classList.remove('active');
        });
        document.getElementById(`tasks-${view}-view`).classList.add('active');
        
        this.render();
    }
    
    selectAllTasks() {
        const filteredTasks = this.filterTasks();
        if (this.selectedTasks.size === filteredTasks.length) {
            this.selectedTasks.clear();
        } else {
            filteredTasks.forEach(task => this.selectedTasks.add(task.id));
        }
        this.render();
    }
    
    bulkComplete() {
        if (this.selectedTasks.size === 0) return;
        
        this.selectedTasks.forEach(taskId => {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = true;
                task.updatedAt = new Date().toISOString();
                task.status = 'completed';
            }
        });
        
        this.selectedTasks.clear();
        this.save();
        this.render();
        this.updateTaskCount();
        this.updateProductivityRing();
        this.showNotification('Selected tasks completed!', 'success');
    }
    
    bulkDelete() {
        if (this.selectedTasks.size === 0) return;
        
        if (confirm(`Delete ${this.selectedTasks.size} selected tasks?`)) {
            this.tasks = this.tasks.filter(task => !this.selectedTasks.has(task.id));
            this.selectedTasks.clear();
            this.save();
            this.render();
            this.updateTaskCount();
            this.updateProductivityRing();
            this.showNotification('Selected tasks deleted!', 'warning');
        }
    }
    
    render() {
        const filteredTasks = this.filterTasks();
        
        if (this.currentView === 'list') {
            this.renderListView(filteredTasks);
        } else if (this.currentView === 'board') {
            this.renderBoardView(filteredTasks);
        } else if (this.currentView === 'calendar') {
            this.renderCalendarView(filteredTasks);
        }
    }
    
    renderListView(tasks) {
        this.taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary); font-style: italic;">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;">⚡</div>
                    <div>NO TASKS FOUND</div>
                    <div style="font-size: 0.8rem; margin-top: 0.5rem;">
                        ${this.tasks.length === 0 ? 'Create your first task above' : 'Try adjusting your filters'}
                    </div>
                </div>
            `;
            this.taskList.appendChild(emptyState);
            return;
        }
        
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority`;
            li.style.animationDelay = `${index * 0.05}s`;
            
            if (task.dueDate && new Date(task.dueDate) < new Date() && !task.completed) {
                li.classList.add('overdue');
            }
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       ${this.selectedTasks.has(task.id) ? 'data-selected="true"' : ''}>
                <div class="task-content">
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <div class="task-meta">
                        <span class="task-category">${task.category}</span>
                        <span class="task-priority">${task.priority}</span>
                        ${task.dueDate ? `<span class="task-due-date">📅 ${this.formatDate(task.dueDate)}</span>` : ''}
                        ${task.tags.length > 0 ? `
                            <div class="task-tags">
                                ${task.tags.map(tag => `<span class="task-tag">#${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <button class="task-delete">DELETE</button>
            `;
            
            const checkbox = li.querySelector('.task-checkbox');
            const deleteBtn = li.querySelector('.task-delete');
            
            checkbox.addEventListener('change', (e) => {
                if (e.shiftKey) {
                    if (this.selectedTasks.has(task.id)) {
                        this.selectedTasks.delete(task.id);
                    } else {
                        this.selectedTasks.add(task.id);
                    }
                    this.render();
                } else {
                    this.toggleTask(task.id);
                }
            });
            
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
            
            this.taskList.appendChild(li);
        });
    }
    
    renderBoardView(tasks) {
        const todoTasks = tasks.filter(t => !t.completed && t.status !== 'progress');
        const progressTasks = tasks.filter(t => !t.completed && t.status === 'progress');
        const completedTasks = tasks.filter(t => t.completed);
        
        this.renderBoardColumn('board-todo', todoTasks);
        this.renderBoardColumn('board-progress', progressTasks);
        this.renderBoardColumn('board-completed', completedTasks);
    }
    
    renderBoardColumn(containerId, tasks) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `board-task ${task.priority}-priority`;
            taskElement.draggable = true;
            taskElement.dataset.taskId = task.id;
            
            taskElement.innerHTML = `
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <div class="task-meta">
                    <span class="task-category">${task.category}</span>
                    <span class="task-priority">${task.priority}</span>
                    ${task.dueDate ? `<span class="task-due-date">📅 ${this.formatDate(task.dueDate)}</span>` : ''}
                </div>
            `;
            
            container.appendChild(taskElement);
        });
    }
    
    renderCalendarView(tasks) {
        const container = document.getElementById('calendar-container');
        if (!container) return;
        
        const tasksWithDates = tasks.filter(t => t.dueDate);
        
        if (tasksWithDates.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;">📅</div>
                    <div>NO TASKS WITH DUE DATES</div>
                    <div style="font-size: 0.8rem; margin-top: 0.5rem;">Add due dates to see tasks in calendar view</div>
                </div>
            `;
            return;
        }
        
        // Simple calendar implementation
        container.innerHTML = `
            <h3 style="color: var(--neon-cyan); margin-bottom: 2rem;">UPCOMING TASKS</h3>
            <div class="calendar-tasks">
                ${tasksWithDates.map(task => `
                    <div class="calendar-task ${task.completed ? 'completed' : ''} ${task.priority}-priority">
                        <div class="calendar-date">${this.formatDate(task.dueDate)}</div>
                        <div class="calendar-task-text">${this.escapeHtml(task.text)}</div>
                        <div class="calendar-task-meta">${task.category} • ${task.priority}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    updateTaskCount() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        
        this.taskCount.textContent = `${active} ACTIVE`;
        
        // Update system status
        if (total === 0) {
            this.systemStatus.textContent = 'STANDBY';
            this.systemStatus.style.color = 'var(--text-secondary)';
        } else if (active === 0) {
            this.systemStatus.textContent = 'COMPLETE';
            this.systemStatus.style.color = 'var(--neon-green)';
        } else {
            this.systemStatus.textContent = 'ACTIVE';
            this.systemStatus.style.color = 'var(--neon-green)';
        }
    }
    
    updateProductivityRing() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const circumference = 157; // 2 * π * 25
        const offset = circumference - (percentage / 100) * circumference;
        
        if (this.productivityRing) {
            this.productivityRing.style.strokeDashoffset = offset;
        }
        
        if (this.productivityPercent) {
            this.productivityPercent.textContent = `${percentage}%`;
        }
    }
    
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear', 'warning');
            return;
        }
        
        if (confirm(`Clear ${completedCount} completed tasks?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.save();
            this.render();
            this.updateTaskCount();
            this.updateProductivityRing();
            this.showNotification(`${completedCount} completed tasks cleared`, 'success');
        }
    }
    
    toggleTheme() {
        const themes = ['cyberpunk', 'matrix', 'neon-blue', 'synthwave'];
        const currentTheme = this.settings.theme;
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        
        this.settings.theme = themes[nextIndex];
        this.setupTheme();
        this.save();
        this.showNotification(`Theme changed to ${themes[nextIndex].toUpperCase()}`, 'success');
    }
    
    setupTheme() {
        document.body.className = `theme-${this.settings.theme}`;
        
        const themes = {
            cyberpunk: {
                '--neon-cyan': '#00ffff',
                '--neon-pink': '#ff0080',
                '--neon-green': '#39ff14',
                '--accent-orange': '#ff6b35'
            },
            matrix: {
                '--neon-cyan': '#00ff41',
                '--neon-pink': '#00ff41',
                '--neon-green': '#00ff41',
                '--accent-orange': '#ff6b35'
            },
            'neon-blue': {
                '--neon-cyan': '#0099ff',
                '--neon-pink': '#6600ff',
                '--neon-green': '#00ff99',
                '--accent-orange': '#ff9900'
            },
            synthwave: {
                '--neon-cyan': '#ff00ff',
                '--neon-pink': '#ff0080',
                '--neon-green': '#80ff00',
                '--accent-orange': '#ff8000'
            }
        };
        
        const themeColors = themes[this.settings.theme];
        if (themeColors) {
            Object.entries(themeColors).forEach(([property, value]) => {
                document.documentElement.style.setProperty(property, value);
            });
        }
    }
    
    openSettings() {
        this.settingsModal.classList.add('active');
        
        // Populate current settings
        document.getElementById('theme-select').value = this.settings.theme;
        document.getElementById('notifications-toggle').checked = this.settings.notifications;
        document.getElementById('sound-toggle').checked = this.settings.soundEffects;
        document.getElementById('autosave-toggle').checked = this.settings.autoSave;
    }
    
    openAnalytics() {
        this.analyticsModal.classList.add('active');
        this.renderAnalytics();
    }
    
    renderAnalytics() {
        const stats = this.getProductivityStats();
        const analyticsContent = document.getElementById('analytics-content');
        
        analyticsContent.innerHTML = `
            <div class="analytics-grid">
                <div class="stat-card">
                    <h3>TOTAL TASKS</h3>
                    <div class="stat-number">${stats.total}</div>
                </div>
                <div class="stat-card">
                    <h3>COMPLETED</h3>
                    <div class="stat-number">${stats.completed}</div>
                </div>
                <div class="stat-card">
                    <h3>TODAY</h3>
                    <div class="stat-number">${stats.todayCompleted}</div>
                </div>
                <div class="stat-card">
                    <h3>THIS WEEK</h3>
                    <div class="stat-number">${stats.weekCompleted}</div>
                </div>
                <div class="stat-card">
                    <h3>OVERDUE</h3>
                    <div class="stat-number">${stats.overdue}</div>
                </div>
                <div class="stat-card">
                    <h3>COMPLETION RATE</h3>
                    <div class="stat-number">${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</div>
                </div>
            </div>
            
            <div class="analytics-charts">
                <div class="chart-section">
                    <h3>TASKS BY CATEGORY</h3>
                    <div class="category-chart">
                        ${Object.entries(stats.byCategory).map(([category, count]) => `
                            <div class="category-bar">
                                <span class="category-name">${category.toUpperCase()}</span>
                                <div class="category-bar-bg">
                                    <div class="category-bar-fill" style="width: ${(count / stats.total) * 100}%"></div>
                                </div>
                                <span class="category-count">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="chart-section">
                    <h3>TASKS BY PRIORITY</h3>
                    <div class="priority-chart">
                        ${Object.entries(stats.byPriority).map(([priority, count]) => `
                            <div class="priority-bar">
                                <span class="priority-name">${priority.toUpperCase()}</span>
                                <div class="priority-bar-bg">
                                    <div class="priority-bar-fill" style="width: ${(count / stats.total) * 100}%"></div>
                                </div>
                                <span class="priority-count">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    getProductivityStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
        
        return {
            total: this.tasks.length,
            completed: this.tasks.filter(t => t.completed).length,
            todayCompleted: this.tasks.filter(t => 
                t.completed && new Date(t.updatedAt) >= today
            ).length,
            weekCompleted: this.tasks.filter(t => 
                t.completed && new Date(t.updatedAt) >= thisWeek
            ).length,
            overdue: this.tasks.filter(t => 
                !t.completed && t.dueDate && new Date(t.dueDate) < now
            ).length,
            byCategory: this.getTasksByCategory(),
            byPriority: this.getTasksByPriority()
        };
    }
    
    getTasksByCategory() {
        return this.tasks.reduce((acc, task) => {
            acc[task.category] = (acc[task.category] || 0) + 1;
            return acc;
        }, {});
    }
    
    getTasksByPriority() {
        return this.tasks.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
        }, {});
    }
    
    showExportOptions() {
        const options = ['JSON', 'CSV', 'PDF'];
        const choice = prompt(`Export format:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nEnter number (1-3):`);
        
        if (choice >= 1 && choice <= 3) {
            const format = options[choice - 1].toLowerCase();
            this.exportTasks(format);
        }
    }
    
    exportTasks(format = 'json') {
        const data = {
            tasks: this.tasks,
            categories: this.categories,
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
        
        let content, filename, mimeType;
        
        switch(format) {
            case 'json':
                content = JSON.stringify(data, null, 2);
                filename = `sumo-tasks-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
                break;
            case 'csv':
                content = this.tasksToCSV();
                filename = `sumo-tasks-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
                break;
            case 'pdf':
                this.showNotification('PDF export coming soon!', 'warning');
                return;
        }
        
        this.downloadFile(content, filename, mimeType);
        this.showNotification(`Data exported as ${format.toUpperCase()}`, 'success');
    }
    
    tasksToCSV() {
        const headers = ['ID', 'Task', 'Category', 'Priority', 'Status', 'Created', 'Due Date', 'Tags'];
        const rows = this.tasks.map(task => [
            task.id,
            `"${task.text.replace(/"/g, '""')}"`,
            task.category,
            task.priority,
            task.completed ? 'Completed' : 'Active',
            task.createdAt,
            task.dueDate || '',
            task.tags.join(';')
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    backupData() {
        this.exportTasks('json');
    }
    
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (data.tasks && Array.isArray(data.tasks)) {
                            if (confirm('This will replace all current data. Continue?')) {
                                this.tasks = data.tasks;
                                this.categories = data.categories || this.categories;
                                this.settings = { ...this.settings, ...data.settings };
                                this.save();
                                this.render();
                                this.updateTaskCount();
                                this.updateProductivityRing();
                                this.showNotification('Data imported successfully!', 'success');
                            }
                        } else {
                            throw new Error('Invalid file format');
                        }
                    } catch (error) {
                        this.showNotification('Error importing data: ' + error.message, 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                    this.syncStatus.textContent = 'ONLINE';
                    this.syncStatus.style.color = 'var(--neon-green)';
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                    this.syncStatus.textContent = 'OFFLINE';
                    this.syncStatus.style.color = 'var(--accent-orange)';
                });
        }
    }
    
    startPeriodicUpdates() {
        // Update system info every 30 seconds
        setInterval(() => {
            const now = new Date();
            this.systemInfo.textContent = `SYSTEM ONLINE - ${now.toLocaleTimeString()}`;
        }, 30000);
        
        // Auto-save every 5 minutes if auto-save is enabled
        setInterval(() => {
            if (this.settings.autoSave) {
                this.save();
            }
        }, 300000);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notifications-container');
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    loadTasks() {
        try {
            const tasks = localStorage.getItem('sumoTasks');
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }
    
    loadCategories() {
        try {
            const categories = localStorage.getItem('sumoCategories');
            return categories ? JSON.parse(categories) : ['personal', 'work', 'urgent'];
        } catch (error) {
            return ['personal', 'work', 'urgent'];
        }
    }
    
    loadSettings() {
        try {
            const settings = localStorage.getItem('sumoSettings');
            return settings ? JSON.parse(settings) : {
                theme: 'cyberpunk',
                notifications: true,
                autoSave: true,
                soundEffects: false
            };
        } catch (error) {
            return {
                theme: 'cyberpunk',
                notifications: true,
                autoSave: true,
                soundEffects: false
            };
        }
    }
    
    save() {
        try {
            localStorage.setItem('sumoTasks', JSON.stringify(this.tasks));
            localStorage.setItem('sumoCategories', JSON.stringify(this.categories));
            localStorage.setItem('sumoSettings', JSON.stringify(this.settings));
            localStorage.setItem('sumoTaskCounter', this.taskIdCounter.toString());
        } catch (error) {
            console.error('Error saving data:', error);
            this.showNotification('Error saving data: ' + error.message, 'error');
        }
    }
}

// Initialize the enhanced app
document.addEventListener('DOMContentLoaded', () => {
    new NeonTasksProduction();
});