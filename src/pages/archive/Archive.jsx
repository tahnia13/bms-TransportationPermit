import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  FileText,
  FolderOpen,
  Download,
  Upload,
  FileCheck,
  ShieldCheck,
  Paperclip,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  File,
} from "lucide-react";
import { api } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../components/Toast";

const categories = [
  "All",
  "Permit",
  "Vehicle",
  "Driver",
  "Safety & Inspection",
  "Other",
];

export default function Archive() {
  const toast = useToast();
  const location = useLocation();
  const [archives, setArchives] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [cardMode, setCardMode] = useState(null); // 'view' | 'edit' | 'add' | null
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [form, setForm] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Role detection
  // User session: Eksklusif Portal Administrator
  const [currentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("transportation_user");
      const parsed = saved ? JSON.parse(saved) : null;
      return {
        username: parsed?.username || "Administrator",
        role: "Transportation Admin",
      };
    } catch {
      return { username: "Administrator", role: "Transportation Admin" };
    }
  });

  const isAdmin = true;

  const loadArchives = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.getArchives();
      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      const mapped = data.map((a) => ({
        id: a.id,
        databaseId: a.id,
        archiveId: `AR-${String(a.id).padStart(3, "0")}`,
        documentNumber: a.document_number || `DOC-${a.id}`,
        title: a.title || "Dokumen Transportasi",
        category: a.category || "Permit",
        uploadedBy: a.uploaded_by || "Administrator",
        date: a.archive_date || a.created_at || "",
        status: a.status || "Active",
        description: a.description || "",
        filePath: a.file_path || null,
        fileName: a.file_name || null,
        fileSize: a.file_size || null,
        fileType: a.file_type || null,
        fileUrl: a.file_url || null,
      }));

      setArchives(mapped);
    } catch (err) {
      console.error("Failed to load archive:", err);
      setError(err?.message || "Gagal mengambil data arsip digital.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchives();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "create") {
      handleAdd();
    }
  }, [location.search]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Berkas Teks";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // KPI Statistics
  const stats = useMemo(() => {
    const total = archives.length;
    let verified = 0;
    let permits = 0;
    let vehicles = 0;
    let physicalFiles = 0;

    archives.forEach((a) => {
      if (String(a.status).toLowerCase() === "active") verified++;
      const cat = String(a.category).toLowerCase();
      if (cat.includes("permit")) permits++;
      else if (cat.includes("vehicle") || cat.includes("kendaraan")) vehicles++;
      if (a.filePath) physicalFiles++;
    });

    return { total, verified, permits, vehicles, physicalFiles };
  }, [archives]);

  // Filtered archives
  const filteredArchives = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return archives.filter((a) => {
      if (categoryFilter !== "All") {
        if (!a.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
          return false;
        }
      }

      if (!keyword) return true;

      return (
        a.archiveId.toLowerCase().includes(keyword) ||
        a.documentNumber.toLowerCase().includes(keyword) ||
        a.title.toLowerCase().includes(keyword) ||
        a.category.toLowerCase().includes(keyword) ||
        a.uploadedBy.toLowerCase().includes(keyword) ||
        a.description.toLowerCase().includes(keyword) ||
        (a.fileName && a.fileName.toLowerCase().includes(keyword))
      );
    });
  }, [archives, search, categoryFilter]);

  const handleAdd = () => {
    setSelectedArchive(null);
    setForm({
      id: null,
      documentNumber: `DOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title: "",
      category: "Permit",
      uploadedBy: currentUser.username || "Administrator",
      date: new Date().toISOString().substring(0, 10),
      status: "Active",
      description: "",
    });
    setSelectedFile(null);
    setUploadedFileName("");
    setCardMode("add");
  };

  const handleView = (a) => {
    setSelectedArchive(a);
    setCardMode("view");
  };

  const handleEdit = (a) => {
    setSelectedArchive(a);
    setForm({
      id: a.id,
      documentNumber: a.documentNumber,
      title: a.title,
      category: a.category,
      uploadedBy: a.uploadedBy,
      date: a.date ? String(a.date).substring(0, 10) : "",
      status: a.status,
      description: a.description,
    });
    setSelectedFile(null);
    setUploadedFileName(a.fileName || "");
    setCardMode("edit");
  };

  const handleDelete = async (a) => {
    if (!isAdmin) {
      toast.warning("Akses Ditolak: Hanya Administrator yang berhak menghapus berkas arsip.");
      return;
    }

    if (!window.confirm(`Hapus berkas arsip fisik & data ${a.documentNumber}?`)) return;

    try {
      await api.deleteArchive(a.databaseId);
      setArchives((prev) => prev.filter((item) => item.databaseId !== a.databaseId));
      if (selectedArchive?.databaseId === a.databaseId) handleClose();
      toast.success("Berkas arsip fisik berhasil dihapus.");
    } catch (err) {
      console.error("Delete archive error:", err);
      toast.error(err.message || "Gagal menghapus berkas arsip.");
    }
  };

  const handleDownloadFile = async (a) => {
    try {
      await api.downloadArchive(a.databaseId, a.fileName || `${a.documentNumber}.pdf`);
    } catch (err) {
      console.error("Download error:", err);
      toast.error(err?.message || "Berkas fisik belum diunggah atau tidak ditemukan di penyimpanan server.");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadedFileName(file.name);
      if (!form.title) {
        setForm((prev) => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, ""),
        }));
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("document_number", form.documentNumber.trim());
      formData.append("title", form.title.trim());
      formData.append("category", form.category);
      formData.append("uploaded_by", form.uploadedBy.trim() || currentUser.username);
      if (form.date) formData.append("archive_date", form.date);
      formData.append("status", form.status);
      if (form.description) formData.append("description", form.description.trim());
      if (selectedFile) formData.append("file", selectedFile);
      formData.append("current_user_role", currentUser.role);

      if (cardMode === "add") {
        const res = await api.uploadArchive(formData);
        const created = res.data || {};
        const mapped = {
          id: created.id,
          databaseId: created.id,
          archiveId: `AR-${String(created.id).padStart(3, "0")}`,
          documentNumber: created.document_number,
          title: created.title,
          category: created.category,
          uploadedBy: created.uploaded_by || "Administrator",
          date: created.archive_date || new Date().toISOString(),
          status: created.status || "Active",
          description: created.description || "",
          filePath: created.file_path,
          fileName: created.file_name,
          fileSize: created.file_size,
          fileType: created.file_type,
          fileUrl: created.file_url,
        };
        setArchives((prev) => [mapped, ...prev]);
        toast.success("Dokumen fisik berhasil diunggah ke repositori arsip.");
      } else {
        const res = await api.updateArchiveWithFile(form.id, formData);
        const updated = res.data || {};
        setArchives((prev) =>
          prev.map((a) =>
            a.id === form.id
              ? {
                  ...a,
                  ...form,
                  fileName: updated.file_name || a.fileName,
                  fileSize: updated.file_size || a.fileSize,
                  filePath: updated.file_path || a.filePath,
                }
              : a
          )
        );
        toast.success("Data arsip berhasil diperbarui.");
      }
      handleClose();
    } catch (err) {
      console.error("Save archive error:", err);
      toast.error(err.message || "Gagal menyimpan berkas arsip.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedArchive(null);
    setCardMode(null);
    setForm(null);
    setSelectedFile(null);
    setUploadedFileName("");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight">
            Arsip Digital Dokumen Fisik
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Penyimpanan terpusat untuk unggah & unduh berkas fisik surat jalan, sertifikat uji kelayakan, dan K3.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D8FF00] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#12372A] shadow-md shadow-[#D8FF00]/20 transition hover:bg-[#c9ee00] hover:scale-[1.02] active:scale-[0.98]"
        >
          <Upload size={16} strokeWidth={2.5} />
          <span>Unggah Berkas Fisik Baru</span>
        </button>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Total Berkas Terdaftar
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-[#12372A]">{stats.total}</h3>
            <span className="text-xs text-gray-400">Arsip</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Berkas Fisik Tersimpan
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-emerald-800">{stats.physicalFiles}</h3>
            <span className="text-xs text-emerald-600 font-semibold">Tersimpan di Server</span>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
            Dokumen Permit
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-purple-800">{stats.permits}</h3>
            <span className="text-xs text-purple-600 font-semibold">Surat Izin</span>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
            Armada & Rig Safety
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-sky-800">{stats.vehicles}</h3>
            <span className="text-xs text-sky-600 font-semibold">Sertifikasi</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* CATEGORY PILLS */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoryFilter(c)}
                className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition ${
                  categoryFilter === c
                    ? "bg-[#12372A] text-[#D8FF00] shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {c === "All" ? "Semua Berkas" : c}
              </button>
            ))}
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full sm:max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor dokumen, judul berkas, nama file..."
              className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] py-2.5 pl-10 pr-9 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ARCHIVE TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-[#F5F7F6]/80 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-4 pl-6">Dokumen & ID</th>
                <th className="py-4">Judul Berkas</th>
                <th className="py-4">Kategori</th>
                <th className="py-4">Berkas Fisik</th>
                <th className="py-4">Tanggal Arsip</th>
                <th className="py-4">Pengunggah</th>
                <th className="py-4">Status</th>
                <th className="py-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#D8FF00] border-t-[#12372A]" />
                      <p className="font-semibold text-[#12372A]">Memuat arsip digital...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredArchives.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-gray-400">
                    <FolderOpen size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-600">Tidak ada berkas arsip yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredArchives.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* ID */}
                    <td className="py-4 pl-6">
                      <span className="font-mono font-bold text-[#12372A] block">
                        {a.documentNumber}
                      </span>
                      <span className="text-[10px] text-gray-400">{a.archiveId}</span>
                    </td>

                    {/* TITLE */}
                    <td className="py-4">
                      <p className="font-bold text-gray-800">{a.title}</p>
                      {a.description && (
                        <p className="text-[10px] text-gray-400 truncate max-w-xs">{a.description}</p>
                      )}
                    </td>

                    {/* CATEGORY */}
                    <td className="py-4">
                      <span className="rounded-2xl bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-700">
                        {a.category}
                      </span>
                    </td>

                    {/* PHYSICAL FILE */}
                    <td className="py-4">
                      {a.filePath ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                            <Paperclip size={13} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 max-w-[120px] truncate" title={a.fileName}>
                              {a.fileName || "Berkas Fisik"}
                            </p>
                            <p className="text-[9px] text-gray-400">{formatFileSize(a.fileSize)}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">Belum diunggah</span>
                      )}
                    </td>

                    {/* DATE */}
                    <td className="py-4 text-gray-500 font-medium">
                      {formatDate(a.date)}
                    </td>

                    {/* UPLOADED BY */}
                    <td className="py-4 font-medium text-gray-700">
                      {a.uploadedBy}
                    </td>

                    {/* STATUS */}
                    <td className="py-4">
                      <StatusBadge status={a.status} size="sm" />
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* DOWNLOAD BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(a)}
                          title="Unduh Berkas Fisik"
                          className="flex h-8 w-8 items-center justify-center rounded-2xl text-emerald-700 hover:bg-emerald-50 transition"
                        >
                          <Download size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleView(a)}
                          title="Lihat Berkas"
                          className="flex h-8 w-8 items-center justify-center rounded-2xl text-gray-500 hover:bg-gray-100 hover:text-[#12372A]"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(a)}
                          title="Edit Arsip"
                          className="flex h-8 w-8 items-center justify-center rounded-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Pencil size={14} />
                        </button>

                        {/* DELETE BUTTON (ADMIN ONLY) */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(a)}
                            title="Hapus Arsip"
                            className="flex h-8 w-8 items-center justify-center rounded-2xl text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      {selectedArchive && cardMode === "view" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={handleClose}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00]">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Detail Berkas Arsip Digital
                  </h3>
                  <p className="text-xs text-gray-400">{selectedArchive.documentNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="rounded-2xl bg-[#F5F7F6] p-4 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Judul Berkas</span>
                  <StatusBadge status={selectedArchive.status} size="sm" />
                </div>
                <h4 className="text-sm font-bold text-[#12372A]">{selectedArchive.title}</h4>
                <p className="text-gray-500 text-[11px]">{selectedArchive.category}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Pengunggah</span>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedArchive.uploadedBy}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Tanggal Arsip</span>
                  <p className="font-bold text-gray-800 mt-0.5">{formatDate(selectedArchive.date)}</p>
                </div>
              </div>

              {selectedArchive.description && (
                <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Catatan / Deskripsi</span>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{selectedArchive.description}</p>
                </div>
              )}

              {/* PHYSICAL ATTACHMENT CARD */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileCheck size={22} className="text-emerald-700" />
                  <div>
                    <p className="font-bold text-gray-900 text-xs">
                      {selectedArchive.fileName || "Dokumen Fisik Terenkripsi"}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {selectedArchive.fileSize ? formatFileSize(selectedArchive.fileSize) : "Tersimpan di repositori PT Besmindo"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadFile(selectedArchive)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-emerald-300 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-50 transition"
                >
                  <Download size={13} /> Unduh Berkas
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleEdit(selectedArchive)}
                className="rounded-2xl bg-[#D8FF00] px-4 py-2 text-xs font-bold text-[#12372A] hover:bg-[#c9ee00]"
              >
                Ubah Arsip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL (WITH PHYSICAL FILE DROPPER) */}
      {form && (cardMode === "add" || cardMode === "edit") && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={handleClose}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {cardMode === "add" ? "Unggah Berkas Fisik Baru" : "Edit Berkas Arsip"}
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nomor Dokumen</label>
                  <input
                    type="text"
                    required
                    name="documentNumber"
                    value={form.documentNumber}
                    onChange={handleFormChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Kategori</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                  >
                    {categories.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Judul Dokumen</label>
                <input
                  type="text"
                  required
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Contoh: Sertifikat Kelayakan Truk DT-04"
                  className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                />
              </div>

              {/* REAL PHYSICAL FILE INPUT */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Pilih Berkas Fisik (PDF / JPG / PNG / DOCX)</label>
                <div className="relative rounded-2xl border-2 border-dashed border-gray-300 p-4 text-center hover:border-[#12372A] transition bg-gray-50/50">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                    <Upload size={20} className="text-[#12372A]" />
                    <p className="font-semibold text-gray-700">
                      {uploadedFileName ? uploadedFileName : "Klik atau seret file fisik ke sini"}
                    </p>
                    <p className="text-[10px] text-gray-400">Maksimal 25MB (PDF, Dokumen Resmi, Foto Scan)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tanggal Terbit / Arsip</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleFormChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status Dokumen</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                  >
                    <option value="Active">Active (Berlaku)</option>
                    <option value="Pending">Pending Verifikasi</option>
                    <option value="Archived">Archived (Kedaluwarsa)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Keterangan kondisi fisik arsip..."
                  className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] p-2.5 text-xs outline-none focus:border-[#12372A] focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-[#12372A] px-5 py-2 text-xs font-bold text-[#D8FF00] shadow-md hover:bg-[#0c261d] transition disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Berkas Arsip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}