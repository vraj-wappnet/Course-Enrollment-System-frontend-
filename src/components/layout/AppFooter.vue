<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-gray-800 text-white py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-4 md:mb-0">
          <div class="text-xl font-bold">CourseHub</div>
          <p class="text-gray-300 mt-1">Expand your knowledge with our courses</p>
        </div>
        
        <div class="flex space-x-8">
          <div>
            <h3 class="font-semibold mb-2">Links</h3>
            <ul class="space-y-1">
              <li><router-link to="/" class="text-gray-300 hover:text-white">Home</router-link></li>
              <li><router-link to="/courses" class="text-gray-300 hover:text-white">Courses</router-link></li>
            </ul>
          </div>
          
          <div>
            <h3 class="font-semibold mb-2">Connect</h3>
            <ul class="space-y-1">
              <li><a href="#" class="text-gray-300 hover:text-white">Contact</a></li>
              <li><a href="#" class="text-gray-300 hover:text-white">About Us</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
        <p>&copy; {{ currentYear }} CourseHub. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>