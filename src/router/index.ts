import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Layouts
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import DashboardView from '../views/dashboard/DashboardView.vue'
import CoursesView from '../views/courses/CoursesView.vue'
import CourseDetailView from '../views/courses/CourseDetailView.vue'
import EnrolledCoursesView from '../views/courses/EnrolledCoursesView.vue'
import AdminDashboardView from '../views/admin/AdminDashboardView.vue'
import AdminCoursesView from '../views/admin/AdminCoursesView.vue'
import AdminCourseFormView from '../views/admin/AdminCourseFormView.vue'
import ForgotPassword from '../views/auth/ForgotPassword.vue'
import VerifyOtp from '../views/auth/VerifyOtp.vue'
import ResetPassword from '../views/auth/ResetPassword.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false, hideForAuth: true }
    },
    {
      path: '/forgot-password',
      name: 'ForgotPassword',
      component: ForgotPassword,
    },
    {
      path: '/verify-otp',
      name: 'VerifyOTP',
      component: VerifyOtp,
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: ResetPassword,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false, hideForAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/courses',
      name: 'courses',
      component: CoursesView,
      meta: { requiresAuth: false }
    },
    {
      path: '/courses/:id',
      name: 'course-detail',
      component: CourseDetailView,
      meta: { requiresAuth: false }
    },
    {
      path: '/enrolled-courses',
      name: 'enrolled-courses',
      component: EnrolledCoursesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: AdminDashboardView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/courses',
      name: 'admin-courses',
      component: AdminCoursesView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/courses/new',
      name: 'admin-course-new',
      component: AdminCourseFormView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/courses/:id',
      name: 'admin-course-edit',
      component: AdminCourseFormView,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth
  const requiresAdmin = to.meta.requiresAdmin
  const hideForAuth = to.meta.hideForAuth
  
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (hideForAuth && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (requiresAdmin && !authStore.isAdmin) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router