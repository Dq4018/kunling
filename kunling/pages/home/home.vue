<template>
	<view class="home-container">
		<!-- 顶部导航栏 -->
		<view class="top-nav">
			<view class="nav-actions">
				<uni-icons type="search" size="24" color="#333" @click="onSearchClick"></uni-icons>
				<uni-icons type="contact" size="24" color="#333" @click="onLoginClick" style="margin-left: 20rpx;"></uni-icons>
			</view>
		</view>

		<!-- 查询区域 -->
		<view class="search-card">
			<view class="search-input-wrapper">
				<input class="search-input" v-model="searchKeyword" placeholder="请输入专利号、商标名或公司名" />
			</view>
			<view class="search-type-wrapper">
				<picker @change="onTypeChange" :value="typeIndex" :range="typeOptions">
					<view class="type-selector">
						{{ typeOptions[typeIndex] }}
						<uni-icons type="arrowdown" size="16" color="#666"></uni-icons>
					</view>
				</picker>
			</view>
			<button class="search-btn" @click="onSearchSubmit">查询</button>
		</view>

		<!-- 营销区域 -->
		<scroll-view class="marketing-area" scroll-y="true">
			<!-- 轮播图 -->
			<swiper class="banner-swiper" :autoplay="true" :interval="3000" :duration="500" :circular="true">
				<swiper-item v-for="(banner, index) in banners" :key="index">
					<view class="banner-item" @click="onBannerClick(banner)">
						<image :src="banner.image" class="banner-image"></image>
						<view class="banner-overlay">
							<text class="banner-title">{{ banner.title }}</text>
							<text class="banner-desc">{{ banner.desc }}</text>
						</view>
					</view>
				</swiper-item>
			</swiper>

			<!-- 成功案例 -->
			<view class="section">
				<view class="section-title">成功案例</view>
				<view class="case-list">
					<view class="case-item" v-for="(caseItem, index) in cases" :key="index" @click="onCaseClick(caseItem)">
						<image :src="caseItem.image" class="case-image"></image>
						<view class="case-content">
							<text class="case-title">{{ caseItem.title }}</text>
							<text class="case-desc">{{ caseItem.desc }}</text>
							<button class="case-btn">了解更多</button>
						</view>
					</view>
				</view>
			</view>

			<!-- 行业资讯 -->
			<view class="section">
				<view class="section-title">行业资讯</view>
				<view class="news-list">
					<view class="news-item" v-for="(news, index) in newsList" :key="index" @click="onNewsClick(news)">
						<view class="news-content">
							<text class="news-title">{{ news.title }}</text>
							<text class="news-summary">{{ news.summary }}</text>
							<text class="news-time">{{ news.time }}</text>
						</view>
						<image :src="news.image" class="news-image"></image>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 底部快速操作 -->
		<view class="bottom-actions">
			<button class="action-btn submit-btn" @click="onSubmitRequest">提交诉求</button>
			<button class="action-btn contact-btn" @click="onContactUs">联系我们</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			searchKeyword: '',
			typeIndex: 0,
			typeOptions: ['全部', '专利', '商标', '版权'],
			banners: [
				{
					id: 1,
					title: '专利申请8折优惠',
					desc: '限时优惠，专业服务',
					image: '/static/banner1.svg'
				},
				{
					id: 2,
					title: '商标注册特惠',
					desc: '快速注册，保护品牌',
					image: '/static/banner2.svg'
				},
				{
					id: 3,
					title: '版权登记服务',
					desc: '原创保护，权益维护',
					image: '/static/banner3.svg'
				}
			],
			cases: [
				{
					id: 1,
					title: '某科技公司专利申请',
					desc: '成功申请发明专利20项，实用新型专利15项',
					image: '/static/case1.svg'
				},
				{
					id: 2,
					title: '知名品牌商标保护',
					desc: '全类别商标注册，品牌全方位保护',
					image: '/static/case2.svg'
				},
				{
					id: 3,
					title: '软件著作权登记',
					desc: '快速完成软件著作权登记，保护核心技术',
					image: '/static/case3.svg'
				}
			],
			newsList: [
				{
					id: 1,
					title: '2024年知识产权保护新政策发布',
					summary: '国家知识产权局发布最新保护政策，加强创新成果保护力度',
					time: '2024-01-15',
					image: '/static/news1.svg'
				},
				{
					id: 2,
					title: '专利申请流程优化，审查周期缩短',
					summary: '新的专利申请流程将大幅缩短审查周期，提高申请效率',
					time: '2024-01-12',
					image: '/static/news2.svg'
				},
				{
					id: 3,
					title: '商标侵权案例分析及防范措施',
					summary: '深度解析近期商标侵权案例，提供有效防范建议',
					time: '2024-01-10',
					image: '/static/news3.svg'
				}
			]
		}
	},
	onLoad() {
		// 页面加载时的初始化
	},
	methods: {
		onSearchClick() {
			// 点击搜索图标
			console.log('搜索图标点击');
		},
		onLoginClick() {
			// 点击登录/注册
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
			});
		},
		onTypeChange(e) {
			this.typeIndex = e.detail.value;
		},
		onSearchSubmit() {
			if (!this.searchKeyword.trim()) {
				uni.showToast({
					title: '请输入查询关键词',
					icon: 'none'
				});
				return;
			}
			// 跳转到查询结果页面
			uni.navigateTo({
				url: `/pages/search-result/search-result?keyword=${this.searchKeyword}&type=${this.typeOptions[this.typeIndex]}`
			});
		},
		onBannerClick(banner) {
			console.log('轮播图点击', banner);
			// 跳转到活动详情页
		},
		onCaseClick(caseItem) {
			console.log('案例点击', caseItem);
			// 跳转到案例详情页
		},
		onNewsClick(news) {
			console.log('资讯点击', news);
			// 跳转到资讯详情页
		},
		onSubmitRequest() {
			// 检查登录状态
			const token = uni.getStorageSync('uni_id_token');
			if (!token) {
				uni.showModal({
					title: '提示',
					content: '请先登录或注册',
					confirmText: '去登录',
					success: (res) => {
						if (res.confirm) {
							uni.navigateTo({
								url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
							});
						}
					}
				});
				return;
			}
			// 跳转到诉求提交页面
			uni.navigateTo({
				url: '/pages/request/request'
			});
		},
		onContactUs() {
			// 联系我们
			uni.showActionSheet({
				itemList: ['拨打电话', '在线客服'],
				success: (res) => {
					if (res.tapIndex === 0) {
						// 拨打电话
						uni.makePhoneCall({
							phoneNumber: '18964317905'
						});
					} else if (res.tapIndex === 1) {
						// 在线客服
						uni.navigateTo({
							url: '/pages/customer-service/customer-service'
						});
					}
				}
			});
		}
	}
}
</script>

