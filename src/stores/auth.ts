import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Mock users for demo
  const mockUsers: User[] = [
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    { id: 2, name: 'Regular User', email: 'user@example.com', role: 'user' }
  ]

  async function login(email: string, password: string) {
    // Mock login - in a real app, you would make an API call
    if (password !== 'password') {
      throw new Error('Invalid credentials')
    }
    
    const foundUser = mockUsers.find(u => u.email === email)
    if (!foundUser) {
      throw new Error('User not found')
    }
    
    user.value = foundUser
    return foundUser
  }

  async function register(name: string, email: string, password: string) {
    // Mock registration - in a real app, you would make an API call
    const existingUser = mockUsers.find(u => u.email === email)
    if (existingUser) {
      throw new Error('User already exists')
    }
    
    const newUser: User = {
      id: mockUsers.length + 1,
      name,
      email,
      role: 'user' // Default role is user
    }
    
    mockUsers.push(newUser)
    user.value = newUser
    return newUser
  }

  function logout() {
    user.value = null
    router.push('/login')
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout
  }
}, {
  persist: true
})