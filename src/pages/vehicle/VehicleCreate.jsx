import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
} from "lucide-react";
import { api } from "../../services/api";

const rigOptions = [
  "02", "03", "03A", "5", "6", "7", "8", "10", "11",
  "15", "16", "17", "18", "19", "20", "21",
];

const categorySuggestions = [
  "Light Vehicle (LV 4x4)",
  "Heavy Duty Truck",
  "Prime Mover / Trailer",
  "Crane Truck",
  "Passenger Bus",
  "Fuel Tanker",
];

export default function VehicleCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    plateNumber: "",
    type: "",
    category: "",
    year: new Date().getFullYear(),
    rig: "",
    status: "Active",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        plate_number: formData.plateNumber.trim().toUpperCase(),
        type: formData.type.trim(),
        category: formData.category.trim() || null,
        year: formData.year ? Number(formData.year) : null,
        rig: formData.rig ? formData.rig.trim() : null,
        status: formData.status,
        description: formData.description.trim() || null,
      };

      await api.createVehicle(payload);
      alert("Kendaraan berhasil didaftarkan ke sistem armada.");
      navigate("/vehicles");
    } catch (err) {
      console.error("Create vehicle error:", err);
      setErrorMessage(err.message || "Gagal menambahkan kendaraan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* BREADCRUMB & HEADER */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2">
          <Link to="/vehicles" className="hover:text-[#12372A]">Armada Kendaraan</Link>
          <span>/</span>
          <span className="text-[#12372A]">Registrasi Kendaraan Baru</span>
        </div>

        <div className="flex items-center gap-3.5">
          <Link
            to="/vehicles"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 shadow-xs transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#12372A] tracking-tight">
              Pendaftaran Armada Kendaraan Baru
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Registrasikan nomor plat polisi, jenis model, dan penetapan rig kerja.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {errorMessage}
        </div>
      )}

      {/* FORM CARD */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-8 shadow-xs space-y-6"
      >
        {/* LIVE PREVIEW OF PLATE NUMBER */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              Pratinjau Plat Nomor Armada
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              Standar format plat nomor operasional PT Besmindo Makmur
            </p>
          </div>

          <div className="inline-flex items-center gap-2.5 rounded-xl bg-gray-950 px-4 py-2 text-base font-black tracking-widest text-white border-2 border-gray-700 shadow-md">
            <span className="h-2 w-2 rounded-full bg-[#D8FF00] animate-pulse" />
            <span>{formData.plateNumber || "BM 0000 XX"}</span>
          </div>
        </div>

        {/* INPUT GRID */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* PLATE NUMBER */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Nomor Plat Polisi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleChange}
              required
              placeholder="Contoh: BM 8421 AR"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-gray-800 uppercase outline-none focus:border-[#12372A] focus:bg-white transition"
            />
          </div>

          {/* TYPE / MODEL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Tipe / Model Kendaraan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              placeholder="Contoh: Toyota Hilux 4x4 D-Cab"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
            />
          </div>

          {/* CATEGORY WITH QUICK SUGGESTIONS */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Kategori Kendaraan
            </label>
            <input
              list="category-suggestions"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Pilih atau ketik kategori"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
            />
            <datalist id="category-suggestions">
              {categorySuggestions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* RIG ASSIGNMENT */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Alokasi Penugasan Rig
            </label>
            <select
              name="rig"
              value={formData.rig}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
            >
              <option value="">Pool / Standby (Belum dialokasikan)</option>
              {rigOptions.map((r) => (
                <option key={r} value={r}>Rig #{r}</option>
              ))}
            </select>
          </div>

          {/* YEAR */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Tahun Pembuatan
            </label>
            <input
              type="number"
              name="year"
              min="1995"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Status Awal
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
            >
              <option value="Active">Active (Siap Operasional)</option>
              <option value="Maintenance">Maintenance (Dalam Perawatan)</option>
              <option value="Inactive">Inactive (Non-Aktif / Standby)</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Catatan Spesifikasi / Riwayat Armada
            </label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nomor rangka, riwayat servis, atau kelengkapan perlengkapan rig..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
            />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3">
          <Link
            to="/vehicles"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D8FF00] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#12372A] hover:bg-[#c9ee00] transition shadow-md shadow-[#D8FF00]/15 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{loading ? "Menyimpan..." : "Daftarkan Kendaraan"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}