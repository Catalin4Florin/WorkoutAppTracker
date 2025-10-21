<template>
  <div class="workouts-background">
    <div class="my-workouts">
      <h1>My Workouts</h1>
      <button v-if="user" @click="logout">Logout</button>

      <!-- Logout success popup -->
      <div v-if="showLogoutPopup" class="logout-popup">
        Successfully logged out!
      </div>

      <!-- Add / Cancel Workout Button -->
      <button @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : editingWorkout ? 'Edit Workout' : 'Add New Workout' }}
      </button>

      <!-- Workout Form -->
      <div v-if="showForm" class="new-workout-form">
        <h2>{{ editingWorkout ? 'Edit Workout' : 'New Workout' }}</h2>

        <!-- Exercise Form -->
        <div v-for="(exercise, exIndex) in exercises" :key="exIndex" class="exercise-form">
          <label>
            Muscle Group:
            <select v-model="exercise.muscle">
              <option value="">Select Muscle</option>
              <option v-for="group in muscleGroups" :key="group" :value="group">
                {{ group }}
              </option>
            </select>
          </label>

          <label>
            Exercise:
            <select v-model="exercise.name">
              <option disabled value="">Select Exercise</option>
              <option
                v-for="ex in exerciseOptions.filter(e => e.muscle === exercise.muscle)"
                :key="ex.name"
                :value="ex.name"
              >
                {{ ex.name }}
              </option>
            </select>
          </label>

          <!-- Sets -->
          <div v-for="(set, setIndex) in exercise.sets" :key="setIndex" class="set-input">
            <label>
              Reps:
              <input v-model.number="set.reps" type="number" min="1" />
            </label>
            <label>
              Weight:
              <input v-model.number="set.weight" type="number" min="0" />
            </label>
            <button @click="removeSet(exIndex, setIndex)">Remove Set</button>
          </div>

          <button @click="addSet(exIndex)">Add Set</button>
          <button @click="removeExercise(exIndex)">Remove Exercise</button>
          <hr />
        </div>

        <button @click="addExercise">Add Exercise</button>
        <button @click="saveWorkout">
          {{ editingWorkout ? 'Update Workout' : 'Save Workout' }}
        </button>
      </div>

      <!-- Workouts List -->
      <div class="workouts-list" v-if="workouts.length">
        <h2>Previous Workouts</h2>
        <ul>
          <li v-for="w in workouts" :key="w.id">
            <strong>{{ w.date }}</strong>
            <ul>
              <li v-for="(ex, i) in w.exercises" :key="i">
                {{ ex.muscle }} — {{ ex.name }}:
                <span v-for="(set, si) in ex.sets" :key="si">
                  {{ set.reps }}x{{ set.weight }}kg
                  <span v-if="si < ex.sets.length - 1">, </span>
                </span>
              </li>
            </ul>
            <button @click="startEditWorkout(w)">Edit</button>
            <button @click="deleteWorkout(w.id)">Delete</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import { db } from '../firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import { useAuth } from '../composables/useAuth'
import { getAuth, signOut } from 'firebase/auth'

const router = useRouter()
const auth = getAuth()
const showLogoutPopup = ref(false)
const { user, loading } = useAuth()

const logout = async () => {
  try {
    await signOut(auth)
    showLogoutPopup.value = true
    exercises.value = []
    workouts.value = []
    editingWorkout.value = null
    showForm.value = false
    setTimeout(() => {
      showLogoutPopup.value = false
      router.push('/')
    }, 1500)
  } catch (err) {
    console.error('Error logging out:', err)
  }
}

