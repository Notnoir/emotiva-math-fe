import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../services/api';
import type { UserProfile } from '../types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nama: '',
    answers: [] as number[],
  });
  const [loading, setLoading] = useState(false);

  // Kuesioner Gaya Belajar (simplified version)
  const questions = [
    {
      id: 1,
      question: 'Cara terbaik saya memahami materi baru adalah:',
      options: [
        { text: 'Melihat diagram, gambar, atau video', type: 'visual', score: 1 },
        { text: 'Mendengarkan penjelasan atau diskusi', type: 'auditori', score: 2 },
        { text: 'Praktik langsung atau mengerjakan soal', type: 'kinestetik', score: 3 },
      ],
    },
    {
      id: 2,
      question: 'Saat belajar matematika, saya lebih suka:',
      options: [
        { text: 'Melihat grafik dan visualisasi 3D', type: 'visual', score: 1 },
        { text: 'Mendengarkan penjelasan step-by-step', type: 'auditori', score: 2 },
        { text: 'Menggunakan alat peraga atau simulasi', type: 'kinestetik', score: 3 },
      ],
    },
    {
      id: 3,
      question: 'Saya lebih mudah mengingat:',
      options: [
        { text: 'Wajah, warna, dan gambar', type: 'visual', score: 1 },
        { text: 'Nama, suara, dan percakapan', type: 'auditori', score: 2 },
        { text: 'Gerakan, aktivitas, dan pengalaman', type: 'kinestetik', score: 3 },
      ],
    },
  ];

  const handleAnswerSelect = (questionIndex: number, score: number) => {
    const newAnswers = [...formData.answers];
    newAnswers[questionIndex] = score;
    setFormData({ ...formData, answers: newAnswers });
  };

  const calculateLearningStyle = (): 'visual' | 'auditori' | 'kinestetik' => {
    const total = formData.answers.reduce((sum, score) => sum + score, 0);
    const avg = total / formData.answers.length;

    if (avg <= 1.5) return 'visual';
    if (avg <= 2.5) return 'auditori';
    return 'kinestetik';
  };

  const handleSubmit = async () => {
    if (!formData.nama || formData.answers.length !== questions.length) {
      alert('⚠️ Mohon lengkapi semua pertanyaan!');
      return;
    }

    setLoading(true);
    try {
      const gayaBelajar = calculateLearningStyle();
      
      const profileData: UserProfile = {
        nama: formData.nama,
        gaya_belajar: gayaBelajar,
        level: 'pemula',
      };

      const response = await profileApi.create(profileData);
      
      // Save user ID to localStorage
      localStorage.setItem('user_id', response.data.id.toString());
      localStorage.setItem('user_profile', JSON.stringify(response.data));

      // Show result
      alert(`✅ Profil berhasil dibuat!\n\n👤 Nama: ${formData.nama}\n🎯 Gaya Belajar: ${gayaBelajar.toUpperCase()}\n📊 Level: Pemula`);
      
      // Navigate to learn page
      navigate('/learn');
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('❌ Gagal membuat profil. Pastikan backend berjalan!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              📝 Buat Profil Pembelajaran
            </h1>
            <p className="text-gray-600">
              Kami akan mengenali gaya belajar Anda untuk pengalaman terbaik
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">{step}/2</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Card */}
          <div className="card">
            {/* Step 1: Name */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Siapa nama Anda?</h2>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap..."
                  className="input-field text-lg"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                />
                <button
                  className="btn-primary w-full"
                  onClick={() => formData.nama && setStep(2)}
                  disabled={!formData.nama}
                >
                  Lanjut →
                </button>
              </div>
            )}

            {/* Step 2: Questionnaire */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">Kuesioner Gaya Belajar</h2>
                  <button
                    onClick={() => setStep(1)}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    ← Kembali
                  </button>
                </div>

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
                            formData.answers[idx] === option.score
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                          onClick={() => handleAnswerSelect(idx, option.score)}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + optIdx)}.</span> {option.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  className="btn-primary w-full mt-8"
                  onClick={handleSubmit}
                  disabled={loading || formData.answers.length !== questions.length}
                >
                  {loading ? '⏳ Membuat Profil...' : '✅ Buat Profil & Mulai Belajar'}
                </button>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Informasi:</strong> Kuesioner ini membantu kami mengenali gaya belajar Anda 
              (Visual, Auditori, atau Kinestetik) agar materi dapat disesuaikan dengan kebutuhan Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
