<template>
  <div class="my-workouts">
    <h1>My Workouts</h1>
    <button v-if="user" @click="logout">Logout</button>


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
            <option v-for="group in muscleGroups" :key="group" :value="group">{{ group }}</option>
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
      <button @click="saveWorkout">{{ editingWorkout ? 'Update Workout' : 'Save Workout' }}</button>
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
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { db } from '../firebase'
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { useAuth } from '../composables/useAuth'
import { getAuth, signOut } from 'firebase/auth'

const auth = getAuth()

const logout = async () => {
  try {
    await signOut(auth)
    console.log('User logged out')
    // Optionally reset local state
    exercises.value = []
    workouts.value = []
    editingWorkout.value = null
    showForm.value = false
  } catch (err) {
    console.error('Error logging out:', err)
  }
}

const { user, loading } = useAuth()

// Exercise Options
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

// Form state
const showForm = ref(false)
const exercises = ref([])
const editingWorkout = ref(null)

// Workouts state
const workouts = ref([])
const workoutsCollection = collection(db, 'workouts')

// Form functions
const addExercise = () => {
  exercises.value.push({ muscle: '', name: '', sets: [{ reps: 10, weight: 0 }] })
}

const removeExercise = (index) => {
  exercises.value.splice(index, 1)
}

const addSet = (exIndex) => {
  exercises.value[exIndex].sets.push({ reps: 10, weight: 0 })
}

const removeSet = (exIndex, setIndex) => {
  exercises.value[exIndex].sets.splice(setIndex, 1)
}

const startEditWorkout = (workout) => {
  editingWorkout.value = { ...workout }
  exercises.value = workout.exercises.map(ex => ({ ...ex, sets: ex.sets.map(s => ({ ...s })) }))
  showForm.value = true
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
  } catch (err) {
    console.error('Error deleting workout:', err)
  }
}

// Load workouts
const loadWorkouts = async () => {
  if (!user.value) return

  try {
    const q = query(
      workoutsCollection,
      where('uid', '==', user.value.uid),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    workouts.value = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        date: new Date(data.date).toLocaleDateString()
      }
    })
  } catch (err) {
    console.error('Error loading workouts:', err)
  }
}

// Watch auth state
onMounted(() => {
  watch([user, loading], ([u, isLoading]) => {
    if (!isLoading && u) loadWorkouts()
  }, { immediate: true })
})
</script>

<style scoped>
.my-workouts {
  width: 500px;
  margin: 30px auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.new-workout-form label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
.exercise-form {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 5px;
  border-radius: 5px;
}
.set-input {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
}
select, input {
  flex: 1;
  margin-left: 10px;
}
</style>
