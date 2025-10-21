<template>
  <div class="workouts-background">
    <div class="my-workouts">
      <h1>My Workouts</h1>

      <div v-if="showLogoutPopup" class="logout-popup">
        Successfully logged out!
      </div>

      <!-- Add Workout Button -->
      <button v-if="!showForm" @click="startNewWorkout" class="add-workout">
        Add New Workout
      </button>

      <!-- Workout Form -->
      <div v-if="showForm" class="new-workout-form">
        <h2>{{ editingWorkout ? 'Edit Workout' : 'New Workout' }}</h2>

        <div
          v-for="(exercise, exIndex) in exercises"
          :key="exIndex"
          class="exercise-form"
        >
          <label>
            Muscle Group:
            <select v-model="exercise.muscle">
              <option value="">Select Muscle</option>
              <option
                v-for="group in muscleGroups"
                :key="group"
                :value="group"
              >
                {{ group }}
              </option>
            </select>
          </label>

          <label>
            Exercise:
            <select v-model="exercise.name">
              <option disabled value="">Select Exercise</option>
              <option
                v-for="ex in exerciseOptions.filter(
                  (e) => e.muscle === exercise.muscle
                )"
                :key="ex.name"
                :value="ex.name"
              >
                {{ ex.name }}
              </option>
            </select>
          </label>

          <div
            v-for="(set, setIndex) in exercise.sets"
            :key="setIndex"
            class="set-input"
          >
          <label>
  Reps:
  <input
    v-model.number="set.reps"
    type="number"
    min="1"
    placeholder="8"
  />
</label>
<label>
  Weight:
  <input
    v-model.number="set.weight"
    type="number"
    min="0"
    placeholder="0"
  />
</label>
            <button @click="removeSet(exIndex, setIndex)">Remove Set</button>
          </div>

          <div class="exercise-actions">
            <button class="add-set" @click="addSet(exIndex)">Add Set</button>
            <button class="remove-exercise" @click="removeExercise(exIndex)">
              Remove Exercise
            </button>
          </div>
          <hr />
        </div>

        <button @click="addExercise" class="add-exercise">Add Exercise</button>

        <div class="form-actions">
          <button @click="cancelWorkout" class="cancel-workout">Cancel</button>
          <button @click="saveWorkout" class="save-workout">
            {{ editingWorkout ? 'Update Workout' : 'Save Workout' }}
          </button>
        </div>
      </div>

      <!-- Previous Workouts -->
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
            <button @click="openDeleteModal(w)">Delete</button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Delete Modal -->
    <div
      v-if="showDeleteModal"
      class="modal-backdrop"
      @click.self="closeDeleteModal"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal">
        <h3>Delete this workout?</h3>
        <p class="modal-sub">
          Date: <strong>{{ pendingDelete.meta.date }}</strong> • Exercises:
          <strong>{{ pendingDelete.meta.exerciseCount }}</strong>
        </p>

        <div class="modal-actions">
          <button class="btn-danger" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
          <button
            class="btn-secondary"
            :disabled="deleting"
            @click="closeDeleteModal"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
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

