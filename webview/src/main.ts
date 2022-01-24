import { createApp } from 'vue';
import App from './App.vue';
import './global.scss';
import { createI18n } from 'vue-i18n';
import messages from './locales';

try {
  // 全局定义，只能用在 vscode 插件环境，其他环境会报错
  (window as any).vscode = acquireVsCodeApi();
} catch (error) {
  console.log(error);
}

const i18n = createI18n({
  locale: (window as any)?.vscodeLangage in messages ? (window as any)?.vscodeLangage : 'zh-cn', // 默认语言
  legacy: false, // Composition API 模式
  globalInjection: true, // 全局注册 $t 方法
  messages
});

createApp(App).use(i18n).mount('#app');
