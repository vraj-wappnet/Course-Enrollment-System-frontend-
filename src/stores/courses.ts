import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type EnrollmentStatus = 'Open' | 'Closed' | 'Completed'

export interface Course {
  id: number
  title: string
  instructorName: string
  duration: number // in hours
  enrollmentStatus: EnrollmentStatus
  description: string
  imageUrl?: string
}

export interface Enrollment {
  id: number
  userId: number
  courseId: number
  progress: number // 0-100
  enrolledAt: Date
}

export const useCoursesStore = defineStore('courses', () => {
  // Mock courses data
  const courses = ref<Course[]>([
    {
      id: 1,
      title: 'Introduction to Web Development',
      instructorName: 'John Smith',
      duration: 30,
      enrollmentStatus: 'Open',
      description: 'Learn the basics of HTML, CSS, and JavaScript to build beautiful websites.',
      imageUrl: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 2,
      title: 'Advanced Vue.js Techniques',
      instructorName: 'Sarah Johnson',
      duration: 24,
      enrollmentStatus: 'Open',
      description: 'Take your Vue.js skills to the next level with advanced patterns and practices.',
      imageUrl: 'https://images.pexels.com/photos/92904/pexels-photo-92904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 3,
      title: 'Backend Development with Node.js',
      instructorName: 'Michael Chen',
      duration: 40,
      enrollmentStatus: 'Closed',
      description: 'Learn server-side programming with Node.js and build RESTful APIs.',
      imageUrl: 'https://images.pexels.com/photos/574077/pexels-photo-574077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 4,
      title: 'Mobile App Development with React Native',
      instructorName: 'Lisa Wong',
      duration: 36,
      enrollmentStatus: 'Open',
      description: 'Build cross-platform mobile applications with React Native.',
      imageUrl: 'https://images.pexels.com/photos/193003/pexels-photo-193003.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    },
    {
      id: 5,
      title: 'Data Science Fundamentals',
      instructorName: 'David Park',
      duration: 48,
      enrollmentStatus: 'Completed',
      description: 'Introduction to data analysis, visualization, and machine learning basics.',
      imageUrl: 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    }
  ])

  const enrollments = ref<Enrollment[]>([])

  // Course actions
  function getCourseById(id: number) {
    return courses.value.find(course => course.id === id) || null
  }

  function addCourse(course: Omit<Course, 'id'>) {
    const newId = courses.value.length > 0 
      ? Math.max(...courses.value.map(c => c.id)) + 1
      : 1
    
    const newCourse: Course = {
      ...course,
      id: newId
    }
    
    courses.value.push(newCourse)
    return newCourse
  }

  function updateCourse(id: number, updates: Partial<Course>) {
    const index = courses.value.findIndex(course => course.id === id)
    if (index !== -1) {
      courses.value[index] = { ...courses.value[index], ...updates }
      return courses.value[index]
    }
    return null
  }

  function deleteCourse(id: number) {
    const index = courses.value.findIndex(course => course.id === id)
    if (index !== -1) {
      courses.value.splice(index, 1)
      // Also delete enrollments for this course
      enrollments.value = enrollments.value.filter(e => e.courseId !== id)
      return true
    }
    return false
  }

  // Enrollment actions
  function enrollInCourse(userId: number, courseId: number) {
    const existingEnrollment = enrollments.value.find(
      e => e.userId === userId && e.courseId === courseId
    )
    
    if (existingEnrollment) {
      return existingEnrollment
    }
    
    const newId = enrollments.value.length > 0 
      ? Math.max(...enrollments.value.map(e => e.id)) + 1
      : 1
    
    const newEnrollment: Enrollment = {
      id: newId,
      userId,
      courseId,
      progress: 0,
      enrolledAt: new Date()
    }
    
    enrollments.value.push(newEnrollment)
    return newEnrollment
  }

  function updateProgress(userId: number, courseId: number, progress: number) {
    const enrollment = enrollments.value.find(
      e => e.userId === userId && e.courseId === courseId
    )
    
    if (enrollment) {
      enrollment.progress = Math.min(Math.max(0, progress), 100) // Ensure progress is between 0-100
      return enrollment
    }
    
    return null
  }

  function getEnrollmentForUserAndCourse(userId: number, courseId: number) {
    return enrollments.value.find(
      e => e.userId === userId && e.courseId === courseId
    ) || null
  }

  function getEnrolledCoursesForUser(userId: number) {
    const userEnrollments = enrollments.value.filter(e => e.userId === userId)
    
    return userEnrollments.map(enrollment => {
      const course = getCourseById(enrollment.courseId)
      return {
        ...course,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt
      }
    }).filter(course => course !== null)
  }

  const openCourses = computed(() => {
    return courses.value.filter(course => course.enrollmentStatus === 'Open')
  })

  const closedCourses = computed(() => {
    return courses.value.filter(course => course.enrollmentStatus === 'Closed')
  })

  const completedCourses = computed(() => {
    return courses.value.filter(course => course.enrollmentStatus === 'Completed')
  })

  return {
    courses,
    enrollments,
    getCourseById,
    addCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    updateProgress,
    getEnrollmentForUserAndCourse,
    getEnrolledCoursesForUser,
    openCourses,
    closedCourses,
    completedCourses
  }
}, {
  persist: true
})