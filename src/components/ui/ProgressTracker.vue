<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  progress: number
  courseId: number
}>()

const emit = defineEmits<{
  'update:progress': [progress: number]
}>()

const localProgress = ref(props.progress)

function updateProgress() {
  // Clamp the value between 0 and 100
  const newValue = Math.min(Math.max(0, localProgress.value), 100)
  emit('update:progress', newValue)
}

watch(() => props.progress, (newVal) => {
  localProgress.value = newVal
})
</script>

<template>
  <div class="my-4">
    <label for="progress-slider" class="block text-sm font-medium text-gray-700 mb-2">
      Your Progress: {{ localProgress }}%
    </label>
    
    <div class="flex items-center">
      <input 
        id="progress-slider"
        type="range" 
        v-model="localProgress" 
        min="0" 
        max="100" 
        step="5"
        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        @change="updateProgress"
      >
    </div>
    
    <div class="mt-4">
      <div class="w-full bg-gray-200 rounded-full h-4">
        <div 
          class="h-4 rounded-full transition-all duration-300 ease-out"
          :class="{
            'bg-red-500': localProgress < 30,
            'bg-yellow-500': localProgress >= 30 && localProgress < 70,
            'bg-green-500': localProgress >= 70
          }"
          :style="`width: ${localProgress}%`"
        ></div>
      </div>
    </div>
    
    <div class="flex justify-between mt-2 text-xs text-gray-500">
      <span>Not Started</span>
      <span>In Progress</span>
      <span>Completed</span>
    </div>
  </div>
</template>