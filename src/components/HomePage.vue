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

      <p class="cta">Start now — and take control of your training!</p>

      <div class="register-btn-container" v-if="!user">
        <router-link to="/login" class="register-btn">Register Now</router-link>
      </div>
    </div>

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
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { useAuth } from '../composables/useAuth'
import { addDoc, collection, doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const { user } = useAuth()
const router = useRouter()
const nickname = ref('')

onMounted(async () => {
  if (user.value) {
    const userRef = doc(db, 'users', user.value.uid)
    const userSnap = await getDoc(userRef)
    if (userSnap.exists()) nickname.value = userSnap.data().nickname || ''
  }
})

const backgroundImages = ['/arnoldGym.jpg', '/ronnieColeman.jpg', '/jayCutler.jpg']
const currentImage = ref(0)
onMounted(() => {
  setInterval(() => {
    currentImage.value = (currentImage.value + 1) % backgroundImages.length
  }, 8000)
})

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
    exercises: workout.exercises.map(ex => ({ ...ex, sets: [{ reps: null, weight: null }] }))
  }
  try {
    const docRef = await addDoc(workoutsCollection, newWorkout)
    router.push({ path: '/myworkouts', query: { editWorkout: docRef.id } })
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

.cta {
  margin-top: 20px;
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

.recommended-section {
  z-index: 1;
  background: rgba(0, 0, 0, 0.65);
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 1000px;
  margin-top: 30px;
  color: white;
  text-align: center;
}

.recommended-section h2 {
  color: #ffa500;
  margin-bottom: 25px;
  text-align: center;
}

.workout-list {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 25px;
  flex-wrap: nowrap; 
}

.workout-card {
  flex: 1;
  min-width: 250px;
  max-width: 300px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 18px;
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

@media (max-width: 900px) {
  .workout-list {
    flex-wrap: wrap;
  }
  .workout-card {
    width: 90%;
    max-width: 400px;
  }
  .recommended-section {
    padding: 20px;
  }
}
</style>
