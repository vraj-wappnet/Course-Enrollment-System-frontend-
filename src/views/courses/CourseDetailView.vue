<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCoursesStore } from '../../stores/courses'
import { useAuthStore } from '../../stores/auth'
import ProgressTracker from '../../components/ui/ProgressTracker.vue'

const route = useRoute()
const router = useRouter()
const coursesStore = useCoursesStore()
const authStore = useAuthStore()

const courseId = computed(() => Number(route.params.id))
const course = computed(() => coursesStore.getCourseById(courseId.value))
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const enrollment = ref(null)

onMounted(() => {
  if (isAuthenticated.value && user.value) {
    enrollment.value = coursesStore.getEnrollmentForUserAndCourse(user.value.id, courseId.value)
  }
})

function enrollInCourse() {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  
  if (course.value?.enrollmentStatus !== 'Open') {
    alert('This course is not open for enrollment')
    return
  }
  
  if (user.value) {
    enrollment.value = coursesStore.enrollInCourse(user.value.id, courseId.value)
  }
}

function updateProgress(newProgress: number) {
  if (user.value) {
    coursesStore.updateProgress(user.value.id, courseId.value, newProgress)
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div v-if="!course" class="min-h-[50vh] flex items-center justify-center">
    <div class="text-center">
      <h2 class="text-xl mb-2">Course not found</h2>
      <button @click="goBack" class="btn btn-primary">Go Back</button>
    </div>
  </div>
  
  <div v-else class="bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <button @click="goBack" class="flex items-center text-primary-600 mb-4 hover:underline">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>
      
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="md:flex">
          <div class="md:w-1/2">
            <img 
              :src="course.imageUrl || 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'" 
              :alt="course.title" 
              class="w-full h-64 md:h-full object-cover"
            >
          </div>
          
          <div class="md:w-1/2 p-6 md:p-8">
            <div class="flex justify-between items-start">
              <h1 class="text-2xl md:text-3xl font-bold">{{ course.title }}</h1>
              <span 
                class="inline-block px-3 py-1 rounded-full text-sm font-medium"
                :class="{
                  'bg-green-100 text-green-800': course.enrollmentStatus === 'Open',
                  'bg-yellow-100 text-yellow-800': course.enrollmentStatus === 'Closed',
                  'bg-gray-100 text-gray-800': course.enrollmentStatus === 'Completed',
                }"
              >
                {{ course.enrollmentStatus }}
              </span>
            </div>
            
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Instructor</p>
                <p class="font-medium">{{ course.instructorName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Duration</p>
                <p class="font-medium">{{ course.duration }} hours</p>
              </div>
            </div>
            
            <div class="mt-6">
              <h2 class="text-lg font-semibold mb-2">Description</h2>
              <p class="text-gray-700">{{ course.description }}</p>
            </div>
            
            <div v-if="enrollment" class="mt-6">
              <h2 class="text-lg font-semibold mb-2">Your Progress</h2>
              <ProgressTracker :progress="enrollment.progress" :course-id="courseId" @update:progress="updateProgress" />
            </div>
            
            <div class="mt-6">
              <button 
                v-if="!enrollment && course.enrollmentStatus === 'Open'" 
                @click="enrollInCourse" 
                class="btn btn-primary w-full"
              >
                Enroll Now
              </button>
              
              <div v-else-if="!enrollment && course.enrollmentStatus !== 'Open'" class="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                This course is not currently open for enrollment.
              </div>
              
              <button 
                v-else
                class="btn btn-accent w-full"
                @click="router.push('/enrolled-courses')"
              >
                Go to My Courses
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Additional course information sections could go here -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">What You'll Learn</h2>
          <ul class="space-y-2">
            <li class="flex items-start">
              <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Key concepts and fundamentals
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Practical skills and techniques
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Industry best practices
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Real-world application examples
            </li>
          </ul>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Requirements</h2>
          <ul class="space-y-2">
            <li class="flex items-start">
              <svg class="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Basic understanding of the subject
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Computer with internet access
            </li>
            <li class="flex items-start">
              <svg class="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Dedication and time commitment
            </li>
          </ul>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Instructor</h2>
          <div class="flex items-center mb-4">
            <div class="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
              {{ course.instructorName.charAt(0) }}
            </div>
            <div class="ml-4">
              <h3 class="font-medium">{{ course.instructorName }}</h3>
              <p class="text-sm text-gray-500">Expert Instructor</p>
            </div>
          </div>
          <p class="text-gray-700">
            Experienced instructor with years of practical knowledge in the field.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>