import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// import {
//     ChatDotRound,
//     User,
//     Setting,
// } from '@element-plus/icons-vue'

// 全局样式、图标等
import './assets/iconfont/iconfont.css'

// 自定义工具/方法
// import * as httpRequest from './api/httpRequest'
import httpRequest from './api/httpRequest'
// import * as socketApi from './api/wssocket'
import * as socketApi from './api/wssocket'
import emotion from './api/emotion.js'
import element from './api/element.js'
import * as enums from './api/enums.js'
import * as date from './api/date.js'

// 自定义指令（如 dialogDrag）
// import './utils/directive/dialogDrag'
import dialogDrag from './utils/directive/dialogDrag'

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(router)
app.use(store)
app.use(ElementPlus)

// // ✅ 注册全局图标组件
// app.component('ChatDotRound', ChatDotRound)
// app.component('UserIcon', User)
// app.component('SettingIcon', Setting)
// // 你可以继续注册其他需要的图标

// 批量注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 挂载全局方法（Vue 3 中通过 app.config.globalProperties）
app.config.globalProperties.$http = httpRequest
app.config.globalProperties.$wsApi = socketApi
app.config.globalProperties.$emo = emotion
app.config.globalProperties.$elm = element
app.config.globalProperties.$enums = enums
app.config.globalProperties.$date = date

// 挂载到 DOM
app.directive('dialogDrag', dialogDrag)
app.mount('#app')
