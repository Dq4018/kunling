<template>
	<view class="customer-service-container">
		<!-- 动态标题 -->
		<view class="dynamic-title">
			<text class="title-text">坤灵智能，知产专家</text>
			<view class="wave-effect"></view>
		</view>
		
		<!-- 顶部导航栏 -->
		<view class="top-nav">
			<uni-icons type="back" size="24" color="#333" @click="goBack"></uni-icons>
			<text class="nav-title">在线客服</text>
			<uni-icons type="settings" size="24" color="#333" @click="toggleModelSelector"></uni-icons>
		</view>
		
		<!-- 模型选择器 -->
		<view v-if="showModelSelector" class="model-selector">
			<text class="selector-title">选择AI模型：</text>
			<view class="model-options">
				<button 
					v-for="(config, key) in aiConfig" 
					:key="key" 
					class="model-btn" 
					:class="{ active: currentModel === key }"
					@click="switchModel(key)"
				>
					{{ getModelName(key) }}
				</button>
			</view>
			<text class="model-status">当前模型：{{ getModelName(currentModel) }}</text>
		</view>

		<!-- 聊天区域 -->
		<scroll-view class="chat-area" scroll-y="true" :scroll-top="scrollTop" scroll-with-animation="true">
			<view class="message-list">
				<!-- 欢迎消息 -->
				<view class="message-item ai-message">
					<view class="avatar ai-avatar">
						<uni-icons type="chatbubble" size="20" color="#fff"></uni-icons>
					</view>
					<view class="message-content">
						<view class="message-bubble ai-bubble">
							<text>您好！我是昆灵知识产权AI客服，很高兴为您服务。请问有什么可以帮助您的吗？</text>
						</view>
						<text class="message-time">{{ getCurrentTime() }}</text>
					</view>
				</view>

				<!-- 消息列表 -->
				<view v-for="(message, index) in messageList" :key="index" class="message-item" :class="message.type + '-message'">
					<view class="avatar" :class="message.type + '-avatar'">
						<uni-icons v-if="message.type === 'ai'" type="chatbubble" size="20" color="#fff"></uni-icons>
						<uni-icons v-else type="person" size="20" color="#fff"></uni-icons>
					</view>
					<view class="message-content">
						<view class="message-bubble" :class="message.type + '-bubble'">
							<text>{{ message.content }}</text>
						</view>
						<text class="message-time">{{ message.time }}</text>
					</view>
				</view>

				<!-- AI正在输入提示 -->
				<view v-if="isAiTyping" class="message-item ai-message">
					<view class="avatar ai-avatar">
						<uni-icons type="chatbubble" size="20" color="#fff"></uni-icons>
					</view>
					<view class="message-content">
						<view class="message-bubble ai-bubble typing-indicator">
							<view class="typing-dots">
								<view class="dot"></view>
								<view class="dot"></view>
								<view class="dot"></view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 快捷回复 -->
		<view v-if="showQuickReplies" class="quick-replies">
			<text class="quick-title">常见问题：</text>
			<view class="quick-buttons">
				<button v-for="(reply, index) in quickReplies" :key="index" class="quick-btn" @click="sendQuickReply(reply)">
					{{ reply.text }}
				</button>
			</view>
		</view>

		<!-- 输入区域 -->
		<view class="input-area">
			<view class="input-wrapper">
				<input class="message-input" v-model="inputMessage" placeholder="请输入您的问题..." @confirm="sendMessage" confirm-type="send" />
				<button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim()">
					<uni-icons type="paperplane" size="20" color="#fff"></uni-icons>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import aiConfig from '@/config/ai-config.js';

