<template>
    <nav class="navbar">
      <div class="navbar-content">
        <h2 class="logo" @click="goHome">🏋️ Workout Tracker</h2>
  
        <div class="nav-links">
          <button @click="goHome">Home</button>
  
          <template v-if="user">
            <button @click="goToWorkouts">My Workouts</button>
            <button @click="logout">Logout</button>
          </template>
  
          <template v-else>
            <button @click="goToLogin">Login</button>
            <button @click="goToLogin">Register</button>
          </template>
        </div>
      </div>
    </nav>
  </template>
  
  
  <script setup>
  import { useRouter } from 'vue-router'
  import { getAuth, signOut } from 'firebase/auth'
  import { useAuth } from '../composables/useAuth'
  import { ref } from 'vue'
  
  const goToLogin = () => router.push('/login')
  const router = useRouter()
  const auth = getAuth()
  const { user } = useAuth()
  const showLogoutPopup = ref(false)
  
  const logout = async () => {
    try {
      await signOut(auth)
      console.log('User logged out')
      showLogoutPopup.value = true
      setTimeout(() => {
        showLogoutPopup.value = false
        router.push('/')
      }, 1500)
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }
  
  const goHome = () => router.push('/')
  const goToWorkouts = () => router.push('/myworkouts')
  </script>
  
  <style scoped>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(6px);
  }
  
  .navbar-content {
    width: 90%;
    max-width: 1000px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
  }
  
  .logo {
    font-size: 1.2rem;
    font-weight: 700;
    cursor: pointer;
  }
  
  .nav-links {
    display: flex;
    gap: 10px;
  }
  
  button {
    border: none;
    border-radius: 8px;
    padding: 8px 14px;
    background-color: #1a1a1a;
    color: white;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.25s;
  }
  
  button:hover {
    border: 1px solid #646cff;
  }
  </style>
  