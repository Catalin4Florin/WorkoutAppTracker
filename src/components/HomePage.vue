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
      <ul>
        <li>💪 Create detailed workouts with sets, reps, and weights.</li>
        <li>📈 Review your previous sessions to measure progress.</li>
      </ul>
      <p>Start now — and take control of your training!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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
      const data = snapshot.data()
      nickname.value = data.nickname || ''
    }
  } catch (err) {
    console.error('Error loading nickname:', err)
  }
}

watch(
  [user, loading],
  ([u, isLoading]) => {
    if (!isLoading && u) loadNickname()
  },
  { immediate: true }
)
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
</style>