export default {
	data() {
		return {
			inputMessage: '',
			messageList: [],
			scrollTop: 0,
			isAiTyping: false,
			showQuickReplies: true,
			quickReplies: [
				{ text: '专利申请流程', keyword: 'patent_process' },
				{ text: '商标注册费用', keyword: 'trademark_cost' },
				{ text: '版权登记时间', keyword: 'copyright_time' },
				{ text: '联系人工客服', keyword: 'human_service' }
			],
			// AI模型配置
			aiConfig: aiConfig,
			currentModel: 'qwen', // 当前使用的模型：qwen, wenxin, glm, kimi
			accessToken: '', // 百度文心一言的访问令牌
			showModelSelector: false // 是否显示模型选择器
		}
	},
	onLoad() {
		this.scrollToBottom();
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},
		getCurrentTime() {
			const now = new Date();
			return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
		},
		sendMessage() {
			if (!this.inputMessage.trim()) return;
			
			const userMessage = {
				type: 'user',
				content: this.inputMessage,
				time: this.getCurrentTime()
			};
			
			this.messageList.push(userMessage);
			const userInput = this.inputMessage;
			this.inputMessage = '';
			this.showQuickReplies = false;
			
			this.scrollToBottom();
			
			// 模拟AI回复
			this.generateAiResponse(userInput);
		},
		sendQuickReply(reply) {
			const userMessage = {
				type: 'user',
				content: reply.text,
				time: this.getCurrentTime()
			};
			
			this.messageList.push(userMessage);
			this.showQuickReplies = false;
			this.scrollToBottom();
			
			// 根据关键词回复
			this.generateAiResponse(reply.text, reply.keyword);
		},
		async generateAiResponse(userInput, keyword = null) {
			this.isAiTyping = true;
			this.scrollToBottom();
			
			try {
				let aiResponse = '';
				
				// 构建专业的知识产权咨询提示词
				const systemPrompt = '你是昆灵知识产权的专业AI客服，专门为客户提供专利申请、商标注册、版权登记等知识产权相关咨询服务。请用专业、友好的语气回答客户问题，回答要准确、简洁，不超过200字。';
				const fullPrompt = `${systemPrompt}\n\n客户问题：${userInput}`;
				
				// 调用AI模型API
				switch (this.currentModel) {
					case 'qwen':
						aiResponse = await this.callQwenAPI(fullPrompt);
						break;
					case 'wenxin':
						aiResponse = await this.callWenxinAPI(fullPrompt);
						break;
					case 'glm':
						aiResponse = await this.callGLMAPI(fullPrompt);
						break;
					case 'kimi':
						aiResponse = await this.callKimiAPI(fullPrompt);
						break;
					default:
						aiResponse = await this.callQwenAPI(fullPrompt);
				}
				
				// 如果API调用失败，使用备用回复
				if (!aiResponse) {
					aiResponse = this.getFallbackResponse(userInput);
				}
				
				const aiMessage = {
					type: 'ai',
					content: aiResponse,
					time: this.getCurrentTime()
				};
				
				this.messageList.push(aiMessage);
				this.scrollToBottom();
			} catch (error) {
				console.error('AI回复生成失败:', error);
				
				// 错误时使用备用回复
				const fallbackMessage = {
					type: 'ai',
					content: '抱歉，我暂时无法回答您的问题。请稍后重试或联系人工客服。',
					time: this.getCurrentTime()
				};
				
				this.messageList.push(fallbackMessage);
				this.scrollToBottom();
			} finally {
				this.isAiTyping = false;
			}
		},
		// 通义千问API调用
		async callQwenAPI(prompt) {
			if (!this.aiConfig.qwen.apiKey) {
				console.warn('通义千问API Key未配置');
				return null;
			}
			
			try {
				const response = await uni.request({
					url: `${this.aiConfig.qwen.baseURL}/chat/completions`,
					method: 'POST',
					header: {
						'Authorization': `Bearer ${this.aiConfig.qwen.apiKey}`,
						'Content-Type': 'application/json'
					},
					data: {
						model: this.aiConfig.qwen.model,
						messages: [
							{ role: 'user', content: prompt }
						],
						max_tokens: 500,
						temperature: 0.7
					}
				});
				
				if (response.statusCode === 200 && response.data.choices && response.data.choices.length > 0) {
					return response.data.choices[0].message.content;
				}
				return null;
			} catch (error) {
				console.error('通义千问API调用失败:', error);
				return null;
			}
		},
		
		// 百度文心一言API调用
		async callWenxinAPI(prompt) {
			if (!this.aiConfig.wenxin.apiKey || !this.aiConfig.wenxin.secretKey) {
				console.warn('百度文心一言API Key或Secret Key未配置');
				return null;
			}
			
			try {
				// 获取访问令牌
				if (!this.accessToken) {
					await this.getWenxinAccessToken();
				}
				
				const response = await uni.request({
					url: `${this.aiConfig.wenxin.baseURL}?access_token=${this.accessToken}`,
					method: 'POST',
					header: {
						'Content-Type': 'application/json'
					},
					data: {
						messages: [
							{ role: 'user', content: prompt }
						],
						max_output_tokens: 500,
						temperature: 0.7
					}
				});
				
				if (response.statusCode === 200 && response.data.result) {
					return response.data.result;
				}
				return null;
			} catch (error) {
				console.error('百度文心一言API调用失败:', error);
				return null;
			}
		},
		
		// 获取百度文心一言访问令牌
		async getWenxinAccessToken() {
			try {
				const response = await uni.request({
					url: 'https://aip.baidubce.com/oauth/2.0/token',
					method: 'POST',
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: `grant_type=client_credentials&client_id=${this.aiConfig.wenxin.apiKey}&client_secret=${this.aiConfig.wenxin.secretKey}`
				});
				
				if (response.statusCode === 200 && response.data.access_token) {
					this.accessToken = response.data.access_token;
				}
			} catch (error) {
				console.error('获取百度访问令牌失败:', error);
			}
		},
		
		// 智谱GLM API调用
		async callGLMAPI(prompt) {
			if (!this.aiConfig.glm.apiKey) {
				console.warn('智谱GLM API Key未配置');
				return null;
			}
			
			try {
				const response = await uni.request({
					url: `${this.aiConfig.glm.baseURL}`,
					method: 'POST',
					header: {
						'Authorization': `Bearer ${this.aiConfig.glm.apiKey}`,
						'Content-Type': 'application/json'
					},
					data: {
						model: this.aiConfig.glm.model,
						messages: [
							{ role: 'user', content: prompt }
						],
						max_tokens: 500,
						temperature: 0.7
					}
				});
				
				if (response.statusCode === 200 && response.data.choices && response.data.choices.length > 0) {
					return response.data.choices[0].message.content;
				}
				return null;
			} catch (error) {
				console.error('智谱GLM API调用失败:', error);
				return null;
			}
		},
		
		// Kimi API调用
		async callKimiAPI(prompt) {
			if (!this.aiConfig.kimi.apiKey) {
				console.warn('Kimi API Key未配置');
				return null;
			}
			
			try {
				const response = await uni.request({
					url: `${this.aiConfig.kimi.baseURL}`,
					method: 'POST',
					header: {
						'Authorization': `Bearer ${this.aiConfig.kimi.apiKey}`,
						'Content-Type': 'application/json'
					},
					data: {
						model: this.aiConfig.kimi.model,
						messages: [
							{ role: 'user', content: prompt }
						],
						max_tokens: 500,
						temperature: 0.7
					}
				});
				
				if (response.statusCode === 200 && response.data.choices && response.data.choices.length > 0) {
					return response.data.choices[0].message.content;
				}
				return null;
			} catch (error) {
				console.error('Kimi API调用失败:', error);
				return null;
			}
		},
		
		// 切换AI模型
		switchModel(modelKey) {
			this.currentModel = modelKey;
			this.showModelSelector = false;
			
			// 添加切换提示消息
			const switchMessage = {
				type: 'ai',
				content: `已切换到${this.getModelName(modelKey)}模型，继续为您服务。`,
				time: this.getCurrentTime()
			};
			
			this.messageList.push(switchMessage);
			this.scrollToBottom();
		},
		
		// 获取模型显示名称
		getModelName(key) {
			const names = {
				qwen: '通义千问',
				wenxin: '文心一言',
				glm: '智谱GLM',
				kimi: 'Kimi'
			};
			return names[key] || key;
		},
		
		// 切换模型选择器显示状态
		toggleModelSelector() {
			this.showModelSelector = !this.showModelSelector;
		},
		
		// 备用回复方法
		getFallbackResponse(input) {
			const lowerInput = input.toLowerCase();
			
			if (lowerInput.includes('专利') || lowerInput.includes('发明')) {
				return '关于专利申请，我们提供发明专利、实用新型专利、外观设计专利的申请服务。您具体想了解哪种类型的专利呢？';
			} else if (lowerInput.includes('商标') || lowerInput.includes('品牌')) {
				return '商标注册可以保护您的品牌权益。我们提供商标查询、申请、续展等全套服务。请问您的商标属于哪个类别？';
			} else if (lowerInput.includes('版权') || lowerInput.includes('著作权')) {
				return '版权登记可以保护您的原创作品。包括文字作品、美术作品、摄影作品、软件著作权等。您需要登记什么类型的作品？';
			} else if (lowerInput.includes('费用') || lowerInput.includes('价格') || lowerInput.includes('多少钱')) {
				return '我们的收费标准透明合理，具体费用根据服务类型而定。建议您详细咨询，我们会为您提供最优惠的方案。';
			} else if (lowerInput.includes('时间') || lowerInput.includes('多久') || lowerInput.includes('周期')) {
				return '不同类型的知识产权申请时间不同：专利18-24个月，商标12-18个月，版权30-60个工作日。具体时间可能因案件复杂程度而异。';
			} else if (lowerInput.includes('人工') || lowerInput.includes('客服') || lowerInput.includes('转接')) {
				return '正在为您转接人工客服，请稍候。工作时间：周一至周五 9:00-18:00。如需紧急咨询，请拨打热线：18964317905';
			} else {
				return '感谢您的咨询！我是AI客服，可以为您解答知识产权相关问题。如需更详细的咨询，建议您联系我们的专业顾问。';
			}
		},
		scrollToBottom() {
			this.$nextTick(() => {
				this.scrollTop = 999999;
			});
		}
	}
}
</script>

