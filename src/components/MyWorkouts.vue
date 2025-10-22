<template>
  <div class="workouts-background">
    <div class="my-workouts">
      <h1>{{ $t('myWorkouts') }}</h1>

      <div class="workout-grid">
        <div class="workout-card new-workout" @click="openNewWorkout">
          <div class="plus">+</div>
          <p>{{ $t('newWorkout') }}</p>
        </div>

        <div
          v-for="workout in workouts"
          :key="workout.id"
          class="workout-card"
          @click="openViewWorkout(workout)"
        >
          <h3>{{ workout.date }}</h3>
          <p class="workout-info">
            {{ workout.exercises.length }} {{ $t('exercises') }}
          </p>
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
        <h2>{{ editingWorkout ? $t('editWorkout') : $t('newWorkout') }}</h2>

        <div
          v-for="(exercise, exIndex) in exercises"
          :key="exIndex"
          class="exercise-form"
        >
          <div class="field">
            <label>{{ $t('muscleGroup') }}</label>
            <select v-model="exercise.muscle">
              <option value="">{{ $t('selectMuscle') }}</option>
              <option v-for="group in muscleGroups" :key="group" :value="group">
                {{ group }}
              </option>
            </select>
          </div>

          <div class="field">
            <label>{{ $t('exercise') }}</label>
            <select v-model="exercise.name">
              <option disabled value="">{{ $t('selectExercise') }}</option>
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
              {{ $t('reps') }}
              <input v-model.number="set.reps" type="number" min="1" placeholder="10" />
            </label>
            <label>
              {{ $t('weight') }}
              <input v-model.number="set.weight" type="number" min="0" placeholder="0" />
            </label>
            <button @click="removeSet(exIndex, setIndex)">
              {{ $t('removeSet') }}
            </button>
          </div>

          <div class="exercise-actions">
            <button class="add-set" @click="addSet(exIndex)">
              {{ $t('addSet') }}
            </button>
            <button
              class="remove-exercise"
              @click="removeExercise(exIndex)"
              :disabled="exercises.length === 1"
            >
              {{ $t('removeExercise') }}
            </button>
          </div>
          <hr />
        </div>

        <button @click="addExercise" class="add-exercise">
          {{ $t('addExercise') }}
        </button>

        <div class="form-actions">
          <button @click="closeNewWorkout" class="cancel-workout">
            {{ $t('cancel') }}
          </button>
          <button @click="saveWorkout" class="save-workout">
            {{ editingWorkout ? $t('updateWorkout') : $t('saveWorkout') }}
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
                {{ set.reps }} {{ $t('reps') }} × {{ set.weight }}kg
              </li>
            </ul>
          </li>
        </ul>
        <div class="form-actions">
          <button class="cancel-workout" @click="closeViewWorkout">
            {{ $t('close') }}
          </button>
          <button class="save-workout" @click="startEditWorkout(viewWorkout)">
            {{ $t('edit') }}
          </button>
          <button class="remove-exercise" @click="confirmDeleteWorkout(viewWorkout)">
            {{ $t('delete') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="confirmDelete" class="modal-backdrop">
      <div class="modal confirm-modal">
        <p>{{ $t('confirmDeleteWorkout') }}</p>
        <div class="form-actions">
          <button class="cancel-workout" @click="confirmDelete = null">{{ $t('cancel') }}</button>
          <button class="remove-exercise" @click="deleteWorkout(confirmDelete)">
            {{ $t('confirm') }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showPopup"
      :class="popupType === 'error' ? 'error-popup' : popupType === 'delete' ? 'delete-popup' : 'success-popup'"
    >
      {{ popupMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
  updateDoc,
  deleteDoc
} from 'firebase/firestore'

const { t } = useI18n()
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
const confirmDelete = ref(null)
const showPopup = ref(false)
const popupMessage = ref('')
const popupType = ref('success')

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

const removeExercise = (index) => {
  if (exercises.value.length > 1) exercises.value.splice(index, 1)
}

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

const validateWorkout = () => {
  if (exercises.value.length === 0) return false
  for (const ex of exercises.value) {
    if (!ex.muscle || !ex.name || !ex.sets.length) return false
    for (const set of ex.sets) {
      if (!set.reps || !set.weight) return false
    }
  }
  return true
}

const showPopupMessage = (message, type = 'success') => {
  popupMessage.value = message
  popupType.value = type
  showPopup.value = true
  setTimeout(() => (showPopup.value = false), 1800)
}

const saveWorkout = async () => {
  if (!user.value || exercises.value.length === 0) return
  if (!validateWorkout()) {
    showPopupMessage(t('fillAllBeforeSave'), 'error')
    return
  }

  try {
    if (editingWorkout.value) {
      const workoutRef = doc(db, 'workouts', editingWorkout.value.id)
      await updateDoc(workoutRef, { exercises: exercises.value })
      showPopupMessage(t('workoutUpdated'), 'success')
      editingWorkout.value = null
    } else {
      const newWorkout = {
        uid: user.value.uid,
        date: new Date().toISOString(),
        exercises: exercises.value
      }
      await addDoc(workoutsCollection, newWorkout)
      showPopupMessage(t('workoutSaved'), 'success')
    }

    await loadWorkouts()
    await updateUserStats()
    closeNewWorkout()
  } catch (err) {
    console.error('Error saving workout:', err)
  }
}

const confirmDeleteWorkout = (workout) => {
  confirmDelete.value = workout
}

const deleteWorkout = async (workout) => {
  try {
    await deleteDoc(doc(db, 'workouts', workout.id))
    confirmDelete.value = null
    await loadWorkouts()
    await updateUserStats()
    showPopupMessage(t('workoutDeleted'), 'delete')
    closeViewWorkout()
  } catch (err) {
    console.error('Error deleting workout:', err)
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
  await updateDoc(userRef, { totalWorkouts: snapshot.size, totalWeight })
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

watch([user, loading], ([u, isLoading]) => {
  if (!isLoading && u) loadWorkouts()
}, { immediate: true })
</script>

<style scoped>
.workouts-background {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  background-image: url('../assets/notepad.jpg');
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
  padding: 24px;
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
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
}

.remove-exercise {
  background: #b02a37;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
}

.add-exercise {
  background: #444;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.cancel-workout {
  background: #6c757d;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
}

.cancel-workout:hover {
  background: #5c636a;
}

.save-workout {
  background: #198754;
  color: white;
  padding: 10px 14px;
  border-radius: 8px;
  border: none;
}

.save-workout:hover {
  background: #157347;
}

.success-popup,
.delete-popup,
.error-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 22px 34px;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  animation: fadeInOut 1.8s ease-in-out forwards;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.5);
  z-index: 1200;
}

.success-popup {
  background-color: #198754;
  color: white;
  box-shadow: 0 0 20px rgba(25, 135, 84, 0.7);
}

.delete-popup {
  background-color: #b02a37;
  color: white;
  box-shadow: 0 0 20px rgba(176, 42, 55, 0.7);
}

.error-popup {
  background-color: rgba(0, 0, 0, 0.85);
  color: #ff6b6b;
  box-shadow: 0 0 20px rgba(255, 100, 100, 0.4);
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, -60%); }
  15% { opacity: 1; transform: translate(-50%, -50%); }
  85% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -40%); }
}

@media (max-width: 768px) {
  .modal {
    width: 94%;
    padding: 20px;
    border-radius: 10px;
  }

  .set-input {
    grid-template-columns: 1fr;
  }

  .set-input button {
    width: 100%;
    height: auto;
  }

  .exercise-actions {
    flex-direction: column;
  }

  .add-set,
  .remove-exercise,
  .add-exercise,
  .cancel-workout,
  .save-workout {
    width: 100%;
  }
}
</style>

