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
  HeartPulse,
  Mail,
  MapPin,
  Users,
} from "lucide-react";
import { api } from "../../services/api";
import { useToast } from "../../components/Toast";
import FormSelectWithCustom from "../../components/FormSelectWithCustom";
import FileUploadField from "../../components/FileUploadField";

const rigOptions = [
  "BMS 02", "BMS 03", "BMS 03A", "BMS 05", "BMS 06", "BMS 07", "BMS 08",
  "BMS 10", "BMS 11", "BMS 15", "BMS 16", "BMS 17", "BMS 18", "BMS 19",
  "BMS 20", "BMS 21", "SUPPORT", "POOL", "YARD"
];

const positionOptions = [
  "BUS DRIVER",
  "RIG-BUS DRIVER",
  "POOL DRIVER",
  "DRIVER GROUND ANCHOR",
  "FOCO OPERATOR",
  "VACUM OPERATOR",
  "TANDEM OPERATOR",
  "LOWBED OPERATOR",
  "DOZER OPERATOR",
  "CRANE OPERATOR",
  "FORKLIFT OPERATOR",
  "TRUCK PUSHER",
  "FOCO SWAMPER",
  "VACUM SWAMPER",
  "TANDEM SWAMPER",
  "LOWBED SWAMPER",
  "DOZER SWAMPER",
  "SWAMPER",
];

const licenseTypeOptions = [
  "SIM BII Umum",
  "SIM BI Umum",
  "SIM B2",
  "SIM B1",
  "SIM A",
  "SIO Crane & SIM BII",
  "SIO Forklift",
  "SIO Rigger",
];

const bloodTypeOptions = [
  "A", "B", "AB", "O", "A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"
];

const crewOptions = [
  "CREW A", "CREW B", "CREW C", "SUPPORT / NON-CREW", "HARIAN"
];

