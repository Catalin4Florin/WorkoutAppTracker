<template>
    <div class="login-background">
      <div class="login-box">
        <h1>Welcome to Workout Tracker</h1>
  
        <input v-model="email" type="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Password" />
  
        <button @click="handleLogin">Login</button>
        <button @click="handleRegister">Register</button>
  
        <p v-if="error" class="error">{{ error }}</p>
      </div>
  
      <!-- Success Popup -->
      <div v-if="showPopup" class="success-popup">
        Successfully logged in!
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useAuth } from '../composables/useAuth'
  import { useRouter } from 'vue-router' // add router
  
  const { login, register } = useAuth()
  const router = useRouter()
  
  const email = ref('')
  const password = ref('')
  const error = ref('')
  const showPopup = ref(false)
  
  const handleLogin = async () => {
    try {
      await login(email.value, password.value)
      error.value = ''
      showPopup.value = true
  
      // hide popup and redirect after 1.5 seconds
      setTimeout(() => {
        showPopup.value = false
        router.push('/myworkouts') // navigate to MyWorkouts.vue
      }, 1500)
    } catch (e) {
      error.value = e.message
    }
  }
  
  const handleRegister = async () => {
    try {
      await register(email.value, password.value)
      error.value = ''
      showPopup.value = true
  
      setTimeout(() => {
        showPopup.value = false
        router.push('/myworkouts')
      }, 1500)
    } catch (e) {
      error.value = e.message
    }
  }
  </script>
  
  <style scoped>
 .login-background {
  background-image: url('/jayCutler.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  background-color: rgba(0, 0, 0, 0.6);
  padding: 30px;
  border-radius: 12px;
  color: white;
  display: flex;
  flex-direction: column;
  width: 300px;
  gap: 10px;
}

input {
  border: none;
  border-radius: 8px;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  height: 42px; /* ✅ same height as buttons */
  box-sizing: border-box;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
  height: 42px; /* ✅ matches inputs */
}

button:hover {
  border-color: #646cff;
}

.error {
  color: red;
}

  
  /* Popup bubble */
  .success-popup {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: #00ff9d;
    padding: 20px 30px;
    border-radius: 12px;
    font-size: 1.2rem;
    font-weight: 600;
    text-align: center;
    animation: fadeInOut 1.5s ease-in-out forwards;
    box-shadow: 0 0 20px rgba(0, 255, 157, 0.5);
  }
  
  /* smooth fade animation */
  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translate(-50%, -60%);
    }
    15% {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
    85% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -40%);
    }
  }
  </style>
  