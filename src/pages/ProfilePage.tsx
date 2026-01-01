import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import type { User } from "../types";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    // Get current user
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);

    // Check if user needs to complete profile (gaya_belajar is empty)
    if (!currentUser.gaya_belajar) {
      setNeedsSetup(true);
    }
  }, [navigate]);

  // Kuesioner Gaya Belajar (simplified version)
  const questions = [
    {
      id: 1,
      question: "Cara terbaik saya memahami materi baru adalah:",
      options: [
        {
          text: "Melihat diagram, gambar, atau video",
          type: "visual",
          score: 1,
        },
        {
          text: "Mendengarkan penjelasan atau diskusi",
          type: "auditori",
          score: 2,
        },
        {
          text: "Praktik langsung atau mengerjakan soal",
          type: "kinestetik",
          score: 3,
        },
      ],
    },
    {
      id: 2,
      question: "Saat belajar matematika, saya lebih suka:",
      options: [
        { text: "Melihat grafik dan visualisasi 3D", type: "visual", score: 1 },
        {
          text: "Mendengarkan penjelasan step-by-step",
          type: "auditori",
          score: 2,
        },
        {
          text: "Menggunakan alat peraga atau simulasi",
          type: "kinestetik",
          score: 3,
        },
      ],
    },
    {
      id: 3,
      question: "Saya lebih mudah mengingat:",
      options: [
        { text: "Wajah, warna, dan gambar", type: "visual", score: 1 },
        { text: "Nama, suara, dan percakapan", type: "auditori", score: 2 },
        {
          text: "Gerakan, aktivitas, dan pengalaman",
          type: "kinestetik",
          score: 3,
        },
      ],
    },
  ];

  const handleAnswerSelect = (questionIndex: number, score: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = score;
    setAnswers(newAnswers);
  };

  const calculateLearningStyle = (): "visual" | "auditori" | "kinestetik" => {
    const total = answers.reduce((sum, score) => sum + score, 0);
    const avg = total / answers.length;

    if (avg <= 1.5) return "visual";
    if (avg <= 2.5) return "auditori";
    return "kinestetik";
  };

  const handleSubmit = async () => {
    if (answers.length !== questions.length) {
      alert("⚠️ Mohon lengkapi semua pertanyaan!");
      return;
    }

    setLoading(true);
    try {
      const gayaBelajar = calculateLearningStyle();

      // Update profile using auth service (updates current user)
      await authService.updateProfile({
        gaya_belajar: gayaBelajar,
        level: "pemula",
      });

      // Refresh user data
      const updatedUser = authService.getCurrentUser();
      setUser(updatedUser);
      setNeedsSetup(false);

      // Show result
      alert(
        `✅ Profil berhasil diperbarui!\n\n👤 Nama: ${
          user?.nama
        }\n🎯 Gaya Belajar: ${gayaBelajar.toUpperCase()}\n📊 Level: Pemula`
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("❌ Gagal memperbarui profil. Silakan coba lagi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          {!needsSetup && user ? (
            // Profile Display (when gaya_belajar is already set)
            <div>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  👤 Profil Pembelajaran
                </h1>
              </div>

              {/* Profile Card */}
              <div className="card space-y-6">
                <div className="flex items-center space-x-4 pb-6 border-b">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user.nama.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {user.nama}
                    </h2>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="text-sm text-indigo-600 font-medium mb-1">
                      Gaya Belajar
                    </div>
                    <div className="text-2xl font-bold text-indigo-700 capitalize">
                      {user.gaya_belajar === "visual" && "👁️ Visual"}
                      {user.gaya_belajar === "auditori" && "👂 Auditori"}
                      {user.gaya_belajar === "kinestetik" && "✋ Kinestetik"}
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium mb-1">
                      Level
                    </div>
                    <div className="text-2xl font-bold text-purple-700 capitalize">
                      {user.level === "pemula" && "🌱 Pemula"}
                      {user.level === "menengah" && "🌿 Menengah"}
                      {user.level === "mahir" && "🌳 Mahir"}
                    </div>
                  </div>

                  <div className="p-4 bg-pink-50 rounded-lg">
                    <div className="text-sm text-pink-600 font-medium mb-1">
                      Role
                    </div>
                    <div className="text-2xl font-bold text-pink-700 capitalize">
                      {user.role === "student" && "🎓 Siswa"}
                      {user.role === "teacher" && "👨‍🏫 Guru"}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600 font-medium mb-1">
                      Status
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      ✅ Aktif
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <button
                    onClick={() => setNeedsSetup(true)}
                    className="btn-primary w-full"
                  >
                    ✏️ Ubah Gaya Belajar
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Informasi:</strong> Anda dapat mengubah gaya
                  belajar kapan saja untuk menyesuaikan pengalaman pembelajaran
                  Anda.
                </p>
              </div>
            </div>
          ) : (
            // Questionnaire (when gaya_belajar needs to be set)
            <div>
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  📝 Lengkapi Profil Pembelajaran
                </h1>
                <p className="text-gray-600">
                  Halo <strong>{user?.nama}</strong>! Kami perlu mengenali gaya
                  belajar Anda untuk pengalaman terbaik
                </p>
              </div>

              {/* Form Card */}
              <div className="card">
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Kuesioner Gaya Belajar
                  </h2>

                  {questions.map((q, idx) => (
                    <div key={q.id} className="space-y-4">
                      <h3 className="font-semibold text-gray-800">
                        {idx + 1}. {q.question}
                      </h3>
                      <div className="space-y-2">
                        {q.options.map((option, optIdx) => (
                          <button
                            key={optIdx}
                            className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                              answers[idx] === option.score
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-gray-200 hover:border-indigo-300"
                            }`}
                            onClick={() =>
                              handleAnswerSelect(idx, option.score)
                            }
                          >
                            <span className="font-medium">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>{" "}
                            {option.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    className="btn-primary w-full mt-8"
                    onClick={handleSubmit}
                    disabled={loading || answers.length !== questions.length}
                  >
                    {loading ? "⏳ Menyimpan..." : "✅ Simpan & Lanjutkan"}
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Informasi:</strong> Kuesioner ini membantu kami
                  mengenali gaya belajar Anda (Visual, Auditori, atau
                  Kinestetik) agar materi dapat disesuaikan dengan kebutuhan
                  Anda.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
