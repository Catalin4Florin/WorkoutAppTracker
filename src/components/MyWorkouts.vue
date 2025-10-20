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
  import { ref } from 'vue'
  
  const showForm = ref(false)
  const exerciseName = ref('')
  const sets = ref(3)
  const reps = ref(10)
  const weight = ref(0)
  const workouts = ref([])
  
  const addWorkout = () => {
    const date = new Date().toLocaleDateString()
    workouts.value.push({
      date,
      exerciseName: exerciseName.value,
      sets: sets.value,
      reps: reps.value,
      weight: weight.value
    })
  
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
  