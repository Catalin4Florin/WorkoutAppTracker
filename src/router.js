import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './components/HomePage.vue'
import LoginPage from './components/LoginPage.vue'
import MyWorkouts from './components/MyWorkouts.vue'
import ProfilePage from './components/ProfilePage.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

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

let authResolved = false

function waitForAuthReady() {
  return new Promise((resolve) => {
    if (authResolved) return resolve()
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, () => {
      authResolved = true
      unsubscribe()
      resolve()
    })
  })
}

router.beforeEach(async (to, from, next) => {
  await waitForAuthReady()
  const auth = getAuth()
  const user = auth.currentUser
  const requiresAuth = ['/myworkouts', '/profile'].includes(to.path)

  if (requiresAuth && !user) next('/login')
  else next()
})

export default router
