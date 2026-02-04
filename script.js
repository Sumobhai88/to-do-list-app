class SumoTasks {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('sumoTasks')) || [];
        this.taskIdCounter = parseInt(localStorage.getItem('sumoTaskCounter')) || 0;
        
        this.taskInput = document.getElementById('task-input');
        this.addBtn = document.getElementById('add-btn');
        this.taskList = document.getElementById('task-list');
        this.clearCompletedBtn = document.getElementById('clear-completed');
        this.taskCount = document.getElementById('task-count');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.render();
        this.updateTaskCount();
        this.addSystemStartupEffect();
    }
    
    addSystemStartupEffect() {
        // Add a brief startup sequence
        setTimeout(() => {
            const statusItems = document.querySelectorAll('.status-item');
            statusItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'statusBlink 0.3s ease-in-out';
                }, index * 200);
            });
        }, 500);
    }
    
    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        // Add some cyberpunk sound effects (visual feedback)
        this.taskInput.addEventListener('focus', () => {
            this.taskInput.style.animation = 'none';
            setTimeout(() => {
                this.taskInput.style.animation = 'neonGlow 2s ease-in-out infinite alternate';
            }, 10);
        });
    }
    
    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;
        
        const task = {
            id: ++this.taskIdCounter,
            text: text,
            completed: false,
            timestamp: Date.now()
        };
        
        this.tasks.unshift(task); // Add to beginning for latest-first order
        this.taskInput.value = '';
        this.save();
        this.render();
        this.updateTaskCount();
        
        // Add visual feedback
        this.addBtn.style.animation = 'none';
        setTimeout(() => {
            this.addBtn.style.animation = '';
        }, 10);
    }
    
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.save();
            this.render();
            this.updateTaskCount();
        }
    }
    
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        this.render();
        this.updateTaskCount();
    }
    
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) return;
        
        this.tasks = this.tasks.filter(t => !t.completed);
        this.save();
        this.render();
        this.updateTaskCount();
        
        // Visual feedback
        this.clearCompletedBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.clearCompletedBtn.style.transform = '';
        }, 150);
    }
    
    render() {
        this.taskList.innerHTML = '';
        
        if (this.tasks.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary); font-style: italic;">
                    <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;">⚡</div>
                    <div>SYSTEM READY - NO ACTIVE TASKS</div>
                    <div style="font-size: 0.8rem; margin-top: 0.5rem;">Enter a task above to begin</div>
                </div>
            `;
            this.taskList.appendChild(emptyState);
            return;
        }
        
        this.tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.style.animationDelay = `${index * 0.1}s`;
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="task-delete">DELETE</button>
            `;
            
            const checkbox = li.querySelector('.task-checkbox');
            const deleteBtn = li.querySelector('.task-delete');
            
            checkbox.addEventListener('change', () => this.toggleTask(task.id));
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
            
            this.taskList.appendChild(li);
        });
    }
    
    updateTaskCount() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        
        this.taskCount.textContent = `${active} ACTIVE`;
        
        // Update status based on completion
        const statusItems = document.querySelectorAll('.status-item');
        if (total === 0) {
            statusItems[0].textContent = 'STANDBY';
            statusItems[0].style.color = 'var(--text-secondary)';
        } else if (active === 0) {
            statusItems[0].textContent = 'COMPLETE';
            statusItems[0].style.color = 'var(--neon-green)';
        } else {
            statusItems[0].textContent = 'ACTIVE';
            statusItems[0].style.color = 'var(--neon-green)';
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    save() {
        localStorage.setItem('sumoTasks', JSON.stringify(this.tasks));
        localStorage.setItem('sumoTaskCounter', this.taskIdCounter.toString());
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SumoTasks();
});

// Add some cyberpunk easter eggs
document.addEventListener('keydown', (e) => {
    // Konami code easter egg
    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        const title = document.querySelector('.title-main');
        title.style.animation = 'neonGlow 0.5s ease-in-out 3';
        
        // Temporarily change colors
        document.documentElement.style.setProperty('--neon-cyan', '#ff0080');
        document.documentElement.style.setProperty('--neon-pink', '#00ffff');
        
        setTimeout(() => {
            document.documentElement.style.setProperty('--neon-cyan', '#00ffff');
            document.documentElement.style.setProperty('--neon-pink', '#ff0080');
        }, 2000);
    }
});

// Add matrix-style background effect on idle
let idleTimer;
function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        const grid = document.querySelector('.grid-overlay');
        grid.style.animation = 'gridPulse 1s ease-in-out 5';
    }, 30000); // 30 seconds of inactivity
}

document.addEventListener('mousemove', resetIdleTimer);
document.addEventListener('keypress', resetIdleTimer);
resetIdleTimer();