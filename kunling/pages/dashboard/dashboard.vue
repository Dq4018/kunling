<template>
	<view class="dashboard">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-content">
				<view class="nav-left">
					<text class="user-name">{{currentUser.name}}</text>
					<text class="nav-title">知识产权管理</text>
				</view>
				<view class="nav-icons">
					<view class="icon-item" @click="onSearchClick">
						<uni-icons type="search" size="20" color="#333"></uni-icons>
					</view>
					<view class="icon-item" @click="onNotificationClick">
						<uni-icons type="notification" size="20" color="#333"></uni-icons>
						<view v-if="unreadCount > 0" class="badge">{{unreadCount > 99 ? '99+' : unreadCount}}</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 核心数据卡片区域 -->
		<scroll-view class="content" scroll-y="true">
			<!-- 专利概况卡片 -->
			<view class="card" @click="onPatentClick">
				<view class="card-header">
					<text class="card-title">专利概况</text>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
				<view class="card-content">
					<view class="stats-row">
						<view class="stat-item">
							<text class="stat-number">{{patentStats.total}}</text>
							<text class="stat-label">总数</text>
						</view>
						<view class="stat-item">
							<text class="stat-number pending">{{patentStats.pending}}</text>
							<text class="stat-label">待审</text>
						</view>
						<view class="stat-item">
							<text class="stat-number approved">{{patentStats.approved}}</text>
							<text class="stat-label">已授权</text>
						</view>
					</view>
					<!-- 简单的饼图展示 -->
					<view class="chart-container">
						<view class="pie-chart">
							<view class="pie-slice pending-slice" :style="{transform: 'rotate(' + pendingAngle + 'deg)'}"></view>
							<view class="pie-slice approved-slice" :style="{transform: 'rotate(' + approvedAngle + 'deg)'}"></view>
						</view>
						<view class="chart-legend">
							<view class="legend-item">
								<view class="legend-color pending-color"></view>
								<text class="legend-text">待审</text>
							</view>
							<view class="legend-item">
								<view class="legend-color approved-color"></view>
								<text class="legend-text">已授权</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 商标概况卡片 -->
			<view class="card" @click="onTrademarkClick">
				<view class="card-header">
					<text class="card-title">商标概况</text>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
				<view class="card-content">
					<view class="stats-row">
						<view class="stat-item">
							<text class="stat-number">{{trademarkStats.total}}</text>
							<text class="stat-label">总数</text>
						</view>
						<view class="stat-item">
							<text class="stat-number pending">{{trademarkStats.pending}}</text>
							<text class="stat-label">待审</text>
						</view>
						<view class="stat-item">
							<text class="stat-number registered">{{trademarkStats.registered}}</text>
							<text class="stat-label">已注册</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 风险预警卡片 -->
			<view class="card" @click="onRiskClick">
				<view class="card-header">
					<text class="card-title">风险预警</text>
					<uni-icons type="right" size="16" color="#999"></uni-icons>
				</view>
				<view class="card-content">
					<view v-if="riskAlerts.length === 0" class="no-data">
						<text class="no-data-text">暂无风险预警</text>
					</view>
					<view v-else class="risk-list">
						<view v-for="(item, index) in riskAlerts.slice(0, 3)" :key="index" class="risk-item" @click.stop="onRiskItemClick(item)">
							<view class="risk-content">
								<view class="risk-level" :class="'level-' + item.level"></view>
								<text class="risk-title">{{item.title}}</text>
							</view>
							<text class="risk-time">{{formatTime(item.time)}}</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 底部快速操作按钮 -->
		<view class="bottom-actions">
			<view class="action-btn primary" @click="onAddRegistrationClick">
				<uni-icons type="plus" size="20" color="#fff"></uni-icons>
				<text class="btn-text">新增登记</text>
			</view>
			<view class="action-btn secondary" @click="onMonitorSettingsClick">
				<uni-icons type="settings" size="20" color="#fff"></uni-icons>
				<text class="btn-text">监控设置</text>
			</view>
		</view>
		
		<!-- 版权信息 -->
		<view class="copyright">
			<text class="copyright-text">© 2024 昆灵科技 知识产权管理系统 v1.0</text>
			<text class="monitor-info">当前监控用户：{{currentUser.name}} ({{currentUser.role}})</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 未读通知数量
			unreadCount: 5,
			// 专利统计数据
			patentStats: {
				total: 156,
				pending: 23,
				approved: 133
			},
			// 商标统计数据
			trademarkStats: {
				total: 89,
				pending: 12,
				registered: 77
			},
			// 风险预警数据
			riskAlerts: [
				{
					id: 1,
					title: '专利ZL202301234567即将到期',
					level: 'high',
					time: new Date(Date.now() - 2 * 60 * 60 * 1000)
				},
				{
					id: 2,
					title: '商标"昆灵科技"续展提醒',
					level: 'medium',
					time: new Date(Date.now() - 5 * 60 * 60 * 1000)
				},
				{
					id: 3,
					title: '发现疑似侵权产品',
					level: 'high',
					time: new Date(Date.now() - 8 * 60 * 60 * 1000)
				}
			],
			// 当前用户信息
			currentUser: {
				name: '张三',
				id: 'user001',
				role: '知识产权管理员'
			}
		}
	},
	computed: {
		// 计算饼图角度
		pendingAngle() {
			if (this.patentStats.total === 0) return 0;
			return (this.patentStats.pending / this.patentStats.total) * 360;
		},
		approvedAngle() {
			if (this.patentStats.total === 0) return 0;
			return this.pendingAngle + (this.patentStats.approved / this.patentStats.total) * 360;
		}
	},
	onLoad() {
		// 页面加载时获取数据
		this.loadDashboardData();
	},
	onShow() {
		// 页面显示时刷新数据
		this.refreshData();
	},
	methods: {
		// 加载仪表盘数据
		loadDashboardData() {
			// 这里可以调用API获取真实数据
			console.log('加载仪表盘数据');
		},
		// 刷新数据
		refreshData() {
			// 刷新统计数据和风险预警
			console.log('刷新数据');
		},
		// 格式化时间
		formatTime(time) {
			const now = new Date();
			const diff = now - time;
			const hours = Math.floor(diff / (1000 * 60 * 60));
			if (hours < 1) {
				return '刚刚';
			} else if (hours < 24) {
				return hours + '小时前';
			} else {
				const days = Math.floor(hours / 24);
				return days + '天前';
			}
		},
		// 点击事件处理
		onSearchClick() {
			uni.navigateTo({
				url: '/pages/search/search'
			});
		},
		onNotificationClick() {
			uni.navigateTo({
				url: '/pages/notification/notification'
			});
		},
		onPatentClick() {
			uni.navigateTo({
				url: '/pages/patent/list'
			});
		},
		onTrademarkClick() {
			uni.navigateTo({
				url: '/pages/trademark/list'
			});
		},
		onRiskClick() {
			uni.navigateTo({
				url: '/pages/risk/list'
			});
		},
		onRiskItemClick(item) {
			uni.navigateTo({
				url: '/pages/risk/detail?id=' + item.id
			});
		},
		onAddRegistrationClick() {
			uni.navigateTo({
				url: '/pages/register/register'
			});
		},
		onMonitorSettingsClick() {
			uni.navigateTo({
				url: '/pages/monitor/settings'
			});
		}
	}
}
</script>

