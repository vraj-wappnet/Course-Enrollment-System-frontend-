<script setup lang="ts">
import { computed } from 'vue'
import type { Course } from '../../stores/courses'

const props = defineProps<{
  course: Course & { progress?: number }
}>()

const statusColors = computed(() => {
  switch (props.course.enrollmentStatus) {
    case 'Open':
      return 'bg-green-100 text-green-800'
    case 'Closed':
      return 'bg-yellow-100 text-yellow-800'
    case 'Completed':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const defaultImage = 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
</script>

<template>
  <div class="card group h-full flex flex-col">
    <div class="relative overflow-hidden h-48">
      <img 
        :src="course.imageUrl || defaultImage" 
        :alt="course.title"
        class="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
      >
      <div class="absolute top-0 right-0 m-2">
        <span :class="['px-2 py-1 rounded-full text-xs font-medium', statusColors]">
          {{ course.enrollmentStatus }}
        </span>
      </div>
    </div>
    
    <div class="p-4 flex-grow flex flex-col">
      <h3 class="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors duration-200">
        {{ course.title }}
      </h3>
      
      <div class="text-sm text-gray-500 mb-2">
        <span>Instructor: {{ course.instructorName }}</span>
      </div>
      
      <div class="text-sm text-gray-500 mb-2">
        <span>Duration: {{ course.duration }} hours</span>
      </div>
      
      <p class="text-gray-600 text-sm mb-4 line-clamp-2">
        {{ course.description }}
      </p>
      
      <div v-if="course.progress !== undefined" class="mt-auto">
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div class="bg-primary-600 h-2.5 rounded-full" :style="`width: ${course.progress}%`"></div>
        </div>
        <div class="text-xs text-gray-500 text-right">Progress: {{ course.progress }}%</div>
      </div>
      
      <slot name="actions"></slot>
    </div>
  </div>
</template>