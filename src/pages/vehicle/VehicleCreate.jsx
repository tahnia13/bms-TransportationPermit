import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Car,
  ShieldCheck,
  Calendar,
  Layers,
  Building,
  HardHat,
  UserCog,
} from "lucide-react";
import { api } from "../../services/api";
import { useToast } from "../../components/Toast";
import FormSelectWithCustom from "../../components/FormSelectWithCustom";

const rigOptions = [
  "BMS 02", "BMS 03", "BMS 03A", "BMS 05", "BMS 06", "BMS 07", "BMS 08",
  "BMS 10", "BMS 11", "BMS 15", "BMS 16", "BMS 17", "BMS 18", "BMS 19",
  "BMS 20", "BMS 21", "SUPPORT", "YARD"
];

const brandOptions = [
  "IVECO",
  "MITSUBISHI",
  "ISUZU",
  "HINO",
  "UD TRUCK",
  "TOYOTA",
];

const axleOptions = [
  "4X2",
  "4X4",
  "6X4",
  "6X2",
];

const categoryOptions = [
  "LV",
  "BUS",
  "TANDEM",
  "VACUM",
  "FOCO",
  "ANCHOR",
  "WATER TANK",
  "CARAVAN",
  "FUEL TANK",
];

const vehicleTypeSuggestions = [
  "PICK-UP DOUBLE CABIN",
  "PICK-UP SINGLE CABIN",
  "DOUBLE CABIN",
  "MEDIUM BUS 13 -24 SEATS",
  "TANDEM TRUCK",
  "CARGO TRUCK WITH CRANE",
  "CARGO TRUCK",
  "VACUUM TANK TRUCK",
  "WATER TANK TRUCK",
  "FUEL TANK TRUCK",
  "LOW BOY TRAILER",
  "LOW BED TRAILER",
  "GROUNDING RIG TRUCK",
  "CARAVAN",
];

const colorSuggestions = [
  "WHITE/PUTIH",
  "PUTIH SOLID",
  "YELLOW / KUNING",
  "ORANGE/ORANGE",
  "GREEN/HIJAU",
  "SILVER METALIK",
  "BIRU PUTIH",
  "HITAM",
];

