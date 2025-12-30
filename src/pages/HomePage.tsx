import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { healthCheck } from '../services/api';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    checkAPI();
  }, []);

  const checkAPI = async () => {
    try {
      await healthCheck();
      setApiStatus('connected');
    } catch (error) {
      setApiStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="container-custom py-20">
        <div className="text-center space-y-8">
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              EMOTIVA-MATH
            </h1>
            <p className="text-2xl text-gray-600 font-medium">
              Emotion-Aware Adaptive Mathematics Learning System
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Sistem pembelajaran matematika adaptif yang memahami gaya belajar dan emosi Anda.
            Belajar Bangun Ruang dengan cara yang paling sesuai untuk Anda!
          </p>

          {/* API Status */}
          <div className="flex items-center justify-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              apiStatus === 'connected' ? 'bg-green-500' :
              apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            } animate-pulse`}></div>
            <span className="text-sm text-gray-600">
              Backend API: {
                apiStatus === 'connected' ? '✅ Connected' :
                apiStatus === 'error' ? '❌ Error' : '⏳ Checking...'
              }
            </span>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="card hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Personalized Learning</h3>
              <p className="text-gray-600">
                Deteksi gaya belajar Anda (Visual, Auditori, Kinestetik) untuk pengalaman terbaik
              </p>
            </div>

            <div className="card hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">😊</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Emotion-Aware</h3>
              <p className="text-gray-600">
                Sistem memahami kondisi emosi Anda dan menyesuaikan materi pembelajaran
              </p>
            </div>

            <div className="card hover:scale-105 transition-transform">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">AR Visualization</h3>
              <p className="text-gray-600">
                Visualisasi 3D interaktif untuk bangun ruang seperti Kubus, Balok, dan lainnya
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mt-12">
            <Link to="/profile" className="btn-primary">
              🚀 Mulai Belajar
            </Link>
            <Link to="/learn" className="btn-outline">
              📚 Langsung ke Materi
            </Link>
          </div>

          {/* Tech Stack */}
          <div className="mt-20 pt-10 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Built with</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <span className="px-4 py-2 bg-white rounded-lg shadow text-sm font-medium text-gray-700">
                ⚛️ React + Vite
              </span>
              <span className="px-4 py-2 bg-white rounded-lg shadow text-sm font-medium text-gray-700">
                🎨 Tailwind CSS
              </span>
              <span className="px-4 py-2 bg-white rounded-lg shadow text-sm font-medium text-gray-700">
                🐍 Flask + SQLAlchemy
              </span>
              <span className="px-4 py-2 bg-white rounded-lg shadow text-sm font-medium text-gray-700">
                🤖 AI-Powered
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
