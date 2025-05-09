<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { loginSchema } from '../../utils/validation'
import * as Yup from 'yup'
import { apiService } from '../../api/apiService'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errors = reactive({
  email: '',
  password: '',
})

async function handleLogin() {
  try {
    isLoading.value = true
    errors.email = ''
    errors.password = ''

    await loginSchema.validate(
      { email: email.value, password: password.value },
      { abortEarly: false }
    )

    const loginData = {
      email: email.value,
      password: password.value,
    }

    const response = await apiService.post<{
      access_token: string
      refresh_token: string
      user_id: string
      email: string
      name: string
      role: 'admin' | 'user'
    }>('/auth/login', loginData)

    await authStore.login(email.value, password.value, response.data)
    router.push('/dashboard')
  } catch (err: any) {
    if (err instanceof Yup.ValidationError) {
      err.inner.forEach((error: any) => {
        if (error.path && errors.hasOwnProperty(error.path)) {
          errors[error.path as keyof typeof errors] = error.message
        }
      })
    } else {
      errors.email = err.message || 'Login failed'
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
      <div>
        <h1
          class="mt-6 text-center text-4xl font-bold tracking-tight text-gray-900"
        >
          Welcome Back
        </h1>
        <p class="mt-3 text-center text-sm text-gray-600">
          Don't have an account?
          <router-link
            to="/register"
            class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            Create one now
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label
              for="email-address"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Email address</label
            >
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="email"
              class="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter your email"
            />
            <transition name="fade">
              <div v-if="errors.email" class="text-red-600 text-xs mt-1">
                {{ errors.email }}
              </div>
            </transition>
          </div>
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Password</label
            >
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              v-model="password"
              class="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter your password"
            />
            <transition name="fade">
              <div v-if="errors.password" class="text-red-600 text-xs mt-1">
                {{ errors.password }}
              </div>
            </transition>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <router-link
              to="/forgot-password"
              class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              Forgot your password?
            </router-link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="w-full flex justify-center items-center px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
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
            <span>{{ isLoading ? 'Signing in...' : 'Sign in' }}</span>
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