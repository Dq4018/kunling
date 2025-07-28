<template>
	<view class="register-page">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-content">
				<view class="nav-left" @click="goBack">
					<uni-icons type="left" size="20" color="#333"></uni-icons>
				</view>
				<text class="nav-title">登记管理</text>
				<view class="nav-right" @click="showImportModal">
					<uni-icons type="folder-add" size="20" color="#007aff"></uni-icons>
				</view>
			</view>
		</view>

		<!-- 筛选栏 -->
		<view class="filter-bar">
			<scroll-view scroll-x="true" class="filter-scroll">
				<view class="filter-tabs">
					<view 
						v-for="(tab, index) in filterTabs" 
						:key="index"
						class="filter-tab"
						:class="{active: currentTab === tab.value}"
						@click="switchTab(tab.value)"
					>
						<text class="tab-text">{{tab.label}}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 列表区域 -->
		<scroll-view scroll-y="true" class="list-container" @scrolltolower="loadMore">
			<view v-if="filteredList.length === 0" class="empty-state">
				<text class="empty-text">暂无数据</text>
			</view>
			<view v-else class="list-content">
				<view 
					v-for="(item, index) in filteredList" 
					:key="index"
					class="list-item"
					@click="showDetail(item)"
				>
					<view class="item-content">
						<view class="item-header">
							<text class="item-title">{{item.name}}</text>
							<view class="item-status" :class="'status-' + item.status">
								<text class="status-text">{{getStatusText(item.status)}}</text>
							</view>
						</view>
						<view class="item-info">
							<text class="item-type">{{getTypeText(item.type)}}</text>
							<text class="item-time">{{formatTime(item.submitTime)}}</text>
						</view>
					</view>
					<view class="item-actions">
						<view class="action-btn" @click.stop="editItem(item)">
							<uni-icons type="compose" size="16" color="#666"></uni-icons>
						</view>
						<view class="action-btn" @click.stop="submitItem(item)">
							<uni-icons type="redo" size="16" color="#007aff"></uni-icons>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 底部浮动按钮 -->
		<view class="floating-btn" @click="showAddModal">
			<uni-icons type="plus" size="24" color="#fff"></uni-icons>
		</view>

		<!-- 新增/编辑弹窗 -->
		<uni-popup ref="formModal" type="bottom">
			<view class="form-modal">
				<view class="modal-header">
					<text class="modal-title">{{isEdit ? '编辑登记' : '新增登记'}}</text>
					<view class="close-btn" @click="closeModal">
						<uni-icons type="close" size="20" color="#666"></uni-icons>
					</view>
				</view>
				<view class="modal-content">
					<view class="form-item">
						<text class="form-label">名称</text>
						<input class="form-input" v-model="formData.name" placeholder="请输入名称" />
					</view>
					<view class="form-item">
						<text class="form-label">类型</text>
						<picker :range="typeOptions" range-key="label" @change="onTypeChange">
							<view class="picker-input">
								<text class="picker-text">{{getTypeText(formData.type) || '请选择类型'}}</text>
								<uni-icons type="down" size="14" color="#999"></uni-icons>
							</view>
						</picker>
					</view>
					<view class="form-item">
						<text class="form-label">申请人</text>
						<input class="form-input" v-model="formData.applicant" placeholder="请输入申请人" />
					</view>
					<view class="form-item">
						<text class="form-label">文件上传</text>
						<view class="upload-area" @click="chooseFile">
							<view v-if="formData.files.length === 0" class="upload-placeholder">
								<uni-icons type="cloud-upload" size="32" color="#ccc"></uni-icons>
								<text class="upload-text">点击或拖拽上传文件</text>
							</view>
							<view v-else class="file-list">
								<view v-for="(file, index) in formData.files" :key="index" class="file-item">
									<text class="file-name">{{file.name}}</text>
									<view class="file-remove" @click.stop="removeFile(index)">
										<uni-icons type="close" size="14" color="#999"></uni-icons>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view class="form-item">
						<text class="form-label">备注</text>
						<textarea class="form-textarea" v-model="formData.remark" placeholder="请输入备注信息" />
					</view>
				</view>
				<view class="modal-footer">
					<view class="btn secondary" @click="saveDraft">
						<text class="btn-text">保存草稿</text>
					</view>
					<view class="btn primary" @click="submitForm">
						<text class="btn-text">提交</text>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 批量导入弹窗 -->
		<uni-popup ref="importModal" type="center">
			<view class="import-modal">
				<view class="modal-header">
					<text class="modal-title">批量导入</text>
					<view class="close-btn" @click="closeImportModal">
						<uni-icons type="close" size="20" color="#666"></uni-icons>
					</view>
				</view>
				<view class="import-content">
					<view class="import-tips">
						<text class="tips-text">支持Excel/CSV格式文件，请按模板格式填写</text>
						<text class="download-template" @click="downloadTemplate">下载模板</text>
					</view>
					<view class="import-area" @click="chooseImportFile">
						<uni-icons type="cloud-upload" size="48" color="#007aff"></uni-icons>
						<text class="import-text">选择文件上传</text>
					</view>
					<view v-if="importProgress > 0" class="progress-bar">
						<view class="progress-fill" :style="{width: importProgress + '%'}"></view>
						<text class="progress-text">{{importProgress}}%</text>
					</view>
				</view>
			</view>
		</uni-popup>

		<!-- 详情弹窗 -->
		<uni-popup ref="detailModal" type="bottom">
			<view class="detail-modal">
				<view class="modal-header">
					<text class="modal-title">详情信息</text>
					<view class="close-btn" @click="closeDetailModal">
						<uni-icons type="close" size="20" color="#666"></uni-icons>
					</view>
				</view>
				<view class="detail-content">
					<view class="detail-item">
						<text class="detail-label">名称：</text>
						<text class="detail-value">{{currentItem.name}}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">类型：</text>
						<text class="detail-value">{{getTypeText(currentItem.type)}}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">申请人：</text>
						<text class="detail-value">{{currentItem.applicant}}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">状态：</text>
						<text class="detail-value" :class="'status-' + currentItem.status">{{getStatusText(currentItem.status)}}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">提交时间：</text>
						<text class="detail-value">{{formatTime(currentItem.submitTime)}}</text>
					</view>
					<view v-if="currentItem.files && currentItem.files.length > 0" class="detail-item">
						<text class="detail-label">附件：</text>
						<view class="attachment-list">
							<view v-for="(file, index) in currentItem.files" :key="index" class="attachment-item" @click="previewFile(file)">
								<uni-icons type="paperclip" size="14" color="#007aff"></uni-icons>
								<text class="attachment-name">{{file.name}}</text>
							</view>
						</view>
					</view>
					<view v-if="currentItem.remark" class="detail-item">
						<text class="detail-label">备注：</text>
						<text class="detail-value">{{currentItem.remark}}</text>
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
			currentTab: 'all',
			filterTabs: [
				{label: '全部', value: 'all'},
				{label: '专利', value: 'patent'},
				{label: '商标', value: 'trademark'},
				{label: '版权', value: 'copyright'}
			],
			typeOptions: [
				{label: '专利', value: 'patent'},
				{label: '商标', value: 'trademark'},
				{label: '版权', value: 'copyright'}
			],
			registrationList: [
				{
					id: 1,
					name: '智能语音识别系统',
					type: 'patent',
					status: 'pending',
					applicant: '张三',
					submitTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
					files: [{name: '申请书.pdf'}, {name: '技术说明.docx'}],
					remark: '核心技术专利申请'
				},
				{
					id: 2,
					name: '昆灵科技商标',
					type: 'trademark',
					status: 'approved',
					applicant: '昆灵科技有限公司',
					submitTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
					files: [{name: '商标图样.png'}],
					remark: '公司主商标'
				},
				{
					id: 3,
					name: '移动应用界面设计',
					type: 'copyright',
					status: 'pending',
					applicant: '李四',
					submitTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
					files: [{name: '设计稿.psd'}],
					remark: 'UI设计版权保护'
				}
			],
			isEdit: false,
			formData: {
				name: '',
				type: '',
				applicant: '',
				files: [],
				remark: ''
			},
			currentItem: {},
			importProgress: 0
		}
	},
	computed: {
		filteredList() {
			if (this.currentTab === 'all') {
				return this.registrationList;
			}
			return this.registrationList.filter(item => item.type === this.currentTab);
		}
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},
		switchTab(tab) {
			this.currentTab = tab;
		},
		getTypeText(type) {
			const typeMap = {
				patent: '专利',
				trademark: '商标',
				copyright: '版权'
			};
			return typeMap[type] || '';
		},
		getStatusText(status) {
			const statusMap = {
				pending: '待审',
				approved: '已授权'
			};
			return statusMap[status] || '';
		},
		formatTime(time) {
			const now = new Date();
			const diff = now - time;
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			if (days === 0) {
				return '今天';
			} else if (days === 1) {
				return '昨天';
			} else if (days < 30) {
				return days + '天前';
			} else {
				return time.toLocaleDateString();
			}
		},
		showAddModal() {
			this.isEdit = false;
			this.resetForm();
			this.$refs.formModal.open();
		},
		editItem(item) {
			this.isEdit = true;
			this.formData = {
				name: item.name,
				type: item.type,
				applicant: item.applicant,
				files: [...item.files],
				remark: item.remark
			};
			this.$refs.formModal.open();
		},
		showDetail(item) {
			this.currentItem = item;
			this.$refs.detailModal.open();
		},
		submitItem(item) {
			uni.showModal({
				title: '确认提交',
				content: '确定要提交到官方数据库吗？提交后将无法修改。',
				success: (res) => {
					if (res.confirm) {
						uni.showLoading({title: '提交中...'});
						setTimeout(() => {
							uni.hideLoading();
							uni.showToast({title: '提交成功', icon: 'success'});
						}, 2000);
					}
				}
			});
		},
		showImportModal() {
			this.$refs.importModal.open();
		},
		closeModal() {
			this.$refs.formModal.close();
		},
		closeImportModal() {
			this.$refs.importModal.close();
		},
		closeDetailModal() {
			this.$refs.detailModal.close();
		},
		resetForm() {
			this.formData = {
				name: '',
				type: '',
				applicant: '',
				files: [],
				remark: ''
			};
		},
		onTypeChange(e) {
			this.formData.type = this.typeOptions[e.detail.value].value;
		},
		chooseFile() {
			uni.chooseFile({
				count: 5,
				extension: ['.pdf', '.doc', '.docx', '.png', '.jpg'],
				success: (res) => {
					this.formData.files.push(...res.tempFiles.map(file => ({name: file.name, path: file.path})));
				}
			});
		},
		removeFile(index) {
			this.formData.files.splice(index, 1);
		},
		saveDraft() {
			uni.showToast({title: '草稿已保存', icon: 'success'});
			this.closeModal();
		},
		submitForm() {
			if (!this.formData.name || !this.formData.type || !this.formData.applicant) {
				uni.showToast({title: '请填写必填项', icon: 'none'});
				return;
			}
			uni.showLoading({title: '提交中...'});
			setTimeout(() => {
				uni.hideLoading();
				uni.showToast({title: '提交成功', icon: 'success'});
				this.closeModal();
			}, 1500);
		},
		chooseImportFile() {
			uni.chooseFile({
				count: 1,
				extension: ['.xlsx', '.xls', '.csv'],
				success: (res) => {
					this.simulateImport();
				}
			});
		},
		simulateImport() {
			this.importProgress = 0;
			const timer = setInterval(() => {
				this.importProgress += 10;
				if (this.importProgress >= 100) {
					clearInterval(timer);
					setTimeout(() => {
						uni.showToast({title: '导入成功', icon: 'success'});
						this.closeImportModal();
						this.importProgress = 0;
					}, 500);
				}
			}, 200);
		},
		downloadTemplate() {
			uni.showToast({title: '模板下载中...', icon: 'loading'});
		},
		previewFile(file) {
			uni.showToast({title: '预览文件: ' + file.name, icon: 'none'});
		},
		loadMore() {
			console.log('加载更多数据');
		}
	}
}
</script>