const startNewWorkout = () => {
  showForm.value = true
  exercises.value = [{ muscle: '', name: '', sets: [{ reps: null, weight: null }] }]
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

const cancelWorkout = () => {
  showForm.value = false
  exercises.value = []
  editingWorkout.value = null
}

const addExercise = () =>
  exercises.value.push({ muscle: '', name: '', sets: [{ reps: null, weight: null }] })

const removeExercise = (index) => exercises.value.splice(index, 1)

const addSet = (exIndex) =>
  exercises.value[exIndex].sets.push({ reps: null, weight: null })

const removeSet = (exIndex, setIndex) =>
  exercises.value[exIndex].sets.splice(setIndex, 1)

const startEditWorkout = (workout) => {
  editingWorkout.value = { ...workout }
  exercises.value = workout.exercises.map((ex) => ({
    ...ex,
    sets: ex.sets.map((s) => ({ ...s }))
  }))
  showForm.value = true
}

const updateUserStats = async () => {
  if (!user.value) return
  const q = query(workoutsCollection, where('uid', '==', user.value.uid))
  const snapshot = await getDocs(q)

  let totalWeight = 0
  snapshot.forEach((docSnap) => {
    const data = docSnap.data()
    data.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
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
    await updateUserStats()
    cancelWorkout()
  } catch (err) {
    console.error('Error saving workout:', err)
  }
}

const showDeleteModal = ref(false)
const deleting = ref(false)
const pendingDelete = ref({
  id: null,
  meta: { date: '', exerciseCount: 0 }
})

const openDeleteModal = (workout) => {
  pendingDelete.value.id = workout.id
  pendingDelete.value.meta.date = workout.date
  pendingDelete.value.meta.exerciseCount = workout.exercises?.length || 0
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  if (deleting.value) return
  showDeleteModal.value = false
  pendingDelete.value = {
    id: null,
    meta: { date: '', exerciseCount: 0 }
  }
}

const confirmDelete = async () => {
  if (!pendingDelete.value.id) return
  deleting.value = true
  try {
    await deleteDoc(doc(db, 'workouts', pendingDelete.value.id))
    workouts.value = workouts.value.filter(
      (w) => w.id !== pendingDelete.value.id
    )
    await updateUserStats()
  } catch (err) {
    console.error('Error deleting workout:', err)
  } finally {
    deleting.value = false
    closeDeleteModal()
  }
}

const onKeydown = (e) => {
  if (e.key === 'Escape' && showDeleteModal.value) closeDeleteModal()
}

const loadWorkouts = async () => {
  if (!user.value) return
  try {
    const q = query(
      workoutsCollection,
      where('uid', '==', user.value.uid),
      orderBy('date', 'desc')
    )
    const snapshot = await getDocs(q)
    workouts.value = snapshot.docs.map((doc) => {
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

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  watch(
    [user, loading],
    ([u, isLoading]) => {
      if (!isLoading && u) loadWorkouts()
    },
    { immediate: true }
  )
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.cancel-workout {
  background: #6c757d;
}

.cancel-workout:hover {
  background: #5c636a;
}

.workouts-background {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background-image: url('/notepad.jpg');
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  padding-top: 100px; 
  padding-bottom: 60px; 
}

.my-workouts {
  background-color: rgba(0, 0, 0, 0.65);
  padding: 30px;
  border-radius: 12px;
  color: white;
  width: 500px;
  max-width: 90vw;
  overflow-y: auto;
  box-sizing: border-box;
}


.new-workout-form label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.exercise-form {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.05);
}

.set-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.set-input label {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.set-input input {
  width: 80px; /* was full width, now compact */
  padding: 4px;
  border-radius: 5px;
  border: none;
  text-align: center;
}

.set-input button {
  background: #b02a37;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 8px;
  cursor: pointer;
  font-size: 0.8rem;
  height: 32px;
  flex-shrink: 0;
}

.set-input button:hover {
  background: #a12631;
}


.exercise-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

select,
input {
  flex: 1;
  margin-left: 10px;
  padding: 4px;
  border-radius: 5px;
  border: none;
}

button {
  padding: 8px 14px;
  margin-top: 6px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  color: white;
}

button:hover {
  opacity: 0.9;
}

/* --- Specific button colors --- */
.add-set {
  background: #444;
}

.remove-exercise {
  background: #b02a37;
}

.save-workout {
  background: #198754;
}

.save-workout:hover {
  background: #157347;
}

.add-exercise {
  background: #444;
}

/* Spacing between Add Exercise and Save Workout */
.new-workout-form > .add-exercise,
.new-workout-form > .save-workout {
  margin-top: 10px;
  margin-right: 8px;
}

/* Spacing between Edit and Delete */
.workouts-list button {
  margin-right: 10px;
}

.workouts-list button:last-of-type {
  background: #b02a37;
}

.workouts-list button:last-of-type:hover {
  background: #a12631;
}

/* Delete modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #1f1f1f;
  color: #fff;
  width: 90%;
  max-width: 420px;
  padding: 22px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  text-align: center;
}

.modal-sub {
  opacity: 0.9;
  margin: 8px 0 18px 0;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-danger {
  background: #b02a37;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-danger:hover {
  background: #a12631;
}

.btn-secondary {
  background: #333;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #3d3d3d;
}

</style>
