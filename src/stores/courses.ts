import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAuthStore } from "../stores/auth";
import { apiService } from "../api/apiService";

export type EnrollmentStatus = "Open" | "Closed" | "Completed";

export interface Course {
  id: string;
  title: string;
  instructorName: string;
  duration: number;
  enrollmentStatus: EnrollmentStatus;
  description: string;
  imageUrl?: string;
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: string;
  progress: number; // 0-100
  enrolledAt: Date;
}

export const useCoursesStore = defineStore(
  "courses",
  () => {
    const courses = ref<Course[]>([]);
    const enrollments = ref<Enrollment[]>([]);
    const authStore = useAuthStore();
    const errorMessage = ref<string | null>(null);

    async function fetchCourses() {
      try {
        const token = authStore.user?.access_token;
        if (!token) {
          throw new Error("No access token available. Please log in.");
        }

        const response = await apiService.get<
          {
            _id: string;
            title: string;
            instructor: string;
            duration: number;
            status: EnrollmentStatus;
            description: string;
            createdAt: string;
            updatedAt: string;
            __v: number;
          }[]
        >("/courses");

        courses.value = response.data.map((apiCourse) => ({
          id: apiCourse._id,
          title: apiCourse.title,
          instructorName: apiCourse.instructor,
          duration: apiCourse.duration,
          enrollmentStatus: apiCourse.status,
          description: apiCourse.description,
        }));
        errorMessage.value = null;
      } catch (error: any) {
        console.error("Failed to fetch courses:", error);
        errorMessage.value =
          error.status === 401
            ? "Session expired. Please log in again."
            : "Failed to load courses. Please try again.";
        if (error.status === 401 || error.message.includes("access token")) {
          authStore.logout();
        }
      }
    }

    async function addCourse(course: Omit<Course, "id">) {
      try {
        const token = authStore.user?.access_token;
        if (!token) {
          throw new Error("No access token available. Please log in.");
        }
        if (!authStore.isAdmin) {
          throw new Error("Only admins can add courses.");
        }

        const apiData = {
          title: course.title.trim(),
          instructor: course.instructorName.trim(),
          duration: Math.floor(course.duration),
          status: course.enrollmentStatus,
          description: course.description?.trim() || undefined,
        };

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
        }>("/courses", apiData);

        const newCourse: Course = {
          id: response.data._id,
          title: response.data.title,
          instructorName: response.data.instructor,
          duration: response.data.duration,
          enrollmentStatus: response.data.status,
          description: response.data.description,
          imageUrl: course.imageUrl,
        };

        courses.value.push(newCourse);
        errorMessage.value = null;
        return newCourse;
      } catch (error: any) {
        console.error("Failed to add course:", error);
        if (error.status === 401) {
          errorMessage.value = "Session expired. Please log in again.";
          authStore.logout();
        } else if (error.status === 400 && Array.isArray(error.message)) {
          errorMessage.value =
            "Validation errors occurred. Please check the form.";
        } else {
          errorMessage.value = error.message || "Failed to add course.";
        }
        throw error;
      }
    }

    async function updateCourse(id: string, updates: Partial<Course>) {
      try {
        const token = authStore.user?.access_token;
        if (!token) {
          throw new Error("No access token available. Please log in.");
        }
        if (!authStore.isAdmin) {
          throw new Error("Only admins can update courses.");
        }

        const apiData = {
          title: updates.title?.trim(),
          instructor: updates.instructorName?.trim(),
          duration:
            updates.duration !== undefined
              ? Math.floor(updates.duration)
              : undefined,
          status: updates.enrollmentStatus,
          description: updates.description?.trim() || undefined,
        };

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
        }>(`/courses/${id}`, apiData);

        const updatedCourse: Course = {
          id: response.data._id,
          title: response.data.title,
          instructorName: response.data.instructor,
          duration: response.data.duration,
          enrollmentStatus: response.data.status,
          description: response.data.description,
          imageUrl: updates.imageUrl,
        };

        const index = courses.value.findIndex((course) => course.id === id);
        if (index !== -1) {
          courses.value[index] = updatedCourse;
          errorMessage.value = null;
          return updatedCourse;
        }
        throw new Error("Course not found");
      } catch (error: any) {
        console.error("Failed to update course:", error);
        if (error.status === 401) {
          errorMessage.value = "Session expired. Please log in again.";
          authStore.logout();
        } else if (error.status === 400 && Array.isArray(error.message)) {
          errorMessage.value =
            "Validation errors occurred. Please check the form.";
        } else {
          errorMessage.value = error.message || "Failed to update course.";
        }
        throw error;
      }
    }

    async function deleteCourse(id: string) {
      try {
        const token = authStore.user?.access_token;
        if (!token) {
          throw new Error("No access token available. Please log in.");
        }
        if (!authStore.isAdmin) {
          throw new Error("Only admins can delete courses.");
        }

        await apiService.delete(`/courses/${id}`);

        const index = courses.value.findIndex((course) => course.id === id);
        if (index !== -1) {
          courses.value.splice(index, 1);
          enrollments.value = enrollments.value.filter(
            (e) => e.courseId !== id
          );
          errorMessage.value = null;
          return true;
        }
        throw new Error("Course not found");
      } catch (error: any) {
        console.error("Failed to delete course:", error);
        if (error.status === 401) {
          errorMessage.value = "Session expired. Please log in again.";
          authStore.logout();
        } else if (error.status === 404) {
          errorMessage.value = "Course not found.";
        } else {
          errorMessage.value = error.message || "Failed to delete course.";
        }
        throw error;
      }
    }

    async function enrollInCourseAPI(courseId: string, userId: string) {
      try {
        const token = authStore.user?.access_token;
        if (!token) {
          throw new Error("No access token available. Please log in.");
        }

        const response = await apiService.post<{
          message: string;
          enrollment: {
            id: number;
            userId: string;
            courseId: string;
            progress: number;
            enrolledAt: string;
          };
        }>("/enrollments", { courseId, userId });

        const newEnrollment: Enrollment = {
          id: response.data.enrollment.id,
          userId: parseInt(userId),
          courseId: response.data.enrollment.courseId,
          progress: response.data.enrollment.progress,
          enrolledAt: new Date(response.data.enrollment.enrolledAt),
        };

        enrollments.value.push(newEnrollment);
        errorMessage.value = null;
        return {
          message: response.data.message || "Enrolled successfully.",
          enrollment: newEnrollment,
        };
      } catch (error: any) {
        console.error("Failed to enroll in course:", error);
        if (error.status === 401) {
          errorMessage.value = "Session expired. Please log in again.";
          authStore.logout();
        } else if (error.status === 400) {
          errorMessage.value = "You are already enrolled in this course.";
        } else {
          errorMessage.value = error.message || "Failed to enroll in course.";
        }
        throw error;
      }
    }

    if (authStore.isAuthenticated) {
      fetchCourses();
    }

    function getCourseById(id: string) {
      return courses.value.find((course) => course.id === id) || null;
    }

    function enrollInCourse(userId: number, courseId: string) {
      const existingEnrollment = enrollments.value.find(
        (e) => e.userId === userId && e.courseId === courseId
      );

      if (existingEnrollment) {
        return existingEnrollment;
      }

      const newId =
        enrollments.value.length > 0
          ? Math.max(...enrollments.value.map((e) => e.id)) + 1
          : 1;

      const newEnrollment: Enrollment = {
        id: newId,
        userId,
        courseId,
        progress: 0,
        enrolledAt: new Date(),
      };

      enrollments.value.push(newEnrollment);
      return newEnrollment;
    }

    function updateProgress(
      userId: number,
      courseId: string,
      progress: number
    ) {
      const enrollment = enrollments.value.find(
        (e) => e.userId === userId && e.courseId === courseId
      );

      if (enrollment) {
        enrollment.progress = Math.min(Math.max(0, progress), 100);
        return enrollment;
      }

      return null;
    }

    function getEnrollmentForUserAndCourse(userId: number, courseId: string) {
      return (
        enrollments.value.find(
          (e) => e.userId === userId && e.courseId === courseId
        ) || null
      );
    }

    function getEnrolledCoursesForUser(userId: number) {
      const userEnrollments = enrollments.value.filter(
        (e) => e.userId === userId
      );

      return userEnrollments
        .map((enrollment) => {
          const course = getCourseById(enrollment.courseId);
          return {
            ...course,
            progress: enrollment.progress,
            enrolledAt: enrollment.enrolledAt,
          };
        })
        .filter((course) => course !== null) as (Course & {
        progress: number;
        enrolledAt: Date;
      })[];
    }

    const openCourses = computed(() => {
      return courses.value.filter(
        (course) => course.enrollmentStatus === "Open"
      );
    });

    const closedCourses = computed(() => {
      return courses.value.filter(
        (course) => course.enrollmentStatus === "Closed"
      );
    });

    const completedCourses = computed(() => {
      return courses.value.filter(
        (course) => course.enrollmentStatus === "Completed"
      );
    });

    return {
      courses,
      enrollments,
      errorMessage,
      fetchCourses,
      getCourseById,
      addCourse,
      updateCourse,
      deleteCourse,
      enrollInCourse,
      enrollInCourseAPI,
      updateProgress,
      getEnrollmentForUserAndCourse,
      getEnrolledCoursesForUser,
      openCourses,
      closedCourses,
      completedCourses,
    };
  },
  {
    persist: true,
  }
);
