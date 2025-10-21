<template>
  <div class="home-container">
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
import { ref, watch } from 'vue'
import { db } from '../firebase'
import { useAuth } from '../composables/useAuth'
import { doc, getDoc } from 'firebase/firestore'

const { user, loading } = useAuth()
const nickname = ref('')

const loadNickname = async () => {
  if (!user.value) return
  try {
    const userRef = doc(db, 'users', user.value.uid)
    const snapshot = await getDoc(userRef)
    if (snapshot.exists()) {
      nickname.value = snapshot.data().nickname || ''
    }
  } catch (err) {
    console.error('Error loading nickname:', err)
  }
}

watch([user, loading], ([u, isLoading]) => {
  if (!isLoading && u) loadNickname()
}, { immediate: true })
</script>

<style scoped>
.home-container {
  background-image: url('/jayCutler.jpg');
  background-size: cover;
  background-position: center;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.overlay {
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
  background-color: #3b82f6;
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}

.register-btn:hover {
  background-color: #2563eb;
}
</style>
