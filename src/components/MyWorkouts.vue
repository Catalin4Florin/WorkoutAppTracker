<template>
  <div class="workouts-background">
    <div class="my-workouts">
      <h1>My Workouts</h1>

      <div class="workout-grid">
        <div class="workout-card new-workout" @click="openNewWorkout">
          <div class="plus">+</div>
          <p>New Workout</p>
        </div>

        <div
          v-for="workout in workouts"
          :key="workout.id"
          class="workout-card"
          @click="openViewWorkout(workout)"
        >
          <h3>{{ workout.date }}</h3>
          <p class="workout-info">{{ workout.exercises.length }} exercises</p>
          <p class="workout-muscles">{{ getMuscleSummary(workout.exercises) }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="showForm"
      class="modal-backdrop"
      @click.self="closeNewWorkout"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal new-workout-modal">
        <h2>{{ editingWorkout ? 'Edit Workout' : 'New Workout' }}</h2>

        <div
          v-for="(exercise, exIndex) in exercises"
          :key="exIndex"
          class="exercise-form"
        >
          <div class="field">
            <label>Muscle Group</label>
            <select v-model="exercise.muscle">
              <option value="">Select Muscle</option>
              <option v-for="group in muscleGroups" :key="group" :value="group">
                {{ group }}
              </option>
            </select>
          </div>

          <div class="field">
            <label>Exercise</label>
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
          </div>

          <div
            v-for="(set, setIndex) in exercise.sets"
            :key="setIndex"
            class="set-input"
          >
            <label>
              <span>Reps</span>
              <input v-model.number="set.reps" type="number" min="1" placeholder="10" />
            </label>
            <label>
              <span>Weight</span>
              <input v-model.number="set.weight" type="number" min="0" placeholder="0" />
            </label>
            <button @click="removeSet(exIndex, setIndex)">Remove Set</button>
          </div>

          <div class="exercise-actions">
            <button class="add-set" @click="addSet(exIndex)">Add Set</button>
            <button class="remove-exercise" @click="removeExercise(exIndex)">Remove Exercise</button>
          </div>

          <hr />
        </div>

        <div class="footer-actions">
          <button @click="addExercise" class="add-exercise">Add Exercise</button>
        </div>

        <div class="form-actions">
          <button @click="closeNewWorkout" class="cancel-workout">Cancel</button>
          <button @click="saveWorkout" class="save-workout">
            {{ editingWorkout ? 'Update Workout' : 'Save Workout' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="viewWorkout"
      class="modal-backdrop"
      @click.self="closeViewWorkout"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal view-workout-modal">
        <h2>{{ viewWorkout.date }}</h2>
        <ul>
          <li v-for="(ex, i) in viewWorkout.exercises" :key="i">
            <strong>{{ ex.muscle }} — {{ ex.name }}</strong>
            <ul>
              <li v-for="(set, si) in ex.sets" :key="si">
                {{ set.reps }} reps × {{ set.weight }}kg
              </li>
            </ul>
          </li>
        </ul>
        <div class="form-actions">
          <button class="cancel-workout" @click="closeViewWorkout">Close</button>
          <button class="save-workout" @click="startEditWorkout(viewWorkout)">Edit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { db } from '../firebase'
import { useAuth } from '../composables/useAuth'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore'

const { user, loading } = useAuth()

const exerciseOptions = [
  { name: 'Bench Press', muscle: 'Chest' },
  { name: 'Push Up', muscle: 'Chest' },
  { name: 'Peck Deck', muscle: 'Chest' },
  { name: 'Incline Dumbbell Press', muscle: 'Chest' },
  { name: 'Squat', muscle: 'Legs' },
  { name: 'Deadlift', muscle: 'Back' },
  { name: 'Pull-Up', muscle: 'Back' },
  { name: 'Cable Row', muscle: 'Back' },
  { name: 'Lat Pulldown', muscle: 'Back' },
  { name: 'T-Bar Row', muscle: 'Back' },
  { name: 'Shrugs', muscle: 'Back' },
  { name: 'Overhead Press', muscle: 'Shoulders' },
  { name: 'Seated Dumbbell Press', muscle: 'Shoulders' },
  { name: 'Lat Raise', muscle: 'Shoulders' },
  { name: 'Reverse Flies', muscle: 'Shoulders' },
  { name: 'Facepull', muscle: 'Shoulders' },
  { name: 'Tricep Straightbar Pushdown', muscle: 'Arms' },
  { name: 'Tricep Rope Pushdown', muscle: 'Arms' },
  { name: 'Dumbbell Curl', muscle: 'Arms' },
  { name: 'Barbell Curl', muscle: 'Arms' },
  { name: 'Hammer Curl', muscle: 'Arms' },
  { name: 'Skullcrusher', muscle: 'Arms' },
  { name: 'Leg Press', muscle: 'Legs' },
  { name: 'Leg Curl', muscle: 'Legs' },
  { name: 'Leg Extension', muscle: 'Legs' },
  { name: 'Calf Raise', muscle: 'Legs' },
  { name: 'Romanian Deadlift', muscle: 'Legs' },
  { name: 'Cable Crunch', muscle: 'Abs' },
  { name: 'Leg Raise', muscle: 'Abs' }
]

const muscleGroups = ['Chest', 'Legs', 'Back', 'Shoulders', 'Arms', 'Abs']
const workoutsCollection = collection(db, 'workouts')

const workouts = ref([])
const showForm = ref(false)
const exercises = ref([])
const editingWorkout = ref(null)
const viewWorkout = ref(null)

const openNewWorkout = () => {
  showForm.value = true
  exercises.value = [{ muscle: '', name: '', sets: [{ reps: null, weight: null }] }]
}

const closeNewWorkout = () => {
  showForm.value = false
  exercises.value = []
  editingWorkout.value = null
}

const openViewWorkout = (workout) => {
  viewWorkout.value = workout
}

const closeViewWorkout = () => {
  viewWorkout.value = null
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
  exercises.value = workout.exercises.map(ex => ({ ...ex, sets: ex.sets.map(s => ({ ...s })) }))
  viewWorkout.value = null
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
    await updateUserStats()
    closeNewWorkout()
  } catch (err) {
    console.error('Error saving workout:', err)
  }
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
        if (set.reps && set.weight) totalWeight += set.reps * set.weight
      })
    })
  })

  const userRef = doc(db, 'users', user.value.uid)
  await updateDoc(userRef, {
    totalWorkouts: snapshot.size,
    totalWeight
  })
}

