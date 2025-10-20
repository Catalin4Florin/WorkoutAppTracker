// src/composables/useAuth.js
import { ref } from 'vue'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'

const user = ref(null)
const loading = ref(true)

// Listen for auth state changes
onAuthStateChanged(auth, u => {
  user.value = u
  loading.value = false
})

export function useAuth() {
  const register = (email, password) => createUserWithEmailAndPassword(auth, email, password)
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const logout = () => signOut(auth)

  return { user, loading, register, login, logout }
}
