<template>
  <div class="home-container">
    <transition name="fade" mode="out-in">
      <div
        :key="currentImage"
        class="background-image"
        :style="{ backgroundImage: `url(${currentImage})` }"
      ></div>
    </transition>

    <div class="overlay">
      <h1 class="title">
        Welcome to Workout Tracker<span v-if="nickname">, {{ nickname }}</span>
      </h1>
      <p>
        Track your workouts, log your progress, and stay consistent with your fitness goals.
        Whether you're training for strength, endurance, or aesthetics — this app helps you
        stay organized and motivated every step of the way.
      </p>
      <div class="features">
        <p>💪 Create detailed workouts with sets, reps, and weights.</p>
        <p>📈 Review your previous sessions to measure progress.</p>
      </div>
      <p>Start now — and take control of your training!</p>

      <div v-if="!user" class="register-btn-container">
        <router-link to="/login" class="register-btn">Register Now</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { db } from '../firebase'
import { useAuth } from '../composables/useAuth'
import { doc, getDoc } from 'firebase/firestore'

const { user, loading } = useAuth()
const nickname = ref('')

const loadNickname = async () => {
  if (!user.value) {
    nickname.value = ''
    return
  }
  try {
    const userRef = doc(db, 'users', user.value.uid)
    const snapshot = await getDoc(userRef)
    if (snapshot.exists()) {
      nickname.value = snapshot.data().nickname || ''
    } else {
      nickname.value = ''
    }
  } catch (err) {
    console.error('Error loading nickname:', err)
  }
}

watch(
  [user, loading],
  ([u, isLoading]) => {
    if (isLoading) return
    if (u) loadNickname()
    else nickname.value = ''
  },
  { immediate: true }
)

const images = [
  '/jayCutler.jpg',
  '/arnoldGym.jpg',
  '/ronnieColeman.jpg',
]

const currentIndex = ref(0)
const currentImage = ref(images[currentIndex.value])
let intervalId

onMounted(() => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.length
    currentImage.value = images[currentIndex.value]
  }, 2500) 
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<style scoped>
.home-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.background-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: opacity 1.5s ease-in-out;
  z-index: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.overlay {
  position: relative;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.65);
  padding: 40px;
  border-radius: 12px;
  max-width: 600px;
  text-align: center;
}

.title {
  color: #ffa500;
  margin-bottom: 15px;
}

.features {
  margin: 20px 0;
}

.features p {
  margin: 8px 0;
}

.register-btn-container {
  margin-top: 20px;
}

.register-btn {
  background-color: #ffa500;
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}

.register-btn:hover {
  background-color: #ae7202;
}
</style>
