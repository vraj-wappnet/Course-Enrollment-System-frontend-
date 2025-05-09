<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { otpSchema } from '../../utils/validation'
import * as Yup from 'yup'
import { apiService } from '../../api/apiService'

const router = useRouter()
const route = useRoute()

const email = ref(route.query.email?.toString() || '')
const otp = ref('')
const isLoading = ref(false)
const errors = reactive({
  otp: '',
})
const successMessage = ref<string | null>(null)

async function handleVerifyOTP() {
  try {
    isLoading.value = true
    errors.otp = ''
    successMessage.value = null

    await otpSchema.validate({ otp: otp.value }, { abortEarly: false })

    const response = await apiService.post<{
      message: string
    }>('/auth/verify-otp', {
      email: email.value,
      otp: otp.value,
    })

    successMessage.value = response.data.message || 'OTP verified successfully.'
    setTimeout(() => {
      router.push({ path: '/reset-password', query: { email: email.value, otp: otp.value } })
    }, 2000)
  } catch (err: any) {
    if (err instanceof Yup.ValidationError) {
      errors.otp = err.errors[0]
    } else {
      errors.otp = err.message || 'Invalid OTP.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div
      class="max-w-md w-full space-y-8 bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20"
    >
      <transition name="fade">
        <div v-if="successMessage" class="text-green-600 text-sm text-center">
          {{ successMessage }}
        </div>
      </transition>

      <div>
        <h1
          class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900"
        >
          Verify OTP
        </h1>
        <p class="mt-3 text-center text-sm text-gray-600">
          Enter the 6-digit OTP sent to {{ email }}.
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleVerifyOTP">
        <div class="space-y-4">
          <div>
            <label
              for="otp"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              One-Time Password (OTP)
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              v-model="otp"
              class="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter 6-digit OTP"
            />
            <transition name="fade">
              <div v-if="errors.otp" class="text-red-600 text-xs mt-1">
                {{ errors.otp }}
              </div>
            </transition>
          </div>
        </div>

        <div class="flex justify-between">
          <router-link
            to="/login"
            class="font-medium text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Back to Login
          </router-link>
          <button
            type="submit"
            class="flex justify-center items-center px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="mr-2">
              <svg
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            <span>{{ isLoading ? 'Verifying OTP...' : 'Verify OTP' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>