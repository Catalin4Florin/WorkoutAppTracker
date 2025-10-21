<template>
  <nav class="navbar">
    <router-link to="/" class="logo">🏋️ Workout Tracker</router-link>

    <div class="burger" @click="toggleMenu">
      <div :class="{ active: menuOpen }" class="burger-icon">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div class="navbar-links" :class="{ open: menuOpen }">
      <router-link to="/" @click="closeMenu">Home</router-link>
      <router-link to="/myworkouts" @click="closeMenu">My Workouts</router-link>
      <router-link to="/profile" @click="closeMenu">Profile</router-link>
      <button v-if="user" @click="logoutAndClose">Logout</button>
      <router-link v-else to="/login" @click="closeMenu">Login</router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const { user, logout } = useAuth()
const router = useRouter()
const menuOpen = ref(false)

const toggleMenu = () => (menuOpen.value = !menuOpen.value)
const closeMenu = () => (menuOpen.value = false)

const logoutAndClose = async () => {
  await logout()
  closeMenu()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.9);
  padding: 15px 20px;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  box-sizing: border-box;
}

.logo {
  font-weight: bold;
  color: #ffa500;
  text-decoration: none;
  font-size: 1.1rem;
  white-space: nowrap;
  flex-shrink: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.navbar-links a,
.navbar-links button {
  background: #1a1a1a;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.navbar-links a:hover,
.navbar-links button:hover {
  background: #333;
}

/* Burger inside flex flow */
.burger {
  display: none;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 10px;
}

.burger-icon {
  width: 28px;
  height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.burger-icon span {
  background: #ffa500;
  height: 3px;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.burger-icon.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 6px);
}
.burger-icon.active span:nth-child(2) {
  opacity: 0;
}
.burger-icon.active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -6px);
}

/* Responsive Navbar */
@media (max-width: 1024px) {
  .burger {
    display: block;
  }

  .navbar-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: center;
    background: rgba(0, 0, 0, 0.97);
    padding: 20px 0;
    display: none;
  }

  .navbar-links.open {
    display: flex;
    animation: slideDown 0.3s ease;
  }

  .navbar-links a,
  .navbar-links button {
    width: 80%;
    text-align: center;
    margin: 10px 0;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
