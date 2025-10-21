<template>
    <div class="home-background">
      <div class="home-content">
        <h1>Welcome to Workout Tracker</h1>
        <p>
          Track your workouts, log your progress, and stay consistent with your fitness goals.
          Whether you're training for strength, endurance, or aesthetics — this app helps you
          stay organized and motivated every step of the way.
        </p>
        <p>💪 Create detailed workouts with sets, reps, and weights.</p>
        <p>📈 Review your previous sessions to measure progress.</p>
        <p>Start now — and take control of your training!</p>
  
        <button
          v-if="!user"
          class="register-btn"
          @click="goToLogin"
        >
          Register for Free
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import { useAuth } from '../composables/useAuth'
  
  const router = useRouter()
  const { user } = useAuth()
  
  const goToLogin = () => router.push('/login')
  </script>
  
  <style scoped>
  .home-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-image: url('/jayCutler.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  
  .home-content {
    background-color: rgba(0, 0, 0, 0.65);
    color: white;
    padding: 40px;
    border-radius: 15px;
    max-width: 700px;
    text-align: center;
  }
  
  h1 {
    color: #ffa500;
    margin-bottom: 20px;
    font-size: 2rem;
  }
  
  p {
    margin-bottom: 10px;
    line-height: 1.6;
  }
  
  .register-btn {
    margin-top: 20px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    background-color: #ff9900;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.3s;
  }
  
  .register-btn:hover {
    background-color: #ffa733;
  }
  </style>
  