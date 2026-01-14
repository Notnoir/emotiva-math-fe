import { useState, useEffect, useRef } from "react";
import { emotionApi, learningApi, adaptiveApi } from "../services/api";
import materialsApi from "../services/api";
import ThreeDViewer from "../components/ThreeDViewer";
import NetViewer from "../components/NetViewer";
import StepBySteViewer from "../components/StepBySteViewer";
import ARViewer from "../components/ARViewer";
import axios from "axios";

export default function LearnPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentEmotion, setCurrentEmotion] = useState<
    "cemas" | "bingung" | "netral" | "percaya_diri"
  >("netral");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [adaptiveContent, setAdaptiveContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [visualizationData, setVisualizationData] = useState<any>(null);
  const [loadingViz, setLoadingViz] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [showNet, setShowNet] = useState(false);

  // Step-by-Step Solution states
  const [showSolution, setShowSolution] = useState(false);
  const [solutionData, setSolutionData] = useState<any>(null);
  const [loadingSolution, setLoadingSolution] = useState(false);

  // AR Mode states
  const [showAR, setShowAR] = useState(false);
  const [arShapeType, setArShapeType] = useState<
    "kubus" | "balok" | "bola" | "tabung" | "kerucut" | "limas" | "prisma"
  >("kubus");

  // 3D Sync states
  const [currentVisualHint, setCurrentVisualHint] = useState<string>("");
  const [currentActiveLabel, setCurrentActiveLabel] = useState<string>("");
  const [explodeEffect, setExplodeEffect] = useState(false);

  // Text-to-Speech states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Load user profile from localStorage
    const profile = localStorage.getItem("user_profile");
    if (profile) {
      const parsedProfile = JSON.parse(profile);
      setUserProfile(parsedProfile);
    }

    // Initialize Speech Synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthesis.current = window.speechSynthesis;
      console.log("✅ Speech Synthesis initialized:", !!window.speechSynthesis);
    } else {
      console.error("❌ Speech Synthesis not available in this browser");
    }

    // Load available topics from backend
    loadAvailableTopics();

    // Cleanup on unmount
    return () => {
      stopAudio();
    };
  }, []);

  const loadAvailableTopics = async () => {
    try {
      setLoadingTopics(true);
      const availableTopics = await materialsApi.getAvailableTopics();
      setTopics(availableTopics);
      console.log("✅ Loaded topics:", availableTopics);
    } catch (error) {
      console.error("❌ Error loading topics:", error);
      // Fallback ke empty array jika error
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  const emotions = [
    { value: "percaya_diri", label: "Percaya Diri", emoji: "😄" },
    { value: "netral", label: "Netral", emoji: "😐" },
    { value: "bingung", label: "Bingung", emoji: "😳" },
    { value: "cemas", label: "Cemas", emoji: "😰" },
  ];

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

      // Auto-play audio for auditory learners
      if (
        userProfile.gaya_belajar === "auditori" &&
        response.data?.content?.explanation
      ) {
        setTimeout(() => {
          playAudio(response.data.content.explanation);
        }, 500);
      }
    } catch (error) {
      console.error("Error loading adaptive content:", error);
      alert("❌ Gagal memuat konten. Pastikan backend berjalan!");
    } finally {
      setLoading(false);
    }
  };

  // [All TTS functions remain the same - playAudio, playAudioChunked, pauseAudio, resumeAudio, stopAudio, handlePlayPause, testSpeech]
  const playAudio = (text: string) => {
    console.log("🔊 playAudio called with text length:", text?.length);

    const MAX_CHUNK_LENGTH = 300;
    if (text.length > MAX_CHUNK_LENGTH) {
      console.log("📝 Text too long, using sentence-by-sentence playback...");
      playAudioChunked(text);
      return;
    }

    if (!text || text.trim() === "") {
      console.error("❌ No text provided to playAudio");
      return;
    }

    if (!window.speechSynthesis) {
      console.error("❌ Speech Synthesis not supported in this browser");
      alert("Browser Anda tidak mendukung Text-to-Speech");
      return;
    }

    if (window.speechSynthesis.speaking) {
      console.log("🛑 Canceling active speech...");
      window.speechSynthesis.cancel();

      if (currentUtterance.current) {
        currentUtterance.current.onstart = null;
        currentUtterance.current.onend = null;
        currentUtterance.current.onerror = null;
        currentUtterance.current = null;
      }

      setTimeout(() => {
        console.log("⏭️ Retry playAudio after cancel...");
        playAudio(text);
      }, 150);
      return;
    }

    let voices = window.speechSynthesis.getVoices();

    if (voices.length === 0) {
      console.log("⏳ Voices not loaded yet, waiting...");
      window.speechSynthesis.addEventListener(
        "voiceschanged",
        () => {
          console.log("🔄 Voices loaded, retrying...");
          playAudio(text);
        },
        { once: true }
      );
      return;
    }

    const microsoftIndonesian = voices.find(
      (v) => v.name.includes("Microsoft") && v.lang.startsWith("id")
    );
    const googleIndonesian = voices.find(
      (v) => v.name.includes("Google") && v.lang === "id-ID"
    );
    const anyIndonesian = voices.find(
      (v) => v.lang.startsWith("id") || v.lang.startsWith("ID")
    );

    let selectedVoice =
      microsoftIndonesian || googleIndonesian || anyIndonesian;

    if (!selectedVoice) {
      selectedVoice = voices.find(
        (v) => v.name.includes("Microsoft") && v.lang === "en-US"
      );
    }

    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = "en-US";
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      console.log("▶️ Audio started playing");
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      console.log("⏹️ Audio finished playing");
      setIsPlaying(false);
      setIsPaused(false);
      currentUtterance.current = null;
    };

    utterance.onerror = (event) => {
      console.error("❌ Speech synthesis error:", event);
      if (event.error !== "interrupted") {
        alert("Error: " + event.error);
      }
      setIsPlaying(false);
      setIsPaused(false);
      currentUtterance.current = null;
    };

    currentUtterance.current = utterance;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
  };

  const playAudioChunked = (text: string) => {
    console.log("🎬 Starting chunked playback...");

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (currentUtterance.current) {
        currentUtterance.current.onstart = null;
        currentUtterance.current.onend = null;
        currentUtterance.current.onerror = null;
        currentUtterance.current = null;
      }
      setTimeout(() => playAudioChunked(text), 150);
      return;
    }

    let voices = window.speechSynthesis.getVoices();
    const googleIndonesian = voices.find(
      (v) => v.name.includes("Google") && v.lang === "id-ID"
    );

    if (!googleIndonesian) {
      alert("Voice bahasa Indonesia tidak tersedia. Silakan coba lagi.");
      return;
    }

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentIndex = 0;
    setIsPlaying(true);
    setIsPaused(false);

    const speakNextSentence = () => {
      if (currentIndex >= sentences.length) {
        setIsPlaying(false);
        setIsPaused(false);
        currentUtterance.current = null;
        return;
      }

      const sentence = sentences[currentIndex].trim();
      if (!sentence) {
        currentIndex++;
        speakNextSentence();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.voice = googleIndonesian;
      utterance.lang = "id-ID";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        currentIndex++;
        setTimeout(speakNextSentence, 100);
      };

      utterance.onerror = (event) => {
        if (event.error !== "interrupted") {
          currentIndex++;
          setTimeout(speakNextSentence, 100);
        }
      };

      currentUtterance.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    speakNextSentence();
  };

  const pauseAudio = () => {
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeAudio = () => {
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      currentUtterance.current = null;
    }
  };

  const handlePlayPause = () => {
    const explanation = adaptiveContent?.content?.explanation;
    if (!explanation) return;

    if (!isPlaying) {
      playAudio(explanation);
    } else if (isPaused) {
      resumeAudio();
    } else {
      pauseAudio();
    }
  };

  const testSpeech = () => {
    console.log("🧪 Testing speech...");
    window.speechSynthesis.cancel();

    setTimeout(() => {
      const voices = window.speechSynthesis.getVoices();
      const microsoftVoice = voices.find(
        (v) => v.name.includes("Microsoft") && v.lang === "en-US"
      );

      const utterance = new SpeechSynthesisUtterance("Hello, this is a test.");
      if (microsoftVoice) {
        utterance.voice = microsoftVoice;
        utterance.lang = microsoftVoice.lang;
      } else {
        utterance.lang = "en-US";
      }

      utterance.volume = 1.0;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      window.speechSynthesis.speak(utterance);
    }, 200);
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
      setVisualizationData(null);
    } finally {
      setLoadingViz(false);
    }
  };

  const loadExampleSolution = async () => {
    if (!selectedTopic) return;

    setLoadingSolution(true);
    setShowSolution(true);

    try {
      // Generate example problem based on topic
      const exampleProblems: Record<string, string> = {
        kubus:
          "Sebuah kubus memiliki panjang sisi 5 cm. Hitunglah volume kubus tersebut!",
        balok:
          "Sebuah balok memiliki panjang 8 cm, lebar 5 cm, dan tinggi 4 cm. Hitunglah volume balok tersebut!",
        bola: "Sebuah bola memiliki jari-jari 7 cm. Hitunglah volume bola tersebut! (gunakan π = 22/7)",
        tabung:
          "Sebuah tabung memiliki jari-jari alas 7 cm dan tinggi 10 cm. Hitunglah volume tabung tersebut!",
        kerucut:
          "Sebuah kerucut memiliki jari-jari alas 7 cm dan tinggi 12 cm. Hitunglah volume kerucut tersebut!",
        limas:
          "Sebuah limas segiempat memiliki panjang sisi alas 6 cm dan tinggi 8 cm. Hitunglah volume limas tersebut!",
        prisma:
          "Sebuah prisma segitiga memiliki alas segitiga dengan panjang alas 6 cm dan tinggi segitiga 4 cm, serta tinggi prisma 10 cm. Hitunglah volume prisma tersebut!",
      };

      const problem = exampleProblems[selectedTopic] || exampleProblems.kubus;

      const solution = await materialsApi.getStepByStepSolution(
        selectedTopic,
        problem,
        userProfile?.level || "pemula"
      );

      setSolutionData(solution);
    } catch (error) {
      console.error("Error loading solution:", error);
      setSolutionData(null);
    } finally {
      setLoadingSolution(false);
    }
  };

  const closeSolution = () => {
    setShowSolution(false);
    setSolutionData(null);
    // Reset 3D sync states
    setCurrentVisualHint("");
    setCurrentActiveLabel("");
    setExplodeEffect(false);
  };

  const handleStepChange = (step: any) => {
    console.log("Step changed:", step);

    // Update visual hint for 3D model
    if (step.visual_hint) {
      setCurrentVisualHint(step.visual_hint);

      // Handle specific visual hints
      switch (step.visual_hint) {
        case "highlight_sisi":
        case "highlight":
          setCurrentActiveLabel(`Langkah ${step.step_number}: ${step.title}`);
          setExplodeEffect(false);
          break;
        case "show_formula":
          if (step.formula) {
            setCurrentActiveLabel(step.formula);
          }
          setExplodeEffect(false);
          break;
        case "calculate":
          setExplodeEffect(true);
          if (step.calculation) {
            setCurrentActiveLabel(step.calculation);
          }
          break;
        case "show_result":
          setExplodeEffect(false);
          if (solutionData?.final_answer) {
            setCurrentActiveLabel(solutionData.final_answer);
          }
          break;
        default:
          setCurrentActiveLabel(`Step ${step.step_number}`);
          setExplodeEffect(false);
      }
    } else {
      setCurrentVisualHint("");
      setCurrentActiveLabel("");
      setExplodeEffect(false);
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

  return (
    <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 hidden sm:block">
            <span className="text-3xl">📚</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Pembelajaran Adaptif Bangun Ruang
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Selamat datang,{" "}
              <span className="font-semibold text-slate-900">
                {userProfile?.nama || "Siswa"}!
              </span>
            </p>
          </div>
        </div>
        {userProfile && (
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-violet-100 text-[#8b5cf6] text-xs font-bold rounded-full border border-violet-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                visibility
              </span>{" "}
              {userProfile.gaya_belajar?.toUpperCase() || "VISUAL"}
            </span>
            <span className="px-3 py-1 bg-pink-100 text-[#d946ef] text-xs font-bold rounded-full border border-pink-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                bar_chart
              </span>{" "}
              Level: {userProfile.level || "pemula"}
            </span>
          </div>
        )}
      </div>

      {/* AI Indicator */}
      {adaptiveContent && (
        <div className="bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] rounded-xl p-4 text-white shadow-lg flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-white opacity-10 skew-x-12 translate-x-12"></div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm shadow-inner">
            <span className="material-symbols-outlined text-2xl animate-pulse">
              smart_toy
            </span>
          </div>
          <div>
            <h3 className="font-bold text-base">
              AI-Powered Adaptive Learning Active
            </h3>
            <p className="text-xs text-white/90">
              Konten disesuaikan dengan gaya belajar{" "}
              <span className="font-bold">{userProfile?.gaya_belajar}</span>,
              emosi <span className="font-bold">{currentEmotion}</span>, dan
              level{" "}
              <span className="font-bold">{adaptiveContent.difficulty}</span>
            </p>
          </div>
        </div>
      )}

      {/* Emotion Selector */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🤔</span> Bagaimana perasaan Anda saat ini?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {emotions.map((emotion) => (
            <button
              key={emotion.value}
              onClick={() =>
                handleEmotionChange(emotion.value as typeof currentEmotion)
              }
              className={`group p-4 rounded-xl border transition-all text-center ${
                currentEmotion === emotion.value
                  ? "relative border-2 border-[#8b5cf6] bg-violet-50"
                  : "border border-slate-200 hover:border-[#8b5cf6]/50 hover:bg-violet-50"
              }`}
            >
              {currentEmotion === emotion.value && (
                <div className="absolute -top-2 -right-2 bg-[#8b5cf6] text-white rounded-full p-0.5">
                  <span className="material-symbols-outlined text-xs">
                    check
                  </span>
                </div>
              )}
              <div
                className={`text-3xl mb-2 transform transition-transform ${
                  currentEmotion === emotion.value
                    ? "scale-110"
                    : "group-hover:scale-110"
                }`}
              >
                {emotion.emoji}
              </div>
              <div
                className={`text-xs font-semibold ${
                  currentEmotion === emotion.value
                    ? "text-[#8b5cf6] font-bold"
                    : "text-slate-600 group-hover:text-[#8b5cf6]"
                }`}
              >
                {emotion.label}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 bg-blue-50 text-blue-700 text-xs px-4 py-2 rounded-lg flex items-center gap-2 border border-blue-100">
          <span className="text-base">💪</span> {getEmotionMessage()}
        </div>
      </section>

      {/* Topic Selection */}
      <section>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400">
            category
          </span>{" "}
          Pilih Topik Pembelajaran
        </h3>

        {/* Loading Topics State */}
        {loadingTopics && (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mb-3"></div>
            <p className="text-sm text-slate-600">
              Memuat topik pembelajaran...
            </p>
          </div>
        )}

        {/* Empty Topics State */}
        {!loadingTopics && topics.length === 0 && (
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-8 text-center border-2 border-dashed border-orange-200">
            <div className="text-5xl mb-3">📚</div>
            <h4 className="font-bold text-lg text-slate-800 mb-2">
              Belum Ada Materi
            </h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Saat ini belum ada materi pembelajaran yang tersedia. Silakan
              hubungi guru untuk mengupload materi terlebih dahulu.
            </p>
          </div>
        )}

        {/* Topics Grid */}
        {!loadingTopics && topics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => handleTopicSelect(topic.id)}
                className={`bg-white p-4 rounded-xl border hover:shadow-md transition-shadow cursor-pointer flex gap-3 items-start group ${
                  selectedTopic === topic.id
                    ? "border-2 border-[#8b5cf6] shadow-md relative overflow-hidden"
                    : "border-slate-100"
                }`}
              >
                {selectedTopic === topic.id && (
                  <div className="absolute top-0 right-0 p-1">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8b5cf6] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8b5cf6]"></span>
                    </span>
                  </div>
                )}
                <div
                  className={`size-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    topic.color === "blue"
                      ? "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                      : topic.color === "yellow"
                      ? "bg-yellow-100 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white"
                      : topic.color === "orange"
                      ? "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600"
                      : topic.color === "green"
                      ? "bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white"
                      : topic.color === "purple"
                      ? "bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
                      : topic.color === "red"
                      ? "bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                      : "bg-pink-100 text-pink-600 group-hover:bg-pink-600 group-hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined">
                    {topic.icon}
                  </span>
                </div>
                <div>
                  <h4
                    className={`font-bold text-sm ${
                      selectedTopic === topic.id
                        ? "text-[#8b5cf6]"
                        : "text-slate-800"
                    }`}
                  >
                    {topic.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 mb-2">
                    {topic.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        topic.difficulty === "Mudah"
                          ? "bg-green-100 text-green-700"
                          : topic.difficulty === "Menengah"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {topic.difficulty}
                    </span>
                    {topic.material_count && (
                      <span className="text-[9px] text-slate-500">
                        {topic.material_count} materi
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <div className="text-6xl mb-4">🤖</div>
          <p className="text-xl font-semibold text-gray-700">
            AI sedang menyesuaikan konten untuk Anda...
          </p>
          <p className="text-gray-500 mt-2">Mohon tunggu sebentar</p>
        </div>
      )}

      {/* Adaptive Content */}
      {!loading && adaptiveContent && selectedTopic && (
        <div className="flex flex-col gap-8">
          {/* Content Header */}
          <div className="bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">
                {topics.find((t) => t.id === selectedTopic)?.id === "balok"
                  ? "📦"
                  : topics.find((t) => t.id === selectedTopic)?.id === "kubus"
                  ? "🟦"
                  : topics.find((t) => t.id === selectedTopic)?.id === "bola"
                  ? "⚽"
                  : "🥫"}
              </span>
              <h2 className="text-2xl font-bold">
                {adaptiveContent.topic_name}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-white/90">
              <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
                <span className="material-symbols-outlined text-sm">
                  bar_chart
                </span>{" "}
                Difficulty: {adaptiveContent.difficulty}
              </span>
              <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
                <span className="material-symbols-outlined text-sm">
                  schedule
                </span>{" "}
                Est. Time: {adaptiveContent.recommendations.estimated_time} min
              </span>
            </div>
          </div>

          {/* Motivation */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-start gap-3">
            <span className="text-xl">💪</span>
            <p className="text-sm text-yellow-800 font-medium">
              {adaptiveContent.motivation}
            </p>
          </div>

          {/* Main Explanation */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8b5cf6]">
                  book
                </span>{" "}
                Penjelasan
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePlayPause}
                  disabled={!adaptiveContent?.content?.explanation}
                  className="flex items-center gap-1 bg-[#8b5cf6] text-white text-xs font-bold px-3 py-1.5 rounded shadow hover:bg-[#7c3aed] transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">
                    volume_up
                  </span>{" "}
                  {isPlaying && !isPaused
                    ? "Pause"
                    : isPaused
                    ? "Resume"
                    : "Listen"}
                </button>
                <button
                  onClick={testSpeech}
                  className="flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded shadow hover:bg-green-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">
                    quiz
                  </span>{" "}
                  Test
                </button>
                {isPlaying && (
                  <button
                    onClick={stopAudio}
                    className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded shadow hover:bg-red-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      stop
                    </span>{" "}
                    Stop
                  </button>
                )}
              </div>
            </div>
            <div className="p-6 sm:p-8 space-y-6 text-slate-600 text-sm leading-relaxed">
              <p className="text-xs text-right text-slate-400 italic">
                Audio generated from AI-adapted text based on teacher material
              </p>
              <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                {adaptiveContent.content.explanation}
              </pre>
            </div>
          </div>

          {/* 3D Visualization */}
          {loadingViz && (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
              <div className="text-5xl mb-4">🎨</div>
              <p className="text-lg font-semibold text-gray-700">
                Membuat visualisasi 3D...
              </p>
            </div>
          )}

          {!loadingViz && visualizationData && (
            <div className="space-y-4">
              {/* Toggle Buttons */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-sm font-semibold text-slate-700">
                  Mode Visualisasi:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNet(false)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                      !showNet
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      deployed_code
                    </span>
                    Model 3D
                  </button>
                  <button
                    onClick={() => setShowNet(true)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                      showNet
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      auto_awesome
                    </span>
                    Jaring-jaring
                  </button>
                  <button
                    onClick={() => {
                      setArShapeType(selectedTopic as any);
                      setShowAR(true);
                    }}
                    className="px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg"
                  >
                    <span className="material-symbols-outlined text-lg">
                      view_in_ar
                    </span>
                    Mode AR
                  </button>
                </div>
              </div>

              {/* 3D Model View */}
              {!showNet && (
                <div className="bg-white rounded-2xl shadow-lg border border-[#8b5cf6]/20 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] p-3 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined">
                        deployed_code
                      </span>
                      <h3 className="font-bold text-sm">
                        Visualisasi 3D Interactive
                      </h3>
                    </div>
                    <div className="text-[10px] bg-white/20 px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">
                        code
                      </span>{" "}
                      {visualizationData.source === "llm"
                        ? "AI-Generated"
                        : "Rule-Based"}{" "}
                      | Aman & Declarative
                    </div>
                  </div>
                  <ThreeDViewer data={visualizationData} />
                </div>
              )}

              {/* Net View */}
              {showNet && selectedTopic && (
                <NetViewer
                  shape={
                    selectedTopic as
                      | "kubus"
                      | "balok"
                      | "tabung"
                      | "kerucut"
                      | "limas"
                      | "prisma"
                  }
                  size={600}
                  showLabels={true}
                  interactive={true}
                />
              )}
            </div>
          )}

          {/* Step-by-Step Solution Example */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-lg mb-1">
                  Contoh Soal & Solusi Step-by-Step
                </h3>
                <p className="text-amber-700 text-sm">
                  Lihat cara menyelesaikan soal dengan langkah-langkah yang
                  mudah dipahami
                </p>
              </div>
            </div>
            <button
              onClick={loadExampleSolution}
              disabled={loadingSolution}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loadingSolution ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memuat solusi...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">play_arrow</span>
                  <span>Lihat Solusi Step-by-Step</span>
                </>
              )}
            </button>
          </div>

          {/* AR Viewer Modal */}
          {showAR && (
            <ARViewer
              shapeType={arShapeType}
              color="#10b981"
              scale={[2, 2, 2]}
              onClose={() => setShowAR(false)}
            />
          )}

          {/* Step-by-Step Solution Viewer Modal with 3D Sync */}
          {showSolution && solutionData && visualizationData && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-7xl max-h-[95vh] overflow-hidden">
                <div className="relative bg-slate-900 rounded-2xl shadow-2xl">
                  {/* Close Button */}
                  <button
                    onClick={closeSolution}
                    className="absolute top-4 right-4 z-20 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    aria-label="Close solution viewer"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>

                  {/* Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <span className="text-3xl">🎯</span>
                      Solusi Interaktif dengan Visualisasi 3D
                    </h2>
                    <p className="text-indigo-100 text-sm mt-2">
                      Ikuti langkah-langkah di kanan, lihat visualisasi 3D di
                      kiri berubah secara otomatis
                    </p>
                  </div>

                  {/* Side-by-Side Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-h-[calc(95vh-180px)] overflow-y-auto">
                    {/* Left: 3D Visualization */}
                    <div className="bg-slate-800 rounded-xl p-4 h-full min-h-[500px] lg:sticky lg:top-0">
                      <div className="mb-3">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                          <span className="material-symbols-outlined text-purple-400">
                            deployed_code
                          </span>
                          Visualisasi 3D Interaktif
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                          Model berubah sesuai langkah yang aktif
                        </p>
                      </div>
                      <ThreeDViewer
                        data={visualizationData}
                        visualHint={currentVisualHint}
                        activeLabel={currentActiveLabel}
                        explodeEffect={explodeEffect}
                      />

                      {/* Visual Hint Indicator */}
                      {currentVisualHint && (
                        <div className="mt-4 bg-purple-900/50 border border-purple-500 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-purple-300 text-sm">
                            <span className="material-symbols-outlined text-lg">
                              visibility
                            </span>
                            <span className="font-medium">
                              Mode: {currentVisualHint.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Step-by-Step Solution */}
                    <div className="h-full overflow-y-auto">
                      <StepBySteViewer
                        data={solutionData}
                        onStepChange={handleStepChange}
                        onComplete={() => {
                          console.log("Solution completed!");
                          setCurrentVisualHint("");
                          setCurrentActiveLabel("✅ Selesai!");
                          setExplodeEffect(false);
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="bg-slate-800 border-t border-slate-700 p-4 rounded-b-2xl">
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                        <span>Highlight = Bagian yang diperhatikan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                        <span>Explode = Visualisasi perhitungan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span>Label = Informasi dinamis</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulas */}
          {adaptiveContent.content.key_formulas && (
            <section>
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8b5cf6]">
                  function
                </span>{" "}
                Rumus Penting
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(adaptiveContent.content.key_formulas).map(
                  ([key, value]: [string, any], idx) => {
                    const colors = [
                      { border: "border-[#8b5cf6]", text: "text-[#8b5cf6]" },
                      { border: "border-[#d946ef]", text: "text-[#d946ef]" },
                      { border: "border-orange-400", text: "text-orange-500" },
                      { border: "border-blue-400", text: "text-blue-500" },
                    ];
                    const colorSet = colors[idx % colors.length];

                    return (
                      <div
                        key={key}
                        className={`bg-white p-5 rounded-xl border-l-4 ${colorSet.border} shadow-sm`}
                      >
                        <h4
                          className={`text-xs font-bold ${colorSet.text} uppercase mb-2`}
                        >
                          {key}:
                        </h4>
                        <p className="font-mono text-slate-700 bg-slate-50 p-2 rounded">
                          {value}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {/* Learning Tips */}
          <section className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span> Tips Belajar untuk Anda
            </h3>
            <ul className="space-y-3">
              {adaptiveContent.recommendations.learning_tips.map(
                (tip: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-blue-800">{tip}</p>
                  </li>
                )
              )}
            </ul>
          </section>

          {/* Next Topic */}
          <div className="bg-violet-100 rounded-xl p-6 text-center md:text-left md:flex justify-between items-center border border-violet-200">
            <div>
              <h4 className="font-bold text-[#8b5cf6] flex items-center gap-2 mb-1 justify-center md:justify-start">
                <span className="material-symbols-outlined">rocket_launch</span>{" "}
                Selanjutnya
              </h4>
              <p className="text-sm text-slate-600">
                Setelah menguasai materi ini, Anda bisa lanjut ke:{" "}
                <span className="font-bold text-slate-900">
                  {adaptiveContent.recommendations.next_topic}
                </span>
              </p>
            </div>
            <button className="mt-4 md:mt-0 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors flex items-center gap-2">
              Lanjut Belajar{" "}
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
