<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useCoursesStore } from '../../stores/courses'
import CourseCard from '../../components/courses/CourseCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const coursesStore = useCoursesStore()

const user = computed(() => authStore.user)
const enrolledCourses = ref<any[]>([])
const isLoading = ref(true)

onMounted(() => {
  if (user.value) {
    enrolledCourses.value = coursesStore.getEnrolledCoursesForUser(user.value.id)
  }
  isLoading.value = false
})

function viewCourse(courseId: number) {
  router.push(`/courses/${courseId}`)
}

function viewAllCourses() {
  router.push('/courses')
}

function viewEnrolledCourses() {
  router.push('/enrolled-courses')
}
</script>

<template>
  <div class="bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 class="text-2xl font-bold mb-2">Welcome, {{ user?.name }}!</h1>
        <p class="text-gray-600">This is your personal dashboard where you can track your courses and progress.</p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Stats Section -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Your Stats</h2>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Enrolled Courses</span>
                <span class="text-lg font-medium">{{ enrolledCourses.length }}</span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Completed Courses</span>
                <span class="text-lg font-medium">{{ enrolledCourses.filter(c => c.progress === 100).length }}</span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-600">In Progress</span>
                <span class="text-lg font-medium">{{ enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length }}</span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Not Started</span>
                <span class="text-lg font-medium">{{ enrolledCourses.filter(c => c.progress === 0).length }}</span>
              </div>
            </div>
            
            <div class="mt-6 flex flex-col space-y-2">
              <button @click="viewAllCourses" class="btn btn-primary">
                Browse Courses
              </button>
              <button @click="viewEnrolledCourses" class="btn btn-secondary">
                View Enrolled Courses
              </button>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4">Account Information</h2>
            <div class="space-y-2">
              <div>
                <span class="text-gray-600">Name:</span>
                <span class="ml-2">{{ user?.name }}</span>
              </div>
              <div>
                <span class="text-gray-600">Email:</span>
                <span class="ml-2">{{ user?.email }}</span>
              </div>
              <div>
                <span class="text-gray-600">Role:</span>
                <span class="ml-2 capitalize">{{ user?.role }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent/In Progress Courses -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold">Your Courses</h2>
              <router-link to="/enrolled-courses" class="text-sm text-primary-600 hover:text-primary-800">
                View All
              </router-link>
            </div>
            
            <div v-if="isLoading" class="text-center py-8">
              <svg class="animate-spin h-8 w-8 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            
            <div v-else-if="enrolledCourses.length === 0" class="text-center py-8">
              <p class="text-gray-500">You haven't enrolled in any courses yet.</p>
              <router-link to="/courses" class="btn btn-primary mt-4 inline-block">
                Browse Courses
              </router-link>
            </div>
            
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="course in enrolledCourses.slice(0, 4)" :key="course.id">
                <CourseCard :course="course">
                  <template #actions>
                    <button @click="viewCourse(course.id)" class="btn btn-primary w-full mt-4">
                      Continue Learning
                    </button>
                  </template>
                </CourseCard>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4">Your Learning Journey</h2>
            
            <div v-if="enrolledCourses.length === 0" class="text-center py-6">
              <p class="text-gray-500">Start your learning journey by enrolling in a course!</p>
            </div>
            
            <div v-else>
              <div class="mb-6">
                <h3 class="text-lg font-medium mb-2">Your Progress</h3>
                <div class="relative pt-1">
                  <div class="flex mb-2 items-center justify-between">
                    <div>
                      <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-100">
                        Overall Completion
                      </span>
                    </div>
                    <div class="text-right">
                      <span class="text-xs font-semibold inline-block text-primary-600">
                        {{ Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length) }}%
                      </span>
                    </div>
                  </div>
                  <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                    <div style="width:70%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 class="text-lg font-medium mb-4">Recent Activity</h3>
                <div class="space-y-3">
                  <div v-for="(course, index) in enrolledCourses.slice(0, 3)" :key="index" 
                    class="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md transition-colors duration-150">
                    <div>
                      <p class="font-medium">{{ course.title }}</p>
                      <p class="text-sm text-gray-500">{{ course.progress }}% complete</p>
                    </div>
                    <button @click="viewCourse(course.id)" class="text-primary-600 hover:text-primary-800">
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>