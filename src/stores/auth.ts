import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

export interface User {
  id: string; // Changed to string to match API's user_id
  name: string;
  email: string;
  role: "admin" | "user";
  access_token?: string; // Added for access token
  refresh_token?: string; // Added for refresh token
}

export const useAuthStore = defineStore(
  "auth",
  () => {
    const router = useRouter();
    const user = ref<User | null>(null);
    const isAuthenticated = computed(() => !!user.value);
    const isAdmin = computed(() => user.value?.role === "admin");

    async function login(
      email: string,
      password: string,
      apiData?: {
        access_token: string;
        refresh_token: string;
        user_id: string;
        email: string;
        name: string;
        role: "admin" | "user";
      }
    ) {
      if (!apiData) {
        throw new Error("Login API data is required");
      }

      // Store user data from API response
      user.value = {
        id: apiData.user_id,
        name: apiData.name,
        email: apiData.email,
        role: apiData.role,
        access_token: apiData.access_token,
        refresh_token: apiData.refresh_token,
      };

      return user.value;
    }

    async function register(name: string, email: string, password: string) {
      // Keep mock registration for now; update for real API if needed
      const existingUser = user.value?.email === email;
      if (existingUser) {
        throw new Error("User already exists");
      }

      const newUser: User = {
        id: Date.now().toString(), // Temporary ID; replace with API response
        name,
        email,
        role: "user",
      };

      user.value = newUser;
      return newUser;
    }

    function logout() {
      user.value = null;
      router.push("/login");
    }

    return {
      user,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
    };
  },
  {
    persist: true,
  }
);
