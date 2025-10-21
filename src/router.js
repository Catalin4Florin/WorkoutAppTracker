import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from './components/LoginPage.vue'
import MyWorkouts from './components/MyWorkouts.vue'

const routes = [
  { path: '/', component: LoginPage },
  { path: '/myworkouts', component: MyWorkouts }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
