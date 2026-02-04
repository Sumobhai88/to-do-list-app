// Advanced Analytics Module for Neon Tasks
class TaskAnalytics {
    constructor(tasks) {
        this.tasks = tasks;
    }
    
    // Productivity trends over time
    getProductivityTrends(days = 30) {
        const trends = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
            
            const completed = this.tasks.filter(task => {
                const completedDate = new Date(task.updatedAt);
                return task.completed && completedDate >= dayStart && completedDate < dayEnd;
            }).length;
            
            const created = this.tasks.filter(task => {
                const createdDate = new Date(task.createdAt);
                return createdDate >= dayStart && createdDate < dayEnd;
            }).length;
            
            trends.push({
                date: dayStart.toISOString().split('T')[0],
                completed,
                created,
                productivity: created > 0 ? (completed / created) * 100 : 0
            });
        }
        
        return trends;
    }
    
    // Peak productivity hours
    getProductivityByHour() {
        const hourlyStats = Array(24).fill(0).map((_, hour) => ({
            hour,
            completed: 0,
            created: 0
        }));
        
        this.tasks.forEach(task => {
            const createdHour = new Date(task.createdAt).getHours();
            hourlyStats[createdHour].created++;
            
            if (task.completed) {
                const completedHour = new Date(task.updatedAt).getHours();
                hourlyStats[completedHour].completed++;
            }
        });
        
        return hourlyStats;
    }
    
    // Task completion patterns
    getCompletionPatterns() {
        const patterns = {
            averageCompletionTime: this.getAverageCompletionTime(),
            completionByDay: this.getCompletionByDayOfWeek(),
            priorityEffectiveness: this.getPriorityEffectiveness(),
            categoryPerformance: this.getCategoryPerformance()
        };
        
        return patterns;
    }
    
    getAverageCompletionTime() {
        const completedTasks = this.tasks.filter(task => task.completed);
        if (completedTasks.length === 0) return 0;
        
        const totalTime = completedTasks.reduce((sum, task) => {
            const created = new Date(task.createdAt);
            const completed = new Date(task.updatedAt);
            return sum + (completed - created);
        }, 0);
        
        return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60)); // hours
    }
    
    getCompletionByDayOfWeek() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayStats = days.map(day => ({ day, completed: 0, created: 0 }));
        
        this.tasks.forEach(task => {
            const createdDay = new Date(task.createdAt).getDay();
            dayStats[createdDay].created++;
            
            if (task.completed) {
                const completedDay = new Date(task.updatedAt).getDay();
                dayStats[completedDay].completed++;
            }
        });
        
        return dayStats;
    }
    
    getPriorityEffectiveness() {
        const priorities = ['high', 'medium', 'low'];
        return priorities.map(priority => {
            const priorityTasks = this.tasks.filter(task => task.priority === priority);
            const completed = priorityTasks.filter(task => task.completed).length;
            const total = priorityTasks.length;
            
            return {
                priority,
                total,
                completed,
                completionRate: total > 0 ? (completed / total) * 100 : 0
            };
        });
    }
    
    getCategoryPerformance() {
        const categories = [...new Set(this.tasks.map(task => task.category))];
        return categories.map(category => {
            const categoryTasks = this.tasks.filter(task => task.category === category);
            const completed = categoryTasks.filter(task => task.completed).length;
            const total = categoryTasks.length;
            const overdue = categoryTasks.filter(task => 
                !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
            ).length;
            
            return {
                category,
                total,
                completed,
                overdue,
                completionRate: total > 0 ? (completed / total) * 100 : 0
            };
        });
    }
    
    // Predictive insights
    getPredictiveInsights() {
        const trends = this.getProductivityTrends(14);
        const recentTrend = trends.slice(-7);
        const avgProductivity = recentTrend.reduce((sum, day) => sum + day.productivity, 0) / 7;
        
        const insights = [];
        
        if (avgProductivity > 80) {
            insights.push({
                type: 'success',
                message: 'Excellent productivity! You\'re completing tasks efficiently.',
                suggestion: 'Consider taking on more challenging projects.'
            });
        } else if (avgProductivity < 50) {
            insights.push({
                type: 'warning',
                message: 'Productivity could be improved.',
                suggestion: 'Try breaking large tasks into smaller, manageable pieces.'
            });
        }
        
        const overdueTasks = this.tasks.filter(task => 
            !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
        );
        
        if (overdueTasks.length > 0) {
            insights.push({
                type: 'alert',
                message: `You have ${overdueTasks.length} overdue task(s).`,
                suggestion: 'Focus on completing overdue tasks first to stay on track.'
            });
        }
        
        return insights;
    }
    
    // Generate comprehensive report
    generateReport() {
        return {
            summary: this.getSummaryStats(),
            trends: this.getProductivityTrends(),
            patterns: this.getCompletionPatterns(),
            insights: this.getPredictiveInsights(),
            recommendations: this.getRecommendations()
        };
    }
    
    getSummaryStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const active = total - completed;
        const overdue = this.tasks.filter(task => 
            !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
        ).length;
        
        return {
            total,
            completed,
            active,
            overdue,
            completionRate: total > 0 ? (completed / total) * 100 : 0
        };
    }
    
    getRecommendations() {
        const recommendations = [];
        const categoryPerf = this.getCategoryPerformance();
        const priorityEff = this.getPriorityEffectiveness();
        
        // Category recommendations
        const worstCategory = categoryPerf.reduce((worst, cat) => 
            cat.completionRate < worst.completionRate ? cat : worst
        );
        
        if (worstCategory.completionRate < 60) {
            recommendations.push({
                type: 'category',
                message: `${worstCategory.category} tasks have low completion rate (${worstCategory.completionRate.toFixed(1)}%)`,
                action: 'Consider reviewing task complexity or time allocation for this category'
            });
        }
        
        // Priority recommendations
        const highPriorityEff = priorityEff.find(p => p.priority === 'high');
        if (highPriorityEff && highPriorityEff.completionRate < 70) {
            recommendations.push({
                type: 'priority',
                message: 'High priority tasks are not being completed efficiently',
                action: 'Focus on high priority tasks first and avoid overcommitting'
            });
        }
        
        return recommendations;
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskAnalytics;
}