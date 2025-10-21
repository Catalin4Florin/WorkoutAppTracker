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
  
          <hr />
  
          <!-- Change Password -->
          <button @click="showPasswordModal = true" class="change-password-btn">
            Change Password
          </button>
        </div>
  
        <div v-else>
          <p>No profile data found.</p>
        </div>
      </div>
  
      <!-- 🔒 Change Password Modal -->
      <div v-if="showPasswordModal" class="modal-backdrop" @click.self="closePasswordModal">
        <div class="modal">
          <h3>Change Password</h3>
          <p>Please enter your new password below:</p>
  
          <input
            v-model="newPassword"
            type="password"
            placeholder="New password"
            class="password-input"
          />
  
          <div class="modal-actions">
            <button class="btn-secondary" @click="closePasswordModal">Cancel</button>
            <button class="btn-primary" @click="changePassword" :disabled="updatingPassword">
              {{ updatingPassword ? 'Updating…' : 'Save Password' }}
            </button>
          </div>
  
          <p v-if="passwordMessage" class="message">{{ passwordMessage }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import { db } from '../firebase'
  import { useAuth } from '../composables/useAuth'
  import { doc, getDoc, updateDoc } from 'firebase/firestore'
  import { updatePassword } from 'firebase/auth'
  
  const { user, loading } = useAuth()
  const profile = ref(null)
  const loadingProfile = ref(true)
  
  const showPasswordModal = ref(false)
  const newPassword = ref('')
  const updatingPassword = ref(false)
  const passwordMessage = ref('')
  
  // ✅ Load user profile
  const loadUserProfile = async () => {
    if (!user.value) return
    try {
      const userRef = doc(db, 'users', user.value.uid)
      const snapshot = await getDoc(userRef)
      if (snapshot.exists()) {
        profile.value = snapshot.data()
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      loadingProfile.value = false
    }
  }
  
  // ✅ Watch auth state
  watch(
    [user, loading],
    ([u, isLoading]) => {
      if (!isLoading && u) loadUserProfile()
    },
    { immediate: true }
  )
  
  // ✅ Save nickname
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
  
  // ✅ Change password
  const changePassword = async () => {
    if (!newPassword.value || newPassword.value.length < 6) {
      passwordMessage.value = 'Password must be at least 6 characters.'
      return
    }
  
    updatingPassword.value = true
    try {
      await updatePassword(user.value, newPassword.value)
      passwordMessage.value = 'Password updated successfully!'
      newPassword.value = ''
      setTimeout(() => closePasswordModal(), 1500)
    } catch (err) {
      console.error('Error updating password:', err)
      if (err.code === 'auth/requires-recent-login') {
        passwordMessage.value = 'Please log in again to change your password.'
      } else {
        passwordMessage.value = 'Failed to update password. Try again.'
      }
    } finally {
      updatingPassword.value = false
    }
  }
  
  const closePasswordModal = () => {
    showPasswordModal.value = false
    newPassword.value = ''
    passwordMessage.value = ''
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
  
  .change-password-btn {
    background-color: #b02a37;
  }
  .change-password-btn:hover {
    background-color: #a12631;
  }
  
  /* Modal styling */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background: #1f1f1f;
    color: white;
    width: 90%;
    max-width: 400px;
    padding: 24px;
    border-radius: 12px;
    text-align: center;
  }
  
  .password-input {
    width: 100%;
    margin: 10px 0;
    background: #222;
    border: 1px solid #555;
    color: white;
    padding: 8px;
    border-radius: 6px;
  }
  
  .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  
  .btn-primary {
    background: #3b82f6;
  }
  .btn-primary:hover {
    background: #2563eb;
  }
  .btn-secondary {
    background: #333;
  }
  .message {
    margin-top: 10px;
    font-size: 0.9rem;
    color: #ffb347;
  }
  </style>
  