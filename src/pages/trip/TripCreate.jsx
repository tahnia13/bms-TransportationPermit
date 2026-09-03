import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  CalendarDays,
  Car,
  MapPin,
  FileText,
} from "lucide-react";
import { api } from "../../services/api";

export default function TripCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tripNumber: "",
    tripDate: new Date().toISOString().substring(0, 10),
    returnDate: "",
    origin: "Pekanbaru Workshop",
    destination: "",
    vehicleId: "",
    driverId: "",
    purpose: "",
    description: "",
    status: "Planned",
  });

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingData(true);
        const [vRes, dRes] = await Promise.all([
          api.getVehicles(),
          api.getDrivers(),
        ]);
        const vList = Array.isArray(vRes?.data) ? vRes.data : Array.isArray(vRes) ? vRes : [];
        const dList = Array.isArray(dRes?.data) ? dRes.data : Array.isArray(dRes) ? dRes : [];
        setVehicles(vList);
        setDrivers(dList);

        // Auto-generate Trip Number
        const randomNum = Math.floor(100 + Math.random() * 900);
        const dateTag = new Date().toISOString().slice(2, 7).replace("-", "");
        setFormData((prev) => ({
          ...prev,
          tripNumber: `TRP-${dateTag}-${randomNum}`,
        }));
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.tripNumber.trim()) {
      setError("Nomor Trip wajib diisi.");
      return;
    }
    if (!formData.tripDate) {
      setError("Tanggal Keberangkatan wajib diisi.");
      return;
    }
    if (!formData.origin.trim() || !formData.destination.trim()) {
      setError("Titik asal dan tujuan perjalanan wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        trip_number: formData.tripNumber.trim(),
        departure_date: formData.tripDate,
        return_date: formData.returnDate || null,
        origin: formData.origin.trim(),
        destination: formData.destination.trim(),
        vehicle_id: formData.vehicleId ? Number(formData.vehicleId) : null,
        driver_id: formData.driverId ? Number(formData.driverId) : null,
        purpose: formData.purpose.trim() || null,
        status: formData.status,
        description: formData.description.trim() || null,
        permit_id: null,
      };

      await api.createTrip(payload);
      alert("Jadwal perjalanan trip berhasil dibuat.");
      navigate("/trips");
    } catch (err) {
      console.error("Failed to create trip:", err);
      setError(err.message || "Gagal membuat jadwal perjalanan trip.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER & BREADCRUMB */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2">
          <Link to="/trips" className="hover:text-[#12372A]">Jadwal Trip</Link>
          <span>/</span>
          <span className="text-[#12372A]">Jadwalkan Trip Baru</span>
        </div>

        <div className="flex items-center gap-3.5">
          <Link
            to="/trips"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 shadow-xs transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#12372A] tracking-tight">
              Penjadwalan Perjalanan Trip Baru
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Tentukan rute perjalanan transportasi, penetapan armada, pengemudi, dan tujuan operasional.
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
        {/* SECTION 1: TRIP IDENTIFIER & TIMELINE */}
        <div>
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <CalendarDays size={16} className="text-[#12372A]" />
            <h2 className="text-sm font-bold text-gray-900">
              1. Identitas Perjalanan & Jadwal
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nomor Trip <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="tripNumber"
                value={formData.tripNumber}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Tanggal Keberangkatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="tripDate"
                value={formData.tripDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Tanggal Kembali (Estimasi)
              </label>
              <input
                type="date"
                name="returnDate"
                value={formData.returnDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ROUTE */}
        <div>
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <MapPin size={16} className="text-[#12372A]" />
            <h2 className="text-sm font-bold text-gray-900">
              2. Titik Rute Operasional
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
                placeholder="Pekanbaru Main Yard"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Tujuan Akhir (*Destination*) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                placeholder="Rig 03 Minas / Duri Camp"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: ASSET ASSIGNMENT */}
        <div>
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <Car size={16} className="text-[#12372A]" />
            <h2 className="text-sm font-bold text-gray-900">
              3. Penugasan Armada & Pengemudi
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Pilih Kendaraan
              </label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              >
                <option value="">Pilih Armada Kendaraan</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate_number || v.plate} - {v.type} ({v.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Pilih Pengemudi Bertugas
              </label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              >
                <option value="">Pilih Pengemudi</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.license_type || "SIM"})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: MISSION PURPOSE */}
        <div>
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <FileText size={16} className="text-[#12372A]" />
            <h2 className="text-sm font-bold text-gray-900">
              4. Maksud Perjalanan & Catatan
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Keperluan Perjalanan (*Purpose*)
              </label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Contoh: Mobilisasi kru pengeboran & suku cadang rig"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Keterangan / Muatan / Kontak Lapangan
              </label>
              <textarea
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Catatan tambahan, daftar perlengkapan yang dibawa..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="border-t border-gray-100 pt-5 flex items-center justify-end gap-3">
          <Link
            to="/trips"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D8FF00] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#12372A] hover:bg-[#c9ee00] transition shadow-md shadow-[#D8FF00]/15 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? "Menyimpan..." : "Simpan Jadwal Trip"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}