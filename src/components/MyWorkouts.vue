<template>
  <div class="my-workouts">
    <h1>My Workouts</h1>

    <!-- Add New Workout Button -->
    <button @click="showForm = !showForm">
      {{ showForm ? 'Cancel' : 'Add New Workout' }}
    </button>

    <!-- New Workout Form -->
    <div v-if="showForm" class="new-workout-form">
      <label>
        Exercise Name:
        <input v-model="exerciseName" type="text" placeholder="e.g., Bench Press" />
      </label>
      <label>
        Sets:
        <input v-model.number="sets" type="number" min="1" />
      </label>
      <label>
        Reps:
        <input v-model.number="reps" type="number" min="1" />
      </label>
      <label>
        Weight:
        <input v-model.number="weight" type="number" min="0" />
      </label>
      <button @click="saveWorkout">
        {{ editingWorkout ? 'Update Workout' : 'Add Workout' }}
      </button>
    </div>

    <!-- Workouts List -->
    <div class="workouts-list" v-if="workouts.length">
      <h2>Previous Workouts</h2>
      <ul>
        <li v-for="(w, index) in workouts" :key="w.id">
          {{ w.date }} — {{ w.exerciseName }}: {{ w.sets }}x{{ w.reps }} @ {{ w.weight }}kg
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
import { 
  collection, addDoc, getDocs, query, where, orderBy, 
  doc, deleteDoc, updateDoc 
} from 'firebase/firestore' // <-- added updateDoc here
import { useAuth } from '../composables/useAuth'

const { user, loading } = useAuth()

// Form state
const showForm = ref(false)
const exerciseName = ref('')
const sets = ref(3)
const reps = ref(10)
const weight = ref(0)
const editingWorkout = ref(null) // currently editing workout

// Workouts array
const workouts = ref([])

// Firestore collection reference
const workoutsCollection = collection(db, 'workouts')

// Function to load workouts for logged-in user
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

// Add or update workout
const saveWorkout = async () => {
  if (!user.value) return

  try {
    if (editingWorkout.value) {
      // Update existing workout
      const workoutRef = doc(db, 'workouts', editingWorkout.value.id)
      await updateDoc(workoutRef, {
        exerciseName: exerciseName.value,
        sets: sets.value,
        reps: reps.value,
        weight: weight.value
      })
      editingWorkout.value = null
    } else {
      // Add new workout
      const newWorkout = {
        uid: user.value.uid,
        date: new Date().toISOString(),
        exerciseName: exerciseName.value,
        sets: sets.value,
        reps: reps.value,
        weight: weight.value
      }
      await addDoc(workoutsCollection, newWorkout)
    }

    // Reload workouts and reset form
    await loadWorkouts()
    exerciseName.value = ''
    sets.value = 3
    reps.value = 10
    weight.value = 0
    showForm.value = false
  } catch (err) {
    console.error('Error saving workout:', err)
  }
}

// Start editing a workout
const startEditWorkout = (workout) => {
  editingWorkout.value = { ...workout } // clone the object
  showForm.value = true
  exerciseName.value = workout.exerciseName
  sets.value = workout.sets
  reps.value = workout.reps
  weight.value = workout.weight
}

// Delete workout
const deleteWorkout = async (id) => {
  try {
    await deleteDoc(doc(db, 'workouts', id))
    workouts.value = workouts.value.filter(w => w.id !== id)
  } catch (err) {
    console.error('Error deleting workout:', err)
  }
}

// Watch for changes in `user` and `loading` to trigger loadWorkouts
onMounted(() => {
  watch(
    [user, loading],
    ([u, isLoading]) => {
      if (!isLoading && u) loadWorkouts()
    },
    { immediate: true }
  )
})
</script>

<style scoped>
.my-workouts {
  width: 400px;
  margin: 50px auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.new-workout-form label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
</style>
