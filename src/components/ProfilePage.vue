<template>
    <div class="profile-background">
      <div class="profile-card">
        <h1>User Profile</h1>
  
        <div v-if="userData">
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Nickname:</strong> 
            <input v-model="nickname" class="nickname-input" />
            <button @click="updateNickname">Save</button>
          </p>
          <p><strong>Total Workouts:</strong> {{ userData.totalWorkouts }}</p>
          <p><strong>Total Weight Lifted:</strong> {{ userData.totalWeight }} kg</p>
        </div>
  
        <div v-else>
          <p>Loading profile...</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { db } from '../firebase'
  import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
  import { useAuth } from '../composables/useAuth'
  
  const { user } = useAuth()
  const userData = ref(null)
  const nickname = ref('')
  
  // Listen for real-time updates to user profile
  let unsubscribe = null
  
  onMounted(() => {
    if (user.value) {
      const userRef = doc(db, 'users', user.value.uid)
  
      unsubscribe = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          userData.value = snapshot.data()
          nickname.value = snapshot.data().nickname || ''
          console.log('👂 Live profile update:', snapshot.data())
        } else {
          console.warn('No profile document found for user')
        }
      })
    }
  })
  
  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })
  
  // Update nickname manually
  const updateNickname = async () => {
    if (!user.value) return
    try {
      const userRef = doc(db, 'users', user.value.uid)
      await updateDoc(userRef, { nickname: nickname.value })
      console.log('✅ Nickname updated:', nickname.value)
    } catch (err) {
      console.error('Error updating nickname:', err)
    }
  }
  </script>
  
  <style scoped>
  .profile-background {
    background-image: url('/gym-bg.jpg'); /* change to your image path */
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .profile-card {
    background-color: rgba(0, 0, 0, 0.75);
    padding: 30px;
    border-radius: 12px;
    color: white;
    width: 400px;
    text-align: left;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
  }
  
  .nickname-input {
    margin-right: 10px;
    border-radius: 6px;
    padding: 5px;
    border: none;
    font-size: 1rem;
  }
  </style>
  