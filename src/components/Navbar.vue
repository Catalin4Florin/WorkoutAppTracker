<template>
  <nav class="navbar">
    <router-link to="/" class="logo">🏋️ Workout Tracker</router-link>

    <div class="navbar-right">
      <div class="navbar-links" :class="{ open: menuOpen }">
        <router-link to="/" @click="closeMenu">{{ $t('home') }}</router-link>
        <router-link to="/myworkouts" @click="closeMenu">{{ $t('myWorkouts') }}</router-link>
        <router-link to="/profile" @click="closeMenu">{{ $t('profile') }}</router-link>
        <button v-if="user" @click="logoutAndClose">{{ $t('logout') }}</button>
        <router-link v-else to="/login" @click="closeMenu">{{ $t('login') }}</router-link>
      </div>

      <button class="lang-btn" @click="toggleLanguage">
        {{ currentLang === 'en' ? '🇷🇴 Română' : '🇬🇧 English' }}
      </button>

      <button class="burger" @click="toggleMenu">
        <img
          v-if="!menuOpen"
          src="/burger.svg"
          alt="Menu"
          class="icon"
        />
        <img
          v-else
          src="/close.svg"
          alt="Close"
          class="icon"
        />
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useI18n } from 'vue-i18n'

const { user, logout } = useAuth()
const router = useRouter()
const menuOpen = ref(false)

const { locale } = useI18n()
const currentLang = computed(() => locale.value)

const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'ro' : 'en'
  localStorage.setItem('language', locale.value)
}

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
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ✅ Unify <a> and <button> appearance */
.navbar-links a,
.navbar-links button {
  background: none;
  border: 1px solid #ffa500;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  line-height: 1.2;
  font-size: 1rem;
  box-sizing: border-box;
  display: inline-block;
  min-width: 110px; /* ensure same width feel */
  text-align: center;
}

/* language button */
.lang-btn {
  background: none;
  border: 1px solid #ffa500;
  color: #ffa500;
  padding: 6px 12px;
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  box-sizing: border-box;
  line-height: 1.2;
}

.navbar-links a:hover,
.navbar-links button:hover,
.lang-btn:hover {
  background: #ffa500;
  color: black;
  box-shadow: 0 0 10px #ffa500;
}

.burger {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: none;
}

.burger .icon {
  width: 28px;
  height: 28px;
  transition: opacity 0.2s ease;
}

.burger:hover .icon {
  opacity: 0.8;
}

/* ✅ Mobile */
@media (max-width: 1024px) {
  .navbar {
    padding: 8px 14px;
  }

  .burger {
    display: block;
  }

  .navbar-right {
    gap: 10px;
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
  .navbar-links button,
  .lang-btn {
    width: 80%;
    text-align: center;
    margin: 10px 0;
    min-width: unset;
  }

  .lang-btn {
    order: 1;
  }

  .burger {
    order: 2;
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

