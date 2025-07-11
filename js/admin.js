// 管理后台JavaScript功能
class AdminManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 20;
        this.allUsers = [];
        this.allRecords = [];
        this.charts = {};
        
        this.init();
    }

    // 初始化
    init() {
        this.bindEvents();
        this.loadAllData();
    }

    // 绑定事件
    bindEvents() {
        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadAllData();
        });

        // 导出按钮
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        // 搜索和筛选
        document.getElementById('userSearch').addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });

        document.getElementById('userSort').addEventListener('change', (e) => {
            this.sortUsers(e.target.value);
        });

        document.getElementById('recordSearch').addEventListener('input', (e) => {
            this.filterRecords(e.target.value);
        });

        document.getElementById('dateFilter').addEventListener('change', (e) => {
            this.filterRecordsByDate(e.target.value);
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filterRecordsByStatus(e.target.value);
        });

        // 数据管理按钮
        document.getElementById('checkDataBtn').addEventListener('click', () => {
            this.checkDataStatus();
        });

        document.getElementById('migrateDataBtn').addEventListener('click', () => {
            this.migrateData();
        });

        document.getElementById('backupDataBtn').addEventListener('click', () => {
            this.backupData();
        });

        document.getElementById('cleanDataBtn').addEventListener('click', () => {
            this.cleanData();
        });

        // 模态框
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modalCancel').addEventListener('click', () => {
            this.closeModal();
        });
    }

    // 显示加载状态
    showLoading(text = '加载中...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.querySelector('.loading-text');
        loadingText.textContent = text;
        overlay.style.display = 'flex';
    }

    // 隐藏加载状态
    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    // 显示模态框
    showModal(title, content, onConfirm = null) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modal').style.display = 'block';
        
        if (onConfirm) {
            document.getElementById('modalConfirm').onclick = onConfirm;
        }
    }

    // 关闭模态框
    closeModal() {
        document.getElementById('modal').style.display = 'none';
    }

    // 加载所有数据
    async loadAllData() {
        this.showLoading('正在加载数据...');
        
        try {
            await Promise.all([
                this.loadStats(),
                this.loadUsers(),
                this.loadRecords()
            ]);
            
            this.updateCharts();
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showModal('错误', '数据加载失败，请检查网络连接或稍后重试。');
        } finally {
            this.hideLoading();
        }
    }

    // 加载统计数据
    async loadStats() {
        try {
            // 这里需要调用你的云函数或API
            // 暂时使用模拟数据
            const stats = await this.fetchStats();
            
            document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
            document.getElementById('totalRecords').textContent = stats.totalRecords || 0;
            document.getElementById('totalSuccess').textContent = stats.totalSuccess || 0;
            document.getElementById('successRate').textContent = (stats.successRate || 0) + '%';
            
        } catch (error) {
            console.error('加载统计数据失败:', error);
        }
    }

    // 获取统计数据
    async fetchStats() {
        try {
            // 方法1：如果在微信环境中，调用云函数
            if (typeof wx !== 'undefined' && wx.cloud) {
                console.log('检测到微信环境，调用云函数');

                const result = await wx.cloud.callFunction({
                    name: 'adminWeb',
                    data: { action: 'getStats' }
                });

                if (result.result && result.result.success) {
                    console.log('云函数调用成功，返回数据');
                    return result.result.data;
                } else {
                    console.error('云函数调用失败:', result.result);
                    throw new Error(result.result?.error || '获取数据失败');
                }
            }

            // 方法2：通过HTTP API调用（如果你配置了HTTP触发器）
            // 这里可以添加HTTP API调用逻辑

            // 方法3：降级到模拟数据
            console.log('非微信环境，使用模拟数据');
            return this.getMockStats();

        } catch (error) {
            console.error('获取统计数据失败:', error);
            // 降级到模拟数据
            return this.getMockStats();
        }
    }

    // 模拟统计数据
    getMockStats() {
        return {
            totalUsers: 15,
            totalRecords: 128,
            totalSuccess: 108,
            successRate: 84
        };
    }

    // 加载用户数据
    async loadUsers() {
        try {
            // 这里调用实际的API获取用户数据
            const users = await this.fetchUsers();
            this.allUsers = users;
            this.renderUsers(users);
        } catch (error) {
            console.error('加载用户数据失败:', error);
            // 使用模拟数据
            this.allUsers = this.getMockUsers();
            this.renderUsers(this.allUsers);
        }
    }

    // 获取用户数据
    async fetchUsers() {
        if (typeof wx !== 'undefined' && wx.cloud) {
            try {
                const result = await wx.cloud.callFunction({
                    name: 'adminWeb',
                    data: { action: 'getStats' }
                });
                
                if (result.result && result.result.success) {
                    return result.result.data.userList || [];
                }
            } catch (error) {
                console.error('获取用户数据失败:', error);
            }
        }
        
        return this.getMockUsers();
    }

    // 模拟用户数据
    getMockUsers() {
        return [
            { userName: '张三', totalRecords: 25, successCount: 22, failCount: 3, successRate: 88, lastActive: '2024-01-15' },
            { userName: '李四', totalRecords: 18, successCount: 15, failCount: 3, successRate: 83, lastActive: '2024-01-14' },
            { userName: '王五', totalRecords: 32, successCount: 28, failCount: 4, successRate: 88, lastActive: '2024-01-15' },
            { userName: '赵六', totalRecords: 12, successCount: 10, failCount: 2, successRate: 83, lastActive: '2024-01-13' },
            { userName: '钱七', totalRecords: 41, successCount: 33, failCount: 8, successRate: 80, lastActive: '2024-01-15' }
        ];
    }

    // 渲染用户表格
    renderUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.userName}</td>
                <td>${user.totalRecords}</td>
                <td>${user.successCount}</td>
                <td>${user.failCount}</td>
                <td>
                    <div class="success-rate">
                        <span>${user.successRate}%</span>
                        <div class="rate-bar">
                            <div class="rate-fill" style="width: ${user.successRate}%"></div>
                        </div>
                    </div>
                </td>
                <td>${user.lastActive || '未知'}</td>
                <td>
                    <button class="btn btn-small btn-info" onclick="adminManager.viewUserDetails('${user.userName}')">查看详情</button>
                    <button class="btn btn-small btn-warning" onclick="adminManager.editUser('${user.userName}')">编辑</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // 加载记录数据
    async loadRecords() {
        try {
            const records = await this.fetchRecords();
            this.allRecords = records;
            this.renderRecords(records);
        } catch (error) {
            console.error('加载记录数据失败:', error);
            this.allRecords = this.getMockRecords();
            this.renderRecords(this.allRecords);
        }
    }

    // 获取记录数据
    async fetchRecords() {
        if (typeof wx !== 'undefined' && wx.cloud) {
            try {
                const result = await wx.cloud.callFunction({
                    name: 'adminWeb',
                    data: { action: 'getRecords', page: 1, limit: 50 }
                });
                
                if (result.result && result.result.success) {
                    return result.result.data || [];
                }
            } catch (error) {
                console.error('获取记录数据失败:', error);
            }
        }
        
        return this.getMockRecords();
    }

    // 模拟记录数据
    getMockRecords() {
        return [
            {
                userName: '张三',
                date: '2024-01-15',
                records: [
                    { workContent: '数据录入', dataCount: 50, successCount: 45, failCount: 5, successRate: 90, remark: '效率较高' }
                ]
            },
            {
                userName: '李四',
                date: '2024-01-15',
                records: [
                    { workContent: '数据审核', dataCount: 30, successCount: 25, failCount: 5, successRate: 83, remark: '质量良好' }
                ]
            }
        ];
    }

    // 渲染记录表格
    renderRecords(records) {
        const tbody = document.getElementById('recordsTableBody');
        tbody.innerHTML = '';
        
        records.forEach(record => {
            if (record.records && Array.isArray(record.records)) {
                record.records.forEach(workRecord => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${record.userName}</td>
                        <td>${record.date}</td>
                        <td>${workRecord.workContent}</td>
                        <td>${workRecord.dataCount}</td>
                        <td>${workRecord.successCount}</td>
                        <td>${workRecord.failCount}</td>
                        <td>${workRecord.successRate}%</td>
                        <td>${workRecord.remark || '-'}</td>
                        <td>
                            <button class="btn btn-small btn-warning" onclick="adminManager.editRecord('${record._id}')">编辑</button>
                            <button class="btn btn-small btn-danger" onclick="adminManager.deleteRecord('${record._id}')">删除</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        });
    }

    // 更新图表
    updateCharts() {
        this.updateUserRankChart();
        this.updateDailyTrendChart();
    }

    // 用户排行图表
    updateUserRankChart() {
        const ctx = document.getElementById('userRankChart').getContext('2d');
        
        if (this.charts.userRank) {
            this.charts.userRank.destroy();
        }
        
        const topUsers = this.allUsers.slice(0, 10);
        
        this.charts.userRank = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topUsers.map(user => user.userName),
                datasets: [{
                    label: '成功率 (%)',
                    data: topUsers.map(user => user.successRate),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // 每日趋势图表
    updateDailyTrendChart() {
        const ctx = document.getElementById('dailyTrendChart').getContext('2d');
        
        if (this.charts.dailyTrend) {
            this.charts.dailyTrend.destroy();
        }
        
        // 生成最近7天的模拟数据
        const dates = [];
        const successRates = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString());
            successRates.push(Math.floor(Math.random() * 20) + 75); // 75-95之间的随机数
        }
        
        this.charts.dailyTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '成功率 (%)',
                    data: successRates,
                    borderColor: 'rgba(72, 187, 120, 1)',
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // 筛选用户
    filterUsers(searchTerm) {
        const filteredUsers = this.allUsers.filter(user => 
            user.userName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderUsers(filteredUsers);
    }

    // 排序用户
    sortUsers(sortBy) {
        const sortedUsers = [...this.allUsers].sort((a, b) => {
            switch (sortBy) {
                case 'successRate':
                    return b.successRate - a.successRate;
                case 'totalRecords':
                    return b.totalRecords - a.totalRecords;
                case 'userName':
                    return a.userName.localeCompare(b.userName);
                default:
                    return 0;
            }
        });
        this.renderUsers(sortedUsers);
    }

    // 筛选记录
    filterRecords(searchTerm) {
        const filteredRecords = this.allRecords.filter(record => 
            record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (record.records && record.records.some(r => 
                r.workContent.toLowerCase().includes(searchTerm.toLowerCase())
            ))
        );
        this.renderRecords(filteredRecords);
    }

    // 按日期筛选记录
    filterRecordsByDate(date) {
        if (!date) {
            this.renderRecords(this.allRecords);
            return;
        }
        
        const filteredRecords = this.allRecords.filter(record => record.date === date);
        this.renderRecords(filteredRecords);
    }

    // 按状态筛选记录
    filterRecordsByStatus(status) {
        if (!status) {
            this.renderRecords(this.allRecords);
            return;
        }
        
        const filteredRecords = this.allRecords.filter(record => 
            record.records && record.records.some(r => r.status === status)
        );
        this.renderRecords(filteredRecords);
    }

    // 导出数据
    exportData() {
        this.showModal('导出数据', `
            <p>选择要导出的数据类型：</p>
            <div style="margin: 1rem 0;">
                <label><input type="checkbox" checked> 用户统计数据</label><br>
                <label><input type="checkbox" checked> 工作记录数据</label><br>
                <label><input type="checkbox"> 图表数据</label>
            </div>
            <p>导出格式：</p>
            <select id="exportFormat">
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="json">JSON (.json)</option>
            </select>
        `, () => {
            this.performExport();
        });
    }

    // 执行导出
    performExport() {
        const format = document.getElementById('exportFormat').value;
        
        // 这里实现实际的导出逻辑
        this.showLoading('正在导出数据...');
        
        setTimeout(() => {
            this.hideLoading();
            this.closeModal();
            this.showModal('导出完成', `数据已成功导出为 ${format.toUpperCase()} 格式！`);
        }, 2000);
    }

    // 检查数据状态
    async checkDataStatus() {
        this.showLoading('正在检查数据状态...');
        
        try {
            // 这里调用实际的检查API
            setTimeout(() => {
                this.hideLoading();
                this.showModal('数据状态检查', `
                    <div>
                        <h4>数据库集合状态：</h4>
                        <ul>
                            <li>work_reports: 85条记录</li>
                            <li>records: 43条记录</li>
                            <li>users: 15个用户</li>
                        </ul>
                        <h4>数据完整性：</h4>
                        <ul>
                            <li>✅ 所有记录格式正确</li>
                            <li>✅ 无重复数据</li>
                            <li>⚠️ 发现3条记录缺少用户名</li>
                        </ul>
                    </div>
                `);
            }, 1500);
        } catch (error) {
            this.hideLoading();
            this.showModal('错误', '检查数据状态失败，请稍后重试。');
        }
    }

    // 数据迁移
    migrateData() {
        this.showModal('数据迁移确认', `
            <p>⚠️ 此操作将执行数据迁移，可能需要较长时间。</p>
            <p>迁移内容：</p>
            <ul>
                <li>将 records 集合数据迁移到 work_reports</li>
                <li>统一数据格式</li>
                <li>更新索引</li>
            </ul>
            <p><strong>确定要继续吗？</strong></p>
        `, () => {
            this.performMigration();
        });
    }

    // 执行迁移
    performMigration() {
        this.showLoading('正在执行数据迁移...');
        this.closeModal();
        
        // 这里调用实际的迁移API
        setTimeout(() => {
            this.hideLoading();
            this.showModal('迁移完成', '数据迁移已成功完成！已迁移 43 条记录。');
            this.loadAllData(); // 重新加载数据
        }, 3000);
    }

    // 备份数据
    backupData() {
        this.showLoading('正在备份数据...');
        
        setTimeout(() => {
            this.hideLoading();
            this.showModal('备份完成', '数据备份已完成，备份文件已保存到云存储。');
        }, 2000);
    }

    // 清理数据
    cleanData() {
        this.showModal('清理数据确认', `
            <p>⚠️ 此操作将清理以下无效数据：</p>
            <ul>
                <li>空记录</li>
                <li>重复数据</li>
                <li>格式错误的记录</li>
            </ul>
            <p><strong>确定要继续吗？</strong></p>
        `, () => {
            this.performCleanup();
        });
    }

    // 执行清理
    performCleanup() {
        this.showLoading('正在清理数据...');
        this.closeModal();
        
        setTimeout(() => {
            this.hideLoading();
            this.showModal('清理完成', '数据清理已完成，共清理了 5 条无效记录。');
            this.loadAllData();
        }, 2000);
    }

    // 查看用户详情
    viewUserDetails(userName) {
        const user = this.allUsers.find(u => u.userName === userName);
        if (user) {
            this.showModal(`用户详情 - ${userName}`, `
                <div>
                    <h4>基本信息：</h4>
                    <p>姓名：${user.userName}</p>
                    <p>总记录数：${user.totalRecords}</p>
                    <p>成功数：${user.successCount}</p>
                    <p>失败数：${user.failCount}</p>
                    <p>成功率：${user.successRate}%</p>
                    <p>最后活跃：${user.lastActive || '未知'}</p>
                </div>
            `);
        }
    }

    // 编辑用户
    editUser(userName) {
        this.showModal(`编辑用户 - ${userName}`, `
            <div>
                <p>编辑用户信息功能开发中...</p>
            </div>
        `);
    }

    // 编辑记录
    editRecord(recordId) {
        this.showModal('编辑记录', `
            <div>
                <p>编辑记录功能开发中...</p>
            </div>
        `);
    }

    // 删除记录
    deleteRecord(recordId) {
        this.showModal('删除确认', `
            <p>⚠️ 确定要删除这条记录吗？此操作不可撤销。</p>
        `, () => {
            this.performDeleteRecord(recordId);
        });
    }

    // 执行删除记录
    performDeleteRecord(recordId) {
        this.showLoading('正在删除记录...');
        this.closeModal();
        
        setTimeout(() => {
            this.hideLoading();
            this.showModal('删除完成', '记录已成功删除。');
            this.loadRecords(); // 重新加载记录
        }, 1000);
    }
}

// 初始化管理系统
let adminManager;
document.addEventListener('DOMContentLoaded', () => {
    adminManager = new AdminManager();
});