export default function VehicleCreate() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    plateNumber: "",
    brand: "",
    type: "",
    ownerName: "PT. BESMINDO MATERI SEWATAMA",
    category: "",
    axle: "",
    year: new Date().getFullYear(),
    color: "",
    rig: "",
    rigBaru: "",
    stnkExpiry: "",
    pajakExpiry: "",
    kirExpiry: "",
    passExpiry: "",
    pic_name: "",
    pic_phone: "",
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
        brand: formData.brand.trim() || null,
        owner_name: formData.ownerName.trim() || null,
        category: formData.category.trim() || null,
        axle: formData.axle.trim() || null,
        year: formData.year ? Number(formData.year) : null,
        color: formData.color.trim() || null,
        rig: formData.rig ? formData.rig.trim() : null,
        rig_baru: formData.rigBaru ? formData.rigBaru.trim() : null,
        stnk_expiry: formData.stnkExpiry || null,
        pajak_expiry: formData.pajakExpiry || null,
        kir_expiry: formData.kirExpiry || null,
        pass_expiry: formData.passExpiry || null,
        pic_name: formData.pic_name.trim() || null,
        pic_phone: formData.pic_phone.trim() || null,
        status: formData.status,
        description: formData.description.trim() || null,
      };

      await api.createVehicle(payload);
      toast.success("Kendaraan berhasil didaftarkan ke sistem armada.");
      navigate("/vehicles");
    } catch (err) {
      console.error("Create vehicle error:", err);
      toast.error(err.message || "Gagal menambahkan kendaraan.");
      setErrorMessage(err.message || "Gagal menambahkan kendaraan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
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
              Input spesifikasi armada, kelengkapan legalitas dokumen, dan alokasi rig operasional.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {errorMessage}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* LIVE PREVIEW OF PLATE NUMBER */}
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/30 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Car size={13} />
              Pratinjau Plat Nomor & Armada BMS
            </span>
            <p className="text-xs text-gray-500">
              {formData.brand ? formData.brand + " • " : ""}{formData.type || "Model Belum Ditentukan"}
              {formData.rig ? ` | Ditugaskan di Rig ${formData.rig}` : " | Pool / Yard"}
            </p>
          </div>

          <div className="inline-flex items-center gap-2.5 rounded-xl bg-gray-950 px-4 py-2 text-base font-black tracking-widest text-white border-2 border-gray-700 shadow-md">
            <span className="h-2 w-2 rounded-full bg-[#D8FF00] animate-pulse" />
            <span>{formData.plateNumber || "BM 0000 XX"}</span>
          </div>
        </div>

        {/* SECTION 1: IDENTITAS & KEPEMILIKAN */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#12372A]/5 text-[#12372A]">
              <Car size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Identitas Kendaraan & Kepemilikan</h2>
              <p className="text-[11px] text-gray-400">Nomor registrasi polisi, pabrikan, dan kategori armada.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                placeholder="Contoh: BM8737DU"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-gray-800 uppercase outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            {/* OWNER NAME */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nama Pemilik (Owner)
              </label>
              <div className="relative">
                <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="PT. BESMINDO MATERI SEWATAMA"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>
            </div>

            {/* BRAND */}
            <FormSelectWithCustom
              label="Brand / Pabrikan"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              defaultOptions={brandOptions}
              storageKey="vehicle_brand"
              placeholder="-- Pilih Brand Kendaraan --"
            />

            {/* CATEGORY */}
            <FormSelectWithCustom
              label="Kategori Armada BMS"
              name="category"
              value={formData.category}
              onChange={handleChange}
              defaultOptions={categoryOptions}
              storageKey="vehicle_category"
              placeholder="-- Pilih Kategori --"
            />

            {/* TYPE / MODEL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Tipe / Model Kendaraan <span className="text-rose-500">*</span>
              </label>
              <input
                list="vehicle-type-suggestions"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                placeholder="Contoh: PICK-UP DOUBLE CABIN, TANDEM TRUCK, VACUUM TANK TRUCK..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
              <datalist id="vehicle-type-suggestions">
                {vehicleTypeSuggestions.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* SECTION 2: SPESIFIKASI FISIK & TEKNIS */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#12372A]/5 text-[#12372A]">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Spesifikasi Fisik & Teknis</h2>
              <p className="text-[11px] text-gray-400">Konfigurasi axle (gandar roda), tahun perakitan, dan warna unit.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* AXLE */}
            <FormSelectWithCustom
              label="Konfigurasi Axle"
              name="axle"
              value={formData.axle}
              onChange={handleChange}
              defaultOptions={axleOptions}
              storageKey="vehicle_axle"
              placeholder="-- Pilih Gandar --"
            />

            {/* YEAR */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Tahun Pembuatan
              </label>
              <input
                type="number"
                name="year"
                min="1990"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={handleChange}
                placeholder="2022"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            {/* COLOR */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Warna Kendaraan
              </label>
              <input
                list="color-suggestions"
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="WHITE/PUTIH"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
              <datalist id="color-suggestions">
                {colorSuggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* STATUS */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Status Armada
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              >
                <option value="Active">Active (Siap Jalan)</option>
                <option value="Maintenance">Maintenance (Workshop)</option>
                <option value="Inactive">Inactive (Standby)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: PENUGASAN RIG */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#12372A]/5 text-[#12372A]">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Alokasi Penugasan Rig & Yard</h2>
              <p className="text-[11px] text-gray-400">Penetapan unit di rig pengeboran aktif atau pool yard.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* RIG ASSIGNMENT */}
            <FormSelectWithCustom
              label="Alokasi Rig Utama"
              icon={HardHat}
              name="rig"
              value={formData.rig}
              onChange={handleChange}
              defaultOptions={rigOptions}
              storageKey="vehicle_rig"
              placeholder="Pool / Standby (Belum dialokasikan)"
            />

            {/* RIG BARU / KETERANGAN POSISI */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Rig Baru / Posisi Yard Terakhir
              </label>
              <input
                type="text"
                name="rigBaru"
                value={formData.rigBaru}
                onChange={handleChange}
                placeholder="Contoh: YARD, YARD / RUSAK..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION PIC: PERSON IN CHARGE */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <UserCog size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">PIC (Person In Charge) Kendaraan</h2>
              <p className="text-[11px] text-gray-400">Penanggung jawab & kontak yang dapat dihubungi untuk kendaraan ini.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* PIC NAME */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nama PIC / Penanggung Jawab
              </label>
              <div className="relative">
                <UserCog size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="pic_name"
                  value={formData.pic_name}
                  onChange={handleChange}
                  placeholder="Nama lengkap penanggung jawab"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>
            </div>

            {/* PIC PHONE */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                No. HP / WhatsApp PIC
              </label>
              <input
                type="text"
                name="pic_phone"
                value={formData.pic_phone}
                onChange={handleChange}
                placeholder="Contoh: 0812-3456-7890"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: KEPATUHAN DOKUMEN & K3LL */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Masa Berlaku Dokumen Legalitas & K3LL</h2>
              <p className="text-[11px] text-gray-400">
                Pencatatan masa kedaluwarsa dokumen kepatuhan izin jalan dan akses rig migas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* STNK */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" />
                STNK Berlaku s/d
              </label>
              <input
                type="date"
                name="stnkExpiry"
                value={formData.stnkExpiry}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            {/* PAJAK */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" />
                Pajak Berlaku s/d
              </label>
              <input
                type="date"
                name="pajakExpiry"
                value={formData.pajakExpiry}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            {/* KIR */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" />
                KIR DLLAJ Berlaku s/d
              </label>
              <input
                type="date"
                name="kirExpiry"
                value={formData.kirExpiry}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>

            {/* PASS EXPIRED / GATE PASS */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" />
                Rig Gate Pass s/d
              </label>
              <input
                type="date"
                name="passExpiry"
                value={formData.passExpiry}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: CATATAN TAMBAHAN */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 sm:p-7 shadow-xs space-y-4">
          <label className="block text-xs font-bold text-gray-700">
            Catatan Tambahan & Keterangan Fisik Kendaraan
          </label>
          <textarea
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nomor rangka, nomor mesin, riwayat perbaikan, perlengkapan safety (APAR, First Aid Kit), dll..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
          />
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-5 shadow-xs flex items-center justify-end gap-3">
          <Link
            to="/vehicles"
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
            <span>{loading ? "Menyimpan ke Database..." : "Daftarkan Kendaraan"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}