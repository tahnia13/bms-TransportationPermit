import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  UserRound,
  FileBadge2,
  CalendarDays,
  Camera,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  SlidersHorizontal,
  PenLine,
  Trash2,
} from "lucide-react";
import { api } from "../../services/api";
import { useToast } from "../../components/Toast";
import DrivingPermitCardView from "../../components/DrivingPermitCardView";
import FormSelectWithCustom from "../../components/FormSelectWithCustom";
import SignaturePad from "../../components/SignaturePad";
import { compressImageFile } from "../../utils/imageCompressor";

const licenseBadgeOptions = [
  "BII.U",
  "BI.U",
  "A",
  "C",
  "SIO CRANE & BII.U",
  "SIO FORKLIFT",
  "SIO RIGGER",
];

const departmentOptions = [
  "Transportation & Logistic",
  "Operation Rig",
  "Maintenance & Workshop",
  "HSE / K3LL",
  "Logistics & Yard",
  "General Affair",
];

const rigOptions = [
  "BMS 02",
  "BMS 03",
  "BMS 03A",
  "BMS 05",
  "BMS 06",
  "BMS 07",
  "BMS 08",
  "BMS 10",
  "BMS 11",
  "BMS 15",
  "BMS 16",
  "BMS 17",
  "BMS 18",
  "BMS 19",
  "BMS 20",
  "BMS 21",
  "SUPPORT",
  "POOL",
  "YARD",
];

