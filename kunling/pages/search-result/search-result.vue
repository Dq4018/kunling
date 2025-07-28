<template>
	<view class="search-result-container">
		<!-- 顶部导航栏 -->
		<view class="top-nav">
			<uni-icons type="back" size="24" color="#333" @click="goBack"></uni-icons>
			<view class="nav-title">查询结果</view>
			<view class="nav-placeholder"></view>
		</view>

		<!-- 搜索信息 -->
		<view class="search-info">
			<text class="search-keyword">"{{ keyword }}"</text>
			<text class="search-type">{{ type }}</text>
			<text class="result-count">共找到 {{ resultList.length }} 条结果</text>
		</view>

		<!-- 筛选栏 -->
		<view class="filter-bar">
			<view class="filter-item" @click="showSortPicker">
				<text>{{ sortOptions[sortIndex] }}</text>
				<uni-icons type="arrowdown" size="16" color="#666"></uni-icons>
			</view>
			<view class="filter-item" @click="showStatusPicker">
				<text>{{ statusOptions[statusIndex] }}</text>
				<uni-icons type="arrowdown" size="16" color="#666"></uni-icons>
			</view>
		</view>

		<!-- 结果列表 -->
		<scroll-view class="result-list" scroll-y="true" @scrolltolower="loadMore">
			<view class="result-item" v-for="(item, index) in resultList" :key="index" @click="onItemClick(item)">
				<view class="item-header">
					<text class="item-name">{{ item.name }}</text>
					<view class="item-type" :class="{
						'type-invention': item.type === '发明专利',
						'type-utility': item.type === '实用新型',
						'type-design': item.type === '外观设计',
						'type-trademark': item.type === '商标',
						'type-copyright': item.type === '版权',
						'type-default': !['发明专利', '实用新型', '外观设计', '商标', '版权'].includes(item.type)
					}">{{ item.type }}</view>
				</view>
				<view class="item-info">
					<text class="item-number">{{ item.number }}</text>
					<text class="item-applicant">申请人：{{ item.applicant }}</text>
				</view>
				<view class="item-footer">
					<view class="item-status" :class="{
						'status-granted': item.status === '已授权',
						'status-pending': item.status === '审查中',
						'status-rejected': item.status === '已驳回',
						'status-expired': item.status === '已失效',
						'status-default': !['已授权', '审查中', '已驳回', '已失效'].includes(item.status)
					}">{{ item.status }}</view>
					<text class="item-date">{{ item.date }}</text>
				</view>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="hasMore">
				<text>加载更多...</text>
			</view>
			<view class="no-more" v-else-if="resultList.length > 0">
				<text>没有更多数据了</text>
			</view>
		</scroll-view>

		<!-- 空状态 -->
		<view class="empty-state" v-if="resultList.length === 0 && !loading">
			<uni-icons type="search" size="80" color="#ccc"></uni-icons>
			<text class="empty-text">未找到相关结果</text>
			<text class="empty-tip">请尝试其他关键词或筛选条件</text>
		</view>

		<!-- 排序选择器 -->
		<uni-popup ref="sortPopup" type="bottom">
			<view class="picker-content">
				<view class="picker-header">
					<text class="picker-title">排序方式</text>
					<uni-icons type="close" size="24" color="#666" @click="closeSortPicker"></uni-icons>
				</view>
				<view class="picker-options">
					<view class="picker-option" v-for="(option, index) in sortOptions" :key="index" @click="selectSort(index)">
						<text :class="{ active: sortIndex === index }">{{ option }}</text>
						<uni-icons v-if="sortIndex === index" type="checkmarkempty" size="20" color="#007AFF"></uni-icons>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 状态选择器 -->
		<uni-popup ref="statusPopup" type="bottom">
			<view class="picker-content">
				<view class="picker-header">
					<text class="picker-title">状态筛选</text>
					<uni-icons type="close" size="24" color="#666" @click="closeStatusPicker"></uni-icons>
				</view>
				<view class="picker-options">
					<view class="picker-option" v-for="(option, index) in statusOptions" :key="index" @click="selectStatus(index)">
						<text :class="{ active: statusIndex === index }">{{ option }}</text>
						<uni-icons v-if="statusIndex === index" type="checkmarkempty" size="20" color="#007AFF"></uni-icons>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			keyword: '',
			type: '',
			sortIndex: 0,
			statusIndex: 0,
			sortOptions: ['相关度', '时间倒序', '时间正序'],
			statusOptions: ['全部状态', '已授权', '审查中', '已驳回', '已失效'],
			resultList: [],
			loading: false,
			hasMore: true,
			page: 1,
			pageSize: 20
		}
	},
	onLoad(options) {
		this.keyword = options.keyword || '';
		this.type = options.type || '全部';
		this.loadData();
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},
		loadData() {
			this.loading = true;
			setTimeout(() => {
				const mockData = this.generateMockData();
				if (this.page === 1) {
					this.resultList = mockData;
				} else {
					this.resultList = [...this.resultList, ...mockData];
				}
				this.loading = false;
				this.hasMore = mockData.length === this.pageSize;
			}, 1000);
		},
		generateMockData() {
			const types = ['发明专利', '实用新型', '外观设计', '商标', '版权'];
			const statuses = ['已授权', '审查中', '已驳回', '已失效'];
			const companies = ['华为技术有限公司', '腾讯科技有限公司', '阿里巴巴集团', '百度在线网络技术有限公司', '小米科技有限公司'];
			
			const data = [];
			for (let i = 0; i < this.pageSize; i++) {
				const typeIndex = Math.floor(Math.random() * types.length);
				const statusIndex = Math.floor(Math.random() * statuses.length);
				const companyIndex = Math.floor(Math.random() * companies.length);
				
				data.push({
					id: (this.page - 1) * this.pageSize + i + 1,
					name: `${this.keyword}相关技术方案${i + 1}`,
					number: `CN${Math.floor(Math.random() * 900000000) + 100000000}`,
					type: types[typeIndex],
					status: statuses[statusIndex],
					applicant: companies[companyIndex],
					date: `2024-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
				});
			}
			return data;
		},
		loadMore() {
			if (!this.loading && this.hasMore) {
				this.page++;
				this.loadData();
			}
		},
		showSortPicker() {
			this.$refs.sortPopup.open();
		},
		closeSortPicker() {
			this.$refs.sortPopup.close();
		},
		selectSort(index) {
			this.sortIndex = index;
			this.closeSortPicker();
			this.page = 1;
			this.loadData();
		},
		showStatusPicker() {
			this.$refs.statusPopup.open();
		},
		closeStatusPicker() {
			this.$refs.statusPopup.close();
		},
		selectStatus(index) {
			this.statusIndex = index;
			this.closeStatusPicker();
			this.page = 1;
			this.loadData();
		},
		onItemClick(item) {
			console.log('点击项目', item);
			uni.navigateTo({
				url: `/pages/detail/detail?id=${item.id}&type=${item.type}`
			});
		}
	}
}
</script>

<style scoped>
.search-result-container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

/* 顶部导航栏 */
.top-nav {
	height: 88rpx;
	padding: 0 32rpx;
	background-color: #fff;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1000;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.nav-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.nav-placeholder {
	width: 48rpx;
}

/* 搜索信息 */
.search-info {
	margin: 108rpx 32rpx 24rpx;
	padding: 24rpx;
	background-color: #fff;
	border-radius: 12rpx;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 16rpx;
}

.search-keyword {
	font-size: 28rpx;
	font-weight: bold;
	color: #007AFF;
}

.search-type {
	font-size: 24rpx;
	color: #666;
	padding: 4rpx 12rpx;
	background-color: #f0f0f0;
	border-radius: 12rpx;
}

.result-count {
	font-size: 24rpx;
	color: #999;
}

/* 筛选栏 */
.filter-bar {
	margin: 0 32rpx 24rpx;
	padding: 0 24rpx;
	background-color: #fff;
	border-radius: 12rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	gap: 32rpx;
}

.filter-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
	font-size: 28rpx;
	color: #333;
}

/* 结果列表 */
.result-list {
	padding: 0 32rpx;
	height: calc(100vh - 300rpx);
}

.result-item {
	padding: 24rpx;
	margin-bottom: 24rpx;
	background-color: #fff;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.item-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.item-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	flex: 1;
	margin-right: 16rpx;
}

.item-type {
	font-size: 20rpx;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	color: #fff;
}

.type-invention {
	background-color: #007AFF;
}

.type-utility {
	background-color: #28a745;
}

.type-design {
	background-color: #ffc107;
}

.type-trademark {
	background-color: #dc3545;
}

.type-copyright {
	background-color: #6f42c1;
}

.type-default {
	background-color: #6c757d;
}

.item-info {
	margin-bottom: 16rpx;
}

.item-number {
	font-size: 24rpx;
	color: #666;
	display: block;
	margin-bottom: 8rpx;
}

.item-applicant {
	font-size: 24rpx;
	color: #666;
}

.item-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.item-status {
	font-size: 20rpx;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	color: #fff;
}

.status-granted {
	background-color: #28a745;
}

.status-pending {
	background-color: #ffc107;
}

.status-rejected {
	background-color: #dc3545;
}

.status-expired {
	background-color: #6c757d;
}

.status-default {
	background-color: #6c757d;
}

.item-date {
	font-size: 20rpx;
	color: #999;
}

/* 加载状态 */
.load-more, .no-more {
	padding: 32rpx;
	text-align: center;
	font-size: 24rpx;
	color: #999;
}

/* 空状态 */
.empty-state {
	padding: 120rpx 32rpx;
	text-align: center;
}

.empty-text {
	font-size: 28rpx;
	color: #666;
	display: block;
	margin: 24rpx 0 12rpx;
}

.empty-tip {
	font-size: 24rpx;
	color: #999;
}

/* 选择器样式 */
.picker-content {
	background-color: #fff;
	border-radius: 24rpx 24rpx 0 0;
	max-height: 60vh;
}

.picker-header {
	padding: 32rpx;
	border-bottom: 2rpx solid #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.picker-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.picker-options {
	padding: 0 32rpx 32rpx;
}

.picker-option {
	padding: 24rpx 0;
	border-bottom: 2rpx solid #f8f8f8;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 28rpx;
	color: #333;
}

.picker-option:last-child {
	border-bottom: none;
}

.picker-option text.active {
	color: #007AFF;
	font-weight: bold;
}
</style>