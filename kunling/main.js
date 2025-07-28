import App from './App'
import i18n from './lang/i18n'


// #ifndef VUE3
// import Vue from 'vue' // 注释掉，避免浏览器环境模块解析错误
// Vue.config.productionTip = false
// App.mpType = 'app'
// const app = new Vue({
// 	i18n,
// 	...App
// })
// app.$mount()
// #endif


// #ifdef VUE3
// import {createSSRApp} from 'vue' // 注释掉，避免浏览器环境模块解析错误

// export function createApp() {
// 	const app = createSSRApp(App)
// 	app.use(i18n)
// 	return {app}
// }
// #endif
