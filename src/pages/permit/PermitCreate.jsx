import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  UserRound,
  Car,
  MapPin,
  FileText,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../services/api";

export default function PermitCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    requester: "",
    department: "",
    vehicle: "",
    driver: "",
    origin: "Pekanbaru",
    destination: "",
    start_date: "",
    end_date: "",
    purpose: "",
    description: "",
    status: "Pending",
  });

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadAssets() {
      try {
        const [vRes, dRes] = await Promise.all([
          api.getVehicles(),
          api.getDrivers(),
        ]);
        setVehicles(Array.isArray(vRes?.data) ? vRes.data : Array.isArray(vRes) ? vRes : []);
        setDrivers(Array.isArray(dRes?.data) ? dRes.data : Array.isArray(dRes) ? dRes : []);
      } catch (err) {
        console.warn("Could not preload vehicles/drivers list:", err);
      }
    }
    loadAssets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setErrorMessage("");
  };

  const generatePermitNumber = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(2, 7).replace("-", "");
    return `PM-${dateStr}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setErrors({});

    try {
      const permitNumber = generatePermitNumber();
      const payload = {
        permit_number: permitNumber,
        requester: formData.requester.trim(),
        department: formData.department.trim() || null,
        vehicle: formData.vehicle.trim() || null,
        driver: formData.driver.trim() || null,
        origin: formData.origin.trim(),
        destination: formData.destination.trim(),
        purpose: formData.purpose.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        description: formData.description.trim() || null,
      };

      await api.createPermit(payload);
      alert(`Permit ${permitNumber} berhasil diterbitkan.`);
      navigate("/permit");
    } catch (error) {
      console.error("Create permit error:", error);
      setErrorMessage(error.message || "Gagal membuat permit.");
      setErrors(error.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER WITH BREADCRUMB */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2">
          <Link to="/permit" className="hover:text-[#12372A]">Permit Management</Link>
          <span>/</span>
          <span className="text-[#12372A]">Buat Permit Baru</span>
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
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#12372A] tracking-tight">
                Penerbitan Transportation Permit
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Isi rincian permohonan izin operasional perjalanan kendaraan dan pengemudi.
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

      {/* 2-COLUMN LAYOUT: FORM & LIVE PREVIEW */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* MAIN FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-xs lg:col-span-2 space-y-6"
        >
          {/* SECTION 1: REQUESTER INFO */}
          <div>
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <UserRound size={16} className="text-[#12372A]" />
              <h2 className="text-sm font-bold text-gray-900">
                1. Data Pemohon & Departemen
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nama Pemohon <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="requester"
                  value={formData.requester}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Budi Santoso"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Departemen / Divisi
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Contoh: Drilling Operation / Rig 03"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ROUTE & SCHEDULE */}
          <div>
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <MapPin size={16} className="text-[#12372A]" />
              <h2 className="text-sm font-bold text-gray-900">
                2. Rute & Jadwal Perjalanan
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Titik Asal (*Origin*) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  required
                  placeholder="Pekanbaru Workshop"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Tujuan (*Destination*) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  placeholder="Rig Site 03A Minas"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Tanggal Berangkat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Tanggal Kepulangan / Selesai <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: VEHICLE & DRIVER ASSIGNMENT */}
          <div>
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <Car size={16} className="text-[#12372A]" />
              <h2 className="text-sm font-bold text-gray-900">
                3. Penugasan Kendaraan & Pengemudi
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Kendaraan / Plat Nomor
                </label>
                <input
                  list="vehicle-options"
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  placeholder="Pilih atau ketik plat kendaraan"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
                <datalist id="vehicle-options">
                  {vehicles.map((v) => (
                    <option
                      key={v.id}
                      value={`${v.plate_number || v.plate} - ${v.type || "Vehicle"}`}
                    />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Pengemudi (*Driver*)
                </label>
                <input
                  list="driver-options"
                  name="driver"
                  value={formData.driver}
                  onChange={handleChange}
                  placeholder="Pilih atau ketik nama pengemudi"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
                <datalist id="driver-options">
                  {drivers.map((d) => (
                    <option key={d.id} value={d.name} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* SECTION 4: PURPOSE & NOTES */}
          <div>
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <FileText size={16} className="text-[#12372A]" />
              <h2 className="text-sm font-bold text-gray-900">
                4. Keperluan & Deskripsi
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Keperluan Transportasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Pengiriman suku cadang rig & inspeksi berkala"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Deskripsi / Catatan Tambahan
                </label>
                <textarea
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Instruksi khusus, muatan kargo, atau kontak darurat..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>
            </div>
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
              className="inline-flex items-center gap-2 rounded-xl bg-[#D8FF00] px-5 py-2.5 text-xs font-bold text-[#12372A] hover:bg-[#c9ee00] transition shadow-md shadow-[#D8FF00]/15 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? "Menerbitkan..." : "Terbitkan Permit"}</span>
            </button>
          </div>
        </form>

        {/* SIDEBAR LIVE SUMMARY CARD */}
        <div className="space-y-4">
          <div className="sticky top-24 rounded-3xl border border-gray-200/70 bg-gradient-to-b from-white to-gray-50 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#12372A]" />
                <span className="text-xs font-bold text-gray-900">
                  Pratinjau Slip Permit
                </span>
              </div>
              <span className="rounded-md bg-[#D8FF00] px-2 py-0.5 text-[10px] font-black text-[#12372A]">
                DRAFT
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase">Pemohon</span>
                <span className="font-bold text-gray-800">
                  {formData.requester || "(Nama Pemohon)"}
                </span>
                {formData.department && (
                  <span className="text-gray-500 block text-[11px]">{formData.department}</span>
                )}
              </div>

              <div className="rounded-xl bg-white border border-gray-100 p-3">
                <span className="text-gray-400 block text-[10px] font-bold uppercase mb-1">Rute</span>
                <div className="flex items-center gap-2 font-bold text-[#12372A]">
                  <span>{formData.origin || "Asal"}</span>
                  <ArrowRight size={12} className="text-gray-400" />
                  <span>{formData.destination || "Tujuan"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Kendaraan</span>
                  <span className="font-semibold text-gray-800 truncate block">
                    {formData.vehicle || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Driver</span>
                  <span className="font-semibold text-gray-800 truncate block">
                    {formData.driver || "-"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] font-bold uppercase">Keperluan</span>
                <p className="font-medium text-gray-700 line-clamp-2">
                  {formData.purpose || "-"}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-[#12372A] p-3 text-white text-[11px] leading-relaxed">
              <p className="font-bold text-[#D8FF00]">Ketentuan Operasional</p>
              <p className="text-emerald-100/80 mt-0.5">
                Pastikan pengemudi memiliki SIM & sertifikasi keselamatan kerja yang masih aktif sebelum keberangkatan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}