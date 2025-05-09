<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore, type EnrollmentStatus } from '../../stores/courses'

const router = useRouter()
const coursesStore = useCoursesStore()

const courses = computed(() => coursesStore.courses)
const searchQuery = ref('')
const selectedStatus = ref<EnrollmentStatus | 'All'>('All')
const sortBy = ref<'title' | 'instructorName' | 'duration'>('title')
const sortOrder = ref<'asc' | 'desc'>('asc')
const errorMessage = ref<string | null>(null)

const filteredCourses = computed(() => {
  let result = [...courses.value]
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(course => 
      course.title.toLowerCase().includes(query) || 
      course.instructorName.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query)
    )
  }
  
  // Filter by status
  if (selectedStatus.value !== 'All') {
    result = result.filter(course => course.enrollmentStatus === selectedStatus.value)
  }
  
  // Sort
  result.sort((a, b) => {
    let valueA = a[sortBy.value]
    let valueB = b[sortBy.value]
    
    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase()
      valueB = typeof valueB === 'string' ? valueB.toLowerCase() : valueB
    }
    
    if (valueA < valueB) return sortOrder.value === 'asc' ? -1 : 1
    if (valueA > valueB) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
  
  return result
})

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

function createCourse() {
  router.push('/admin/courses/new')
}

function editCourse(id: string) {
  router.push(`/admin/courses/${id}`)
}

async function confirmDelete(id: string) {
  if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
    try {
      errorMessage.value = null
      await coursesStore.deleteCourse(id)
    } catch (error: any) {
      console.error('Failed to delete course:', error)
      errorMessage.value = error.status === 401
        ? 'Session expired. Please log in again.'
        : error.message || 'Failed to delete course.'
    }
  }
}
</script>

<template>
  <div class="bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold mb-2">Manage Courses</h1>
            <p class="text-gray-600">Add, edit, or delete courses from the system.</p>
          </div>
          <button @click="createCourse" class="btn btn-primary flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Course
          </button>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="search" class="form-label">Search Courses</label>
            <input
              id="search"
              type="text"
              v-model="searchQuery"
              placeholder="Search by title, instructor, or keyword"
              class="form-input"
            >
          </div>
          
          <div>
            <label for="status" class="form-label">Status</label>
            <select id="status" v-model="selectedStatus" class="form-input">
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label for="sort" class="form-label">Sort By</label>
            <div class="flex">
              <select id="sort" v-model="sortBy" class="form-input rounded-r-none">
                <option value="title">Title</option>
                <option value="instructorName">Instructor</option>
                <option value="duration">Duration</option>
              </select>
              <button @click="toggleSortOrder" class="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50">
                <span v-if="sortOrder === 'asc'">↑</span>
                <span v-else>↓</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="course in filteredCourses" :key="course.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <img v-if="course.imageUrl" :src="course.imageUrl" :alt="course.title" class="h-10 w-10 rounded-full object-cover">
                      <div v-else class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {{ course.title.charAt(0) }}
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ course.title }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ course.instructorName }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ course.duration }} hours</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': course.enrollmentStatus === 'Open',
                      'bg-yellow-100 text-yellow-800': course.enrollmentStatus === 'Closed',
                      'bg-gray-100 text-gray-800': course.enrollmentStatus === 'Completed',
                    }"
                  >
                    {{ course.enrollmentStatus }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="editCourse(course.id)" class="text-primary-600 hover:text-primary-900 mr-3">
                    Edit
                  </button>
                  <button @click="confirmDelete(course.id)" class="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
              
              <tr v-if="filteredCourses.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                  No courses found matching your criteria. Try adjusting your search or 
                  <button @click="createCourse" class="text-primary-600 hover:text-primary-900">
                    add a new course.
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>