<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CourseCard from '../components/courses/CourseCard.vue'
import { useCoursesStore } from '../stores/courses'

const router = useRouter()
const coursesStore = useCoursesStore()
const featuredCourses = ref(coursesStore.openCourses.slice(0, 3))

function viewCourse(courseId: number) {
  router.push(`/courses/${courseId}`)
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-center">
          <div class="md:w-1/2 mb-8 md:mb-0">
            <h1 class="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Expand Your Knowledge with Our Courses
            </h1>
            <p class="text-xl mb-8 text-primary-100">
              Discover a wide range of courses taught by industry experts.
              Learn at your own pace and track your progress.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <router-link to="/courses" class="btn bg-white text-primary-700 hover:bg-primary-50">
                Browse Courses
              </router-link>
              <router-link to="/register" class="btn bg-primary-500 text-white hover:bg-primary-400 border border-primary-400">
                Sign Up Now
              </router-link>
            </div>
          </div>
          <div class="md:w-1/2 md:pl-10">
            <img src="https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Online Learning" 
                class="rounded-lg shadow-xl transform -rotate-3 transition-transform hover:rotate-0 duration-300"
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Courses Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Featured Courses</h2>
          <p class="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our most popular courses and start your learning journey today.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="course in featuredCourses" :key="course.id" class="h-full">
            <CourseCard :course="course">
              <template #actions>
                <button @click="viewCourse(course.id)" class="btn btn-primary w-full mt-4">
                  View Course
                </button>
              </template>
            </CourseCard>
          </div>
        </div>
        
        <div class="text-center mt-12">
          <router-link to="/courses" class="btn btn-secondary">
            View All Courses
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform</h2>
          <p class="text-lg text-gray-600 max-w-3xl mx-auto">
            We provide the best learning experience with features designed to help you succeed.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div class="h-12 w-12 bg-primary-100 rounded-lg text-primary-600 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Quality Content</h3>
            <p class="text-gray-600">
              All our courses are created by industry experts and reviewed for quality.
            </p>
          </div>
          
          <div class="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div class="h-12 w-12 bg-primary-100 rounded-lg text-primary-600 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p class="text-gray-600">
              Track your progress in each course and pick up where you left off.
            </p>
          </div>
          
          <div class="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div class="h-12 w-12 bg-primary-100 rounded-lg text-primary-600 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-2">Learn at Your Pace</h3>
            <p class="text-gray-600">
              Access course materials anytime, anywhere, and learn at your own pace.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>