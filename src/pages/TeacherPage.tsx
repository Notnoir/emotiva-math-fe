import { useState, useEffect } from "react";
import type { TeacherMaterial } from "../types";
import api from "../services/api";

function TeacherPage() {
  const [materials, setMaterials] = useState<TeacherMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMaterial, setPreviewMaterial] =
    useState<TeacherMaterial | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

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
    level: "pemula" | "menengah" | "mahir";
    created_by: string;
  }>({
    judul: "",
    topik: "kubus",
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

  const validateAndSetFile = (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "❌ Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, PPT, PPTX, atau TXT"
      );
      return false;
    }

    if (file.size > 16 * 1024 * 1024) {
      setMessage("❌ Ukuran file terlalu besar. Maksimal 16MB");
      return false;
    }

    setSelectedFile(file);
    setMessage("");
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      validateAndSetFile(files[0]);
    }
  };

  const handlePreviewFile = () => {
    if (!selectedFile) {
      setMessage("❌ Silakan pilih file terlebih dahulu");
      return;
    }

    const reader = new FileReader();

    if (selectedFile.type === "text/plain") {
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content);
        setShowPreview(true);
      };
      reader.readAsText(selectedFile);
    } else if (selectedFile.type === "application/pdf") {
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setFileContent(base64);
        setShowPreview(true);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For Word/PowerPoint files, show download option
      setFileContent(null);
      setShowPreview(true);
    }
  };

  const handlePreviewMaterial = async (material: TeacherMaterial) => {
    setPreviewMaterial(material);
    setFileContent(null);
    setShowPreview(true);

    // If material has file, try to load its content
    if (material.file_name && material.file_type) {
      setLoadingContent(true);
      try {
        if (material.file_type === "txt") {
          // For text files, download and read content
          const blob = await api.downloadMaterial(material.id);
          const text = await blob.text();
          setFileContent(text);
        } else if (material.file_type === "pdf") {
          // For PDF, download as blob and convert to data URL
          const blob = await api.downloadMaterial(material.id);
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          setFileContent(base64);
        }
        // For doc/ppt files, we'll just show download button
      } catch (error) {
        console.error("Failed to load file content:", error);
        setMessage("❌ Gagal memuat konten file: " + error);
      } finally {
        setLoadingContent(false);
      }
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewMaterial(null);
    setFileContent(null);
    setLoadingContent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setMessage("❌ Silakan pilih file materi");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", selectedFile);
      formDataToSend.append("judul", formData.judul);
      formDataToSend.append("topik", formData.topik);
      formDataToSend.append("level", formData.level);
      formDataToSend.append("created_by", formData.created_by);

      await api.uploadMaterial(formDataToSend);
      setMessage("✅ Materi berhasil diupload!");

      // Reset form
      setFormData({
        judul: "",
        topik: "kubus",
        level: "pemula",
        created_by: "Pak Budi",
      });
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

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

  const handleDownload = async (id: number, fileName: string) => {
    try {
      const blob = await api.downloadMaterial(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setMessage("✅ File berhasil didownload");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Gagal download file: " + error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            👨‍🏫 Portal Guru
          </h1>
          <p className="text-gray-600">Upload dan Kelola Materi Pembelajaran</p>
          <div className="mt-4 inline-block bg-purple-100 border border-purple-300 rounded-xl px-5 py-2.5">
            <p className="text-sm text-purple-800 font-medium">
              💡 Materi yang Anda upload adalah sumber pengetahuan utama sistem
              AI
            </p>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-md ${
              message.includes("✅")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <p className="font-medium">{message}</p>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            ➕ Upload Materi Baru
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
                placeholder="Nama Anda"
                value={formData.created_by}
                onChange={(e) =>
                  setFormData({ ...formData, created_by: e.target.value })
                }
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                File Materi * (PDF, DOC, DOCX, PPT, PPTX, TXT)
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-all ${
                  isDragging
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-300 hover:border-purple-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <label
                      htmlFor="file-input"
                      className="relative cursor-pointer rounded-md font-semibold text-purple-600 hover:text-purple-500"
                    >
                      <span>Klik untuk upload</span>
                      <input
                        id="file-input"
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <span className="pl-1">atau drag & drop file di sini</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, PPT, PPTX, TXT hingga 16MB
                  </p>
                </div>
                {selectedFile && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      ✅ File terpilih:{" "}
                      <span className="font-semibold">{selectedFile.name}</span>
                      <span className="ml-2 text-xs">
                        ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePreviewFile}
                disabled={!selectedFile}
                className="px-8 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                👁️ Preview File
              </button>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "⏳ Menyimpan..." : "📤 Upload Materi"}
              </button>
            </div>
          </form>
        </div>

        {/* Materials List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            📚 Materi yang Sudah Diupload ({materials.length})
          </h2>

          {materials.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-lg font-medium text-gray-600">
                Belum ada materi yang diupload
              </p>
              <p className="text-sm mt-2">
                Silakan upload materi pertama Anda!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all"
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
                        onClick={() => handlePreviewMaterial(material)}
                        className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors font-medium"
                      >
                        👁️ Review
                      </button>
                      {material.file_name && (
                        <button
                          onClick={() =>
                            handleDownload(material.id, material.file_name!)
                          }
                          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                          📥 Download
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-100">
                    {material.file_name ? (
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">
                          {material.file_type === "pdf"
                            ? "📄"
                            : material.file_type === "doc" ||
                              material.file_type === "docx"
                            ? "📝"
                            : material.file_type === "ppt" ||
                              material.file_type === "pptx"
                            ? "📊"
                            : "📋"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">
                            {material.file_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Tipe: {material.file_type?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-3">
                        {material.konten || "Tidak ada konten"}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-gray-400">
                    Dibuat:{" "}
                    {new Date(material.created_at).toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {previewMaterial ? "📖 Review Materi" : "👁️ Preview File"}
                </h2>
                <button
                  onClick={closePreview}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1">
                {/* For uploaded file preview */}
                {!previewMaterial && selectedFile && (
                  <div>
                    <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        📎 {selectedFile.name}
                      </h3>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>
                          📏 Ukuran: {(selectedFile.size / 1024).toFixed(2)} KB
                        </span>
                        <span>
                          📋 Tipe:{" "}
                          {selectedFile.type.split("/")[1]?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* File Content Preview */}
                    <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                      {selectedFile.type === "text/plain" && fileContent ? (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-4 text-lg">
                            📝 Konten File:
                          </h4>
                          <div className="bg-white p-6 rounded-lg border border-gray-300 max-h-[500px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
                              {fileContent}
                            </pre>
                          </div>
                        </div>
                      ) : selectedFile.type === "application/pdf" &&
                        fileContent ? (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-4 text-lg">
                            📄 PDF Preview:
                          </h4>
                          <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                            <iframe
                              src={fileContent}
                              className="w-full h-[500px]"
                              title="PDF Preview"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">
                            {selectedFile.type.includes("word")
                              ? "📝"
                              : selectedFile.type.includes("powerpoint") ||
                                selectedFile.type.includes("presentation")
                              ? "📊"
                              : "📄"}
                          </div>
                          <p className="text-gray-700 font-semibold mb-2">
                            Preview tidak tersedia untuk tipe file ini
                          </p>
                          <p className="text-sm text-gray-500">
                            File siap untuk diupload
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* For material preview */}
                {previewMaterial && (
                  <div>
                    {/* Material Info */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        {previewMaterial.judul}
                      </h3>
                      <div className="flex gap-3 mb-4">
                        <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-semibold text-sm">
                          📚 {previewMaterial.topik}
                        </span>
                        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm">
                          📊 {previewMaterial.level}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-semibold text-sm">
                          👤 {previewMaterial.created_by}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Dibuat:{" "}
                        {new Date(previewMaterial.created_at).toLocaleString(
                          "id-ID"
                        )}
                      </p>
                    </div>

                    {/* File Content or Text Content */}
                    <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                      {loadingContent ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Memuat konten file...</p>
                        </div>
                      ) : previewMaterial.file_name ? (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-4 text-lg">
                            📎 File: {previewMaterial.file_name}
                          </h4>

                          {/* Show content based on file type */}
                          {previewMaterial.file_type === "txt" &&
                          fileContent ? (
                            <div className="bg-white p-6 rounded-lg border border-gray-300 max-h-[500px] overflow-y-auto">
                              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
                                {fileContent}
                              </pre>
                            </div>
                          ) : previewMaterial.file_type === "pdf" &&
                            fileContent ? (
                            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                              <iframe
                                src={fileContent}
                                className="w-full h-[500px]"
                                title="PDF Preview"
                              />
                            </div>
                          ) : (
                            <div className="bg-white p-6 rounded-lg border border-gray-300">
                              <div className="text-center py-8">
                                <div className="text-6xl mb-4">
                                  {previewMaterial.file_type === "doc" ||
                                  previewMaterial.file_type === "docx"
                                    ? "📝"
                                    : previewMaterial.file_type === "ppt" ||
                                      previewMaterial.file_type === "pptx"
                                    ? "📊"
                                    : "📄"}
                                </div>
                                <p className="text-gray-700 font-semibold mb-2">
                                  Preview tidak tersedia untuk file{" "}
                                  {previewMaterial.file_type?.toUpperCase()}
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                  Silakan download file untuk melihat konten
                                  lengkap
                                </p>
                                <button
                                  onClick={() =>
                                    handleDownload(
                                      previewMaterial.id,
                                      previewMaterial.file_name!
                                    )
                                  }
                                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
                                >
                                  📥 Download File
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-4 text-lg">
                            📝 Konten Materi:
                          </h4>
                          <div className="bg-white p-6 rounded-lg border border-gray-300 max-h-[500px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                              {previewMaterial.konten || "Tidak ada konten"}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={closePreview}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Tutup
                </button>
                {previewMaterial?.file_name && (
                  <button
                    onClick={() => {
                      handleDownload(
                        previewMaterial.id,
                        previewMaterial.file_name!
                      );
                    }}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
                  >
                    📥 Download
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherPage;
