import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  ArrowLeft,
  Save,
  CreditCard,
  Phone,
  CalendarDays,
  HardHat,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../services/api";
import { useToast } from "../../components/Toast";

const rigOptions = [
  "02", "03", "03A", "5", "6", "7", "8", "10", "11",
  "15", "16", "17", "18", "19", "20", "21",
];

export default function DriverCreate() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    license_number: "",
    phone: "",
    license_type: "SIM BII Umum",
    expiry_date: "",
    training_date: "",
    rig: "",
    status: "Active",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Nama pengemudi wajib diisi.");
      return;
    }
    if (!formData.license_number.trim()) {
      setError("Nomor SIM wajib diisi.");
      return;
    }
    if (!formData.expiry_date) {
      setError("Masa berlaku SIM wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      await api.createDriver(formData);
      toast.success("Pengemudi berhasil didaftarkan.");
      navigate("/drivers");
    } catch (err) {
      console.error("Create driver error:", err);
      toast.error(err.message || "Gagal mendaftarkan pengemudi.");
      setError(err.message || "Gagal mendaftarkan pengemudi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER & BREADCRUMB */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2">
          <Link to="/drivers" className="hover:text-[#12372A]">Direktori Pengemudi</Link>
          <span>/</span>
          <span className="text-[#12372A]">Daftarkan Pengemudi Baru</span>
        </div>

        <div className="flex items-center gap-3.5">
          <Link
            to="/drivers"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 shadow-xs transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#12372A] tracking-tight">
              Pendaftaran Pengemudi & Safety Passport
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Registrasi identitas pengemudi resmi, validasi SIM, sertifikasi K3, dan alokasi rig.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* FORM CARD */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-8 shadow-xs space-y-6"
      >
        {/* SECTION 1: PERSONAL */}
        <div>
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <UserRound size={16} className="text-[#12372A]" />
            <h2 className="text-sm font-bold text-gray-900">
              1. Identitas Pribadi Pengemudi
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nama Lengkap Pengemudi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Contoh: Ahmad Fauzi"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Contoh: 0812-3456-7890"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: LICENSE */}
        <div>
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <CreditCard size={16} className="text-[#12372A]" />
            <h2 className="text-sm font-bold text-gray-900">
              2. Lisensi Mengemudi (SIM) & Validitas
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nomor SIM <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                required
                placeholder="16 Digit Nomor SIM"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Golongan Lisensi
              </label>
              <select
                name="license_type"
                value={formData.license_type}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              >
                <option value="SIM BII Umum">SIM BII Umum (Truk Gandeng / Rig)</option>
                <option value="SIM BI Umum">SIM BI Umum (Bus / Truk Ringan)</option>
                <option value="SIM BII">SIM BII</option>
                <option value="SIM BI">SIM BI</option>
                <option value="SIM A">SIM A</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Masa Berlaku SIM <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SAFETY & RIG */}
        <div>
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <HardHat size={16} className="text-[#12372A]" />
            <h2 className="text-sm font-bold text-gray-900">
              3. Sertifikasi K3 & Alokasi Penugasan
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Tanggal Terakhir Safety Training
              </label>
              <input
                type="date"
                name="training_date"
                value={formData.training_date}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

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
                <option value="">Pool / Standby (Belum ditentukan)</option>
                {rigOptions.map((r) => (
                  <option key={r} value={r}>Rig #{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Status Pengemudi
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              >
                <option value="Active">Active (Siap Tugas)</option>
                <option value="Inactive">Inactive (Cuti / Non-Aktif)</option>
              </select>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3">
          <Link
            to="/drivers"
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
            <span>{loading ? "Mendaftarkan..." : "Daftarkan Pengemudi"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}