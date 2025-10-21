// src/composables/useAuth.js
import { ref } from 'vue'
import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

const user = ref(null)
const loading = ref(true)

// Listen for auth state changes
onAuthStateChanged(auth, async (u) => {
  user.value = u
  loading.value = false

  // Automatically ensure user document exists
  if (u) {
    const userRef = doc(db, 'users', u.uid)
    const snapshot = await getDoc(userRef)

    if (!snapshot.exists()) {
      await setDoc(userRef, {
        nickname: 'New User',
        totalWorkouts: 0,
        totalWeight: 0
      })
      console.log( u.email)
    }
  }
})

export function useAuth() {
  const register = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const userRef = doc(db, 'users', cred.user.uid)
    await setDoc(userRef, {
      nickname: 'New User',
      totalWorkouts: 0,
      totalWeight: 0
    })
    console.log( cred.user.email)
    return cred
  }

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const logout = () => signOut(auth)

  return { user, loading, register, login, logout }
}