<style scoped>
.register-page {
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

.nav-left, .nav-right {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-title {
	font-size: 18px;
	font-weight: 600;
	color: #333;
}

/* 筛选栏 */
.filter-bar {
	position: fixed;
	top: 88px;
	left: 0;
	right: 0;
	z-index: 999;
	background-color: #fff;
	border-bottom: 1px solid #f0f0f0;
}

.filter-scroll {
	white-space: nowrap;
}

.filter-tabs {
	display: flex;
	padding: 0 16px;
}

.filter-tab {
	padding: 12px 16px;
	margin-right: 8px;
	border-radius: 20px;
	background-color: #f8f8f8;
	transition: all 0.3s;
}

.filter-tab.active {
	background-color: #007aff;
}

.tab-text {
	font-size: 14px;
	color: #666;
}

.filter-tab.active .tab-text {
	color: #fff;
}

/* 列表容器 */
.list-container {
	flex: 1;
	padding-top: 140px;
	padding-bottom: 80px;
}

.empty-state {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 200px;
}

.empty-text {
	font-size: 14px;
	color: #999;
}

.list-content {
	padding: 0 16px;
}

.list-item {
	background-color: #fff;
	border-radius: 8px;
	margin-bottom: 12px;
	padding: 16px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.item-content {
	flex: 1;
}

.item-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
}

.item-title {
	font-size: 16px;
	font-weight: 600;
	color: #333;
	flex: 1;
}

.item-status {
	padding: 4px 8px;
	border-radius: 12px;
	font-size: 12px;
}

.status-pending {
	background-color: #fff3e0;
	color: #ff9500;
}

.status-approved {
	background-color: #e8f5e8;
	color: #34c759;
}

.status-text {
	font-size: 12px;
}

.item-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.item-type {
	font-size: 14px;
	color: #666;
}

.item-time {
	font-size: 12px;
	color: #999;
}

.item-actions {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-left: 16px;
}

.action-btn {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 6px;
	background-color: #f8f8f8;
}

/* 浮动按钮 */
.floating-btn {
	position: fixed;
	bottom: 30px;
	right: 20px;
	width: 56px;
	height: 56px;
	border-radius: 28px;
	background-color: #007aff;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
	z-index: 1000;
}

/* 弹窗样式 */
.form-modal, .import-modal, .detail-modal {
	background-color: #fff;
	border-radius: 16px 16px 0 0;
	max-height: 80vh;
	min-height: 400px;
}

.import-modal {
	width: 320px;
	border-radius: 16px;
	min-height: 300px;
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 20px 0;
	border-bottom: 1px solid #f0f0f0;
	padding-bottom: 16px;
	margin-bottom: 20px;
}

.modal-title {
	font-size: 18px;
	font-weight: 600;
	color: #333;
}

.close-btn {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-content {
	padding: 0 20px;
	max-height: 50vh;
	overflow-y: auto;
}

.form-item {
	margin-bottom: 20px;
}

.form-label {
	font-size: 14px;
	color: #333;
	margin-bottom: 8px;
	display: block;
}

.form-input, .form-textarea {
	width: 100%;
	padding: 12px;
	border: 1px solid #e5e5e5;
	border-radius: 8px;
	font-size: 14px;
	background-color: #fff;
}

.form-textarea {
	height: 80px;
	resize: none;
}

.picker-input {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px;
	border: 1px solid #e5e5e5;
	border-radius: 8px;
	background-color: #fff;
}

.picker-text {
	font-size: 14px;
	color: #333;
}

.upload-area {
	border: 2px dashed #e5e5e5;
	border-radius: 8px;
	padding: 20px;
	text-align: center;
	background-color: #fafafa;
}

.upload-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
}

.upload-text {
	font-size: 14px;
	color: #999;
}

.file-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.file-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 12px;
	background-color: #f8f8f8;
	border-radius: 6px;
}

.file-name {
	font-size: 14px;
	color: #333;
	flex: 1;
}

.file-remove {
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-footer {
	display: flex;
	gap: 12px;
	padding: 20px;
	border-top: 1px solid #f0f0f0;
}

.btn {
	flex: 1;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8px;
	font-weight: 500;
}

.btn.secondary {
	background-color: #f8f8f8;
	color: #666;
}

.btn.primary {
	background-color: #007aff;
	color: #fff;
}

.btn-text {
	font-size: 16px;
}

/* 导入弹窗 */
.import-content {
	padding: 0 20px 20px;
}

.import-tips {
	margin-bottom: 20px;
	text-align: center;
}

.tips-text {
	font-size: 14px;
	color: #666;
	display: block;
	margin-bottom: 8px;
}

.download-template {
	font-size: 14px;
	color: #007aff;
	text-decoration: underline;
}

.import-area {
	border: 2px dashed #007aff;
	border-radius: 8px;
	padding: 40px 20px;
	text-align: center;
	background-color: #f8fbff;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
}

.import-text {
	font-size: 16px;
	color: #007aff;
	font-weight: 500;
}

.progress-bar {
	position: relative;
	height: 6px;
	background-color: #f0f0f0;
	border-radius: 3px;
	margin-top: 20px;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background-color: #007aff;
	border-radius: 3px;
	transition: width 0.3s;
}

.progress-text {
	position: absolute;
	top: -20px;
	right: 0;
	font-size: 12px;
	color: #666;
}

/* 详情弹窗 */
.detail-content {
	padding: 0 20px 20px;
}

.detail-item {
	margin-bottom: 16px;
	display: flex;
	align-items: flex-start;
}

.detail-label {
	font-size: 14px;
	color: #666;
	width: 80px;
	flex-shrink: 0;
}

.detail-value {
	font-size: 14px;
	color: #333;
	flex: 1;
}

.attachment-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
	flex: 1;
}

.attachment-item {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 8px;
	background-color: #f8f8f8;
	border-radius: 4px;
}

.attachment-name {
	font-size: 14px;
	color: #007aff;
}
</style>