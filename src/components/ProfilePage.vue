<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2>
        {{ profile?.nickname ? profile.nickname + ' ' + $t('profileTitle') : $t('userProfile') }}
      </h2>

      <div v-if="loadingProfile">{{ $t('loadingProfile') }}</div>

      <div v-else-if="profile">
        <p><strong>{{ $t('email') }}:</strong> {{ user?.email }}</p>

        <label>
          <strong>{{ $t('nickname') }}:</strong>
          <input v-model="profile.nickname" type="text" />
        </label>
        <button @click="saveNickname">{{ $t('save') }}</button>

        <p><strong>{{ $t('totalWorkouts') }}:</strong> {{ profile.totalWorkouts }}</p>
        <p><strong>{{ $t('totalWeightLifted') }}:</strong> {{ profile.totalWeight }} kg</p>

        <div v-if="muscleStats && Object.keys(muscleStats).length" class="muscle-stats">
          <h3>{{ $t('muscleGroupsTrained') }}</h3>
          <div class="muscle-stats-inline">
            <p v-for="(count, muscle) in muscleStats" :key="muscle">
              <strong>{{ muscle }}:</strong> {{ count }} {{ $t('times') }}
            </p>
          </div>
        </div>

        <hr />

        <button @click="showPasswordModal = true" class="change-password-btn">
          {{ $t('changePassword') }}
        </button>
      </div>

      <div v-else>
        <p>{{ $t('noProfileData') }}</p>
      </div>
    </div>

    <div v-if="showPasswordModal" class="modal-backdrop" @click.self="closePasswordModal">
      <div class="modal">
        <h3>{{ $t('changePassword') }}</h3>
        <p>{{ $t('enterNewPassword') }}</p>

        <input
          v-model="newPassword"
          type="password"
          :placeholder="$t('newPassword')"
          class="password-input"
        />

        <div class="modal-actions">
          <button class="btn-secondary" @click="closePasswordModal">{{ $t('cancel') }}</button>
          <button class="btn-primary" @click="changePassword" :disabled="updatingPassword">
            {{ updatingPassword ? $t('updating') : $t('savePassword') }}
          </button>
        </div>

        <p v-if="passwordMessage" class="message">{{ passwordMessage }}</p>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showPopup" class="success-popup">
        {{ popupMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { db } from '../firebase'
import { useAuth } from '../composables/useAuth'
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { updatePassword } from 'firebase/auth'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { user, loading } = useAuth()
const profile = ref(null)
const loadingProfile = ref(true)
const muscleStats = ref({})

const showPasswordModal = ref(false)
const newPassword = ref('')
const updatingPassword = ref(false)
const passwordMessage = ref('')
const showPopup = ref(false)
const popupMessage = ref('')

const loadUserProfile = async () => {
  if (!user.value) return
  try {
    const userRef = doc(db, 'users', user.value.uid)
    const snapshot = await getDoc(userRef)
    if (snapshot.exists()) {
      profile.value = snapshot.data()
    }

    const workoutsRef = collection(db, 'workouts')
    const q = query(workoutsRef, where('uid', '==', user.value.uid))
    const workoutsSnap = await getDocs(q)

    const muscleCount = {}
    workoutsSnap.forEach(docSnap => {
      const data = docSnap.data()
      if (data.exercises) {
        data.exercises.forEach(ex => {
          if (ex.muscle) {
            const muscle = ex.muscle.trim()
            muscleCount[muscle] = (muscleCount[muscle] || 0) + 1
          }
        })
      }
    })
    muscleStats.value = muscleCount
  } catch (err) {
    console.error('Error loading profile:', err)
  } finally {
    loadingProfile.value = false
  }
}

watch(
  [user, loading],
  ([u, isLoading]) => {
    if (!isLoading && u) loadUserProfile()
  },
  { immediate: true }
)

const saveNickname = async () => {
  if (!user.value || !profile.value) return
  try {
    const userRef = doc(db, 'users', user.value.uid)
    await updateDoc(userRef, { nickname: profile.value.nickname })
    popupMessage.value = t('nicknameUpdated')
    showPopup.value = true
    setTimeout(() => (showPopup.value = false), 1800)
  } catch (err) {
    console.error('Error saving nickname:', err)
  }
}

const changePassword = async () => {
  if (!newPassword.value || newPassword.value.length < 6) {
    passwordMessage.value = t('passwordTooShort')
    return
  }

  updatingPassword.value = true
  try {
    await updatePassword(user.value, newPassword.value)
    passwordMessage.value = t('passwordUpdated')
    newPassword.value = ''
    setTimeout(() => closePasswordModal(), 1500)
  } catch (err) {
    console.error('Error updating password:', err)
    if (err.code === 'auth/requires-recent-login') {
      passwordMessage.value = t('reloginToChange')
    } else {
      passwordMessage.value = t('passwordUpdateFailed')
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
  margin-right: 8px;
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

.muscle-stats {
  margin-top: 20px;
  text-align: center;
}

.muscle-stats h3 {
  margin-bottom: 8px;
}

.muscle-stats-inline p {
  margin: 4px 0;
  font-size: 1rem;
}

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

/* Success popup */
.success-popup {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: #198754;
  color: white;
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 0 15px rgba(25, 135, 84, 0.7);
  animation: fadeInOut 1.8s ease-in-out forwards;
  z-index: 1200;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, 20px); }
  15% { opacity: 1; transform: translate(-50%, 0); }
  85% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}
</style>
