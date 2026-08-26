import { createApp } from 'vue'
import App from './App.vue'
import { initializeAuth } from './composables/useAuth'
import router from './router'
import './assets/main.css'

await initializeAuth()

createApp(App).use(router).mount('#app')
