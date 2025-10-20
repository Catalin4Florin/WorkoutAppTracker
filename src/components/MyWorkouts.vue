<template>
    <div class="my-workouts">
      <h1>My Workouts</h1>
      
      <button @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : 'Add New Workout' }}
      </button>
  
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
        <button @click="addWorkout">Save Workout</button>
      </div>
  
      <div class="workouts-list" v-if="workouts.length">
        <h2>Previous Workouts</h2>
        <ul>
          <li v-for="(w, index) in workouts" :key="index">
            {{ w.date }} — {{ w.exerciseName }}: {{ w.sets }}x{{ w.reps }} @ {{ w.weight }}kg
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
  import { db } from '../firebase'
  import { ref, onMounted } from 'vue'
  import { db } from '../firebase'

  
  const { user } = useAuth()
  
  const showForm = ref(false)
  const exerciseName = ref('')
  const sets = ref(3)
  const reps = ref(10)
  const weight = ref(0)
  const workouts = ref([])
  
  const workoutsCollection = collection(db, 'workouts')
  
  const loadWorkouts = async () => {
  if (!user.value) return

  const workoutsCollection = collection(db, 'workouts')
  const q = query(
    workoutsCollection,
    where('uid', '==', user.value.uid),
    orderBy('date', 'desc')
  )
  const snapshot = await getDocs(q)
  workouts.value = snapshot.docs.map(doc => doc.data())
}
  
import { watch } from 'vue'

watch(user, (u) => {
  if (u) loadWorkouts()
})
  
  // Add new workout to Firestore
  const addWorkout = async () => {
    if (!user.value) return
  
    const date = new Date().toLocaleDateString()
  
    const newWorkout = {
      uid: user.value.uid,
      date,
      exerciseName: exerciseName.value,
      sets: sets.value,
      reps: reps.value,
      weight: weight.value
    }
  
    await addDoc(workoutsCollection, newWorkout)
    workouts.value.unshift(newWorkout) // add to local list
  
    // reset form
    exerciseName.value = ''
    sets.value = 3
    reps.value = 10
    weight.value = 0
    showForm.value = false
  }
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
  