export default function DriverCreate() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    badge_number: "",
    position: "BUS DRIVER",
    license_number: "",
    license_type: "SIM BII Umum",
    nik_ktp: "",
    blood_type: "",
    phone: "",
    email: "",
    address: "",
    emergency_contact: "",
    expiry_date: "",
    training_date: "",
    certification: "Defensive Driving Course (DDC) & K3LL Migas",
    rig: "",
    crew: "CREW A",
    status: "Active",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // File upload untuk dokumen kualifikasi mengemudi (SIM/K3LL Passport)
  const [licenseFile, setLicenseFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Nama lengkap pengemudi wajib diisi.");
      return;
    }
    if (!formData.license_number.trim()) {
      setError("Nomor lisensi SIM / SIO wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        badge_number: formData.badge_number.trim() || null,
        position: formData.position.trim() || null,
        license_number: formData.license_number.trim(),
        license_type: formData.license_type.trim() || null,
        nik_ktp: formData.nik_ktp.trim() || null,
        blood_type: formData.blood_type.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        emergency_contact: formData.emergency_contact.trim() || null,
        expiry_date: formData.expiry_date || null,
        training_date: formData.training_date || null,
        certification: formData.certification.trim() || null,
        rig: formData.rig ? formData.rig.trim() : null,
        crew: formData.crew ? formData.crew.trim() : null,
        status: formData.status,
        description: formData.description.trim() || null,
      };

      // Jika ada file yang diupload, kirim sebagai multipart FormData
      if (licenseFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([key, val]) => {
          if (val !== null && val !== undefined) fd.append(key, String(val));
        });
        fd.append("license_document", licenseFile);
        await api.uploadDriver(fd);
      } else {
        await api.createDriver(payload);
      }
      toast.success("Personil pengemudi / operator berhasil didaftarkan.");
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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* HEADER & BREADCRUMB */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2">
          <Link to="/drivers" className="hover:text-[#12372A]">Direktori Pengemudi & Operator</Link>
          <span>/</span>
          <span className="text-[#12372A]">Daftarkan Personil Baru</span>
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
              Pendaftaran Driver & Operator Rig BMS
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Registrasi identitas resmi karyawan, badge ID, kualifikasi SIM/SIO, K3LL DDC, dan golongan darah.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* LIVE DRIVER BADGE PREVIEW */}
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/30 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00] font-black text-lg shadow-xs">
              {formData.name ? formData.name.substring(0, 2).toUpperCase() : "DR"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-gray-900">
                  {formData.name || "Nama Calon Pengemudi"}
                </span>
                {formData.badge_number && (
                  <span className="rounded-md bg-gray-900 px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                    BADGE: {formData.badge_number}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {formData.position || "Driver"} • {formData.rig ? `Penugasan ${formData.rig}` : "Pool / Standby"}
                {formData.blood_type ? ` • Goldar ${formData.blood_type}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
              {formData.license_type}
            </span>
          </div>
        </div>

        {/* SECTION 1: IDENTITAS & KEPEGAWAIAN */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#12372A]/5 text-[#12372A]">
              <UserRound size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Identitas Karyawan & Kepegawaian BMS</h2>
              <p className="text-[11px] text-gray-400">Data nomor badge, NIK KTP, jabatan, dan penetapan rig.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* NAMA LENGKAP */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nama Lengkap Karyawan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Contoh: AGAM AL ADAM"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            {/* BADGE NUMBER */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nomor Badge BMS (NIK Perusahaan)
              </label>
              <input
                type="text"
                name="badge_number"
                value={formData.badge_number}
                onChange={handleChange}
                placeholder="Contoh: 22053539"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            {/* JABATAN / POSISI */}
            <FormSelectWithCustom
              label="Jabatan / Posisi Pengemudi"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              defaultOptions={positionOptions}
              storageKey="driver_position"
              placeholder="-- Pilih atau Tambah Jabatan --"
            />

            {/* NIK KTP */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                NIK KTP (16 Digit)
              </label>
              <input
                type="text"
                name="nik_ktp"
                value={formData.nik_ktp}
                onChange={handleChange}
                maxLength={16}
                placeholder="Contoh: 1471120511710041"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm font-mono text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            {/* ALOKASI RIG */}
            <FormSelectWithCustom
              label="Alokasi Penugasan Rig"
              icon={HardHat}
              name="rig"
              value={formData.rig}
              onChange={handleChange}
              defaultOptions={rigOptions}
              storageKey="driver_rig"
              placeholder="Pool / Standby (Belum ditentukan)"
            />

            {/* CREW */}
            <FormSelectWithCustom
              label="Regu Kerja (Crew)"
              name="crew"
              value={formData.crew}
              onChange={handleChange}
              defaultOptions={crewOptions}
              storageKey="driver_crew"
              placeholder="-- Pilih Crew --"
            />
          </div>
        </div>

        {/* SECTION 2: LISENSI SIM & K3LL PASSPORT */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Kualifikasi Mengemudi, SIM & Safety Passport</h2>
              <p className="text-[11px] text-gray-400">Nomor SIM, jenis lisensi, sertifikasi Defensive Driving, dan masa berlaku.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* NOMOR SIM */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nomor SIM / SIO Operator <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  required
                  placeholder="SIM-22053539"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-mono font-bold text-gray-800 uppercase outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>
            </div>

            {/* JENIS SIM */}
            <FormSelectWithCustom
              label="Jenis Lisensi Mengemudi"
              name="license_type"
              value={formData.license_type}
              onChange={handleChange}
              defaultOptions={licenseTypeOptions}
              storageKey="driver_license_type"
              placeholder="-- Pilih Jenis SIM / SIO --"
            />

            {/* MASA BERLAKU SIM */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Masa Berlaku SIM / SIO
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            {/* TANGGAL TRAINING DDC */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Tgl Pelatihan DDC / Refresh K3
              </label>
              <input
                type="date"
                name="training_date"
                value={formData.training_date}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            {/* SERTIFIKASI TAMBAHAN */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Sertifikasi Keselamatan & Kompetensi
              </label>
              <input
                type="text"
                name="certification"
                value={formData.certification}
                onChange={handleChange}
                placeholder="Defensive Driving Course (DDC) & K3LL Migas, Rigger, Crane Operator Level II..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            {/* UPLOAD DOKUMEN SIM / K3LL PASSPORT */}
            <FileUploadField
              label="Upload Dokumen SIM / Sertifikat K3LL (Foto atau PDF)"
              name="license_document"
              accept="image/*,application/pdf"
              file={licenseFile}
              onFileChange={setLicenseFile}
              hint="Upload foto SIM, SIO, atau sertifikat K3LL Passport. Format: JPG, PNG, atau PDF. Maksimal 10 MB."
            />
          </div>
        </div>

        {/* SECTION 3: KONTAK & MEDIS TANGGAP DARURAT */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <HeartPulse size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Kontak, Medis & Tanggap Darurat K3</h2>
              <p className="text-[11px] text-gray-400">Nomor handphone, golongan darah darurat migas, dan kontak darurat.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* TELEPHONE */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nomor Handphone / WhatsApp
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0812-7654-3210"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>
            </div>

            {/* GOLONGAN DARAH */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Golongan Darah</span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">K3 HSE</span>
              </label>
              <select
                name="blood_type"
                value={formData.blood_type}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              >
                <option value="">-- Belum Diketahui / Dicek --</option>
                {bloodTypeOptions.map((b) => (
                  <option key={b} value={b}>Golongan Darah {b}</option>
                ))}
              </select>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="driver@besmindo.co.id"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>
            </div>

            {/* KONTAK DARURAT */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Kontak Darurat (Keluarga / Kerabat)
              </label>
              <input
                type="text"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleChange}
                placeholder="Nama Istri / Kerabat - 0812xxxx"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            {/* ALAMAT DOMISILI */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Alamat Domisili Karyawan
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Jl. Lintas Duri - Dumai KM 12, Mandau, Bengkalis, Riau..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: STATUS & CATATAN */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Status Operasional
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              >
                <option value="Active">Active (Siap Tugas Lapangan)</option>
                <option value="On Leave">On Leave (Cuti / Roster Off)</option>
                <option value="Standby">Standby Pool</option>
                <option value="Inactive">Inactive (Non-Aktif)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Catatan / Riwayat Khusus K3LL
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Catatan keahlian khusus, riwayat unit kendaraan yang dioperasikan, dll..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-5 shadow-xs flex items-center justify-end gap-3">
          <Link
            to="/drivers"
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D8FF00] px-6 py-2.5 text-xs sm:text-sm font-bold text-[#12372A] hover:bg-[#c9ee00] transition shadow-md shadow-[#D8FF00]/15 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{loading ? "Menyimpan ke Database..." : "Daftarkan Pengemudi"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}