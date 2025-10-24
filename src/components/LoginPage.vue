<template>
  <div class="login-background">
    <div class="login-box">
      <h1>{{ $t('welcome') }}</h1>

      <input v-model="email" type="email" :placeholder="$t('email')" />
      <input v-model="password" type="password" :placeholder="$t('password')" />

      <button @click="handleLogin">{{ $t('login') }}</button>
      <button @click="handleRegister">{{ $t('register') }}</button>

      <div class="divider">{{ $t('or') }}</div>

      <button class="google-btn" @click="signInWithGoogle">
        {{ $t('continueWithGoogle') }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div v-if="showPopup" class="success-popup">
      {{ $t('loginSuccess') }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const { login, register } = useAuth()
const router = useRouter()
const auth = getAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const showPopup = ref(false)

const handleLogin = async () => {
  try {
    await login(email.value, password.value)
    error.value = ''
    showPopup.value = true
    setTimeout(() => {
      showPopup.value = false
      router.push('/')
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

const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    const userRef = doc(db, 'users', user.uid)
    const snap = await getDoc(userRef)

    if (!snap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        nickname: user.displayName || 'New User',
        totalWorkouts: 0,
        totalWeight: 0
      })
    }

    showPopup.value = true
    setTimeout(() => {
      showPopup.value = false
      router.push('/myworkouts')
    }, 1500)
  } catch (err) {
    console.error('Google sign-in error:', err)
    error.value = 'Failed to sign in with Google.'
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
  background-color: #1a1a1a;
  color: white;
  height: 42px;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  height: 42px;
}

button:hover {
  border-color: #646cff;
}

.google-btn {
  background-color: #4285f4;
  color: white;
}

.google-btn:hover {
  background-color: #357ae8;
}

.divider {
  text-align: center;
  color: #ccc;
  margin: 10px 0;
}

.error {
  color: red;
}

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
