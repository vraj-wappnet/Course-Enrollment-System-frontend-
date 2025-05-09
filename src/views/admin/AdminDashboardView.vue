<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore } from '../../stores/courses'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const coursesStore = useCoursesStore()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const courses = computed(() => coursesStore.courses)
const openCourses = computed(() => coursesStore.openCourses)
const closedCourses = computed(() => coursesStore.closedCourses)
const completedCourses = computed(() => coursesStore.completedCourses)

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 class="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p class="text-gray-600">Manage courses and monitor the platform.</p>
      </div>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-500 mb-1">Total Courses</p>
              <p class="text-2xl font-bold">{{ courses.length }}</p>
            </div>
            <div class="h-12 w-12 bg-primary-100 rounded-lg text-primary-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-500 mb-1">Open Courses</p>
              <p class="text-2xl font-bold">{{ openCourses.length }}</p>
            </div>
            <div class="h-12 w-12 bg-green-100 rounded-lg text-green-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-500 mb-1">Closed Courses</p>
              <p class="text-2xl font-bold">{{ closedCourses.length }}</p>
            </div>
            <div class="h-12 w-12 bg-yellow-100 rounded-lg text-yellow-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-500 mb-1">Completed Courses</p>
              <p class="text-2xl font-bold">{{ completedCourses.length }}</p>
            </div>
            <div class="h-12 w-12 bg-gray-100 rounded-lg text-gray-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Admin Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
          <div class="space-y-4">
            <button @click="navigateTo('/admin/courses/new')" class="flex items-center w-full p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors duration-150">
              <div class="h-10 w-10 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-left">
                <h3 class="font-medium">Add New Course</h3>
                <p class="text-sm text-gray-500">Create a new course in the system</p>
              </div>
            </button>
            
            <button @click="navigateTo('/admin/courses')" class="flex items-center w-full p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors duration-150">
              <div class="h-10 w-10 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <div class="text-left">
                <h3 class="font-medium">Manage Courses</h3>
                <p class="text-sm text-gray-500">Edit, update or delete existing courses</p>
              </div>
            </button>
            
            <button class="flex items-center w-full p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors duration-150">
              <div class="h-10 w-10 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="text-left">
                <h3 class="font-medium">User Management</h3>
                <p class="text-sm text-gray-500">View and manage user accounts</p>
              </div>
            </button>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Admin Information</h2>
          <div class="mb-6">
            <div class="flex items-center mb-4">
              <div class="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                {{ user?.name.charAt(0) }}
              </div>
              <div class="ml-4">
                <h3 class="font-medium">{{ user?.name }}</h3>
                <p class="text-sm text-gray-500">Admin</p>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex">
                <span class="text-gray-500 w-24">Email:</span>
                <span>{{ user?.email }}</span>
              </div>
              <div class="flex">
                <span class="text-gray-500 w-24">Role:</span>
                <span class="capitalize">{{ user?.role }}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="font-medium mb-2">System Status</h3>
            <div class="space-y-2">
              <div class="flex items-center">
                <span class="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                <span>All systems operational</span>
              </div>
              <div class="flex items-center">
                <span class="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                <span>Database connected</span>
              </div>
              <div class="flex items-center">
                <span class="inline-block h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                <span>API services available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>