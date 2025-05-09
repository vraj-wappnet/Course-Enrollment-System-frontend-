<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { useCoursesStore } from "../../stores/courses";
import { apiService } from "../../api/apiService";
import CourseCard from "../../components/courses/CourseCard.vue";

interface Course {
  _id: string;
  id: string;
  title: string;
  instructor: string;
  instructorName: string;
  duration: number;
  status: "Open" | "Closed" | "Completed";
  enrollmentStatus: "Open" | "Closed" | "Completed";
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Enrollment {
  _id: string;
  courseId: Course;
  userId: string;
  progress: number;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface EnrolledCourse extends Course {
  enrollmentId: string;
  progress: number;
  enrolledAt: Date;
}

const router = useRouter();
const authStore = useAuthStore();
const coursesStore = useCoursesStore();

const user = computed(() => authStore.user);
const enrolledCourses = ref<EnrolledCourse[]>([]);
const isLoading = ref(true);
const showEnrollForm = ref(false);
const selectedCourseId = ref("");
const enrollError = ref<string | null>(null);
const enrollSuccess = ref<string | null>(null);
const fetchError = ref<string | null>(null);
const progressError = ref<string | null>(null);
const deleteError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

onMounted(async () => {
  if (user.value) {
    try {
      // Fetch courses for the enrollment form dropdown
      await coursesStore.fetchCourses();

      // Fetch enrolled courses from API
      const token = authStore.user?.access_token;
      if (!token) {
        throw new Error("No access token available. Please log in.");
      }

      const response = await apiService.get<Enrollment[]>(
        `/enrollments/user/${user.value.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      enrolledCourses.value = response.data.map((enrollment) => ({
        ...enrollment.courseId,
        id: enrollment.courseId._id,
        enrollmentId: enrollment._id,
        progress: enrollment.progress,
        enrolledAt: new Date(enrollment.enrolledAt),
        enrollmentStatus: enrollment.courseId.status,
        instructorName: enrollment.courseId.instructor,
      }));
    } catch (error: any) {
      console.error("Failed to fetch enrolled courses:", error);
      if (error.response?.status === 401) {
        fetchError.value = "Session expired. Please log in again.";
        authStore.logout();
        router.push("/login");
      } else if (error.response?.status === 404) {
        fetchError.value = "No enrolled courses found.";
        enrolledCourses.value = [];
      } else if (error.response?.status === 500) {
        fetchError.value = "Server error. Please try again later.";
        enrolledCourses.value = [];
      } else {
        fetchError.value = error.message || "Failed to load enrolled courses.";
      }
    } finally {
      isLoading.value = false;
    }
  } else {
    isLoading.value = false;
    router.push("/login");
  }
});

async function viewCourse(courseId: string) {
  const course = enrolledCourses.value.find((c) => c.id === courseId);
  if (!course) {
    progressError.value = "Course not found.";
    return;
  }

  try {
    progressError.value = null;
    const token = authStore.user?.access_token;
    if (!token) {
      throw new Error("No access token available. Please log in.");
    }

    // Calculate new progress (increment by 25, cap at 100)
    const newProgress = Math.min(course.progress + 25, 100);

    // Call PUT API to update progress
    await apiService.put(`/enrollments/${course.enrollmentId}/progress`, {
      progress: newProgress,
    });

    // Update progress locally
    enrolledCourses.value = enrolledCourses.value.map((c) =>
      c.id === courseId ? { ...c, progress: newProgress } : c
    );

    // Navigate to course page
    router.push(`/courses/${courseId}`);
  } catch (error: any) {
    console.error("Failed to update progress:", error);
    if (error.response?.status === 401) {
      progressError.value = "Session expired. Please log in again.";
      authStore.logout();
      router.push("/login");
    } else if (error.response?.status === 400) {
      progressError.value = "Invalid progress update request.";
    } else if (error.response?.status === 500) {
      progressError.value = "Server error. Please try again later.";
    } else {
      progressError.value = error.message || "Failed to update progress.";
    }
  }
}

async function deleteEnrollment(enrollmentId: string) {
  try {
    deleteError.value = null;
    const token = authStore.user?.access_token;
    if (!token) {
      throw new Error("No access token available. Please log in.");
    }

    // Call DELETE API to remove enrollment
    await apiService.delete(`/enrollments/${enrollmentId}`);

    // Remove the course from enrolledCourses
    enrolledCourses.value = enrolledCourses.value.filter(
      (course) => course.enrollmentId !== enrollmentId
    );
  } catch (error: any) {
    console.error("Failed to delete enrollment:", error);
    if (error.response?.status === 401) {
      deleteError.value = "Session expired. Please log in again.";
      authStore.logout();
      router.push("/login");
    } else if (error.response?.status === 400) {
      deleteError.value = "Invalid deletion request.";
    } else if (error.response?.status === 404) {
      deleteError.value = "Enrollment not found.";
    } else if (error.response?.status === 500) {
      deleteError.value = "Server error. Please try again later.";
    } else {
      deleteError.value = error.message || "Failed to delete enrollment.";
    }
  }
}

function viewAllCourses() {
  if (!user.value) {
    router.push("/login");
    return;
  }
  showEnrollForm.value = true;
}

function viewEnrolledCourses() {
  router.push("/enrolled-courses");
}

async function handleEnroll() {
  if (!selectedCourseId.value) {
    enrollError.value = "Please select a course.";
    return;
  }

  try {
    enrollError.value = null;
    enrollSuccess.value = null;

    if (!user.value || !user.value.id) {
      throw new Error("User not authenticated. Please log in.");
    }

    // Call the enrollment API
    const response = await coursesStore.enrollInCourseAPI(
      selectedCourseId.value,
      user.value.id.toString()
    );

    // Get the newly enrolled course details
    const enrolledCourseResponse = await apiService.get<Enrollment>(
      `/enrollments/${response.enrollmentId}`,
      { headers: { Authorization: `Bearer ${authStore.user?.access_token}` } }
    );

    // Add the new course to the enrolledCourses array
    const newEnrollment = enrolledCourseResponse.data;
    enrolledCourses.value = [
      ...enrolledCourses.value,
      {
        ...newEnrollment.courseId,
        id: newEnrollment.courseId._id,
        enrollmentId: newEnrollment._id,
        progress: newEnrollment.progress,
        enrolledAt: new Date(newEnrollment.enrolledAt),
        enrollmentStatus: newEnrollment.courseId.status,
        instructorName: newEnrollment.courseId.instructor,
      }
    ];

    // Show success message and close modal
    successMessage.value = "Successfully enrolled in the course!";
    showEnrollForm.value = false;
    selectedCourseId.value = "";

    // Clear success message after 2 seconds
    setTimeout(() => {
      successMessage.value = null;
    }, 2000);
  } catch (error: any) {
    console.error("Enrollment error:", error);
    enrollError.value = error.message || "Failed to enroll in course";
    if (enrollError.value.includes("not authenticated")) {
      authStore.logout();
      router.push("/login");
    }
  }
}

function closeEnrollForm() {
  showEnrollForm.value = false;
  selectedCourseId.value = "";
  enrollError.value = null;
  enrollSuccess.value = null;
}

const availableCourses = computed(() => {
  return coursesStore.courses;
});
</script>

<template>
  <div class="bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 class="text-2xl font-bold mb-2">Welcome, {{ user?.name }}!</h1>
        <p class="text-gray-600">
          This is your personal dashboard where you can track your courses and
          progress.
        </p>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mb-6 text-center text-green-600">
        {{ successMessage }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Stats Section -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Your Stats</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Enrolled Courses</span>
                <span class="text-lg font-medium">{{
                  enrolledCourses.length
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Completed Courses</span>
                <span class="text-lg font-medium">{{
                  enrolledCourses.filter((c) => c.progress === 100).length
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">In Progress</span>
                <span class="text-lg font-medium">{{
                  enrolledCourses.filter(
                    (c) => c.progress > 0 && c.progress < 100
                  ).length
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Not Started</span>
                <span class="text-lg font-medium">{{
                  enrolledCourses.filter((c) => c.progress === 0).length
                }}</span>
              </div>
            </div>
            <div class="mt-6 flex flex-col space-y-2">
              <button @click="viewAllCourses" class="btn btn-primary">
                Enroll Courses
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
              <router-link
                to="/enrolled-courses"
                class="text-sm text-primary-600 hover:text-primary-800"
              >
                View All
              </router-link>
            </div>
            <div v-if="isLoading" class="text-center py-8">
              <svg
                class="animate-spin h-8 w-8 text-primary-500 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div v-else-if="fetchError" class="text-center py-8 text-red-600">
              {{ fetchError }}
            </div>
            <div
              v-else-if="progressError"
              class="text-center py-8 text-red-600"
            >
              {{ progressError }}
            </div>
            <div v-else-if="deleteError" class="text-center py-8 text-red-600">
              {{ deleteError }}
            </div>
            <div
              v-else-if="enrolledCourses.length === 0"
              class="text-center py-8"
            >
              <p class="text-gray-500">
                You haven't enrolled in any courses yet.
              </p>
              <router-link
                to="/courses"
                class="btn btn-primary mt-4 inline-block"
              >
                Browse Courses
              </router-link>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="course in enrolledCourses.slice(0, 4)"
                :key="course.id"
              >
                <CourseCard :course="course">
                  <template #actions>
                    <div class="mt-4 space-y-2">
                      <div v-if="course.progress < 100">
                        <button
                          @click="viewCourse(course.id)"
                          class="btn btn-primary w-full"
                        >
                          Continue Learning
                        </button>
                      </div>
                      <div
                        v-else
                        class="text-center text-green-600 font-semibold"
                      >
                        Completed
                      </div>
                      <button
                        @click="deleteEnrollment(course.enrollmentId)"
                        class="btn btn-outline btn-danger w-full"
                      >
                        Delete
                      </button>
                    </div>
                  </template>
                </CourseCard>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4">Your Learning Journey</h2>
            <div v-if="enrolledCourses.length === 0" class="text-center py-6">
              <p class="text-gray-500">
                Start your learning journey by enrolling in a course!
              </p>
            </div>
            <div v-else>
              <div class="mb-6">
                <h3 class="text-lg font-medium mb-2">Your Progress</h3>
                <div class="relative pt-1">
                  <div class="flex mb-2 items-center justify-between">
                    <div>
                      <span
                        class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-100"
                      >
                        Overall Completion
                      </span>
                    </div>
                    <div class="text-right">
                      <span
                        class="text-xs font-semibold inline-block text-primary-600"
                      >
                        {{
                          Math.round(
                            enrolledCourses.reduce(
                              (sum, course) => sum + course.progress,
                              0
                            ) / enrolledCourses.length
                          )
                        }}%
                      </span>
                    </div>
                  </div>
                  <div
                    class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200"
                  >
                    <div
                      :style="{
                        width: `${
                          enrolledCourses.reduce(
                            (sum, course) => sum + course.progress,
                            0
                          ) / enrolledCourses.length
                        }%`,
                      }"
                      class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-medium mb-4">Recent Activity</h3>
                <div class="space-y-3">
                  <div
                    v-for="(course, index) in enrolledCourses.slice(0, 3)"
                    :key="index"
                    class="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md transition-colors duration-150"
                  >
                    <div>
                      <p class="font-medium">{{ course.title }}</p>
                      <p class="text-sm text-gray-500">
                        {{ course.progress }}% complete
                      </p>
                    </div>
                    <div v-if="course.progress < 100">
                      <button
                        @click="viewCourse(course.id)"
                        class="text-primary-600 hover:text-primary-800"
                      >
                        Continue
                      </button>
                    </div>
                    <div v-else class="text-green-600 font-semibold">
                      Completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enroll Form Modal -->
      <div
        v-if="showEnrollForm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Enroll in a Course</h2>
            <button
              @click="closeEnrollForm"
              class="text-gray-600 hover:text-gray-800"
            >
              <svg
                class="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <form @submit.prevent="handleEnroll">
            <div class="mb-4">
              <label
                for="course"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Course
              </label>
              <select
                id="course"
                v-model="selectedCourseId"
                class="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              >
                <option value="" disabled>Select a course</option>
                <option
                  v-for="course in availableCourses"
                  :key="course.id"
                  :value="course.id"
                >
                  {{ course.title }}
                </option>
              </select>
              <div v-if="enrollError" class="text-red-600 text-xs mt-1">
                {{ enrollError }}
              </div>
              <div v-if="enrollSuccess" class="text-green-600 text-xs mt-1">
                {{ enrollSuccess }}
              </div>
            </div>
            <div class="flex justify-end space-x-2">
              <button
                type="button"
                @click="closeEnrollForm"
                class="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                :disabled="isLoading"
              >
                Enroll
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
