<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);
const user = computed(() => authStore.user);
const isUser = computed(() => isAuthenticated.value && !isAdmin.value);
const isMobileMenuOpen = ref(false);

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function logout() {
  authStore.logout();
  router.push("/");
}
</script>

<template>
  <header
    class="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 transition-all duration-300"
  >
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <router-link
              to="/"
              class="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition-transform duration-200"
            >
              CourseHub
            </router-link>
          </div>
          <div class="hidden sm:ml-8 sm:flex sm:space-x-6">
            <router-link
              v-if="!isAuthenticated"
              to="/"
              class="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors duration-200 group"
              :class="[
                $route.name === 'home'
                  ? 'text-indigo-600 after:scale-x-100'
                  : 'after:scale-x-0',
              ]"
            >
              Home
              <span
                class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform transition-transform duration-300 group-hover:scale-x-100"
              ></span>
            </router-link>
            <router-link
              to="/courses"
              class="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors duration-200 group"
              :class="[
                $route.name === 'courses'
                  ? 'text-indigo-600 after:scale-x-100'
                  : 'after:scale-x-0',
              ]"
            >
              Courses
              <span
                class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform transition-transform duration-300 group-hover:scale-x-100"
              ></span>
            </router-link>
            <router-link
              v-if="isUser"
              to="/enrolled-courses"
              class="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors duration-200 group"
              :class="[
                $route.name === 'enrolled-courses'
                  ? 'text-indigo-600 after:scale-x-100'
                  : 'after:scale-x-0',
              ]"
            >
              My Courses
              <span
                class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform transition-transform duration-300 group-hover:scale-x-100"
              ></span>
            </router-link>

            <router-link
              v-if="isAuthenticated"
              :to="isAdmin ? '/admin' : '/dashboard'"
              class="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors duration-200 group"
              :class="[
                $route.name === (isAdmin ? 'admin' : 'dashboard')
                  ? 'text-indigo-600 after:scale-x-100'
                  : 'after:scale-x-0',
              ]"
            >
              Dashboard
              <span
                class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform transition-transform duration-300 group-hover:scale-x-100"
              ></span>
            </router-link>
          </div>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
          <div v-if="isAuthenticated" class="flex items-center space-x-4">
            <span
              class="text-sm font-medium text-gray-800 bg-white/50 rounded-full px-3 py-1"
              >{{ user?.name }}</span
            >
            <button
              @click="logout"
              class="relative inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 group overflow-hidden"
            >
              <span
                class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              ></span>
              Logout
            </button>
          </div>
          <div v-else class="flex items-center space-x-4">
            <router-link
              to="/login"
              class="relative inline-flex items-center px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 group"
            >
              <span
                class="absolute inset-0 bg-indigo-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              ></span>
              Login
            </router-link>
            <router-link
              to="/register"
              class="relative inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 group overflow-hidden"
            >
              <span
                class="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              ></span>
              Register
            </router-link>
          </div>
        </div>
        <div class="flex items-center sm:hidden">
          <button
            @click="toggleMobileMenu"
            class="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <span class="sr-only">Open main menu</span>
            <svg
              v-if="!isMobileMenuOpen"
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <transition name="slide">
      <div
        v-if="isMobileMenuOpen"
        class="sm:hidden bg-white/95 backdrop-blur-md shadow-lg"
      >
        <div class="pt-2 pb-3 space-y-1">
          <router-link
            v-if="!isAuthenticated"
            to="/"
            class="block pl-4 pr-4 py-2 text-base font-medium"
            :class="[
              $route.name === 'home'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600',
            ]"
          >
            Home
          </router-link>
          <router-link
            to="/courses"
            class="block pl-4 pr-4 py-2 text-base font-medium"
            :class="[
              $route.name === 'courses'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600',
            ]"
          >
            Courses
          </router-link>
          <router-link
            v-if="isUser"
            to="/enrolled-courses"
            class="block pl-4 pr-4 py-2 text-base font-medium"
            :class="[
              $route.name === 'enrolled-courses'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600',
            ]"
          >
            My Courses
          </router-link>
          <router-link
            v-if="isAuthenticated && isAdmin"
            to="/admin"
            class="block pl-4 pr-4 py-2 text-base font-medium"
            :class="[
              $route.name?.toString().startsWith('admin')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600',
            ]"
          >
            Admin
          </router-link>
        </div>
        <div class="pt-4 pb-3 border-t border-gray-200">
          <div v-if="isAuthenticated" class="flex items-center px-4">
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800">
                {{ user?.name }}
              </div>
              <div class="text-sm font-medium text-gray-500">
                {{ user?.email }}
              </div>
            </div>
          </div>
          <div class="mt-3 space-y-1">
            <div v-if="isAuthenticated">
              <button
                @click="logout"
                class="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
              >
                Logout
              </button>
            </div>
            <div v-else class="space-y-1">
              <router-link
                to="/login"
                class="block px-4 py-2 text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
              >
                Login
              </router-link>
              <router-link
                to="/register"
                class="block px-4 py-2 text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
              >
                Register
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
/* Slide transition for mobile menu */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-100%);
}

/* Hover and focus effects */
button:hover:not(:disabled),
a:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:focus,
a:focus {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
}

/* Smooth header shadow transition */
header {
  transition: box-shadow 0.3s ease;
}

header:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
