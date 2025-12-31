import { useState, useEffect, useRef } from "react";
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

      // Load recommendations
      loadRecommendations(parsedProfile.id);
    }

    // Initialize Speech Synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthesis.current = window.speechSynthesis;
      console.log("✅ Speech Synthesis initialized:", !!window.speechSynthesis);
    } else {
      console.error("❌ Speech Synthesis not available in this browser");
    }

    // Cleanup on unmount
    return () => {
      stopAudio();
    };
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

      // Auto-play audio for auditory learners
      if (
        userProfile.gaya_belajar === "auditori" &&
        response.data?.content?.explanation
      ) {
        // Small delay to ensure content is rendered
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

  // Text-to-Speech Functions - with chunking for Google voices
  const playAudio = (text: string) => {
    console.log("🔊 playAudio called with text length:", text?.length);

    // If text is very long, split into sentences for better Google voice handling
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

    // Check browser support
    if (!window.speechSynthesis) {
      console.error("❌ Speech Synthesis not supported in this browser");
      alert("Browser Anda tidak mendukung Text-to-Speech");
      return;
    }

    // Only cancel if actually speaking (not just pending)
    if (window.speechSynthesis.speaking) {
      console.log("🛑 Canceling active speech...");
      window.speechSynthesis.cancel();

      // Clean up old utterance
      if (currentUtterance.current) {
        currentUtterance.current.onstart = null;
        currentUtterance.current.onend = null;
        currentUtterance.current.onerror = null;
        currentUtterance.current = null;
      }

      // Small delay after cancel
      setTimeout(() => {
        console.log("⏭️ Retry playAudio after cancel...");
        playAudio(text);
      }, 150);
      return;
    }

    // Get available voices
    let voices = window.speechSynthesis.getVoices();

    // If voices not loaded yet, wait for them
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

    console.log("🎤 Available voices:", voices.length);
    console.log(
      "🎤 All voices:",
      voices.map((v) => `${v.name} (${v.lang})`)
    );

    // Try to find Indonesian voice (prefer LOCAL Microsoft, but accept Google if no local)
    const microsoftIndonesian = voices.find(
      (v) => v.name.includes("Microsoft") && v.lang.startsWith("id")
    );
    const googleIndonesian = voices.find(
      (v) => v.name.includes("Google") && v.lang === "id-ID"
    );
    const anyIndonesian = voices.find(
      (v) => v.lang.startsWith("id") || v.lang.startsWith("ID")
    );

    // Priority: Microsoft local > Google online > English fallback
    let selectedVoice =
      microsoftIndonesian || googleIndonesian || anyIndonesian;

    if (!selectedVoice) {
      console.log(
        "⚠️ No Indonesian voice found, using English Microsoft as fallback"
      );
      selectedVoice = voices.find(
        (v) => v.name.includes("Microsoft") && v.lang === "en-US"
      );
    }

    console.log(
      "🇮� Selected voice:",
      selectedVoice?.name || "default",
      "localService:",
      selectedVoice?.localService
    );

    console.log("✅ Creating new utterance...");

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice and language
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      console.log(
        "✅ Using voice:",
        selectedVoice.name,
        "lang:",
        selectedVoice.lang,
        "local:",
        selectedVoice.localService
      );
    } else {
      // Last resort fallback
      utterance.lang = "en-US";
      console.log("⚠️ No voice found, using default en-US");
    }

    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    console.log("🎙️ Utterance config:", {
      voice: utterance.voice?.name || "default",
      lang: utterance.lang,
      rate: utterance.rate,
      textLength: text.length,
    });

    // Event handlers
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
      // Only show alert for non-interrupted errors
      if (event.error !== "interrupted") {
        alert("Error: " + event.error);
      }
      setIsPlaying(false);
      setIsPaused(false);
      currentUtterance.current = null;
    };

    currentUtterance.current = utterance;

    console.log("🚀 Starting speech synthesis...");

    // Force resume in case speechSynthesis is stuck in paused state
    if (window.speechSynthesis.paused) {
      console.log("⚠️ SpeechSynthesis was paused, resuming...");
      window.speechSynthesis.resume();
    }

    // Timeout fallback - if Google voice doesn't start in 3 seconds, use English
    let hasStarted = false;
    const fallbackTimeout = setTimeout(() => {
      if (!hasStarted && currentUtterance.current) {
        console.log(
          "❌ Timeout waiting for Google voice, switching to English fallback..."
        );
        window.speechSynthesis.cancel();
        currentUtterance.current = null;

        // Retry with English voice
        const englishVoices = window.speechSynthesis.getVoices();
        const englishVoice = englishVoices.find(
          (v) => v.name.includes("Microsoft") && v.lang === "en-US"
        );

        const fallbackUtterance = new SpeechSynthesisUtterance(text);
        if (englishVoice) {
          fallbackUtterance.voice = englishVoice;
          fallbackUtterance.lang = englishVoice.lang;
        } else {
          fallbackUtterance.lang = "en-US";
        }
        fallbackUtterance.rate = 0.9;
        fallbackUtterance.pitch = 1.0;
        fallbackUtterance.volume = 1.0;

        fallbackUtterance.onstart = () => {
          console.log("▶️ Fallback audio started");
          setIsPlaying(true);
          setIsPaused(false);
        };

        fallbackUtterance.onend = () => {
          console.log("⏹️ Fallback audio finished");
          setIsPlaying(false);
          setIsPaused(false);
          currentUtterance.current = null;
        };

        fallbackUtterance.onerror = (event) => {
          console.error("❌ Fallback error:", event);
          setIsPlaying(false);
          setIsPaused(false);
          currentUtterance.current = null;
        };

        currentUtterance.current = fallbackUtterance;
        console.log("🔄 Speaking with English fallback...");
        window.speechSynthesis.speak(fallbackUtterance);
      }
    }, 3000);

    // Modify onstart to clear timeout and flag
    const originalOnStart = utterance.onstart;
    utterance.onstart = function (event) {
      hasStarted = true;
      clearTimeout(fallbackTimeout);
      if (originalOnStart) originalOnStart.call(this, event);
    };

    window.speechSynthesis.speak(utterance);

    // For online voices (like Google), need multiple resume attempts to handle network delay
    const maxAttempts = 5;
    let attempt = 0;

    const forceResumeInterval = setInterval(() => {
      attempt++;

      if (attempt > maxAttempts || !currentUtterance.current || hasStarted) {
        clearInterval(forceResumeInterval);
        return;
      }

      if (window.speechSynthesis.paused) {
        console.log(`⚠️ Force resume attempt ${attempt}...`);
        window.speechSynthesis.resume();
      }

      // If still pending/speaking but not started yet, try resume
      if (window.speechSynthesis.pending && !isPlaying) {
        console.log(`⚠️ Still pending, force resume ${attempt}...`);
        window.speechSynthesis.resume();
      }
    }, 200);

    console.log("✅ speak() called, waiting for onstart...");
  };

  // Play audio in chunks (sentence by sentence)
  const playAudioChunked = (text: string) => {
    console.log("🎬 Starting chunked playback...");

    // Only cancel if actually speaking (not first time)
    if (window.speechSynthesis.speaking) {
      console.log("🛑 Canceling active speech...");
      window.speechSynthesis.cancel();

      // Clean up old utterance
      if (currentUtterance.current) {
        currentUtterance.current.onstart = null;
        currentUtterance.current.onend = null;
        currentUtterance.current.onerror = null;
        currentUtterance.current = null;
      }

      // Small delay after cancel
      setTimeout(() => {
        console.log("⏭️ Retry playAudioChunked after cancel...");
        playAudioChunked(text);
      }, 150);
      return;
    }

    // Get Indonesian voice
    let voices = window.speechSynthesis.getVoices();
    const googleIndonesian = voices.find(
      (v) => v.name.includes("Google") && v.lang === "id-ID"
    );

    if (!googleIndonesian) {
      console.error("❌ No Indonesian voice available");
      alert("Voice bahasa Indonesia tidak tersedia. Silakan coba lagi.");
      return;
    }

    console.log("✅ Using voice:", googleIndonesian.name);

    // Split by sentences (. ! ?)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    console.log(`📚 Split into ${sentences.length} sentences`);

    let currentIndex = 0;
    setIsPlaying(true);
    setIsPaused(false);

    const speakNextSentence = () => {
      if (currentIndex >= sentences.length) {
        console.log("✅ All sentences completed");
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

      console.log(
        `🗣️ Speaking sentence ${currentIndex + 1}/${
          sentences.length
        }: "${sentence.substring(0, 50)}..."`
      );

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.voice = googleIndonesian;
      utterance.lang = "id-ID";
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        console.log(`▶️ Sentence ${currentIndex + 1} started`);
      };

      utterance.onend = () => {
        console.log(`✅ Sentence ${currentIndex + 1} ended`);
        currentIndex++;
        // Small delay between sentences
        setTimeout(speakNextSentence, 100);
      };

      utterance.onerror = (event) => {
        console.error(`❌ Error on sentence ${currentIndex + 1}:`, event);
        if (event.error !== "interrupted") {
          // Skip to next sentence on error
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
    console.log("⏸️ pauseAudio called, isPlaying:", isPlaying);
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      console.log("✅ Audio paused");
    }
  };

  const resumeAudio = () => {
    console.log("▶️ resumeAudio called, isPaused:", isPaused);
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      console.log("✅ Audio resumed");
    }
  };

  const stopAudio = () => {
    console.log("⏹️ stopAudio called");
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      currentUtterance.current = null;
      console.log("✅ Audio stopped and state cleared");
    }
  };

  const handlePlayPause = () => {
    const explanation = adaptiveContent?.content?.explanation;
    console.log(
      "🎯 handlePlayPause clicked, explanation exists:",
      !!explanation
    );

    if (!explanation) {
      console.error(
        "❌ No explanation found in adaptiveContent.content.explanation"
      );
      return;
    }

    console.log("Current state - isPlaying:", isPlaying, "isPaused:", isPaused);

    if (!isPlaying) {
      console.log("➡️ Starting playback...");
      playAudio(explanation);
    } else if (isPaused) {
      console.log("➡️ Resuming playback...");
      resumeAudio();
    } else {
      console.log("➡️ Pausing playback...");
      pauseAudio();
    }
  };

  // Test function - simple English speech
  const testSpeech = () => {
    console.log("🧪 Testing speech with simple English text...");

    // Hard reset speechSynthesis
    console.log("🔄 Resetting speechSynthesis...");
    window.speechSynthesis.cancel();

    setTimeout(() => {
      // Use LOCAL Microsoft voice only
      const voices = window.speechSynthesis.getVoices();
      const microsoftVoice = voices.find(
        (v) => v.name.includes("Microsoft") && v.lang === "en-US"
      );

      console.log("🎤 Using voice:", microsoftVoice?.name || "default");

      const utterance = new SpeechSynthesisUtterance("Hello, this is a test.");

      // Use Microsoft voice if available
      if (microsoftVoice) {
        utterance.voice = microsoftVoice;
        utterance.lang = microsoftVoice.lang;
      } else {
        utterance.lang = "en-US";
      }

      utterance.volume = 1.0;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        console.log("✅ TEST: Speech started!");
      };

      utterance.onend = () => {
        console.log("✅ TEST: Speech ended!");
      };

      utterance.onerror = (e) => {
        console.error("❌ TEST: Error:", e);
      };

      console.log("✅ TEST: Calling speak()...");
      window.speechSynthesis.speak(utterance);

      // Check status immediately after
      setTimeout(() => {
        console.log("📊 Status after speak:", {
          speaking: window.speechSynthesis.speaking,
          pending: window.speechSynthesis.pending,
          paused: window.speechSynthesis.paused,
        });

        // Try resume if paused
        if (window.speechSynthesis.paused) {
          console.log("⚠️ Was paused, resuming...");
          window.speechSynthesis.resume();
        }
      }, 50);
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
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  📖 Penjelasan
                </h3>

                {/* Audio Player Controls */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={handlePlayPause}
                      disabled={!adaptiveContent?.content?.explanation}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-md flex items-center gap-2 ${
                        isPlaying && !isPaused
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isPlaying && !isPaused ? (
                        <>⏸️ Pause</>
                      ) : isPaused ? (
                        <>▶️ Resume</>
                      ) : (
                        <>🔊 Listen Explanation</>
                      )}
                    </button>

                    {/* Test Button */}
                    <button
                      onClick={testSpeech}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all shadow-md text-sm"
                    >
                      🧪 Test
                    </button>

                    {isPlaying && (
                      <button
                        onClick={stopAudio}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all shadow-md"
                      >
                        ⏹️ Stop
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 text-right max-w-xs">
                    {userProfile?.gaya_belajar === "auditori" && (
                      <div className="text-indigo-600 font-medium mb-1">
                        👂 Auto-play aktif (Auditory Learner)
                      </div>
                    )}
                    <div className="italic">
                      Audio generated from AI-adapted text based on teacher
                      material
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio Status Indicator */}
              {isPlaying && (
                <div className="mb-4 p-3 bg-indigo-50 border-l-4 border-indigo-500 rounded">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-1 h-4 bg-indigo-600 animate-pulse"
                        style={{ animationDelay: "0s" }}
                      ></div>
                      <div
                        className="w-1 h-4 bg-indigo-600 animate-pulse"
                        style={{ animationDelay: "0.15s" }}
                      ></div>
                      <div
                        className="w-1 h-4 bg-indigo-600 animate-pulse"
                        style={{ animationDelay: "0.3s" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-indigo-700">
                      {isPaused ? "Audio Paused" : "Playing Audio..."}
                    </span>
                  </div>
                </div>
              )}

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
