import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import axios from "axios";

interface QuizHistory {
  id: number;
  topik: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

interface LearningStats {
  total_quizzes: number;
  avg_score: number;
  total_activities: number;
  learning_streak: number;
  dominant_emotion: string;
  gaya_belajar: string;
  level: string;
}

const API_URL = "http://localhost:5000/api";

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (currentUser.role !== "student") {
      navigate("/teacher");
      return;
    }

    setUser(currentUser);
    loadStudentData(currentUser.id);
  }, [navigate]);

  const loadStudentData = async (userId: number) => {
    setLoading(true);
    try {
      // Load quiz history
      const historyRes = await axios.get(
        `${API_URL}/quiz/history/${userId}?limit=5`
      );
      console.log("Quiz history response:", historyRes.data);

      if (historyRes.data.status === "success") {
        // Map backend data to frontend interface
        const attempts = historyRes.data.data.attempts || [];
        console.log("Quiz attempts:", attempts);

        const mappedHistory = attempts.map((attempt: any) => ({
          id: attempt.id,
          topik: attempt.topik,
          score: attempt.benar,
          total_questions: attempt.total_soal,
          completed_at: attempt.completed_at,
        }));
        console.log("Mapped history:", mappedHistory);
        setQuizHistory(mappedHistory);
      }

      // Load stats
      const statsRes = await axios.get(`${API_URL}/quiz/stats/${userId}`);
      console.log("Quiz stats response:", statsRes.data);

      if (statsRes.data.status === "success") {
        const statsData = statsRes.data.data.stats;
        console.log("Stats data:", statsData);
        setStats({
          total_quizzes: statsData?.total_quizzes || 0,
          avg_score: statsData?.avg_score || 0,
          total_activities: statsData?.total_activities || 0,
          learning_streak: statsData?.learning_streak || 0,
          dominant_emotion: statsData?.dominant_emotion || "",
          gaya_belajar:
            statsData?.gaya_belajar || user?.gaya_belajar || "visual",
          level: statsData?.level || user?.level || "pemula",
        });
      }
    } catch (error) {
      console.error("Failed to load student data:", error);
      setStats({
        total_quizzes: 0,
        avg_score: 0,
        total_activities: 0,
        learning_streak: 0,
        dominant_emotion: "",
        gaya_belajar: user?.gaya_belajar || "visual",
        level: user?.level || "pemula",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-900">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayStats = stats || {
    total_quizzes: 0,
    avg_score: 0,
    total_activities: 0,
    learning_streak: 0,
    dominant_emotion: "",
    gaya_belajar: user.gaya_belajar || "visual",
    level: user.level || "pemula",
  };

  return (
    <main className="bg-background-light min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            Selamat Datang, {user.nama}!
          </h2>
          <p className="text-slate-600">
            Ini adalah dashboard pembelajaran Anda. Mari lanjutkan belajar!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Level Card */}
          <div className="dashboard-card relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-slate-600">Level Anda</h3>
              {displayStats.level === "pemula" && (
                <span className="material-symbols-outlined text-green-500 bg-green-50 p-1.5 rounded-lg">
                  spa
                </span>
              )}
              {displayStats.level === "menengah" && (
                <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-1.5 rounded-lg">
                  rocket_launch
                </span>
              )}
              {displayStats.level === "mahir" && (
                <span className="material-symbols-outlined text-purple-500 bg-purple-50 p-1.5 rounded-lg">
                  stars
                </span>
              )}
            </div>
            {displayStats.level === "pemula" && (
              <div className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold border border-green-200">
                Pemula
              </div>
            )}
            {displayStats.level === "menengah" && (
              <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold border border-blue-200">
                Menengah
              </div>
            )}
            {displayStats.level === "mahir" && (
              <div className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold border border-purple-200">
                Mahir
              </div>
            )}
          </div>

          {/* Gaya Belajar Card */}
          <div className="dashboard-card relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-slate-600">
                Gaya Belajar
              </h3>
              {displayStats.gaya_belajar === "visual" && (
                <span className="material-symbols-outlined text-purple-500 bg-purple-50 p-1.5 rounded-lg">
                  visibility
                </span>
              )}
              {displayStats.gaya_belajar === "auditori" && (
                <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-1.5 rounded-lg">
                  hearing
                </span>
              )}
              {displayStats.gaya_belajar === "kinestetik" && (
                <span className="material-symbols-outlined text-pink-500 bg-pink-50 p-1.5 rounded-lg">
                  back_hand
                </span>
              )}
            </div>
            {displayStats.gaya_belajar === "visual" && (
              <div className="text-xl font-bold text-[#6C5CE7]">Visual</div>
            )}
            {displayStats.gaya_belajar === "auditori" && (
              <div className="text-xl font-bold text-[#6C5CE7]">Auditori</div>
            )}
            {displayStats.gaya_belajar === "kinestetik" && (
              <div className="text-xl font-bold text-[#6C5CE7]">Kinestetik</div>
            )}
          </div>

          {/* Quiz Completed Card */}
          <div className="dashboard-card relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-slate-600">
                Quiz Selesai
              </h3>
              <span className="material-symbols-outlined text-pink-500 bg-pink-50 p-1.5 rounded-lg">
                target
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary">
                {displayStats.total_quizzes}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Total quiz dikerjakan</p>
          </div>

          {/* Average Score Card */}
          <div className="dashboard-card relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-medium text-slate-600">
                Rata-rata Nilai
              </h3>
              <span className="material-symbols-outlined text-yellow-500 bg-yellow-50 p-1.5 rounded-lg">
                star
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[#6C5CE7]">
                {displayStats.avg_score
                  ? displayStats.avg_score.toFixed(0)
                  : "0"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Dari 100 poin</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Streak */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="dashboard-card">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🚀</span> Aksi Cepat
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/learn")}
                  className="action-btn bg-purple-600 hover:bg-purple-700 shadow-purple-500/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white/90">
                      school
                    </span>
                    <span>Mulai Belajar</span>
                  </div>
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </button>
                <button
                  onClick={() => navigate("/quiz")}
                  className="action-btn bg-violet-600 hover:bg-violet-700 shadow-purple-400/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white/90">
                      sports_esports
                    </span>
                    <span>Kerjakan Quiz</span>
                  </div>
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="action-btn bg-gray-100 hover:bg-gray-200 text-slate-900 shadow-gray-200/50"
                >
                  <div className="flex items-center gap-3 text-slate-900">
                    <span className="material-symbols-outlined">person</span>
                    <span>Lihat Profil</span>
                  </div>
                  <span className="material-symbols-outlined text-sm text-slate-900">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>

            {/* Learning Streak */}
            <div className="dashboard-card bg-success-bg border-success-text/10">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="text-xl">🔥</span> Streak Belajar
              </h3>
              <div className="text-center py-4">
                <div className="text-6xl font-bold text-success-text mb-2">
                  {displayStats.learning_streak || 0}
                </div>
                <p className="text-sm font-medium text-slate-900">
                  hari berturut-turut
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Tetap konsisten belajar setiap hari!
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Quiz History & Tips */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quiz History */}
            <div className="dashboard-card h-full min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400">
                    analytics
                  </span>
                  Riwayat Quiz Terakhir
                </h3>
                <button
                  onClick={() => navigate("/quiz")}
                  className="text-sm text-[#6C5CE7] hover:underline flex items-center gap-1"
                >
                  Lihat Semua
                  <span className="material-symbols-outlined text-xs">
                    arrow_forward
                  </span>
                </button>
              </div>

              {quizHistory.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                    <span className="material-symbols-outlined text-4xl text-gray-400">
                      assignment_add
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                    Belum Ada Quiz
                  </h4>
                  <p className="text-slate-600 max-w-sm mb-6">
                    Mulai kerjakan quiz pertama Anda untuk melihat progress!
                  </p>
                  <button
                    onClick={() => navigate("/quiz")}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg shadow-lg shadow-purple-500/20 transition-all transform hover:-translate-y-0.5"
                  >
                    Mulai Quiz Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizHistory.map((quiz) => {
                    const percentage =
                      (quiz.score / quiz.total_questions) * 100;
                    const isPassed = percentage >= 70;

                    return (
                      <div
                        key={quiz.id}
                        className="p-4 border-2 border-gray-100 rounded-lg hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">
                            {quiz.topik}
                          </h4>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              isPassed
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {isPassed ? "Lulus" : "Belum Lulus"}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <div className="flex items-center gap-4">
                            <span>
                              Nilai:{" "}
                              <strong className="text-[#6C5CE7]">
                                {quiz.score}
                              </strong>{" "}
                              / {quiz.total_questions}
                            </span>
                            <span>({percentage.toFixed(0)}%)</span>
                          </div>
                          <span className="text-xs">
                            {new Date(quiz.completed_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isPassed ? "bg-green-500" : "bg-red-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
