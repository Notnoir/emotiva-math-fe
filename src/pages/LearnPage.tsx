import { useState, useEffect } from "react";
import { emotionApi, learningApi, adaptiveApi } from "../services/api";
import ThreeDViewer from "../components/ThreeDViewer";
import axios from "axios";

export default function LearnPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentEmotion, setCurrentEmotion] = useState<
    "cemas" | "bingung" | "netral" | "percaya_diri"
  >("netral");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [adaptiveContent, setAdaptiveContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [visualizationData, setVisualizationData] = useState<any>(null);
  const [loadingViz, setLoadingViz] = useState(false);

  useEffect(() => {
    // Load user profile from localStorage
    const profile = localStorage.getItem("user_profile");
    if (profile) {
      const parsedProfile = JSON.parse(profile);
      setUserProfile(parsedProfile);

      // Load recommendations
      loadRecommendations(parsedProfile.id);
    }
  }, []);

  const topics = [
    {
      id: "kubus",
      title: "Kubus",
      icon: "🟦",
      description: "Bangun ruang dengan 6 sisi berbentuk persegi",
      difficulty: "Mudah",
      color: "blue",
    },
    {
      id: "balok",
      title: "Balok",
      icon: "📦",
      description: "Bangun ruang dengan 6 sisi berbentuk persegi panjang",
      difficulty: "Mudah",
      color: "green",
    },
    {
      id: "bola",
      title: "Bola",
      icon: "⚽",
      description: "Bangun ruang berbentuk bulat sempurna",
      difficulty: "Menengah",
      color: "purple",
    },
    {
      id: "tabung",
      title: "Tabung",
      icon: "🥫",
      description: "Bangun ruang dengan alas lingkaran",
      difficulty: "Menengah",
      color: "orange",
    },
  ];

  const emotions = [
    { value: "percaya_diri", label: "😊 Percaya Diri", color: "green" },
    { value: "netral", label: "😐 Netral", color: "gray" },
    { value: "bingung", label: "😕 Bingung", color: "yellow" },
    { value: "cemas", label: "😰 Cemas", color: "red" },
  ];

  const loadRecommendations = async (userId: number) => {
    try {
      const response = await adaptiveApi.getRecommendations(userId);
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error loading recommendations:", error);
    }
  };

  const handleEmotionChange = async (emotion: typeof currentEmotion) => {
    setCurrentEmotion(emotion);

    // Log emotion to backend
    if (userProfile?.id) {
      try {
        await emotionApi.log({
          user_id: userProfile.id,
          emosi: emotion,
          context: selectedTopic
            ? `Belajar ${selectedTopic}`
            : "Memilih materi",
        });
      } catch (error) {
        console.error("Error logging emotion:", error);
      }
    }

    // Reload adaptive content if topic is selected
    if (selectedTopic && userProfile) {
      loadAdaptiveContent(selectedTopic, emotion);
    }
  };

  const loadAdaptiveContent = async (topicId: string, emotion?: string) => {
    if (!userProfile) {
      alert("⚠️ Silakan buat profil terlebih dahulu!");
      return;
    }

    setLoading(true);
    try {
      const response = await adaptiveApi.getContent(
        userProfile.id,
        topicId,
        emotion || currentEmotion
      );

      setAdaptiveContent(response.data);

      // Log learning activity
      await learningApi.createLog(userProfile.id, {
        materi: topics.find((t) => t.id === topicId)?.title || topicId,
        tipe_aktivitas: "belajar",
        durasi: 0,
      });
    } catch (error) {
      console.error("Error loading adaptive content:", error);
      alert("❌ Gagal memuat konten. Pastikan backend berjalan!");
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = async (topicId: string) => {
    setSelectedTopic(topicId);
    await loadAdaptiveContent(topicId);
    await loadVisualization(topicId);
  };

  const loadVisualization = async (topicId: string) => {
    setLoadingViz(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/visualization/generate",
        {
          topic: topicId,
          difficulty: userProfile?.level || "pemula",
          context: `Visualisasi ${topicId}`,
        }
      );

      setVisualizationData(response.data.data);
    } catch (error) {
      console.error("Error loading visualization:", error);
      // Use fallback visualization
      setVisualizationData(null);
    } finally {
      setLoadingViz(false);
    }
  };

  const getEmotionMessage = () => {
    switch (currentEmotion) {
      case "percaya_diri":
        return "🎉 Bagus! Anda siap untuk materi yang lebih menantang!";
      case "netral":
        return "👍 Mari kita mulai dengan materi yang sesuai!";
      case "bingung":
        return "🤔 Tidak masalah! Kami akan memberikan penjelasan lebih detail.";
      case "cemas":
        return "💪 Tenang, kami akan mulai dari dasar dan pelan-pelan!";
    }
  };

  const getLearningStyleIcon = (style: string) => {
    switch (style) {
      case "visual":
        return "👁️";
      case "auditori":
        return "👂";
      case "kinestetik":
        return "✋";
      default:
        return "📚";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📚 Pembelajaran Adaptif Bangun Ruang
          </h1>
          {userProfile ? (
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <p className="text-gray-600">
                Selamat datang, <strong>{userProfile.nama}</strong>!
              </p>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                {getLearningStyleIcon(userProfile.gaya_belajar)}{" "}
                {userProfile.gaya_belajar.toUpperCase()}
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                📊 Level: {userProfile.level}
              </span>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-yellow-800">
                ⚠️ <strong>Profil belum dibuat.</strong> Silakan kunjungi
                halaman{" "}
                <a href="/profile" className="underline font-bold">
                  Profil
                </a>{" "}
                untuk membuat profil pembelajaran Anda.
              </p>
            </div>
          )}
        </div>

        {/* AI Indicator */}
        {adaptiveContent && (
          <div className="card mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🤖</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  AI-Powered Adaptive Learning Active
                </h3>
                <p className="text-sm opacity-90">
                  Konten disesuaikan dengan gaya belajar{" "}
                  <strong>{userProfile?.gaya_belajar}</strong>, emosi{" "}
                  <strong>{currentEmotion}</strong>, dan level{" "}
                  <strong>{adaptiveContent.difficulty}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Emotion Selector */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            😊 Bagaimana perasaan Anda saat ini?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {emotions.map((emotion) => (
              <button
                key={emotion.value}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  currentEmotion === emotion.value
                    ? "border-indigo-600 bg-indigo-50 scale-105 shadow-lg"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
                onClick={() =>
                  handleEmotionChange(emotion.value as typeof currentEmotion)
                }
              >
                <div className="text-2xl mb-1">
                  {emotion.label.split(" ")[0]}
                </div>
                <div className="text-sm font-medium">
                  {emotion.label.split(" ").slice(1).join(" ")}
                </div>
              </button>
            ))}
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium">{getEmotionMessage()}</p>
          </div>
        </div>

        {/* Topic Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📐 Pilih Topik Pembelajaran
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className={`card cursor-pointer transition-all duration-200 ${
                  selectedTopic === topic.id
                    ? "ring-4 ring-indigo-600 shadow-2xl"
                    : "hover:scale-105"
                }`}
                onClick={() => handleTopicSelect(topic.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{topic.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {topic.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{topic.description}</p>
                    <div className="flex gap-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          topic.difficulty === "Mudah"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {topic.difficulty}
                      </span>
                      {recommendations?.recommended_topics?.includes(
                        topic.id
                      ) && (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          ⭐ Recommended
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adaptive Content Display */}
        {loading && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-xl font-semibold text-gray-700">
              AI sedang menyesuaikan konten untuk Anda...
            </p>
            <p className="text-gray-500 mt-2">Mohon tunggu sebentar</p>
          </div>
        )}

        {!loading && adaptiveContent && selectedTopic && (
          <div className="space-y-6">
            {/* Content Header */}
            <div className="card bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <h2 className="text-3xl font-bold mb-2">
                {topics.find((t) => t.id === selectedTopic)?.icon}{" "}
                {adaptiveContent.topic_name}
              </h2>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                  📊 Difficulty: {adaptiveContent.difficulty}
                </span>
                <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                  ⏱️ Est. Time: {adaptiveContent.recommendations.estimated_time}{" "}
                  min
                </span>
              </div>
            </div>

            {/* Motivation */}
            <div className="card bg-yellow-50 border-2 border-yellow-200">
              <p className="text-lg font-semibold text-yellow-900">
                💬 {adaptiveContent.motivation}
              </p>
            </div>

            {/* Main Explanation */}
            <div className="card">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                📖 Penjelasan
              </h3>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                  {adaptiveContent.content.explanation}
                </pre>
              </div>
            </div>

            {/* 3D Visualization */}
            {loadingViz && (
              <div className="card text-center py-12">
                <div className="text-5xl mb-4">🎨</div>
                <p className="text-lg font-semibold text-gray-700">
                  Membuat visualisasi 3D...
                </p>
              </div>
            )}

            {!loadingViz && visualizationData && (
              <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 p-0 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <h3 className="text-2xl font-bold">
                    🎨 Visualisasi 3D Interactive
                  </h3>
                  <p className="text-sm mt-1 opacity-90">
                    {visualizationData.source === "llm"
                      ? "🤖 AI-Generated"
                      : "🔧 Rule-Based"}{" "}
                    | Aman & Declarative (No Code Execution)
                  </p>
                </div>
                <ThreeDViewer data={visualizationData} />
              </div>
            )}

            {/* Formulas */}
            {adaptiveContent.content.key_formulas && (
              <div className="card bg-purple-50">
                <h3 className="text-xl font-bold text-purple-900 mb-4">
                  📐 Rumus Penting
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(adaptiveContent.content.key_formulas).map(
                    ([key, value]: [string, any]) => (
                      <div key={key} className="bg-white p-4 rounded-lg">
                        <p className="font-bold text-purple-800">{key}:</p>
                        <p className="text-2xl font-mono text-gray-800 mt-2">
                          {value}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Examples */}
            {adaptiveContent.content.examples &&
              adaptiveContent.content.examples.length > 0 && (
                <div className="card">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    💡 Contoh Soal
                  </h3>
                  {adaptiveContent.content.examples.map(
                    (example: any, idx: number) => (
                      <div key={idx} className="mb-6 last:mb-0">
                        <div className="bg-blue-50 p-4 rounded-lg mb-2">
                          <p className="font-semibold text-blue-900">
                            Soal {idx + 1}:
                          </p>
                          <p className="text-gray-800 mt-2">
                            {example.question}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="font-semibold text-green-900">
                            Pembahasan:
                          </p>
                          <p className="text-gray-800 mt-2">
                            {example.solution}
                          </p>
                          <p className="font-bold text-green-800 mt-2">
                            Jawaban: {example.answer}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

            {/* Learning Tips */}
            <div className="card bg-indigo-50">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">
                💡 Tips Belajar untuk Anda
              </h3>
              <ul className="space-y-2">
                {adaptiveContent.recommendations.learning_tips.map(
                  (tip: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-gray-800">{tip}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Next Topic Recommendation */}
            <div className="card bg-gradient-to-r from-pink-100 to-purple-100">
              <h3 className="text-xl font-bold text-purple-900 mb-2">
                🎯 Selanjutnya
              </h3>
              <p className="text-gray-800 text-lg">
                Setelah menguasai materi ini, Anda bisa lanjut ke:{" "}
                <strong className="text-purple-900">
                  {adaptiveContent.recommendations.next_topic}
                </strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
