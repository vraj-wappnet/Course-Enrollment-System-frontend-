<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCoursesStore } from "../../stores/courses";
import { useAuthStore } from "../../stores/auth";
import CourseCard from "../../components/courses/CourseCard.vue";
import type { Course, EnrollmentStatus } from "../../stores/courses";

const router = useRouter();
const coursesStore = useCoursesStore();
const authStore = useAuthStore();

const courses = computed(() => coursesStore.courses);
const searchQuery = ref("");
const selectedStatus = ref<EnrollmentStatus | "All">("All");
const sortBy = ref<"title" | "instructor" | "duration">("title");
const sortOrder = ref<"asc" | "desc">("asc");

const filteredCourses = computed(() => {
  let result = [...courses.value];

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.instructorName.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
    );
  }

  // Filter by status
  if (selectedStatus.value !== "All") {
    result = result.filter(
      (course) => course.enrollmentStatus === selectedStatus.value
    );
  }

  // Sort
  result.sort((a, b) => {
    let valueA = a[sortBy.value];
    let valueB = b[sortBy.value];

    if (typeof valueA === "string") {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) return sortOrder.value === "asc" ? -1 : 1;
    if (valueA > valueB) return sortOrder.value === "asc" ? 1 : -1;
    return 0;
  });

  return result;
});

function viewCourse(courseId: number) {
  router.push(`/courses/${courseId}`);
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
}
</script>

<template>
  <div class="bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Filters and Search -->
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
            />
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
              <select
                id="sort"
                v-model="sortBy"
                class="form-input rounded-r-none"
              >
                <option value="title">Title</option>
                <option value="instructorName">Instructor</option>
                <option value="duration">Duration</option>
              </select>
              <button
                @click="toggleSortOrder"
                class="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50"
              >
                <span v-if="sortOrder === 'asc'">↑</span>
                <span v-else>↓</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Course Grid -->
      <div v-if="filteredCourses.length === 0" class="text-center py-8">
        <p class="text-gray-500">
          No courses found. Try adjusting your search criteria.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="course in filteredCourses" :key="course.id" class="h-full">
          <CourseCard :course="course">
            <template #actions>
              <button
                @click="viewCourse(course.id)"
                class="btn btn-primary w-full mt-4"
              >
                View Details
              </button>
            </template>
          </CourseCard>
        </div>
      </div>
    </div>
  </div>
</template>
