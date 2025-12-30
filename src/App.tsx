import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import LearnPage from "./pages/LearnPage";
import TeacherPage from "./pages/TeacherPage";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        {/* Navigation */}
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="container-custom py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3">
                <div className="text-3xl">🧠</div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    EMOTIVA-MATH
                  </h1>
                  <p className="text-xs text-gray-500">AI-Powered Learning</p>
                </div>
              </Link>

              {/* Nav Links */}
              <div className="flex gap-6">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/teacher"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  👨‍🏫 Guru
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  Profil
                </Link>
                <Link
                  to="/learn"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  Belajar
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/learn" element={<LearnPage />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-20">
          <div className="container-custom text-center">
            <p className="text-gray-400">
              © 2024 EMOTIVA-MATH - Tugas Besar Kecerdasan Buatan
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Institut Teknologi Nasional Bandung
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
