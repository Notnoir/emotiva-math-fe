import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Auth token management
export const authService = {
  // Get token from localStorage
  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  // Save token to localStorage
  setToken: (token: string): void => {
    localStorage.setItem("auth_token", token);
  },

  // Remove token from localStorage
  removeToken: (): void => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_profile");
  },

  // Get current user from localStorage
  getCurrentUser: (): any | null => {
    const userStr = localStorage.getItem("user_profile");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Save user to localStorage
  setCurrentUser: (user: any): void => {
    localStorage.setItem("user_profile", JSON.stringify(user));
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },

  // Check if user is teacher
  isTeacher: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === "teacher";
  },

  // Check if user is student
  isStudent: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === "student";
  },

  // Register new user
  register: async (data: {
    nama: string;
    email: string;
    password: string;
    role: "teacher" | "student";
    gaya_belajar?: string;
    level?: string;
  }) => {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    if (response.data.status === "success") {
      const { token, user } = response.data.data;
      authService.setToken(token);
      authService.setCurrentUser(user);
    }
    return response;
  },

  // Login user
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    if (response.data.status === "success") {
      const { token, user } = response.data.data;
      authService.setToken(token);
      authService.setCurrentUser(user);
    }
    return response;
  },

  // Logout user
  logout: (): void => {
    authService.removeToken();
    // Redirect to login
    window.location.href = "/login";
  },

  // Verify token
  verifyToken: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        return null;
      }

      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === "success") {
        const user = response.data.data.user;
        authService.setCurrentUser(user);
        return user;
      }

      return null;
    } catch (error) {
      authService.removeToken();
      return null;
    }
  },

  // Update profile
  updateProfile: async (data: {
    nama?: string;
    gaya_belajar?: string;
    level?: string;
  }) => {
    const token = authService.getToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await axios.put(`${API_URL}/auth/update-profile`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status === "success") {
      const user = response.data.data.user;
      authService.setCurrentUser(user);
    }

    return response;
  },
};

// Add auth token to all axios requests
axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token && config.url?.includes("/api/")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      authService.removeToken();
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default authService;
