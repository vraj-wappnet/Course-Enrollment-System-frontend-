<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore } from '../../stores/courses'
import { useAuthStore } from '../../stores/auth'
import CourseCard from '../../components/courses/CourseCard.vue'

const router = useRouter()
const coursesStore = useCoursesStore()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const enrolledCourses = ref<any[]>([])
const isLoading = ref(true)
const activeFilter = ref<'all' | 'in-progress' | 'completed' | 'not-started'>('all')

onMounted(() => {
  if (user.value) {
    enrolledCourses.value = coursesStore.getEnrolledCoursesForUser(user.value.id)
  }
  isLoading.value = false
})

const filteredCourses = computed(() => {
  if (activeFilter.value === 'all') {
    return enrolledCourses.value
  } else if (activeFilter.value === 'in-progress') {
    return enrolledCourses.value.filter(course => course.progress > 0 && course.progress < 100)
  } else if (activeFilter.value === 'completed') {
    return enrolledCourses.value.filter(course => course.progress === 100)
  } else {
    return enrolledCourses.value.filter(course => course.progress === 0)
  }
})

function viewCourse(courseId: number) {
  router.push(`/courses/${courseId}`)
}
</script>

<template>
  <div class="bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 class="text-2xl font-bold mb-4">My Enrolled Courses</h1>
        <p class="text-gray-600">Track your progress and continue learning where you left off.</p>
      </div>
      
      <!-- Filter Tabs -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button 
              @click="activeFilter = 'all'"
              class="py-4 px-1 border-b-2 font-medium text-sm" 
              :class="[
                activeFilter === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              All Courses ({{ enrolledCourses.length }})
            </button>
            <button 
              @click="activeFilter = 'in-progress'"
              class="py-4 px-1 border-b-2 font-medium text-sm" 
              :class="[
                activeFilter === 'in-progress'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              In Progress ({{ enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length }})
            </button>
            <button 
              @click="activeFilter = 'completed'"
              class="py-4 px-1 border-b-2 font-medium text-sm" 
              :class="[
                activeFilter === 'completed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Completed ({{ enrolledCourses.filter(c => c.progress === 100).length }})
            </button>
            <button 
              @click="activeFilter = 'not-started'"
              class="py-4 px-1 border-b-2 font-medium text-sm" 
              :class="[
                activeFilter === 'not-started'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Not Started ({{ enrolledCourses.filter(c => c.progress === 0).length }})
            </button>
          </nav>
        </div>
      </div>
      
      <!-- Enrolled Courses -->
      <div v-if="isLoading" class="text-center py-8">
        <svg class="animate-spin h-8 w-8 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      
      <div v-else-if="enrolledCourses.length === 0" class="text-center py-8">
        <p class="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
        <router-link to="/courses" class="btn btn-primary">
          Browse Courses
        </router-link>
      </div>
      
      <div v-else-if="filteredCourses.length === 0" class="text-center py-8">
        <p class="text-gray-500">No courses match the selected filter.</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="course in filteredCourses" :key="course.id" class="h-full">
          <CourseCard :course="course">
            <template #actions>
              <button @click="viewCourse(course.id)" class="btn btn-primary w-full mt-4">
                {{ course.progress > 0 ? 'Continue Learning' : 'Start Learning' }}
              </button>
            </template>
          </CourseCard>
        </div>
      </div>
    </div>
  </div>
</template>