// AI模型配置文件
// 请在此文件中填入您的API密钥，不要将此文件提交到版本控制系统

export default {
	// 通义千问配置
	qwen: {
		apiKey: '', // 请填入您的通义千问API Key
		baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
		model: 'qwen-turbo'
	},
	
	// 百度文心一言配置
	wenxin: {
		apiKey: '', // 请填入您的百度API Key
		secretKey: '', // 请填入您的百度Secret Key
		baseURL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
		model: 'ERNIE-Bot-turbo'
	},
	
	// 智谱GLM配置
	glm: {
		apiKey: '', // 请填入您的智谱API Key
		baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
		model: 'glm-4'
	},
	
	// 月之暗面Kimi配置
	kimi: {
		apiKey: '', // 请填入您的Kimi API Key
		baseURL: 'https://api.moonshot.cn/v1/chat/completions',
		model: 'moonshot-v1-8k'
	}
};

// API申请指南：
// 1. 通义千问：访问 https://dashscope.aliyun.com/ 注册并获取API Key
// 2. 百度文心一言：访问 https://cloud.baidu.com/ 开通千帆大模型平台
// 3. 智谱GLM：访问 https://open.bigmodel.cn/ 注册并获取API Key
// 4. 月之暗面Kimi：访问 https://platform.moonshot.cn/ 注册并获取API Key