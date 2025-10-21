<template>
    <div class="profile-background">
      <div class="profile-card">
        <h1>My Profile</h1>
  
        <div class="profile-section">
          <label>Nickname:</label>
          <input v-model="nickname" type="text" />
          <button @click="saveNickname">Save Nickname</button>
        </div>
  
        <hr />
  
        <div class="profile-stats">
          <p><strong>Total Workouts:</strong> {{ totalWorkouts }}</p>
          <p><strong>Total Weight Lifted:</strong> {{ totalWeight }} kg</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useAuth } from '../composables/useAuth'
  import { db } from '../firebase'
  import { doc, getDoc, updateDoc } from 'firebase/firestore'
  
  const { user } = useAuth()
  
  const nickname = ref('')
  const totalWorkouts = ref(0)
  const totalWeight = ref(0)
  
  const loadUserProfile = async () => {
    if (!user.value) return
  
    try {
      const userRef = doc(db, 'users', user.value.uid)
      const snapshot = await getDoc(userRef)
      if (snapshot.exists()) {
        const data = snapshot.data()
        nickname.value = data.nickname || 'New User'
        totalWorkouts.value = data.totalWorkouts || 0
        totalWeight.value = data.totalWeight || 0
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    }
  }
  
  const saveNickname = async () => {
    if (!user.value) return
    try {
      const userRef = doc(db, 'users', user.value.uid)
      await updateDoc(userRef, { nickname: nickname.value })
      alert('Nickname updated successfully!')
    } catch (err) {
      console.error('Error saving nickname:', err)
    }
  }
  
  onMounted(loadUserProfile)
  </script>
  
  <style scoped>
  .profile-background {
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
    align-items: center;
    overflow: hidden;
  }
  
  .profile-card {
    background-color: rgba(0, 0, 0, 0.65);
    padding: 30px;
    border-radius: 12px;
    color: white;
    width: 400px;
    text-align: center;
  }
  
  .profile-section {
    margin-bottom: 20px;
  }
  
  .profile-section input {
    width: 80%;
    padding: 8px;
    margin-top: 5px;
    border-radius: 6px;
    border: none;
  }
  
  .profile-section button {
    margin-top: 10px;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background-color: #ffb347;
    color: black;
    font-weight: bold;
  }
  
  .profile-stats p {
    margin: 10px 0;
  }
  </style>
  