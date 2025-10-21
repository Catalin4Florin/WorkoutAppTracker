<template>
    <div class="profile-container">
      <div class="profile-card">
        <h2>User Profile</h2>
  
        <div v-if="loadingProfile">Loading profile...</div>
  
        <div v-else-if="profile">
          <p><strong>Email:</strong> {{ user?.email }}</p>
  
          <label>
            <strong>Nickname:</strong>
            <input v-model="profile.nickname" type="text" />
          </label>
          <button @click="saveNickname">Save</button>
  
          <p><strong>Total Workouts:</strong> {{ profile.totalWorkouts }}</p>
          <p><strong>Total Weight Lifted:</strong> {{ profile.totalWeight }} kg</p>
        </div>
  
        <div v-else>
          <p>No profile data found.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import { db } from '../firebase'
  import { useAuth } from '../composables/useAuth'
  import { doc, getDoc, updateDoc } from 'firebase/firestore'
  
  const { user, loading } = useAuth()
  const profile = ref(null)
  const loadingProfile = ref(true)
  
  const loadUserProfile = async () => {
    if (!user.value) return
    try {
      const userRef = doc(db, 'users', user.value.uid)
      const snapshot = await getDoc(userRef)
      if (snapshot.exists()) {
        profile.value = snapshot.data()
      } else {
        console.warn('No user profile found in Firestore.')
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      loadingProfile.value = false
    }
  }
  
  watch(
    [user, loading],
    ([u, isLoading]) => {
      if (!isLoading && u) {
        loadUserProfile()
      }
    },
    { immediate: true }
  )
  
  const saveNickname = async () => {
    if (!user.value || !profile.value) return
    try {
      const userRef = doc(db, 'users', user.value.uid)
      await updateDoc(userRef, { nickname: profile.value.nickname })
      alert('Nickname updated!')
    } catch (err) {
      console.error('Error saving nickname:', err)
    }
  }
  </script>
  
  <style scoped>
  .profile-container {
    background-color: black;
    color: white;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .profile-card {
    background-color: rgba(0, 0, 0, 0.85);
    padding: 30px;
    border-radius: 12px;
    text-align: center;
    width: 400px;
  }
  
  input {
    background: #222;
    border: 1px solid #555;
    color: white;
    border-radius: 6px;
    padding: 6px;
    margin-left: 8px;
  }
  
  button {
    background: #333;
    border: none;
    border-radius: 8px;
    color: white;
    padding: 8px 12px;
    margin-top: 10px;
    cursor: pointer;
  }
  
  button:hover {
    background: #444;
  }
  </style>
  