export default function PermitCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const savedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("transportation_user") || "{}");
    } catch {
      return {};
    }
  })();

  // Generator for official Besmindo Permit Number: BMSD/{seq}/PERMIT/{month}/{year}
  const generatePermitNumber = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const seq = Math.floor(1000 + Math.random() * 9000);
    return `BMSD/${seq}/PERMIT/${mm}/${yy}`;
  };

  // Helper date formatter for card display (DD - MM - YYYY)
  const formatDateForCard = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  // Default dates: start = today, end = 1 year ahead
  const todayIso = new Date().toISOString().substring(0, 10);
  const oneYearAheadIso = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().substring(0, 10);
  })();

  // Main form data aligned with Driving Permit Card
  const [formData, setFormData] = useState({
    permit_number: generatePermitNumber(),
    driver: "JEFRINALDO",
    position: "OPR - FOCO",
    license_number: "09279809000042",
    license_expiry_year: "2026",
    license_type: "BII.U",
    ddc_training_date: todayIso,
    start_date: todayIso,
    end_date: oneYearAheadIso,
    equipment_type: "FOCO / BUS / LV / 4 X 4",
    driver_photo: "/default-driver-photo.png",
    requester: savedUser.username || "Administrator",
    department: "Transportation & Logistic",
    vehicle: "",
    rig: "BMS 10",
    origin: "Pekanbaru Workshop",
    destination: "Rig Site / Area Operasional",
    purpose: "Izin Mengemudi Resmi (Driving Permit)",
    description: "",
    status: "Approved",
  });

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewSide, setPreviewSide] = useState("both"); // 'both' | 'front' | 'back'
  const [showOperational, setShowOperational] = useState(false);

  // State tanda tangan — dimuat dari localStorage otomatis saat mount
  const [hseSignature, setHseSignature] = useState(
    () => localStorage.getItem("permit_hse_signature") || null
  );
  const [opsSignature, setOpsSignature] = useState(
    () => localStorage.getItem("permit_ops_signature") || null
  );

  useEffect(() => {
    async function loadAssets() {
      try {
        const [vRes, dRes] = await Promise.all([
          api.getVehicles(),
          api.getDrivers(),
        ]);
        const dList = Array.isArray(dRes?.data) ? dRes.data : Array.isArray(dRes) ? dRes : [];
        setVehicles(Array.isArray(vRes?.data) ? vRes.data : Array.isArray(vRes) ? vRes : []);
        setDrivers(dList);

        // If JEFRINALDO exists in the list, link default data
        const jef = dList.find(d => d.name?.toLowerCase().includes("jefrinaldo"));
        if (jef) {
          handleSelectDriver(jef);
        }
      } catch (err) {
        console.warn("Could not preload vehicles/drivers list:", err);
      }
    }
    loadAssets();
  }, []);

  // When selecting a driver, auto-fill card fields
  const handleSelectDriver = (driver) => {
    if (!driver) return;
    const expYear = driver.expiry_date
      ? new Date(driver.expiry_date).getFullYear().toString()
      : "2026";

    let badge = (driver.license_type || "BII.U").toUpperCase();
    if (badge.includes("B2") || badge.includes("BII")) badge = "BII.U";
    else if (badge.includes("B1") || badge.includes("BI")) badge = "BI.U";
    else if (badge.includes("A")) badge = "A";
    else if (badge.includes("C")) badge = "C";

    setFormData((prev) => ({
      ...prev,
      driver: driver.name || prev.driver,
      position: driver.position || prev.position,
      license_number: driver.license_number || prev.license_number,
      license_expiry_year: expYear,
      license_type: badge,
      ddc_training_date: driver.training_date ? String(driver.training_date).substring(0, 10) : prev.ddc_training_date,
      // Jangan timpa foto dengan supir lain, dan jika supir tidak punya foto resmi gunakan default avatar
      driver_photo: (driver.photo_url && driver.photo_url !== "/default-driver-photo.png") ? driver.photo_url : "/default-driver-photo.png",
      rig: driver.rig || prev.rig || "BMS 10",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Driver photo file upload handler (dengan kompresi canvas otomatis)
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 480, 600, 0.85);
        setFormData((prev) => ({ ...prev, driver_photo: compressed }));
        toast.success("Foto pengemudi berhasil dimuat dan disesuaikan!");
      } catch (err) {
        console.error("Gagal mengompres foto:", err);
        toast.error("Gagal memproses gambar. Pastikan format JPG/PNG.");
      }
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, driver_photo: "/default-driver-photo.png" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Foto dihapus. Menggunakan avatar inisial nama.");
  };

  const handleRegenerateNumber = () => {
    setFormData((prev) => ({ ...prev, permit_number: generatePermitNumber() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        permit_number: formData.permit_number.trim(),
        driver: formData.driver.trim(),
        position: formData.position.trim(),
        license_number: formData.license_number.trim(),
        license_type: formData.license_type.trim(),
        license_expiry_year: formData.license_expiry_year.trim(),
        ddc_training_date: formData.ddc_training_date,
        equipment_type: formData.equipment_type.trim(),
        driver_photo: formData.driver_photo,
        start_date: formData.start_date,
        end_date: formData.end_date,
        requester: formData.requester.trim() || savedUser.username || "Administrator",
        department: formData.department.trim() || "Transportation & Logistic",
        vehicle: formData.vehicle.trim() || null,
        rig: formData.rig.trim() || null,
        origin: formData.origin.trim() || "Pekanbaru Workshop",
        destination: formData.destination.trim() || "Rig Site / Area Operasional",
        purpose: formData.purpose.trim() || "Izin Mengemudi Resmi (Driving Permit)",
        description: formData.description.trim() || null,
        status: formData.status || "Approved",
      };

      await api.createPermit(payload);
      toast.success(`Driving Permit ${payload.permit_number} untuk ${payload.driver} berhasil diterbitkan!`);
      navigate("/permit");
    } catch (error) {
      console.error("Create permit error:", error);
      toast.error(error.message || "Gagal membuat permit.");
      setErrorMessage(error.message || "Gagal membuat permit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER WITH BREADCRUMB */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2">
          <Link to="/permit" className="hover:text-[#12372A]">
            Permit Management
          </Link>
          <span>/</span>
          <span className="text-[#12372A]">Penerbitan Driving Permit Baru</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link
              to="/permit"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition shadow-xs"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#12372A] tracking-tight">
                  Penerbitan Driving Permit Resmi
                </h1>
                <span className="rounded-lg bg-[#D8FF00] px-2.5 py-0.5 text-xs font-black text-[#12372A]">
                  ID CARD FORMAT
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Formulir penerbitan kartu Driving Permit PT Besmindo Materi Sewatama sesuai format resmi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {errorMessage}
        </div>
      )}

      {/* 2-COLUMN LAYOUT: FORM & LIVE CARD PREVIEW */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: INPUT FORM (7 COLS) */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 lg:col-span-7 rounded-3xl border border-gray-200/70 bg-white p-6 shadow-xs"
        >
          {/* SECTION 1: PERMIT NUMBER & DRIVER INFO */}
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileBadge2 size={18} className="text-[#12372A]" />
                <h2 className="text-sm font-bold text-gray-900">
                  1. Identitas Driving Permit & Pengemudi
                </h2>
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase">
                Tabel Kartu Depan
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* PERMIT NUMBER INPUT */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nomor Permit (*Permit No*) <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="permit_number"
                    value={formData.permit_number}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: BMSD/1000/PERMIT/03/26"
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-mono font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={handleRegenerateNumber}
                    title="Generate ulang nomor permit"
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 shadow-2xs"
                  >
                    Generate Ulang
                  </button>
                </div>
              </div>

              {/* DRIVER SELECTION & POSITION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nama Pengemudi (*Nama*) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    list="driver-list-options"
                    name="driver"
                    value={formData.driver}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleChange(e);
                      const matched = drivers.find(
                        (d) => d.name?.toLowerCase().trim() === val.toLowerCase().trim()
                      );
                      if (matched) handleSelectDriver(matched);
                    }}
                    required
                    placeholder="Pilih atau ketik nama driver"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                  />
                  <datalist id="driver-list-options">
                    {drivers.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.position ? `(${d.position})` : ""}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Jabatan (*Position*) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: OPR - FOCO"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* LICENSE NUMBER & EXPIRY YEAR */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nomor SIM (*SIM No*) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    required
                    placeholder="Contoh: 09279809000042"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-mono font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Tahun Exp SIM <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="license_expiry_year"
                    value={formData.license_expiry_year}
                    onChange={handleChange}
                    required
                    placeholder="2026"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-mono font-bold text-center text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: LICENSE BADGE, TRAINING & VALIDITY */}
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-[#12372A]" />
                <h2 className="text-sm font-bold text-gray-900">
                  2. Golongan SIM & Masa Berlaku Kartu
                </h2>
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase">
                Badge & Tanggal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* GOLONGAN SIM BADGE */}
              <div>
                <FormSelectWithCustom
                  label="Golongan SIM (Badge)"
                  name="license_type"
                  value={formData.license_type}
                  onChange={handleChange}
                  required
                  storageKey="driver_license_type"
                  defaultOptions={licenseBadgeOptions}
                  placeholder="-- Pilih Golongan SIM --"
                />
              </div>

              {/* DDC TRAINING DATE */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  DDC Training Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="ddc_training_date"
                  value={formData.ddc_training_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>

              {/* EXPIRED DATE PERMIT */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Expired Date Permit <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: EQUIPMENT TYPE & PHOTO */}
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-[#12372A]" />
                <h2 className="text-sm font-bold text-gray-900">
                  3. Jenis Kendaraan / Alat (*Equipment Type*) & Foto
                </h2>
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase">
                Halaman Belakang & Foto
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* EQUIPMENT TYPE */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Equipment Type (Teks Belakang) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="equipment_type"
                  value={formData.equipment_type}
                  onChange={handleChange}
                  required
                  placeholder="FOCO / BUS / LV / 4 X 4"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
                {/* QUICK SELECTOR PILLS */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    "FOCO / BUS / LV / 4 X 4",
                    "LIGHT VEHICLE / 4X4",
                    "HEAVY EQUIPMENT / CRANE",
                    "BUS OPERATIONAL",
                  ].map((eq) => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, equipment_type: eq }))}
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition ${
                        formData.equipment_type === eq
                          ? "bg-[#12372A] text-[#D8FF00]"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              {/* DRIVER PHOTO UPLOAD */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Foto Pengemudi (*Driver Photo*)
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-black bg-slate-200 shadow-2xs">
                    {formData.driver_photo && formData.driver_photo !== "/default-driver-photo.png" ? (
                      <img
                        src={formData.driver_photo}
                        alt="Foto Pengemudi"
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#12372A] text-[#D8FF00] font-black text-xs">
                        {formData.driver ? formData.driver.charAt(0).toUpperCase() : "D"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs"
                      >
                        <Camera size={13} />
                        <span>Pilih / Ganti Foto</span>
                      </button>
                      {formData.driver_photo && formData.driver_photo !== "/default-driver-photo.png" && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50/70 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 shadow-2xs transition"
                          title="Hapus foto dan gunakan avatar inisial nama"
                        >
                          <Trash2 size={12} />
                          <span>Hapus Foto</span>
                        </button>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <p className="text-[10px] text-gray-400">
                      Gunakan pas foto formal (PNG/JPG). Foto otomatis dioptimalkan agar pas pada kartu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: TANDA TANGAN PEJABAT */}
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <PenLine size={18} className="text-[#12372A]" />
                <h2 className="text-sm font-bold text-gray-900">
                  4. Tanda Tangan Pejabat
                </h2>
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase">
                TTD Online
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              {/* TTD HSE & ISO Jr.Manager */}
              <SignaturePad
                storageKey="permit_hse_signature"
                label="HSE & ISO Jr.Manager"
                onSave={(base64) => setHseSignature(base64)}
                onClear={() => setHseSignature(null)}
              />

              {/* TTD Ops. Manager */}
              <SignaturePad
                storageKey="permit_ops_signature"
                label="Ops. Manager"
                onSave={(base64) => setOpsSignature(base64)}
                onClear={() => setOpsSignature(null)}
              />
            </div>

            <p className="mt-3 text-[10px] text-gray-400 flex items-center gap-1">
              <span>💡</span>
              TTD tersimpan otomatis di perangkat ini. Tidak perlu gambar ulang setiap kali membuat permit baru.
            </p>
          </div>

          {/* SECTION 5: OPERATIONAL DETAILS (COLLAPSIBLE / OPTIONAL) */}
          <div className="rounded-2xl border border-gray-200/80 bg-gray-50/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowOperational(!showOperational)}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-gray-700 hover:bg-gray-100/70 transition"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-[#12372A]" />
                <span>Rincian Operasional & Departemen (Opsional)</span>
              </div>
              {showOperational ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showOperational && (
              <div className="p-4 pt-0 border-t border-gray-200/50 space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <FormSelectWithCustom
                      label="Departemen / Divisi"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      storageKey="permit_department"
                      defaultOptions={departmentOptions}
                      placeholder="-- Pilih Departemen --"
                    />
                  </div>
                  <div>
                    <FormSelectWithCustom
                      label="Rig / Lokasi Rig (Alokasi)"
                      name="rig"
                      value={formData.rig}
                      onChange={handleChange}
                      storageKey="permit_rig"
                      defaultOptions={rigOptions}
                      placeholder="-- Pilih Alokasi Rig --"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Kendaraan / Plat Nomor
                    </label>
                    <input
                      list="create-veh-opts"
                      name="vehicle"
                      value={formData.vehicle}
                      onChange={handleChange}
                      placeholder="Pilih plat kendaraan (opsional)"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs"
                    />
                    <datalist id="create-veh-opts">
                      {vehicles.map((v) => (
                        <option
                          key={v.id}
                          value={`${v.plate_number || v.plate} - ${v.type || "Vehicle"}`}
                        />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Keperluan / Muatan (*Purpose*)
                    </label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      placeholder="Contoh: Izin Mengemudi Resmi"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Asal (*Origin*)
                    </label>
                    <input
                      type="text"
                      name="origin"
                      value={formData.origin}
                      onChange={handleChange}
                      placeholder="Pekanbaru Workshop"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Tujuan (*Destination*)
                    </label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder="Rig Site Minas"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Catatan Khusus K3 / APD
                  </label>
                  <textarea
                    rows={2}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Instruksi keselamatan atau muatan khusus..."
                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SUBMIT BUTTONS */}
          <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3">
            <Link
              to="/permit"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#D8FF00] px-6 py-2.5 text-xs font-extrabold text-[#12372A] hover:bg-[#c9ee00] transition shadow-md shadow-[#D8FF00]/20 disabled:opacity-50 active:scale-[0.98]"
            >
              <Save size={16} />
              <span>{loading ? "Menyimpan..." : "Terbitkan Driving Permit"}</span>
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: LIVE REAL-TIME CARD PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <div className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#12372A]" />
                <span className="text-xs font-bold text-gray-900">
                  Pratinjau Langsung Kartu
                </span>
              </div>

              {/* PREVIEW VIEW SIDE SWITCH */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewSide("both")}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                    previewSide === "both"
                      ? "bg-[#12372A] text-[#D8FF00]"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  2 Sisi
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSide("front")}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                    previewSide === "front"
                      ? "bg-[#12372A] text-[#D8FF00]"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  Depan
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSide("back")}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                    previewSide === "back"
                      ? "bg-[#12372A] text-[#D8FF00]"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  Belakang
                </button>
              </div>
            </div>

            {/* LIVE CARD CANVAS */}
            <div className="flex justify-center overflow-x-auto p-2 bg-slate-100/60 rounded-2xl">
              <div className="transform scale-90 sm:scale-95 origin-top transition-transform">
                <DrivingPermitCardView
                  driverName={formData.driver}
                  position={formData.position}
                  licenseNo={formData.license_number}
                  licenseExpiryYear={formData.license_expiry_year}
                  permitNumber={formData.permit_number}
                  licenseCategory={formData.license_type}
                  ddcTrainingDate={formatDateForCard(formData.ddc_training_date)}
                  permitExpiryDate={formatDateForCard(formData.end_date)}
                  equipmentType={formData.equipment_type}
                  photoUrl={formData.driver_photo}
                  hseSignatureUrl={hseSignature}
                  opsSignatureUrl={opsSignature}
                  viewSide={previewSide}
                  layout="stack"
                />
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200/60 p-3 text-[11px] text-emerald-900 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <span>
                Kartu ini otomatis tersimpan dan siap dicetak / diunduh menjadi PDF 2 halaman di Permit List.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}