<style scoped>
.customer-service-container {
	height: 100vh;
	background-color: #f5f5f5;
	display: flex;
	flex-direction: column;
}

/* 动态标题 */
.dynamic-title {
	height: 120rpx;
	position: relative;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	margin-top: 88rpx;
	z-index: 1;
}

.title-text {
	font-size: 40rpx;
	font-weight: bold;
	color: #fff;
	z-index: 2;
	position: relative;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
	animation: textFloat 3s ease-in-out infinite;
}

.wave-effect {
	position: absolute;
	top: 0;
	left: 0;
	width: 200%;
	height: 100%;
	background: linear-gradient(90deg, 
		transparent 0%, 
		rgba(255, 255, 255, 0.1) 25%, 
		rgba(255, 255, 255, 0.2) 50%, 
		rgba(255, 255, 255, 0.1) 75%, 
		transparent 100%);
	animation: waveMove 4s linear infinite;
}

@keyframes textFloat {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-6rpx);
	}
}

@keyframes waveMove {
	0% {
		transform: translateX(-100%);
	}
	100% {
		transform: translateX(0);
	}
}

/* 顶部导航栏 */
.top-nav {
	height: 88rpx;
	padding: 0 32rpx;
	background-color: #fff;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 10;
}

.nav-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

/* 模型选择器 */
.model-selector {
	padding: 24rpx;
	background-color: #fff;
	border-bottom: 2rpx solid #e0e0e0;
}

