import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './components/HomePage.vue'
import LoginPage from './components/LoginPage.vue'
import MyWorkouts from './components/MyWorkouts.vue'
import ProfilePage from './components/ProfilePage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: LoginPage },
  { path: '/myworkouts', component: MyWorkouts },
  { path: '/profile', component: ProfilePage } 
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
