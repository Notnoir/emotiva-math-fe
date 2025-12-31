import { useState, useEffect } from "react";
import axios from "axios";

interface Question {
  id: number;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
}

interface Answer {
  question_id: number;
  jawaban: string;
}

interface GradedAnswer {
  question_id: number;
  jawaban_user: string;
  jawaban_benar: string;
  is_correct: boolean;
  pertanyaan: string;
  penjelasan: string;
}

interface QuizResult {
  attempt_id: number;
  total_soal: number;
  benar: number;
  salah: number;
  skor: number;
  durasi: number;
  feedback: string;
  next_step: string;
  answers: GradedAnswer[];
}

const API_URL = "http://localhost:5000/api";

export default function QuizPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [topik, setTopik] = useState<
    "kubus" | "balok" | "bola" | "tabung" | "kerucut" | "limas" | "prisma"
  >("kubus");
  const [level, setLevel] = useState<"pemula" | "menengah" | "mahir">("pemula");
  const [numQuestions, setNumQuestions] = useState(5);

  // Quiz state
  const [quizState, setQuizState] = useState<
    "setup" | "loading" | "active" | "completed" | "error"
  >("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string>("");

  // Load user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/profile`);
        if (
          response.data.status === "success" &&
          response.data.data.length > 0
        ) {
          const user = response.data.data[0];
          setUserId(user.id);
          setLevel(user.level);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const generateQuiz = async () => {
    if (!userId) {
      setError("Silakan buat profil terlebih dahulu");
      return;
    }

    setQuizState("loading");
    setError("");

    try {
      const response = await axios.post(`${API_URL}/quiz/generate`, {
        topik,
        level,
        num_questions: numQuestions,
      });

      if (response.data.status === "success") {
        setQuestions(response.data.data.questions);
        setAnswers([]);
        setCurrentIndex(0);
        setStartTime(Date.now());
        setQuizState("active");
      } else {
        setError(response.data.message || "Gagal generate quiz");
        setQuizState("error");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Gagal generate quiz. Pastikan materi guru sudah ada."
      );
      setQuizState("error");
    }
  };

  const handleAnswer = (jawaban: string) => {
    const currentQuestion = questions[currentIndex];

    // Update or add answer
    const existingIndex = answers.findIndex(
      (a) => a.question_id === currentQuestion.id
    );
    if (existingIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingIndex] = { question_id: currentQuestion.id, jawaban };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { question_id: currentQuestion.id, jawaban }]);
    }

    // Move to next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const submitQuiz = async () => {
    if (!userId) return;

    const durasi = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await axios.post(`${API_URL}/quiz/submit`, {
        user_id: userId,
        topik,
        level,
        answers,
        durasi,
      });

      if (response.data.status === "success") {
        setResult(response.data.data);
        setQuizState("completed");
      } else {
        setError(response.data.message || "Gagal submit quiz");
        setQuizState("error");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal submit quiz");
      setQuizState("error");
    }
  };

  const restartQuiz = () => {
    setQuizState("setup");
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setResult(null);
    setError("");
  };

  // Get user's answer for current question
  const getCurrentAnswer = () => {
    const currentQuestion = questions[currentIndex];
    return (
      answers.find((a) => a.question_id === currentQuestion.id)?.jawaban || ""
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">
            🎯 Latihan & Evaluasi
          </h1>
          <p className="text-gray-600">
            Uji pemahaman Anda dengan latihan soal
          </p>
        </div>

        {/* Setup Screen */}
        {quizState === "setup" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Pengaturan Quiz
            </h2>

            <div className="space-y-6">
              {/* Topic Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Topik
                </label>
                <select
                  value={topik}
                  onChange={(e) => setTopik(e.target.value as typeof topik)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="kubus">Kubus</option>
                  <option value="balok">Balok</option>
                  <option value="bola">Bola</option>
                  <option value="tabung">Tabung</option>
                  <option value="kerucut">Kerucut</option>
                  <option value="limas">Limas</option>
                  <option value="prisma">Prisma</option>
                </select>
              </div>

              {/* Level Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tingkat Kesulitan
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as typeof level)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="pemula">Pemula</option>
                  <option value="menengah">Menengah</option>
                  <option value="mahir">Mahir</option>
                </select>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Soal: {numQuestions}
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3 soal</span>
                  <span>10 soal</span>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={generateQuiz}
                disabled={!userId}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {userId ? "Mulai Quiz 🚀" : "Buat Profil Dulu"}
              </button>

              {!userId && (
                <p className="text-center text-sm text-red-600">
                  Silakan buat profil di halaman Home terlebih dahulu
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading Screen */}
        {quizState === "loading" && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-xl text-gray-700">Membuat soal quiz...</p>
            <p className="text-sm text-gray-500 mt-2">
              AI sedang menyiapkan soal berkualitas untuk Anda
            </p>
          </div>
        )}

        {/* Active Quiz */}
        {quizState === "active" && questions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  Soal {currentIndex + 1} dari {questions.length}
                </span>
                <span>{answers.length} terjawab</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {questions[currentIndex].pertanyaan}
              </h3>

              {/* Answer Options */}
              <div className="space-y-3">
                {["A", "B", "C", "D"].map((option) => {
                  const key =
                    `pilihan_${option.toLowerCase()}` as keyof Question;
                  const pilihan = questions[currentIndex][key] as string;
                  const isSelected = getCurrentAnswer() === option;

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-semibold text-indigo-600 mr-3">
                        {option}.
                      </span>
                      <span className="text-gray-800">{pilihan}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Sebelumnya
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={submitQuiz}
                  disabled={answers.length !== questions.length}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selesai & Submit ✓
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrentIndex(
                      Math.min(questions.length - 1, currentIndex + 1)
                    )
                  }
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                >
                  Selanjutnya →
                </button>
              )}
            </div>

            {answers.length !== questions.length && (
              <p className="text-center text-sm text-amber-600 mt-4">
                Jawab semua soal untuk submit quiz
              </p>
            )}
          </div>
        )}

        {/* Results Screen */}
        {quizState === "completed" && result && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Score Card */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 mb-4">
                <div className="text-6xl font-bold text-indigo-600 mb-2">
                  {result.skor}%
                </div>
                <div className="text-xl text-gray-700">
                  {result.benar} dari {result.total_soal} benar
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {result.feedback}
              </h2>
              <p className="text-gray-600">{result.next_step}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {result.benar}
                </div>
                <div className="text-sm text-gray-600">Benar</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-600">
                  {result.salah}
                </div>
                <div className="text-sm text-gray-600">Salah</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {result.durasi}s
                </div>
                <div className="text-sm text-gray-600">Durasi</div>
              </div>
            </div>

            {/* Answer Review */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Review Jawaban
              </h3>
              <div className="space-y-4">
                {result.answers.map((ans, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      ans.is_correct
                        ? "border-green-300 bg-green-50"
                        : "border-red-300 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-2xl">
                        {ans.is_correct ? "✓" : "✗"}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 mb-2">
                          Soal {idx + 1}: {ans.pertanyaan}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-gray-600">
                              Jawaban Anda:{" "}
                            </span>
                            <span
                              className={
                                ans.is_correct
                                  ? "text-green-700 font-semibold"
                                  : "text-red-700 font-semibold"
                              }
                            >
                              {ans.jawaban_user}
                            </span>
                          </p>
                          {!ans.is_correct && (
                            <p>
                              <span className="text-gray-600">
                                Jawaban Benar:{" "}
                              </span>
                              <span className="text-green-700 font-semibold">
                                {ans.jawaban_benar}
                              </span>
                            </p>
                          )}
                          <p className="text-gray-700 mt-2">
                            <span className="font-semibold">Penjelasan: </span>
                            {ans.penjelasan}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={restartQuiz}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
              >
                Quiz Baru 🔄
              </button>
              <button
                onClick={() => (window.location.href = "/learn")}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Kembali Belajar 📚
              </button>
            </div>
          </div>
        )}

        {/* Error Screen */}
        {quizState === "error" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={restartQuiz}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
