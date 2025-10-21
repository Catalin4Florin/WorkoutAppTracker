<template>
  <div class="workouts-background">
    <div class="my-workouts">
      <h1>My Workouts</h1>
      <button v-if="user" @click="logout">Logout</button>

      <div v-if="showLogoutPopup" class="logout-popup">
        Successfully logged out!
      </div>

      <button @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : editingWorkout ? 'Edit Workout' : 'Add New Workout' }}
      </button>

      <div v-if="showForm" class="new-workout-form">
        <h2>{{ editingWorkout ? 'Edit Workout' : 'New Workout' }}</h2>

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
          Date: <strong>{{ pendingDelete.meta.date }}</strong> •
          Exercises: <strong>{{ pendingDelete.meta.exerciseCount }}</strong>
        </p>

        <div class="modal-actions">
          <button class="btn-danger" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
          <button class="btn-secondary" :disabled="deleting" @click="closeDeleteModal">
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
  pendingDelete.value = { id: null, meta: { date: '', exerciseCount: 0 } }
}

const confirmDelete = async () => {
  if (!pendingDelete.value.id) return
  deleting.value = true
  try {
    await deleteDoc(doc(db, 'workouts', pendingDelete.value.id))
    workouts.value = workouts.value.filter(w => w.id !== pendingDelete.value.id)
    await updateUserStats() // recalc totals
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
  window.addEventListener('keydown', onKeydown)
  watch([user, loading], ([u, isLoading]) => {
    if (!isLoading && u) loadWorkouts()
  }, { immediate: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
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
  background-color: rgba(255, 255, 255, 0.05);
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
