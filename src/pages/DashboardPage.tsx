import { useState, useEffect } from "react";
import axios from "axios";

interface OverviewData {
  total_users: number;
  total_materials: number;
  total_quizzes: number;
  total_activities: number;
  avg_quiz_score: number;
}

interface RecentActivity {
  last_7_days_activities: number;
  last_7_days_quizzes: number;
}

interface Student {
  id: number;
  nama: string;
  level: string;
  gaya_belajar: string;
  total_quizzes: number;
  avg_quiz_score: number;
  total_activities: number;
  total_duration_minutes: number;
  dominant_emotion: string;
  last_activity: string | null;
}

interface TopicAnalytics {
  topik: string;
  materials_count: number;
  total_attempts: number;
  avg_score: number;
  total_activities: number;
  completion_rate: number;
  students_passed: number;
}

interface EmotionData {
  count: number;
  percentage: number;
}

const API_URL = "http://localhost:5000/api";

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(
    null
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [topics, setTopics] = useState<TopicAnalytics[]>([]);
  const [emotions, setEmotions] = useState<Record<string, EmotionData>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "topics" | "emotions"
  >("overview");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log("📊 Loading dashboard data...");
      
      // Load overview
      const overviewRes = await axios.get(`${API_URL}/dashboard/overview`);
      console.log("Overview response:", overviewRes.data);
      if (overviewRes.data.status === "success") {
        setOverview(overviewRes.data.data.overview);
        setRecentActivity(overviewRes.data.data.recent_activity);
      }

      // Load students
      const studentsRes = await axios.get(
        `${API_URL}/dashboard/students?limit=10&sort=score`
      );
      console.log("Students response:", studentsRes.data);
      if (studentsRes.data.status === "success") {
        setStudents(studentsRes.data.data.students);
      }

      // Load topics
      const topicsRes = await axios.get(`${API_URL}/dashboard/topics`);
      console.log("Topics response:", topicsRes.data);
      if (topicsRes.data.status === "success") {
        setTopics(topicsRes.data.data.topics);
      }

      // Load emotions
      const emotionsRes = await axios.get(
        `${API_URL}/dashboard/emotions?days=30`
      );
      console.log("Emotions response:", emotionsRes.data);
      if (emotionsRes.data.status === "success") {
        setEmotions(emotionsRes.data.data.distribution);
      }
      
      console.log("✅ Dashboard data loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojis: Record<string, string> = {
      cemas: "😰",
      bingung: "😕",
      netral: "😐",
      percaya_diri: "😊",
    };
    return emojis[emotion] || "😐";
  };

  const getTopikLabel = (topik: string) => {
    const labels: Record<string, string> = {
      kubus: "📦 Kubus",
      balok: "📦 Balok",
      bola: "⚽ Bola",
      tabung: "🥫 Tabung",
      kerucut: "🍦 Kerucut",
      limas: "🔺 Limas",
      prisma: "📐 Prisma",
    };
    return labels[topik] || topik;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      pemula: "bg-green-100 text-green-800",
      menengah: "bg-yellow-100 text-yellow-800",
      mahir: "bg-red-100 text-red-800",
    };
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-xl text-gray-700 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            📊 Dashboard Guru
          </h1>
          <p className="text-gray-600">
            Analisis lengkap progress dan aktivitas pembelajaran siswa
          </p>
        </div>

        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-3xl font-bold text-gray-800">
                {overview.total_users}
              </div>
              <div className="text-sm text-gray-600">Total Siswa</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-3xl font-bold text-gray-800">
                {overview.total_materials}
              </div>
              <div className="text-sm text-gray-600">Materi Tersedia</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-gray-800">
                {overview.total_quizzes}
              </div>
              <div className="text-sm text-gray-600">Quiz Dikerjakan</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-3xl font-bold text-gray-800">
                {overview.avg_quiz_score.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Rata-rata Skor</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-pink-500">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-3xl font-bold text-gray-800">
                {overview.total_activities}
              </div>
              <div className="text-sm text-gray-600">Total Aktivitas</div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md p-6 mb-8 text-white">
            <h2 className="text-xl font-bold mb-4">
              ⚡ Aktivitas 7 Hari Terakhir
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">
                  {recentActivity.last_7_days_activities}
                </div>
                <div className="text-sm opacity-90">Sesi Belajar</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">
                  {recentActivity.last_7_days_quizzes}
                </div>
                <div className="text-sm opacity-90">Quiz Dikerjakan</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === "overview"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === "students"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
              }`}
            >
              👥 Siswa
            </button>
            <button
              onClick={() => setActiveTab("topics")}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === "topics"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
              }`}
            >
              📚 Topik
            </button>
            <button
              onClick={() => setActiveTab("emotions")}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === "emotions"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
              }`}
            >
              😊 Emosi
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Students */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🏆</span> Top 5 Siswa
              </h3>
              <div className="space-y-3">
                {students.slice(0, 5).map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors border border-gray-100"
                  >
                    <div className="text-2xl font-bold text-purple-600 w-8">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {student.nama}
                      </div>
                      <div className="text-sm text-gray-600">
                        {student.gaya_belajar} • {student.total_quizzes} quiz
                      </div>
                    </div>
                    <div
                      className={`text-2xl font-bold ${getScoreColor(
                        student.avg_quiz_score
                      )}`}
                    >
                      {student.avg_quiz_score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Topics */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📚</span> Topik Populer
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {topics.slice(0, 4).map((topic) => (
                  <div
                    key={topic.topik}
                    className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100 hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-bold text-gray-800">
                        {getTopikLabel(topic.topik)}
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {topic.avg_score.toFixed(0)}%
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Percobaan:</span>
                        <span className="font-semibold">
                          {topic.total_attempts}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lulus:</span>
                        <span className="font-semibold text-green-600">
                          {topic.students_passed} siswa
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tingkat Selesai:</span>
                        <span className="font-semibold">
                          {topic.completion_rate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Gaya
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Quiz
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Skor
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Durasi
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Emosi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {student.nama}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {student.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(
                            student.level
                          )}`}
                        >
                          {student.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {student.gaya_belajar}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        {student.total_quizzes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`text-lg font-bold ${getScoreColor(
                            student.avg_quiz_score
                          )}`}
                        >
                          {student.avg_quiz_score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                        {student.total_duration_minutes} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-2xl">
                        {getEmotionEmoji(student.dominant_emotion)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "topics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topics.map((topic) => (
              <div
                key={topic.topik}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {getTopikLabel(topic.topik)}
                  </h3>
                  <span className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                    {topic.materials_count} materi
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Percobaan</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {topic.total_attempts}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rata-rata Skor</span>
                    <span
                      className={`text-2xl font-bold ${getScoreColor(
                        topic.avg_score
                      )}`}
                    >
                      {topic.avg_score}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tingkat Kelulusan</span>
                    <span className="text-2xl font-bold text-green-600">
                      {topic.completion_rate}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Siswa Lulus (≥60%)</span>
                    <span className="text-xl font-semibold text-gray-800">
                      {topic.students_passed} / {topic.total_attempts}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                        style={{ width: `${topic.completion_rate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "emotions" && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              😊 Distribusi Emosi (30 Hari Terakhir)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(emotions).map(([emosi, data]) => (
                <div
                  key={emosi}
                  className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="text-center">
                    <div className="text-5xl mb-3">{getEmotionEmoji(emosi)}</div>
                    <div className="text-lg font-semibold text-gray-800 capitalize mb-2">
                      {emosi.replace("_", " ")}
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {data.count}
                    </div>
                    <div className="text-sm text-gray-600">
                      {data.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(emotions).length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">😊</div>
                <p className="text-lg font-medium text-gray-600">Belum ada data emosi</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
