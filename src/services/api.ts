/**
 * API Service untuk koneksi ke Backend
 * Base URL: http://localhost:5000/api
 */
import axios from "axios";
import { authService } from "./authService";
import type {
  UserProfile,
  EmotionLog,
  LearningLog,
  TeacherMaterial,
} from "../types";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to all requests from this api instance
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== PROFILE API ====================

export const profileApi = {
  // Get all profiles
  getAll: async () => {
    const response = await api.get("/profile");
    return response.data;
  },

  // Get specific profile
  getById: async (id: number) => {
    const response = await api.get(`/profile/${id}`);
    return response.data;
  },

  // Create new profile
  create: async (data: UserProfile) => {
    const response = await api.post("/profile", data);
    return response.data;
  },

  // Update profile
  update: async (id: number, data: Partial<UserProfile>) => {
    const response = await api.put(`/profile/${id}`, data);
    return response.data;
  },
};

// ==================== EMOTION API ====================

export const emotionApi = {
  // Log emotion
  log: async (data: EmotionLog) => {
    const response = await api.post("/emotion", data);
    return response.data;
  },

  // Get emotion history
  getHistory: async (userId: number) => {
    const response = await api.get(`/emotion/${userId}`);
    return response.data;
  },
};

// ==================== LEARNING LOG API ====================

export const learningApi = {
  // Get learning logs
  getLogs: async (userId: number) => {
    const response = await api.get(`/learning-logs/${userId}`);
    return response.data;
  },

  // Create learning log
  createLog: async (userId: number, data: LearningLog) => {
    const response = await api.post(`/learning-logs/${userId}`, data);
    return response.data;
  },
};

// ==================== ADAPTIVE LEARNING API ====================

export const adaptiveApi = {
  // Get adaptive content
  getContent: async (userId: number, topic: string, emotion?: string) => {
    const response = await api.post("/adaptive/content", {
      user_id: userId,
      topic,
      emosi: emotion,
    });
    return response.data;
  },

  // Note: Backend doesn't have /adaptive/recommend endpoint
  // Topics should be fetched from materials instead
};

// ==================== HEALTH CHECK ====================

export const healthCheck = async () => {
  const response = await api.get("/health");
  return response.data;
};

// ==================== TEACHER MATERIALS API ====================

// Simple API functions untuk Teacher Materials
const getMaterials = async (
  topik?: string,
  level?: string
): Promise<TeacherMaterial[]> => {
  let url = "/materials";
  const params = new URLSearchParams();
  if (topik) params.append("topik", topik);
  if (level) params.append("level", level);
  if (params.toString()) url += `?${params.toString()}`;

  const response = await api.get(url);
  return response.data.data;
};

const getMaterialById = async (id: number): Promise<TeacherMaterial> => {
  const response = await api.get(`/materials/${id}`);
  return response.data.data;
};

const createMaterial = async (
  data: Omit<TeacherMaterial, "id" | "created_at" | "updated_at">
): Promise<TeacherMaterial> => {
  const response = await api.post("/materials", data);
  return response.data.data;
};

const uploadMaterial = async (formData: FormData): Promise<TeacherMaterial> => {
  const response = await axios.post(`${API_BASE_URL}/materials`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${authService.getToken()}`,
    },
  });
  return response.data.data;
};

const downloadMaterial = async (id: number): Promise<Blob> => {
  const response = await axios.get(`${API_BASE_URL}/materials/${id}/download`, {
    responseType: "blob",
    headers: {
      Authorization: `Bearer ${authService.getToken()}`,
    },
  });
  return response.data;
};

const updateMaterial = async (
  id: number,
  data: Partial<Omit<TeacherMaterial, "id" | "created_at" | "updated_at">>
): Promise<TeacherMaterial> => {
  const response = await api.put(`/materials/${id}`, data);
  return response.data.data;
};

const deleteMaterial = async (id: number): Promise<void> => {
  await api.delete(`/materials/${id}`);
};

const searchMaterials = async (
  keyword: string,
  topik?: string,
  level?: string
): Promise<TeacherMaterial[]> => {
  let url = `/materials/search?q=${encodeURIComponent(keyword)}`;
  if (topik) url += `&topik=${topik}`;
  if (level) url += `&level=${level}`;

  const response = await api.get(url);
  return response.data.data;
};

const getAvailableTopics = async (): Promise<any[]> => {
  const response = await api.get("/materials/topics");
  return response.data.data;
};

const getStepByStepSolution = async (
  topic: string,
  problem: string,
  level: string = "pemula"
): Promise<any> => {
  const response = await api.post("/materials/solution-steps", {
    topic,
    problem,
    level,
  });
  return response.data.data;
};

export default {
  getMaterials,
  getMaterialById,
  createMaterial,
  uploadMaterial,
  downloadMaterial,
  updateMaterial,
  deleteMaterial,
  searchMaterials,
  getAvailableTopics,
  getStepByStepSolution,
};
