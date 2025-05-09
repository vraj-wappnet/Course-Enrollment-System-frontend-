<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCoursesStore, type EnrollmentStatus } from "../../stores/courses";
import { useAuthStore } from "../../stores/auth";
import { apiService } from "../../api/apiService";

const route = useRoute();
const router = useRouter();
const coursesStore = useCoursesStore();
const authStore = useAuthStore();

const isEditMode = computed(() => route.params.id !== undefined);
const courseId = computed(() =>
  isEditMode.value ? (route.params.id as string) : null
);

const title = ref("");
const instructorName = ref("");
const duration = ref<number | null>(null);
const enrollmentStatus = ref<EnrollmentStatus>("Open");
const description = ref("");
const imageUrl = ref("");

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);
const authError = ref<string | null>(null);

onMounted(() => {
  if (!authStore.isAdmin) {
    authError.value = "Only admins can manage courses.";
    router.push("/courses");
    return;
  }

  if (isEditMode.value && courseId.value) {
    const course = coursesStore.getCourseById(courseId.value);
    if (course) {
      title.value = course.title;
      instructorName.value = course.instructorName;
      duration.value = course.duration;
      enrollmentStatus.value = course.enrollmentStatus;
      description.value = course.description || ""; // Fixed: Use course.description
      imageUrl.value = course.imageUrl || "";
    } else {
      router.push("/admin/courses");
    }
  }
});

