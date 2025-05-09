import axios, { AxiosInstance, AxiosError } from "axios";
import { useAuthStore } from "../stores/auth";

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

interface ApiError {
  message: string;
  status?: number;
}

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL as string,
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Initialize interceptors without store
    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Get the store dynamically when needed
        const authStore = useAuthStore();
        const token = authStore.user?.access_token;
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || "An error occurred",
          status: error.response?.status,
        };
        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get<T>(url, { params });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post<T>(url, data);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put<T>(url, data);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete<T>(url);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }
}

export const apiService = new ApiService();
