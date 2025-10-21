<template>
    <div class="home-background">
      <div class="home-content">
        <h1>Welcome to Workout Tracker</h1>
        <p>
          Track your workouts, log your progress, and stay consistent with your fitness goals.
          Whether you're training for strength, endurance, or aesthetics — this app helps you
          stay organized and motivated every step of the way.
        </p>
        <p>
          💪 Create detailed workouts with sets, reps, and weights.<br />
          📈 Review your previous sessions to measure progress.<br />
        </p>
        <p>Start now — and take control of your training!</p>
      </div>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .home-background {
    background-image: url('/notepad.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    min-height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    padding: 40px;
  }
  
  .home-content {
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 12px;
    padding: 40px;
    max-width: 700px;
    text-align: center;
    line-height: 1.6;
    font-size: 1.1rem;
  }
  
  .home-content h1 {
    font-size: 2.2rem;
    margin-bottom: 20px;
    color: #ffb347;
  }
  </style>
  