.selector-title {
	font-size: 28rpx;
	color: #333;
	font-weight: bold;
	margin-bottom: 16rpx;
	display: block;
}

.model-options {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.model-btn {
	padding: 16rpx 24rpx;
	background-color: #f8f9fa;
	border: 2rpx solid #e0e0e0;
	border-radius: 32rpx;
	font-size: 24rpx;
	color: #333;
}

.model-btn.active {
	background-color: #007AFF;
	color: #fff;
	border-color: #007AFF;
}

.model-btn:active {
	background-color: #e9ecef;
}

.model-btn.active:active {
	background-color: #0056b3;
}

.model-status {
	font-size: 24rpx;
	color: #666;
	display: block;
}

/* 聊天区域 */
.chat-area {
	flex: 1;
	padding: 24rpx;
	overflow-y: auto;
}

.message-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.message-item {
	display: flex;
	align-items: flex-start;
	gap: 16rpx;
}

.user-message {
	flex-direction: row-reverse;
}

.avatar {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.ai-avatar {
	background-color: #007AFF;
}

.user-avatar {
	background-color: #28a745;
}

.message-content {
	max-width: 70%;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.user-message .message-content {
	align-items: flex-end;
}

.message-bubble {
	padding: 24rpx;
	border-radius: 24rpx;
	word-wrap: break-word;
	line-height: 1.4;
}

.ai-bubble {
	background-color: #fff;
	border: 2rpx solid #e0e0e0;
	color: #333;
}

.user-bubble {
	background-color: #007AFF;
	color: #fff;
}

.message-time {
	font-size: 20rpx;
	color: #999;
	margin: 0 16rpx;
}

/* 输入提示动画 */
.typing-indicator {
	padding: 20rpx 24rpx;
}

.typing-dots {
	display: flex;
	gap: 8rpx;
	align-items: center;
}

.dot {
	width: 12rpx;
	height: 12rpx;
	background-color: #ccc;
	border-radius: 50%;
	animation: typing 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
	animation-delay: -0.32s;
}

.dot:nth-child(2) {
	animation-delay: -0.16s;
}

@keyframes typing {
	0%, 80%, 100% {
		transform: scale(0.8);
		opacity: 0.5;
	}
	40% {
		transform: scale(1);
		opacity: 1;
	}
}

/* 快捷回复 */
.quick-replies {
	padding: 24rpx;
	background-color: #fff;
	border-top: 2rpx solid #e0e0e0;
}

.quick-title {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 16rpx;
	display: block;
}

.quick-buttons {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.quick-btn {
	padding: 16rpx 24rpx;
	background-color: #f8f9fa;
	border: 2rpx solid #e0e0e0;
	border-radius: 32rpx;
	font-size: 24rpx;
	color: #333;
}

.quick-btn:active {
	background-color: #e9ecef;
}

/* 输入区域 */
.input-area {
	padding: 24rpx;
	background-color: #fff;
	border-top: 2rpx solid #e0e0e0;
}

.input-wrapper {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.message-input {
	flex: 1;
	height: 72rpx;
	padding: 0 24rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 36rpx;
	background-color: #f8f9fa;
	font-size: 28rpx;
}

.send-btn {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background-color: #007AFF;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
}

.send-btn[disabled] {
	background-color: #ccc;
}
</style>