const getMuscleSummary = (exercises) => {
  const muscles = [...new Set(exercises.map(e => e.muscle).filter(Boolean))]
  return muscles.join(', ')
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
  position: relative;
  min-height: 100vh;
  width: 100vw;
  background-image: url('/notepad.jpg');
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  padding-top: 80px;
  padding-bottom: 60px;
}

.my-workouts {
  color: white;
  width: 90%;
  max-width: 1100px;
}

h1 {
  margin-bottom: 20px;
}

.workout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.workout-card {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  padding: 20px;
  color: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.workout-card:hover {
  background: rgba(0, 0, 0, 0.75);
  transform: translateY(-3px);
}

.new-workout {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed rgba(255, 255, 255, 0.5);
}

.plus {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #1f1f1f;
  color: #fff;
  width: 90%;
  max-width: 640px;
  padding: 28px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
  max-height: 90vh;
}

.exercise-form {
  border: 1px solid #555;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.field select,
.set-input input {
  background: #2f2f2f;
  border: 1px solid #555;
  color: #fff;
  border-radius: 6px;
  padding: 8px 10px;
  transition: all 0.2s ease;
}

.field select:focus,
.set-input input:focus {
  outline: none;
  border-color: #888;
  box-shadow: 0 0 5px #888;
}

.set-input {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: end;
  gap: 12px;
  margin-bottom: 10px;
}

.set-input label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.set-input button {
  background: #b02a37;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 0.9rem;
  height: 36px;
}

.set-input button:hover {
  background: #a12631;
}

.exercise-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.add-set {
  background: #444;
  padding: 10px 14px;
  border-radius: 8px;
}

.remove-exercise {
  background: #b02a37;
  padding: 10px 14px;
  border-radius: 8px;
}

.footer-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 6px;
}

.add-exercise {
  background: #444;
  padding: 10px 14px;
  border-radius: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.cancel-workout {
  background: #6c757d;
  padding: 10px 14px;
  border-radius: 8px;
}

.cancel-workout:hover {
  background: #5c636a;
}

.save-workout {
  background: #198754;
  padding: 10px 14px;
  border-radius: 8px;
}

.save-workout:hover {
  background: #157347;
}
</style>