function validateForm() {
  const newErrors: Record<string, string> = {};

  // Title validation
  if (!title.value.trim()) {
    newErrors.title = "Course title is required";
  } else if (typeof title.value !== "string") {
    newErrors.title = "Course title must be a string";
  } else if (title.value.length > 100) {
    newErrors.title = "Course title must be 100 characters or less";
  }

  // Instructor validation
  if (!instructorName.value.trim()) {
    newErrors.instructorName = "Instructor name is required";
  } else if (typeof instructorName.value !== "string") {
    newErrors.instructorName = "Instructor name must be a string";
  } else if (instructorName.value.length > 100) {
    newErrors.instructorName = "Instructor name must be 100 characters or less";
  }

  // Duration validation
  if (duration.value === null || duration.value === undefined) {
    newErrors.duration = "Duration is required";
  } else if (!Number.isInteger(duration.value)) {
    newErrors.duration = "Duration must be an integer";
  } else if (duration.value <= 0) {
    newErrors.duration = "Duration must be a positive number";
  }

  // Status validation
  if (!enrollmentStatus.value) {
    newErrors.enrollmentStatus = "Enrollment status is required";
  } else if (
    !["Open", "Closed", "Completed"].includes(enrollmentStatus.value)
  ) {
    newErrors.enrollmentStatus = "Status must be Open, Closed, or Completed";
  }

  // Description validation
  if (description.value && description.value.length > 500) {
    newErrors.description = "Description must be 500 characters or less";
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
}

async function handleSubmit() {
  if (!authStore.isAdmin) {
    authError.value = "Only admins can manage courses.";
    return;
  }

  if (!validateForm()) {
    return;
  }

  try {
    isSubmitting.value = true;
    authError.value = null;

    const courseData = {
      title: title.value.trim(),
      instructor: instructorName.value.trim(),
      duration: Math.floor(duration.value as number), // Ensure integer
      status: enrollmentStatus.value,
      description: description.value.trim() || undefined,
    };

    const token = authStore.user?.access_token;
    if (!token) {
      throw new Error("No access token available. Please log in.");
    }

    if (isEditMode.value && courseId.value) {
      // Update existing course (PUT /courses/:id)
      const response = await apiService.put<{
        _id: string;
        title: string;
        instructor: string;
        duration: number;
        status: EnrollmentStatus;
        description: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
      }>(`/courses/${courseId.value}`);

      await coursesStore.updateCourse(courseId.value, {
        id: response.data._id,
        title: response.data.title,
        instructorName: response.data.instructor,
        duration: response.data.duration,
        enrollmentStatus: response.data.status,
        description: response.data.description,
        imageUrl: imageUrl.value || undefined,
      });
    } else {
      // Create new course (POST /courses)
      const response = await apiService.post<{
        _id: string;
        title: string;
        instructor: string;
        duration: number;
        status: EnrollmentStatus;
        description: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
      }>("/courses", courseData);

      await coursesStore.addCourse({
        id: response.data._id,
        title: response.data.title,
        instructorName: response.data.instructor,
        duration: response.data.duration,
        enrollmentStatus: response.data.status,
        description: response.data.description,
        imageUrl: imageUrl.value || undefined,
      });
    }

    router.push("/admin/courses");
  } catch (error: any) {
    isSubmitting.value = false;
    console.error("Error submitting form:", error);

    if (error.status === 401) {
      authError.value = "Session expired. Please log in again.";
      authStore.logout();
    } else if (error.status === 400 && Array.isArray(error.message)) {
      // Map API validation errors to form fields
      const newErrors: Record<string, string> = {};
      error.message.forEach((msg: string) => {
        if (msg.includes("title")) {
          newErrors.title = msg;
        } else if (msg.includes("instructor")) {
          newErrors.instructorName = msg;
        } else if (msg.includes("duration")) {
          newErrors.duration = msg;
        } else if (msg.includes("status")) {
          newErrors.enrollmentStatus = msg;
        } else if (msg.includes("description")) {
          newErrors.description = msg;
        }
      });
      errors.value = newErrors;
      authError.value = "Please correct the form errors.";
    } else {
      authError.value = error.message || "Failed to save course.";
    }
  }
}

function cancel() {
  router.push("/admin/courses");
}
</script>

<template>
  <div class="bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-2">
          {{ isEditMode ? "Edit Course" : "Create New Course" }}
        </h1>
        <form @submit.prevent="handleSubmit">
          <div class="space-y-6">
            <div>
              <label for="title" class="form-label"
                >Course Title <span class="text-red-500">*</span></label
              >
              <input
                id="title"
                type="text"
                v-model="title"
                class="form-input"
                :class="{ 'border-red-500': errors.title }"
                placeholder="Enter course title"
              />
              <p v-if="errors.title" class="mt-1 text-sm text-red-500">
                {{ errors.title }}
              </p>
            </div>

            <div>
              <label for="instructor" class="form-label"
                >Instructor Name <span class="text-red-500">*</span></label
              >
              <input
                id="instructor"
                type="text"
                v-model="instructorName"
                class="form-input"
                :class="{ 'border-red-500': errors.instructorName }"
                placeholder="Enter instructor name"
              />
              <p v-if="errors.instructorName" class="mt-1 text-sm text-red-500">
                {{ errors.instructorName }}
              </p>
            </div>

            <div>
              <label for="duration" class="form-label"
                >Duration (hours) <span class="text-red-500">*</span></label
              >
              <input
                id="duration"
                type="number"
                v-model="duration"
                min="1"
                class="form-input"
                :class="{ 'border-red-500': errors.duration }"
                placeholder="Enter course duration in hours"
              />
              <p v-if="errors.duration" class="mt-1 text-sm text-red-500">
                {{ errors.duration }}
              </p>
            </div>

            <div>
              <label for="status" class="form-label"
                >Enrollment Status <span class="text-red-500">*</span></label
              >
              <select
                id="status"
                v-model="enrollmentStatus"
                class="form-input"
                :class="{ 'border-red-500': errors.enrollmentStatus }"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Completed">Completed</option>
              </select>
              <p
                v-if="errors.enrollmentStatus"
                class="mt-1 text-sm text-red-500"
              >
                {{ errors.enrollmentStatus }}
              </p>
            </div>

            <div>
              <label for="description" class="form-label">Description</label>
              <textarea
                id="description"
                v-model="description"
                rows="4"
                class="form-input"
                :class="{ 'border-red-500': errors.description }"
                placeholder="Enter course description"
              ></textarea>
              <p v-if="errors.description" class="mt-1 text-sm text-red-500">
                {{ errors.description }}
              </p>
              <p class="mt-1 text-sm text-gray-500">Maximum 500 characters</p>
            </div>

            <div
              class="flex justify-end space-x-3 pt-6 border-t border-gray-200"
            >
              <button type="button" @click="cancel" class="btn btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary flex items-center"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="mr-2">
                  <svg
                    class="animate-spin h-5 w-5 text-white"
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
                </span>
                {{ isEditMode ? "Update Course" : "Create Course" }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
