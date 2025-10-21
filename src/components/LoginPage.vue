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
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useAuth } from '../composables/useAuth'
  
  const { login, register } = useAuth()
  const email = ref('')
  const password = ref('')
  const error = ref('')
  
  const handleLogin = async () => {
    try {
      await login(email.value, password.value)
      error.value = ''
      alert('Logged in!')
    } catch (e) {
      error.value = e.message
    }
  }
  
  const handleRegister = async () => {
    try {
      await register(email.value, password.value)
      error.value = ''
      alert('Registered and logged in!')
    } catch (e) {
      error.value = e.message
    }
  }
  </script>
  
  <style scoped>
  /* full screen background container */
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
  
  /* the centered login box */
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
  
  .error {
    color: red;
  }
  </style>
  