const exerciseOptions = [
  { name: 'Bench Press', muscle: 'Chest' },
  { name: 'Incline Dumbbell Press', muscle: 'Chest' },
  { name: 'Squat', muscle: 'Legs' },
  { name: 'Deadlift', muscle: 'Back' },
  { name: 'Pull-Up', muscle: 'Back' },
  { name: 'Overhead Press', muscle: 'Shoulders' },
  { name: 'Bicep Curl', muscle: 'Arms' },
  { name: 'Tricep Pushdown', muscle: 'Arms' }
]
const muscleGroups = ['Chest', 'Legs', 'Back', 'Shoulders', 'Arms']
const showForm = ref(false)
const exercises = ref([])
const editingWorkout = ref(null)
const workouts = ref([])
const workoutsCollection = collection(db, 'workouts')

const addExercise = () => exercises.value.push({ muscle: '', name: '', sets: [{ reps: 10, weight: 0 }] })
const removeExercise = (index) => exercises.value.splice(index, 1)
const addSet = (exIndex) => exercises.value[exIndex].sets.push({ reps: 10, weight: 0 })
const removeSet = (exIndex, setIndex) => exercises.value[exIndex].sets.splice(setIndex, 1)
const startEditWorkout = (workout) => {
  editingWorkout.value = { ...workout }
  exercises.value = workout.exercises.map(ex => ({ ...ex, sets: ex.sets.map(s => ({ ...s })) }))
  showForm.value = true
}

const updateUserStats = async () => {
  if (!user.value) return
  const q = query(workoutsCollection, where('uid', '==', user.value.uid))
  const snapshot = await getDocs(q)

  let totalWeight = 0
  snapshot.forEach(docSnap => {
    const data = docSnap.data()
    data.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        totalWeight += set.reps * set.weight
      })
    })
  })

  const userRef = doc(db, 'users', user.value.uid)
  await updateDoc(userRef, {
    totalWorkouts: snapshot.size,
    totalWeight
  })
}

const saveWorkout = async () => {
  if (!user.value || exercises.value.length === 0) return

  try {
    if (editingWorkout.value) {
      const workoutRef = doc(db, 'workouts', editingWorkout.value.id)
      await updateDoc(workoutRef, { exercises: exercises.value })
      editingWorkout.value = null
    } else {
      const newWorkout = {
        uid: user.value.uid,
        date: new Date().toISOString(),
        exercises: exercises.value
      }
      await addDoc(workoutsCollection, newWorkout)
    }

    await loadWorkouts()
    await updateUserStats() // recalc totals
    exercises.value = []
    showForm.value = false
  } catch (err) {
    console.error('Error saving workout:', err)
  }
}

const deleteWorkout = async (id) => {
  try {
    await deleteDoc(doc(db, 'workouts', id))
    workouts.value = workouts.value.filter(w => w.id !== id)
    await updateUserStats() // recalc totals
  } catch (err) {
    console.error('Error deleting workout:', err)
  }
}

const loadWorkouts = async () => {
  if (!user.value) return
  try {
    const q = query(workoutsCollection, where('uid', '==', user.value.uid), orderBy('date', 'desc'))
    const snapshot = await getDocs(q)
    workouts.value = snapshot.docs.map(doc => {
      const data = doc.data()
      return { id: doc.id, ...data, date: new Date(data.date).toLocaleDateString() }
    })
  } catch (err) {
    console.error('Error loading workouts:', err)
  }
}

onMounted(() => {
  watch([user, loading], ([u, isLoading]) => {
    if (!isLoading && u) loadWorkouts()
  }, { immediate: true })
})
</script>

<style scoped>
.workouts-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url('/notepad.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 40px;
  overflow: hidden;
}

.my-workouts {
  background-color: rgba(0, 0, 0, 0.65);
  padding: 30px;
  border-radius: 12px;
  color: white;
  width: 500px;
  max-height: 85vh;
  overflow-y: auto;
}

.logout-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #ffb347;
  padding: 20px 30px;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  animation: fadeInOut 1.5s ease-in-out forwards;
  box-shadow: 0 0 20px rgba(255, 179, 71, 0.5);
  z-index: 999;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -60%); }
  15% { opacity: 1; transform: translate(-50%, -50%); }
  85% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -40%); }
}
</style>
