import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import LearnPage from "./pages/LearnPage";
import TeacherPage from "./pages/TeacherPage";
import QuizPage from "./pages/QuizPage";
import DashboardPage from "./pages/DashboardPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { authService } from "./services/authService";
import "./index.css";

function Navigation() {
  const location = useLocation();
  const [user, setUser] = useState<any>(authService.getCurrentUser());
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary tracking-tight">
                EMOTIVA-MATH
              </h1>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider">
                AI-Powered Learning
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          {isAuthenticated && user ? (
            <>
              <nav className="hidden md:flex items-center space-x-2">
                <Link
                  to="/"
                  className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
                >
                  Home
                </Link>

                {/* Teacher Links */}
                {user.role === "teacher" && (
                  <>
                    <Link
                      to="/teacher"
                      className={`nav-link ${location.pathname === "/teacher" ? "active" : ""}`}
                    >
                      <span className="material-symbols-outlined text-lg">school</span>
                      Materi
                    </Link>
                    <Link
                      to="/dashboard"
                      className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
                    >
                      <span className="material-symbols-outlined text-lg">dashboard</span>
                      Dashboard
                    </Link>
                  </>
                )}

                {/* Student Links */}
                {user.role === "student" && (
                  <>
                    <Link
                      to="/student-dashboard"
                      className={`nav-link ${location.pathname === "/student-dashboard" ? "active" : ""}`}
                    >
                      <span className="material-symbols-outlined text-lg">dashboard</span>
                      Dashboard
                    </Link>
                    <Link
                      to="/learn"
                      className={`nav-link ${location.pathname === "/learn" ? "active" : ""}`}
                    >
                      <span className="material-symbols-outlined text-lg">book</span>
                      Belajar
                    </Link>
                    <Link
                      to="/quiz"
                      className={`nav-link ${location.pathname === "/quiz" ? "active" : ""}`}
                    >
                      <span className="material-symbols-outlined text-lg">sports_esports</span>
                      Quiz
                    </Link>
                    <Link
                      to="/profile"
                      className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}
                    >
                      <span className="material-symbols-outlined text-lg">person</span>
                      Profil
                    </Link>
                  </>
                )}
              </nav>

              {/* User Info & Logout */}
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">{user.nama}</p>
                  <p className="text-xs text-slate-600">
                    {user.role === "teacher" ? "Guru" : "Siswa"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-6 py-2 text-primary font-semibold hover:text-primary-hover transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-all shadow-md"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AppContent() {
  const location = useLocation();
  const hideNavAndFooter = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen">
      {!hideNavAndFooter && <Navigation />}

      {/* Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute requireRole="teacher">
              <TeacherPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireRole="teacher">
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute requireRole="student">
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireRole="student">
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute requireRole="student">
              <LearnPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute requireRole="student">
              <QuizPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Footer */}
      {!hideNavAndFooter && (
        <footer className="bg-slate-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-slate-400">
              © 2024 EMOTIVA-MATH - Tugas Besar Kecerdasan Buatan
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Institut Teknologi Nasional Bandung
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Verify token on mount
    const verifyAuth = async () => {
      if (authService.isAuthenticated()) {
        await authService.verifyToken();
      }
      setIsVerifying(false);
    };

    verifyAuth();
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-slate-900">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
