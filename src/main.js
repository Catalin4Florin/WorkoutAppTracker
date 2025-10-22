import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { createI18n } from 'vue-i18n'

import en from './locales/en.json'
import ro from './locales/ro.json'

const savedLang = localStorage.getItem('language') || 'en'

const i18n = createI18n({
  locale: savedLang,
  fallbackLocale: 'en',
  messages: { en, ro }
})

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')
