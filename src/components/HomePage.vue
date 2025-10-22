<template>
  <div class="home-container">
    <transition name="fade" mode="out-in">
      <div
        class="background-image"
        :style="{ backgroundImage: `url(${backgroundImages[currentImage]})` }"
        :key="currentImage"
      ></div>
    </transition>

    <div class="overlay">
      <h1 class="title">{{ $t('welcomeTitle') }}, {{ userDisplayName }}</h1>
      <p>{{ $t('welcomeText') }}</p>

      <div class="features">
        <p>💪 {{ $t('feature1') }}</p>
        <p>📈 {{ $t('feature2') }}</p>
      </div>

      <div class="register-btn-container" v-if="!user">
        <router-link to="/login" class="register-btn">
          {{ $t('registerNow') }}
        </router-link>
      </div>
    </div>

    <!-- ✅ Recommended Workouts -->
    <div v-if="user" class="recommended-section">
      <h2>🔥 Recommended Workouts</h2>
      <div class="workout-list">
        <div
          v-for="(workout, index) in recommendedWorkouts"
          :key="index"
          class="workout-card"
        >
          <h3>{{ workout.name }}</h3>
          <ul>
            <li v-for="ex in workout.exercises" :key="ex.name">
              {{ ex.muscle }} — {{ ex.name }}
            </li>
          </ul>
          <button @click="startWorkout(workout)" class="start-btn">
            Start Workout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { db } from '../firebase'
import { useAuth } from '../composables/useAuth'
import { addDoc, collection } from 'firebase/firestore'

const { t } = useI18n()
const { user } = useAuth()

// rotating background
const backgroundImages = [
  '/arnoldGym.jpg',
  '/ronnieColeman.jpg',
  '/jayCutler.jpg'
]
const currentImage = ref(0)
onMounted(() => {
  setInterval(() => {
    currentImage.value = (currentImage.value + 1) % backgroundImages.length
  }, 8000)
})

// ✅ show username if logged in
const userDisplayName = computed(() => {
  if (!user.value) return 'Athlete'
  return user.value.displayName || user.value.email.split('@')[0]
})

// ✅ Recommended workouts
const recommendedWorkouts = [
  {
    name: 'Push Day',
    exercises: [
      { muscle: 'Chest', name: 'Bench Press' },
      { muscle: 'Shoulders', name: 'Overhead Press' },
      { muscle: 'Arms', name: 'Tricep Rope Pushdown' }
    ]
  },
  {
    name: 'Pull Day',
    exercises: [
      { muscle: 'Back', name: 'Deadlift' },
      { muscle: 'Back', name: 'Pull-Up' },
      { muscle: 'Arms', name: 'Barbell Curl' }
    ]
  },
  {
    name: 'Leg Day',
    exercises: [
      { muscle: 'Legs', name: 'Squat' },
      { muscle: 'Legs', name: 'Leg Press' },
      { muscle: 'Legs', name: 'Calf Raise' }
    ]
  }
]

const workoutsCollection = collection(db, 'workouts')

const startWorkout = async (workout) => {
  if (!user.value) return

  const newWorkout = {
    uid: user.value.uid,
    date: new Date().toISOString(),
    exercises: workout.exercises.map((ex) => ({
      ...ex,
      sets: [{ reps: null, weight: null }]
    }))
  }

  try {
    await addDoc(workoutsCollection, newWorkout)
    alert('Workout added to My Workouts!')
  } catch (err) {
    console.error('Error adding recommended workout:', err)
  }
}
</script>

<style scoped>
.home-container {
  position: relative;
  min-height: 100svh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  padding-top: 80px;
  padding-bottom: 80px;
}

.background-image {
  position: fixed;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: opacity 1.5s ease-in-out;
  z-index: 0;
}

.overlay {
  position: relative;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.65);
  padding: 40px;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  text-align: center;
  margin: 20px auto;
}

.title {
  color: #ffa500;
  margin-bottom: 15px;
}

.features {
  margin: 20px 0;
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

/* ✅ Recommended Section */
.recommended-section {
  z-index: 1;
  background: rgba(0, 0, 0, 0.65);
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 700px;
  margin-top: 30px;
  color: white;
}

.recommended-section h2 {
  color: #ffa500;
  margin-bottom: 20px;
  text-align: center;
}

.workout-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.workout-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 16px;
  width: 200px;
  text-align: left;
  transition: transform 0.2s ease;
}

.workout-card:hover {
  transform: translateY(-3px);
}

.workout-card h3 {
  color: #ffa500;
  margin-bottom: 10px;
}

.workout-card ul {
  margin: 0;
  padding: 0 0 10px 15px;
  list-style: none;
}

.start-btn {
  background: #198754;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  width: 100%;
  cursor: pointer;
  transition: 0.2s ease;
}

.start-btn:hover {
  background: #157347;
}

/* ✅ Mobile */
@media (max-width: 768px) {
  .overlay {
    width: 88%;
    max-width: 360px;
    padding: 24px 18px;
    margin: 60px auto;
  }

  .recommended-section {
    padding: 20px;
    margin-top: 20px;
  }

  .workout-card {
    width: 90%;
  }
}
</style>
