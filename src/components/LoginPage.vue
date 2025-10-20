<template>
    <div class="login-page">
      <h1>Welcome to Workout Tracker</h1>
      
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
  
      <button @click="handleLogin">Login</button>
      <button @click="handleRegister">Register</button>
  
      <p v-if="error" style="color:red">{{ error }}</p>
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
  .login-page {
    display: flex;
    flex-direction: column;
    width: 300px;
    margin: 50px auto;
    gap: 10px;
  }
  </style>
  