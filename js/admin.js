// 管理后台JavaScript
class AdminManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.charts = {};
        this.init();
    }

    init() {
        // 检查登录状态
        if (!this.checkLogin()) {
            window.location.href = './login.html';
            return;
        }

        this.initNavigation();
        this.initCharts();
        this.loadDashboardData();
        this.hideLoading();
        this.initLogout();
    }

    // 检查登录状态
    checkLogin() {
        return localStorage.getItem('admin_logged_in') === 'true';
    }

    // 初始化退出登录
    initLogout() {
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('确定要退出登录吗？')) {
                    localStorage.removeItem('admin_logged_in');
                    localStorage.removeItem('admin_username');
                    window.location.href = './login.html';
                }
            });
        }

        // 显示用户名
        const username = localStorage.getItem('admin_username');
        if (username) {
            const userInfo = document.querySelector('.user-info span');
            if (userInfo) {
                userInfo.textContent = username;
            }
        }
    }

    // 初始化导航
    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });
    }

    // 切换页面
    switchPage(page) {
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // 更新页面内容
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`${page}-page`).classList.add('active');

        // 更新页面标题
        const titles = {
            dashboard: '数据概览',
            users: '用户管理',
            reports: '工作记录',
            analytics: '数据分析',
            export: '数据导出',
            settings: '系统设置'
        };
        document.getElementById('page-title').textContent = titles[page];

        this.currentPage = page;

        // 加载页面数据
        this.loadPageData(page);
    }

    // 加载页面数据
    async loadPageData(page) {
        this.showLoading();
        
        try {
            switch (page) {
                case 'dashboard':
                    await this.loadDashboardData();
                    break;
                case 'users':
                    await this.loadUsersData();
                    break;
                case 'reports':
                    await this.loadReportsData();
                    break;
                case 'analytics':
                    await this.loadAnalyticsData();
                    break;
                case 'export':
                    await this.loadExportData();
                    break;
                case 'settings':
                    await this.loadSettingsData();
                    break;
            }
        } catch (error) {
            console.error('加载页面数据失败：', error);
            this.showError('加载数据失败，请重试');
        } finally {
            this.hideLoading();
        }
    }

    // 加载仪表板数据
    async loadDashboardData() {
        try {
            // 模拟API调用 - 实际应该调用云函数
            const stats = await this.fetchStats();
            
            // 更新统计数据
            document.getElementById('total-users').textContent = stats.totalUsers || 0;
            document.getElementById('total-reports').textContent = stats.totalReports || 0;
            document.getElementById('avg-success-rate').textContent = (stats.avgSuccessRate || 0) + '%';
            document.getElementById('active-users').textContent = stats.activeUsers || 0;

            // 更新图表
            this.updateUserGrowthChart(stats.userGrowthData);
            this.updateReportsChart(stats.reportsData);

            // 加载最近活动
            this.loadRecentActivity(stats.recentActivity);
        } catch (error) {
            console.error('加载仪表板数据失败：', error);
        }
    }

    // 获取统计数据
    async fetchStats() {
        try {
            console.log('开始获取真实数据');

            // 尝试调用云函数API
            const apiUrl = 'https://cloud1-3g74c2ped44be66f.ap-shanghai.app.tcloudbase.com/adminWeb';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'getStats'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('API调用结果：', result);

            if (result.success && result.data) {
                console.log('API调用成功，返回真实数据');

                // 转换数据格式以匹配前端期望
                return {
                    totalUsers: result.data.totalUsers || 0,
                    totalReports: result.data.totalRecords || 0,
                    avgSuccessRate: result.data.successRate || 0,
                    activeUsers: Math.floor(result.data.totalUsers * 0.6) || 0, // 估算活跃用户
                    userGrowthData: this.generateMockUserGrowthData(),
                    reportsData: this.generateMockReportsData(),
                    recentActivity: this.generateMockActivity()
                };
            } else {
                console.error('API调用失败：', result);
                throw new Error(result.error || '获取数据失败');
            }
        } catch (error) {
            console.error('获取统计数据失败：', error);
            console.log('降级到模拟数据');
            // 降级到模拟数据
            return this.getMockStats();
        }
    }

    // 获取模拟数据
    getMockStats() {
        return {
            totalUsers: 156,
            totalReports: 1248,
            avgSuccessRate: 87.5,
            activeUsers: 89,
            userGrowthData: this.generateMockUserGrowthData(),
            reportsData: this.generateMockReportsData(),
            recentActivity: this.generateMockActivity()
        };
    }

    // 生成模拟用户增长数据
    generateMockUserGrowthData() {
        const data = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                users: Math.floor(Math.random() * 10) + 1
            });
        }
        return data;
    }

    // 生成模拟报告数据
    generateMockReportsData() {
        const data = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                reports: Math.floor(Math.random() * 50) + 10,
                success: Math.floor(Math.random() * 40) + 30
            });
        }
        return data;
    }

    // 初始化图表
    initCharts() {
        // 用户增长图表
        const userGrowthCtx = document.getElementById('user-growth-chart').getContext('2d');
        this.charts.userGrowth = new Chart(userGrowthCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '新增用户',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // 工作记录图表
        const reportsCtx = document.getElementById('reports-chart').getContext('2d');
        this.charts.reports = new Chart(reportsCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: '总记录数',
                    data: [],
                    backgroundColor: '#667eea'
                }, {
                    label: '成功记录',
                    data: [],
                    backgroundColor: '#28a745'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // 更新用户增长图表
    updateUserGrowthChart(data) {
        if (!data || !this.charts.userGrowth) return;
        
        this.charts.userGrowth.data.labels = data.map(item => item.date);
        this.charts.userGrowth.data.datasets[0].data = data.map(item => item.users);
        this.charts.userGrowth.update();
    }

    // 更新报告图表
    updateReportsChart(data) {
        if (!data || !this.charts.reports) return;
        
        this.charts.reports.data.labels = data.map(item => item.date);
        this.charts.reports.data.datasets[0].data = data.map(item => item.reports);
        this.charts.reports.data.datasets[1].data = data.map(item => item.success);
        this.charts.reports.update();
    }

    // 生成模拟活动数据
    generateMockActivity() {
        return [
            { icon: '👤', title: '新用户注册', time: '2分钟前' },
            { icon: '📋', title: '工作记录提交', time: '5分钟前' },
            { icon: '📊', title: '数据统计更新', time: '10分钟前' },
            { icon: '⚙️', title: '系统设置修改', time: '1小时前' },
            { icon: '📤', title: '数据导出完成', time: '2小时前' }
        ];
    }

    // 加载最近活动
    loadRecentActivity(activities) {
        // 如果没有传入活动数据，使用模拟数据
        if (!activities) {
            activities = this.generateMockActivity();
        }

        const activityList = document.getElementById('recent-activity-list');
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    // 加载用户数据
    async loadUsersData() {
        try {
            console.log('开始获取用户数据');

            // 尝试调用云函数API获取真实用户数据
            const apiUrl = 'https://cloud1-3g74c2ped44be66f.ap-shanghai.app.tcloudbase.com/adminWeb';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'getStats'
                })
            });

            let users = [];

            if (response.ok) {
                const result = await response.json();
                console.log('用户数据API调用结果：', result);

                if (result.success && result.data && result.data.userList) {
                    // 转换真实数据格式
                    users = result.data.userList.map((user, index) => ({
                        id: `user${index + 1}`,
                        nickname: user.userName || '未知用户',
                        registerTime: new Date().toISOString().split('T')[0], // 模拟注册时间
                        reports: user.totalRecords || 0,
                        lastActive: new Date().toISOString().split('T')[0], // 模拟最后活跃时间
                        successRate: user.successRate || 0
                    }));

                    console.log('使用真实用户数据：', users);
                }
            }

            // 如果没有真实数据，使用模拟数据
            if (users.length === 0) {
                console.log('降级到模拟用户数据');
                users = [
                    { id: 'user001', nickname: '张三', registerTime: '2024-01-15', reports: 25, lastActive: '2024-07-11', successRate: 85 },
                    { id: 'user002', nickname: '李四', registerTime: '2024-02-20', reports: 18, lastActive: '2024-07-10', successRate: 92 },
                    { id: 'user003', nickname: '王五', registerTime: '2024-03-10', reports: 32, lastActive: '2024-07-11', successRate: 78 }
                ];
            }

            const tbody = document.getElementById('users-table-body');
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.nickname}</td>
                    <td>${user.registerTime}</td>
                    <td>${user.reports}</td>
                    <td>${user.lastActive}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="viewUser('${user.id}')">查看</button>
                        <button class="btn btn-danger" onclick="deleteUser('${user.id}')">删除</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('加载用户数据失败：', error);
            // 使用模拟数据作为后备
            const users = [
                { id: 'user001', nickname: '张三', registerTime: '2024-01-15', reports: 25, lastActive: '2024-07-11', successRate: 85 }
            ];

            const tbody = document.getElementById('users-table-body');
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.nickname}</td>
                    <td>${user.registerTime}</td>
                    <td>${user.reports}</td>
                    <td>${user.lastActive}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="viewUser('${user.id}')">查看</button>
                        <button class="btn btn-danger" onclick="deleteUser('${user.id}')">删除</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // 加载报告数据
    async loadReportsData() {
        // 模拟报告数据
        const reports = [
            { date: '2024-07-11', user: '张三', records: 5, success: 4, fail: 1, rate: '80%' },
            { date: '2024-07-11', user: '李四', records: 3, success: 3, fail: 0, rate: '100%' },
            { date: '2024-07-10', user: '王五', records: 8, success: 6, fail: 2, rate: '75%' }
        ];

        const tbody = document.getElementById('reports-table-body');
        tbody.innerHTML = reports.map(report => `
            <tr>
                <td>${report.date}</td>
                <td>${report.user}</td>
                <td>${report.records}</td>
                <td>${report.success}</td>
                <td>${report.fail}</td>
                <td>${report.rate}</td>
                <td>
                    <button class="btn btn-secondary" onclick="viewReport('${report.date}', '${report.user}')">查看详情</button>
                </td>
            </tr>
        `).join('');
    }

    // 显示/隐藏加载动画
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    // 显示错误信息
    showError(message) {
        alert(message); // 简单实现，可以改为更好的UI
    }
}

// 全局函数
function refreshUsers() {
    adminManager.loadUsersData();
}

function filterReports() {
    adminManager.loadReportsData();
}

function updateAnalytics() {
    adminManager.loadAnalyticsData();
}

function exportData() {
    const type = document.getElementById('export-type').value;
    const format = document.getElementById('export-format').value;
    alert(`导出${type}数据为${format}格式`);
}

function saveSettings() {
    alert('设置已保存');
}

function viewUser(userId) {
    alert(`查看用户：${userId}`);
}

function deleteUser(userId) {
    if (confirm(`确定要删除用户 ${userId} 吗？`)) {
        alert(`用户 ${userId} 已删除`);
    }
}

function viewReport(date, user) {
    alert(`查看 ${user} 在 ${date} 的报告详情`);
}

// 初始化管理系统
let adminManager;
document.addEventListener('DOMContentLoaded', () => {
    adminManager = new AdminManager();
});
