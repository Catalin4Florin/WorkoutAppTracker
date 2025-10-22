<template>
  <div class="my-workouts">
    <h1>{{ $t('myWorkouts') }}</h1>

    <button @click="showForm = !showForm">
      {{ showForm ? $t('cancel') : $t('addNewWorkout') }}
    </button>

    <div v-if="showForm" class="new-workout-form">
      <label>
        {{ $t('exerciseName') }}:
        <input v-model="exerciseName" type="text" :placeholder="$t('placeholderExercise')" />
      </label>

      <label>
        {{ $t('sets') }}:
        <input v-model.number="sets" type="number" min="1" />
      </label>

      <label>
        {{ $t('reps') }}:
        <input v-model.number="reps" type="number" min="1" />
      </label>

      <label>
        {{ $t('weight') }}:
        <input v-model.number="weight" type="number" min="0" />
      </label>

      <button @click="saveWorkout">{{ $t('saveWorkout') }}</button>
    </div>

    <div v-if="loading">{{ $t('loadingWorkouts') }}</div>

    <div v-else>
      <div v-if="workouts.length === 0">
        <p>{{ $t('noWorkouts') }}</p>
      </div>

      <ul v-else class="workout-list">
        <li v-for="workout in workouts" :key="workout.id" class="workout-item">
          <div class="workout-details">
            <strong>{{ workout.exerciseName }}</strong>
            <p>{{ $t('sets') }}: {{ workout.sets }} | {{ $t('reps') }}: {{ workout.reps }} | {{ $t('weight') }}: {{ workout.weight }} kg</p>
          </div>
          <div class="buttons">
            <button @click="editWorkout(workout)">{{ $t('edit') }}</button>
            <button @click="deleteWorkout(workout.id)">{{ $t('delete') }}</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { useAuth } from '../composables/useAuth'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore'

const { user } = useAuth()
const exerciseName = ref('')
const sets = ref(0)
const reps = ref(0)
const weight = ref(0)
const workouts = ref([])
const showForm = ref(false)
const loading = ref(true)
const editingWorkout = ref(null)

const fetchWorkouts = async () => {
  if (!user.value) return
  loading.value = true
  const workoutsRef = collection(db, 'workouts')
  const q = query(workoutsRef, where('uid', '==', user.value.uid))
  const snapshot = await getDocs(q)
  workouts.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  loading.value = false
}

const saveWorkout = async () => {
  if (!user.value) return
  const workoutData = {
    uid: user.value.uid,
    exerciseName: exerciseName.value,
    sets: sets.value,
    reps: reps.value,
    weight: weight.value
  }

  if (editingWorkout.value) {
    const workoutRef = doc(db, 'workouts', editingWorkout.value.id)
    await updateDoc(workoutRef, workoutData)
    editingWorkout.value = null
  } else {
    await addDoc(collection(db, 'workouts'), workoutData)
  }

  exerciseName.value = ''
  sets.value = 0
  reps.value = 0
  weight.value = 0
  showForm.value = false
  fetchWorkouts()
}

const editWorkout = workout => {
  editingWorkout.value = workout
  exerciseName.value = workout.exerciseName
  sets.value = workout.sets
  reps.value = workout.reps
  weight.value = workout.weight
  showForm.value = true
}

const deleteWorkout = async id => {
  await deleteDoc(doc(db, 'workouts', id))
  fetchWorkouts()
}

onMounted(() => {
  fetchWorkouts()
})
</script>

<style scoped>
.my-workouts {
  background-color: black;
  color: white;
  width: 100vw;
  min-height: 100vh;
  padding: 40px;
  text-align: center;
}

button {
  background: #333;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  margin: 5px;
  cursor: pointer;
}

button:hover {
  background: #444;
}

.new-workout-form {
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  width: 300px;
  gap: 10px;
}

input {
  background: #222;
  border: 1px solid #555;
  color: white;
  border-radius: 6px;
  padding: 6px;
  margin-left: 8px;
}

.workout-list {
  list-style: none;
  padding: 0;
  margin-top: 20px;
}

.workout-item {
  background: #1a1a1a;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.workout-details {
  text-align: left;
}

.buttons button {
  margin-left: 5px;
}
</style>
