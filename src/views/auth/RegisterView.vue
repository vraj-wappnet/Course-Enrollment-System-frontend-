<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { registerSchema } from '../../utils/validation'
import * as Yup from 'yup'
import { apiService } from '../../api/apiService'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const isLoading = ref(false)
const error = ref('') // <-- Added to handle general error messages

const errors = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
})

async function handleRegister() {
  try {
    isLoading.value = true
    error.value = '' // <-- Reset error
    errors.name = ''
    errors.email = ''
    errors.password = ''
    errors.passwordConfirm = ''

    // Validate form data using Yup schema
    await registerSchema.validate({
      name: name.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
    }, { abortEarly: false })

    // Prepare data for API call
    const registerData = {
      email: email.value,
      name: name.value,
      password: password.value,
    }

    // Make API call to register endpoint
    await apiService.post('auth/register', registerData)

    // Redirect to dashboard on successful registration
    router.push('/dashboard')
  } catch (err: any) {
    if (err instanceof Yup.ValidationError) {
      // Map validation errors to specific fields
      err.inner.forEach((errorItem: any) => {
        if (errorItem.path && errors.hasOwnProperty(errorItem.path)) {
          errors[errorItem.path as keyof typeof errors] = errorItem.message
        }
      })
    } else {
      // Handle API errors
      error.value = err.message || 'Registration failed'
    }
  } finally {
    isLoading.value = false
  }
}
</script>


<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
      <div>
        <h3 class="text-center text-4xl font-bold tracking-tight text-gray-900">
          Create a New Account
        </h3>
      </div>
      <transition name="fade">
        <div v-if="error" class="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
          {{ error }}
        </div>
      </transition>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autocomplete="name"
              required
              v-model="name"
              class="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label for="email-address" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
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
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              v-model="password"
              class="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter your password"
            />
          </div>
          <div>
            <label for="password-confirm" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              id="password-confirm"
              name="password-confirm"
              type="password"
              autocomplete="new-password"
              required
              v-model="passwordConfirm"
              class="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 placeholder-gray-400"
              placeholder="Confirm your password"
            />
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
            <span>{{ isLoading ? "Signing up..." : "Sign up" }}</span>
          </button>
        </div>
        <div>
          <p class="mt-3 text-center text-sm text-gray-600">
            Already have an account?
            <router-link
              to="/login"
              class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              Sign in now
            </router-link>
          </p>
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