<style scoped>
.home-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	display: flex;
	flex-direction: column;
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
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.nav-actions {
	display: flex;
	align-items: center;
}

/* 查询区域 */
.search-card {
	margin: 108rpx 32rpx 32rpx;
	padding: 32rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.search-input-wrapper {
	margin-bottom: 24rpx;
}

.search-input {
	width: 100%;
	height: 80rpx;
	padding: 0 24rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	font-size: 28rpx;
	background-color: #fafafa;
}

.search-type-wrapper {
	margin-bottom: 24rpx;
}

.type-selector {
	height: 80rpx;
	padding: 0 24rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	background-color: #fafafa;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 28rpx;
	color: #666;
}

.search-btn {
	width: 100%;
	height: 80rpx;
	background-color: #007AFF;
	color: #fff;
	border: none;
	border-radius: 8rpx;
	font-size: 32rpx;
	font-weight: bold;
}

/* 营销区域 */
.marketing-area {
	flex: 1;
	padding: 0 32rpx 120rpx;
}

/* 轮播图 */
.banner-swiper {
	height: 320rpx;
	width: 90%;
	margin: 0 auto 32rpx auto;
	border-radius: 16rpx;
	overflow: hidden;
}

.banner-item {
	position: relative;
	height: 100%;
}

.banner-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.banner-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 32rpx;
	background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
	color: #fff;
}

.banner-title {
	font-size: 32rpx;
	font-weight: bold;
	display: block;
	margin-bottom: 8rpx;
}

.banner-desc {
	font-size: 24rpx;
	opacity: 0.9;
}

/* 区块标题 */
.section {
	margin-bottom: 32rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 24rpx;
	padding-left: 16rpx;
	border-left: 8rpx solid #007AFF;
}

/* 成功案例 */
.case-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.case-item {
	padding: 24rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	display: flex;
	align-items: center;
}

.case-image {
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	margin-right: 24rpx;
	object-fit: cover;
}

.case-content {
	flex: 1;
}

.case-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 12rpx;
}

.case-desc {
	font-size: 24rpx;
	color: #666;
	display: block;
	margin-bottom: 16rpx;
	line-height: 1.4;
}

.case-btn {
	padding: 12rpx 24rpx;
	background-color: #28a745;
	color: #fff;
	border: none;
	border-radius: 20rpx;
	font-size: 24rpx;
	width: 480rpx;
	display: block;
	margin: 0 auto;
}

/* 行业资讯 */
.news-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.news-item {
	padding: 24rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	display: flex;
	align-items: center;
}

.news-content {
	flex: 1;
	margin-right: 24rpx;
}

.news-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 12rpx;
}

.news-summary {
	font-size: 24rpx;
	color: #666;
	display: block;
	margin-bottom: 12rpx;
	line-height: 1.4;
}

.news-time {
	font-size: 20rpx;
	color: #999;
}

.news-image {
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	object-fit: cover;
}

/* 底部快速操作 */
.bottom-actions {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 24rpx 32rpx;
	background-color: #fff;
	border-top: 2rpx solid #e0e0e0;
	display: flex;
	gap: 24rpx;
}

.action-btn {
	flex: 1;
	height: 80rpx;
	border: none;
	border-radius: 8rpx;
	font-size: 28rpx;
	font-weight: bold;
}

.submit-btn {
	background-color: #28a745;
	color: #fff;
}

.contact-btn {
	background-color: #007AFF;
	color: #fff;
}
</style>