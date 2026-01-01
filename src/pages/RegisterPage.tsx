import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as "teacher" | "student",
    gaya_belajar: "", // Empty by default - will be filled in ProfilePage
    level: "", // Empty by default - will be filled in ProfilePage
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password harus minimal 6 karakter");
      setLoading(false);
      return;
    }

    try {
      const registerData: any = {
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Add learning profile for students only (if provided)
      if (
        formData.role === "student" &&
        formData.gaya_belajar &&
        formData.level
      ) {
        registerData.gaya_belajar = formData.gaya_belajar;
        registerData.level = formData.level;
      }

      const response = await authService.register(registerData);

      if (response.data.status === "success") {
        const user = response.data.data.user;

        // Redirect based on role and profile completeness
        if (user.role === "teacher") {
          navigate("/teacher");
        } else {
          // Student: redirect to profile if gaya_belajar is empty, else dashboard
          if (!user.gaya_belajar) {
            navigate("/profile");
          } else {
            navigate("/student-dashboard");
          }
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registrasi gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-custom-gradient font-display text-slate-800 min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Header Section */}
      <div className="text-center mb-8 animate-fade-in-down">
        <div className="mx-auto h-20 w-20 bg-pink-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <span className="material-icons text-5xl text-pink-400">
            psychology
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#8b5cf6] tracking-tight mb-2">
          EMOTIVA-MATH
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-md mx-auto">
          Emotion-Aware Adaptive Learning System
        </p>
      </div>

      {/* Register Form Card */}
      <div className="w-full max-w-[680px] bg-white rounded-2xl shadow-xl shadow-purple-100/50 overflow-hidden border border-white">
        <div className="p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Buat Akun Anda
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-medium">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Daftar Sebagai
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "student" })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === "student"
                      ? "border-[#8b5cf6] bg-purple-50 shadow-md"
                      : "border-slate-300 hover:border-[#8b5cf6]"
                  }`}
                >
                  <div className="text-3xl mb-2">👨‍🎓</div>
                  <div className="font-semibold text-slate-900">Siswa</div>
                  <div className="text-xs text-slate-600">
                    Belajar dengan AI adaptif
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "teacher" })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === "teacher"
                      ? "border-[#8b5cf6] bg-purple-50 shadow-md"
                      : "border-slate-300 hover:border-[#8b5cf6]"
                  }`}
                >
                  <div className="text-3xl mb-2">👨‍🏫</div>
                  <div className="font-semibold text-slate-900">Guru</div>
                  <div className="text-xs text-slate-600">
                    Upload materi & dashboard
                  </div>
                </button>
              </div>
            </div>

            {/* Nama */}
            <div>
              <label
                htmlFor="nama"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Nama Lengkap
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] sm:text-sm placeholder-slate-400 transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Konfirmasi Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="block w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] sm:text-sm placeholder-slate-400 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Student-specific fields */}
            {formData.role === "student" && (
              <div className="bg-purple-50 rounded-xl p-5 border border-purple-100 space-y-4">
                <div className="flex items-start gap-2">
                  <span className="material-icons text-[#8b5cf6] text-lg mt-0.5">
                    info
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">
                      Profil Belajar (Opsional)
                    </h3>
                    <p className="text-xs text-slate-600">
                      Anda dapat mengisi ini sekarang atau nanti di halaman
                      profil
                    </p>
                  </div>
                </div>

                {/* Gaya Belajar */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Gaya Belajar
                  </label>
                  <select
                    name="gaya_belajar"
                    value={formData.gaya_belajar}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] sm:text-sm transition-colors"
                  >
                    <option value="">Isi nanti</option>
                    <option value="visual">👁️ Visual</option>
                    <option value="auditori">👂 Auditori</option>
                    <option value="kinestetik">✋ Kinestetik</option>
                  </select>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] sm:text-sm transition-colors"
                  >
                    <option value="">Isi nanti</option>
                    <option value="pemula">🌱 Pemula</option>
                    <option value="menengah">🚀 Menengah</option>
                    <option value="mahir">⭐ Mahir</option>
                  </select>
                </div>
              </div>
            )}

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
                  "Daftar"
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Sudah punya akun?{" "}
              <Link
                to="/login"
                className="font-medium text-[#8b5cf6] hover:text-[#7c3aed] hover:underline transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
