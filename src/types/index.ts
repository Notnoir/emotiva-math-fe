/**
 * TypeScript Type Definitions untuk EMOTIVA-MATH
 */

export interface UserProfile {
  id?: number;
  nama: string;
  gaya_belajar: "visual" | "auditori" | "kinestetik";
  level?: "pemula" | "menengah" | "mahir";
  created_at?: string;
  updated_at?: string;
  stats?: {
    total_emotions_logged: number;
    total_learning_activities: number;
  };
}

export interface EmotionLog {
  id?: number;
  user_id: number;
  emosi: "cemas" | "bingung" | "netral" | "percaya_diri";
  context?: string;
  waktu?: string;
}

export interface LearningLog {
  id?: number;
  user_id?: number;
  materi: string;
  tipe_aktivitas?: "belajar" | "latihan" | "quiz";
  skor?: number;
  durasi?: number;
  waktu?: string;
}

export interface TeacherMaterial {
  id: number;
  judul: string;
  topik: "kubus" | "balok" | "bola" | "tabung" | "kerucut" | "limas" | "prisma";
  konten: string;
  level: "pemula" | "menengah" | "mahir";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type LearningStyle = "visual" | "auditori" | "kinestetik";
export type Level = "pemula" | "menengah" | "mahir";
export type Emotion = "cemas" | "bingung" | "netral" | "percaya_diri";
export type ActivityType = "belajar" | "latihan" | "quiz";