<style scoped>
.dashboard {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f5f5f5;
}

/* 顶部导航栏 */
.nav-bar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1000;
	background-color: #fff;
	border-bottom: 1px solid #e5e5e5;
	padding-top: 44px;
}

.nav-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 44px;
	padding: 0 16px;
}

.nav-left {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.user-name {
	font-size: 12px;
	color: #666;
	font-weight: 400;
}

.nav-title {
	font-size: 18px;
	font-weight: 600;
	color: #333;
}

.nav-icons {
	display: flex;
	align-items: center;
	gap: 16px;
}

.icon-item {
	position: relative;
	padding: 4px;
}

.badge {
	position: absolute;
	top: -2px;
	right: -2px;
	background-color: #ff4757;
	color: #fff;
	font-size: 10px;
	padding: 1px 4px;
	border-radius: 8px;
	min-width: 16px;
	height: 16px;
	line-height: 14px;
	text-align: center;
}

/* 内容区域 */
.content {
	flex: 1;
	padding: 88px 16px 120px;
}

/* 卡片样式 */
.card {
	background-color: #fff;
	border-radius: 8px;
	margin-bottom: 16px;
	padding: 16px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.card-title {
	font-size: 16px;
	font-weight: 600;
	color: #333;
}

.card-content {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

/* 统计数据行 */
.stats-row {
	display: flex;
	justify-content: space-around;
	align-items: center;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.stat-number {
	font-size: 24px;
	font-weight: 700;
	color: #333;
}

.stat-number.pending {
	color: #ff9500;
}

.stat-number.approved {
	color: #34c759;
}

.stat-number.registered {
	color: #007aff;
}

.stat-label {
	font-size: 12px;
	color: #666;
}

/* 图表容器 */
.chart-container {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.pie-chart {
	position: relative;
	width: 60px;
	height: 60px;
	border-radius: 50%;
	background-color: #e5e5e5;
	overflow: hidden;
}

.pie-slice {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 50%;
	transform-origin: center;
}

.pending-slice {
	background: #ff9500;
	clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%);
}

.approved-slice {
	background: #34c759;
	clip-path: polygon(50% 50%, 100% 50%, 100% 100%, 0% 100%, 0% 0%, 50% 0%);
}

.chart-legend {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.legend-item {
	display: flex;
	align-items: center;
	gap: 6px;
}

.legend-color {
	width: 12px;
	height: 12px;
	border-radius: 2px;
}

.pending-color {
	background-color: #ff9500;
}

.approved-color {
	background-color: #34c759;
}

.legend-text {
	font-size: 12px;
	color: #666;
}

/* 无数据状态 */
.no-data {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.no-data-text {
	font-size: 14px;
	color: #999;
}

/* 风险列表 */
.risk-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.risk-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 0;
	border-bottom: 1px solid #f0f0f0;
}

.risk-item:last-child {
	border-bottom: none;
}

.risk-content {
	display: flex;
	align-items: center;
	gap: 8px;
	flex: 1;
}

.risk-level {
	width: 6px;
	height: 6px;
	border-radius: 50%;
}

.level-high {
	background-color: #ff4757;
}

.level-medium {
	background-color: #ff9500;
}

.level-low {
	background-color: #34c759;
}

.risk-title {
	font-size: 14px;
	color: #333;
	flex: 1;
}

.risk-time {
	font-size: 12px;
	color: #999;
}

/* 底部操作按钮 */
.bottom-actions {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	gap: 12px;
	padding: 12px 16px;
	padding-bottom: calc(12px + env(safe-area-inset-bottom));
	background-color: #fff;
	border-top: 1px solid #e5e5e5;
}

.action-btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	height: 44px;
	border-radius: 8px;
	font-weight: 500;
}

.action-btn.primary {
	background-color: #007aff;
}

.action-btn.secondary {
	background-color: #34c759;
}

.btn-text {
	font-size: 14px;
	color: #fff;
}

/* 版权信息 */
.copyright {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #f8f8f8;
	border-top: 1px solid #e5e5e5;
	padding: 8px 16px;
	padding-bottom: calc(8px + env(safe-area-inset-bottom));
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2px;
	z-index: 999;
}

.copyright-text {
	font-size: 10px;
	color: #999;
	text-align: center;
}

.monitor-info {
	font-size: 10px;
	color: #666;
	text-align: center;
	font-weight: 500;
}
</style>