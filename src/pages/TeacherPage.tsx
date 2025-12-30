import { useState, useEffect } from "react";
import type { TeacherMaterial } from "../types";
import api from "../services/api";

function TeacherPage() {
  const [materials, setMaterials] = useState<TeacherMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    judul: string;
    topik:
      | "kubus"
      | "balok"
      | "bola"
      | "tabung"
      | "kerucut"
      | "limas"
      | "prisma";
    konten: string;
    level: "pemula" | "menengah" | "mahir";
    created_by: string;
  }>({
    judul: "",
    topik: "kubus",
    konten: "",
    level: "pemula",
    created_by: "Pak Budi",
  });

  // Load materials on mount
  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await api.getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error("Failed to load materials:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isEditing && editingId) {
        // Update existing material
        await api.updateMaterial(editingId, formData);
        setMessage("✅ Materi berhasil diupdate!");
      } else {
        // Create new material
        await api.createMaterial(formData);
        setMessage("✅ Materi berhasil diupload!");
      }

      // Reset form
      setFormData({
        judul: "",
        topik: "kubus",
        konten: "",
        level: "pemula",
        created_by: "Pak Budi",
      });
      setIsEditing(false);
      setEditingId(null);

      // Reload materials
      loadMaterials();

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Gagal menyimpan materi: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material: TeacherMaterial) => {
    setFormData({
      judul: material.judul,
      topik: material.topik,
      konten: material.konten,
      level: material.level,
      created_by: material.created_by,
    });
    setIsEditing(true);
    setEditingId(material.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus materi ini?")) return;

    try {
      await api.deleteMaterial(id);
      setMessage("✅ Materi berhasil dihapus!");
      loadMaterials();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Gagal menghapus materi: " + error);
    }
  };

  const handleCancel = () => {
    setFormData({
      judul: "",
      topik: "kubus",
      konten: "",
      level: "pemula",
      created_by: "Pak Budi",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            👨‍🏫 Portal Guru
          </h1>
          <p className="text-xl text-gray-600">
            Upload dan Kelola Materi Pembelajaran
          </p>
          <div className="mt-4 inline-block bg-yellow-100 border-2 border-yellow-400 rounded-lg px-6 py-3">
            <p className="text-sm text-yellow-800 font-semibold">
              ⚠️ CRITICAL: Materi yang Anda upload adalah SUMBER PENGETAHUAN
              UTAMA sistem AI
            </p>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("✅")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {isEditing ? "📝 Edit Materi" : "➕ Upload Materi Baru"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Judul */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Judul Materi *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                placeholder="Contoh: Pengenalan Kubus - Dasar"
                value={formData.judul}
                onChange={(e) =>
                  setFormData({ ...formData, judul: e.target.value })
                }
              />
            </div>

            {/* Topik dan Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Topik *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  value={formData.topik}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      topik: e.target.value as typeof formData.topik,
                    })
                  }
                >
                  <option value="kubus">🎲 Kubus</option>
                  <option value="balok">📦 Balok</option>
                  <option value="bola">⚽ Bola</option>
                  <option value="tabung">🥫 Tabung</option>
                  <option value="kerucut">🍦 Kerucut</option>
                  <option value="limas">🔺 Limas</option>
                  <option value="prisma">🔷 Prisma</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Level *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      level: e.target.value as typeof formData.level,
                    })
                  }
                >
                  <option value="pemula">🌱 Pemula</option>
                  <option value="menengah">🌿 Menengah</option>
                  <option value="mahir">🌳 Mahir</option>
                </select>
              </div>
            </div>

            {/* Nama Guru */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Guru/Pembuat
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                placeholder="Nama Anda"
                value={formData.created_by}
                onChange={(e) =>
                  setFormData({ ...formData, created_by: e.target.value })
                }
              />
            </div>

            {/* Konten */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Konten Materi * (Markdown supported)
              </label>
              <textarea
                required
                rows={15}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none font-mono text-sm"
                placeholder={`Tuliskan materi lengkap di sini...

Contoh:
KUBUS adalah bangun ruang...

CIRI-CIRI:
1. Memiliki 6 sisi...
2. Memiliki 12 rusuk...

RUMUS:
- Volume = s³
- Luas = 6s²

CONTOH SOAL:
...`}
                value={formData.konten}
                onChange={(e) =>
                  setFormData({ ...formData, konten: e.target.value })
                }
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Gunakan format yang jelas dengan heading, list, dan
                contoh soal
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading
                  ? "⏳ Menyimpan..."
                  : isEditing
                  ? "💾 Update Materi"
                  : "📤 Upload Materi"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                >
                  ❌ Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Materials List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            📚 Materi yang Sudah Diupload ({materials.length})
          </h2>

          {materials.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Belum ada materi yang diupload.</p>
              <p className="text-sm mt-2">
                Silakan upload materi pertama Anda! 🚀
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {material.judul}
                      </h3>
                      <div className="flex gap-3 text-sm">
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold">
                          {material.topik}
                        </span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                          {material.level}
                        </span>
                        <span className="text-gray-600">
                          👤 {material.created_by}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(material)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-3">
                      {material.konten}
                    </p>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Dibuat:{" "}
                    {new Date(material.created_at).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherPage;
