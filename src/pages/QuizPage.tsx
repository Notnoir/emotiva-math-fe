import { useState, useEffect } from "react";
import axios from "axios";
import { authService } from "../services/authService";

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
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUserId(currentUser.id);
      setLevel(currentUser.level || "pemula");
    }
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Conditional Container: Full width for results, max-w-4xl for other states */}
      {quizState === "completed" && result ? (
        // Full-width container for results
        <div className="w-full">
          {/* Results Screen - Split Layout */}
          <div className="flex w-full max-w-full mx-auto">
            {/* Left Sidebar - Summary */}
            <div className="w-1/3 min-w-[300px] max-w-[400px] sticky top-0 h-screen overflow-hidden bg-white py-6 px-6 shadow-xl border-r border-slate-100 flex flex-col justify-between">
              {/* Top Content */}
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-3xl text-pink-500">🎯</span>
                    <h1 className="text-3xl font-bold text-slate-800">
                      Latihan & Evaluasi
                    </h1>
                  </div>
                  <p className="text-slate-500 text-sm">
                    Uji pemahaman Anda dengan latihan soal
                  </p>
                </div>

                {/* Score Card */}
                <div className="bg-[#f0f1ff] rounded-2xl p-5 text-center w-full flex flex-col items-center justify-center border border-slate-100">
                  <h2 className="text-5xl font-bold text-[#7e3af2] mb-1">
                    {result.skor}%
                  </h2>
                  <p className="text-slate-600 font-medium text-sm">
                    {result.benar} dari {result.total_soal} benar
                  </p>
                </div>

                {/* Feedback Message */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    {result.feedback} 💪
                  </h3>
                  <p className="text-slate-500 text-sm">{result.next_step}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 w-full">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-700 mb-1">
                      {result.benar}
                    </div>
                    <div className="text-xs font-medium text-slate-600">
                      Benar
                    </div>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-rose-700 mb-1">
                      {result.salah}
                    </div>
                    <div className="text-xs font-medium text-slate-600">
                      Salah
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-blue-700 mb-1">
                      {result.durasi}s
                    </div>
                    <div className="text-xs font-medium text-slate-600">
                      Durasi
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={restartQuiz}
                    className="flex-1 bg-[#7e3af2] hover:bg-[#6c2bd9] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Quiz Baru <span className="text-lg">🔄</span>
                  </button>
                  <button
                    onClick={() => (window.location.href = "/learn")}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    Kembali Belajar <span className="text-lg">📚</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Content - Answer Review */}
            <div className="flex-1 bg-[#f3f4ff] p-8 relative overflow-y-auto">
              {/* Filter Buttons */}
              <div className="sticky top-0 bg-[#f3f4ff] z-20 pt-0 pb-4">
                <h4 className="text-lg font-bold text-slate-800 mb-4">
                  Review Jawaban
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[#7e3af2] text-white shadow-sm hover:bg-[#6c2bd9] transition-colors">
                    Semua
                  </button>
                  <button className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                    Benar
                  </button>
                  <button className="px-4 py-2 text-sm font-medium rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors">
                    Salah
                  </button>
                </div>
              </div>

              {/* Answer Cards */}
              <div className="space-y-4">
                {result.answers.map((ans, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-5 relative overflow-hidden ${
                      ans.is_correct
                        ? "border border-emerald-200 bg-emerald-50"
                        : "border border-rose-200 bg-rose-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`text-2xl font-bold ${
                          ans.is_correct ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {ans.is_correct ? "✓" : "✗"}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 mb-2 text-sm">
                          Soal {idx + 1}: {ans.pertanyaan}
                        </p>
                        <p className="text-sm text-slate-600 mb-1">
                          <span className="font-medium">Jawaban Anda:</span>{" "}
                          <span
                            className={`font-bold ${
                              ans.is_correct
                                ? "text-slate-800"
                                : "text-rose-700"
                            }`}
                          >
                            {ans.jawaban_user}
                          </span>
                        </p>
                        {!ans.is_correct && (
                          <p className="text-sm text-slate-600 mb-1">
                            <span className="font-medium">Jawaban Benar:</span>{" "}
                            <span className="font-bold text-emerald-700">
                              {ans.jawaban_benar}
                            </span>
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          <span className="font-semibold">Penjelasan:</span>{" "}
                          {ans.penjelasan}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Regular max-w container for other states
        <div className="max-w-4xl mx-auto px-4 py-8">
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
            <div className="w-full flex flex-col items-center">
              {/* Quiz Card */}
              <div className="w-full max-w-[900px] bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-slate-100 flex flex-col gap-6">
                {/* Progress Info */}
                <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-2">
                  <span>
                    Soal {currentIndex + 1} dari {questions.length}{" "}
                    <span className="mx-2 text-slate-300">|</span>{" "}
                    {answers.length} terjawab
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-gradient-to-r from-[#7e3af2] to-purple-400 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentIndex + 1) / questions.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>

                {/* Question */}
                <div className="mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                    {questions[currentIndex].pertanyaan}
                  </h2>
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["A", "B", "C", "D"].map((option) => {
                    const key =
                      `pilihan_${option.toLowerCase()}` as keyof Question;
                    const pilihan = questions[currentIndex][key] as string;
                    const isSelected = getCurrentAnswer() === option;

                    return (
                      <label
                        key={option}
                        className="group relative flex items-center p-4 sm:p-5 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-[#7e3af2]/50 transition-all duration-200"
                      >
                        <input
                          type="radio"
                          name="quiz_option"
                          className="sr-only peer"
                          checked={isSelected}
                          onChange={() => handleAnswer(option)}
                        />
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#7e3af2] font-bold bg-transparent group-hover:bg-[#7e3af2]/10 mr-4 transition-colors">
                          {option}.
                        </div>
                        <span className="text-lg text-slate-700 font-medium">
                          {pilihan}
                        </span>
                        <div
                          className={`absolute inset-0 border-2 rounded-xl pointer-events-none transition-colors ${
                            isSelected
                              ? "border-[#7e3af2]"
                              : "border-transparent"
                          }`}
                        ></div>
                      </label>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-4">
                  <button
                    onClick={() =>
                      setCurrentIndex(Math.max(0, currentIndex - 1))
                    }
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-100 text-slate-400 font-medium cursor-not-allowed disabled:opacity-100"
                  >
                    <span className="text-lg">←</span>
                    Sebelumnya
                  </button>

                  {currentIndex === questions.length - 1 ? (
                    <button
                      onClick={submitQuiz}
                      disabled={answers.length !== questions.length}
                      className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#7e3af2] hover:bg-[#6c2bd9] text-white font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      Selesai & Submit
                      <span className="text-lg">✓</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setCurrentIndex(
                          Math.min(questions.length - 1, currentIndex + 1)
                        )
                      }
                      className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#7e3af2] hover:bg-[#6c2bd9] text-white font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      Selanjutnya
                      <span className="text-lg">→</span>
                    </button>
                  )}
                </div>

                {/* Warning Message */}
                {answers.length !== questions.length && (
                  <div className="text-center mt-2">
                    <p className="text-orange-400 text-sm font-medium">
                      Jawab semua soal untuk submit quiz
                    </p>
                  </div>
                )}
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
      )}
    </div>
  );
}
