import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login(
        formData.email,
        formData.password
      );

      if (response.data.status === "success") {
        const user = response.data.data.user;

        // Redirect based on role
        if (user.role === "teacher") {
          navigate("/teacher");
        } else {
          // Student: redirect to dashboard
          navigate("/student-dashboard");
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login gagal. Periksa email dan password Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-custom-gradient font-display text-slate-800 min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Header Section */}
      <div className="text-center mb-8 animate-fade-in-down">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#8b5cf6] tracking-tight mb-2">
          EMOTIVA-MATH
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-md mx-auto">
          Emotion-Aware Adaptive Learning System
        </p>
      </div>

      {/* Login Form Card */}
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl shadow-purple-100/50 overflow-hidden border border-white">
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Masuk ke Akun Anda
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-medium">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] sm:text-sm placeholder-slate-400 transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] sm:text-sm placeholder-slate-400 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#8b5cf6] hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b5cf6] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Memproses...
                  </span>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="font-medium text-[#8b5cf6] hover:text-[#7c3aed] hover:underline transition-colors"
              >
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Demo Accounts Info */}
      <div className="mt-8 w-full max-w-[480px] bg-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm">
        <div className="flex items-start">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-blue-900 mb-2">
              Demo Accounts (untuk testing):
            </h3>
            <div className="text-sm space-y-1 text-slate-700">
              <p>
                <span className="font-semibold text-blue-800">Guru:</span>{" "}
                teacher@demo.com / password123
              </p>
              <p>
                <span className="font-semibold text-blue-800">Siswa:</span>{" "}
                student@demo.com / password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
