import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './components/HomePage.vue'
import LoginPage from './components/LoginPage.vue'
import MyWorkouts from './components/MyWorkouts.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: LoginPage },
  { path: '/myworkouts', component: MyWorkouts }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
