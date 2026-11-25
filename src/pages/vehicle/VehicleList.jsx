import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  HardHat,
  ShieldCheck,
  Calendar,
  Building,
  Layers,
  AlertTriangle,
  CheckCircle2,
  UserCog,
  Phone,
} from "lucide-react";
import { api } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import FilterSelectWithCustom from "../../components/FilterSelectWithCustom";
import FormSelectWithCustom from "../../components/FormSelectWithCustom";
import { useToast } from "../../components/Toast";
import { getPicByRig, getAllDriversByRig } from "../../data/rigPicData";

const rigOptions = [
  "All",
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
  "All",
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




// =====================================================
// DATA PIC PER RIG (dari data karyawan BMS AUG26)
// PIC = Tool Pusher Crew A masing-masing rig
// =====================================================
const RIG_PIC_MAP = {
  "BMS 02":        { name: "HENDRITA",                 phone: "085376013294", jabatan: "TOOL PUSHER" },
  "BMS 03":        { name: "ANTON RIADI",               phone: "085364338261", jabatan: "TOOL PUSHER" },
  "BMS 03A":       { name: "MARJONO",                   phone: "081364480240", jabatan: "TOOL PUSHER" },
  "BMS 05":        { name: "MAULIADY SYAHPUTRA",        phone: "085247218069", jabatan: "TOOL PUSHER" },
  "BMS 06":        { name: "ZONI ZAKIR",                phone: "082132726963", jabatan: "TOOL PUSHER" },
  "BMS 07":        { name: "DARWIN",                    phone: "082307198859", jabatan: "TOOL PUSHER" },
  "BMS 08":        { name: "MUHAMMAD RAJALI NASUTION",  phone: "082389370474", jabatan: "TOOL PUSHER" },
  "BMS 09":        { name: "DESRIZAL",                  phone: "085271607866", jabatan: "TOOL PUSHER" },
  "BMS 10":        { name: "NASRIL",                    phone: "081371495698", jabatan: "TOOL PUSHER" },
  "BMS 10 HY":     { name: "NIMROD PANGARIBUAN",        phone: "082344047784", jabatan: "TOOL PUSHER" },
  "BMS 11":        { name: "AJAMESH",                   phone: "082172636542", jabatan: "TOOL PUSHER" },
  "BMS 11 HY":     { name: "SYAFRIL",                   phone: "081365706427", jabatan: "TOOL PUSHER" },
  "BMS 15":        { name: "ABANI AMAR PALA NASUTION",  phone: "085264000130", jabatan: "TOOL PUSHER" },
  "BMS 16":        { name: "DEDI SUSANTO",              phone: "081276767500", jabatan: "TOOL PUSHER" },
  "BMS 16 HY":     { name: "SUYITNO",                   phone: "081276343800", jabatan: "TOOL PUSHER" },
  "BMS 17":        { name: "JHON HENDRI",               phone: "081378043978", jabatan: "TOOL PUSHER" },
  "BMS 18":        { name: "MAJU SINAGA",               phone: "082386163303", jabatan: "TOOL PUSHER" },
  "BMS 19":        { name: "ANGGI YELLASMAN",           phone: "081261545400", jabatan: "TOOL PUSHER" },
  "BMS 20":        { name: "RANO",                      phone: "081276065540", jabatan: "TOOL PUSHER" },
  "BMS 21":        { name: "APRIADI",                   phone: "085297875353", jabatan: "TOOL PUSHER" },
};

/**
 * Dapatkan PIC untuk kendaraan tertentu.
 * Prioritas: data pic_name dari DB → mapping berdasarkan rig
 */
function getPicForVehicle(v) {
  if (v.pic_name) {
    return { name: v.pic_name, phone: v.pic_phone || "", jabatan: "PIC" };
  }
  const rig = String(v.rig || "").trim().toUpperCase();
  // Coba exact match dulu
  for (const [key, val] of Object.entries(RIG_PIC_MAP)) {
    if (rig === key.toUpperCase()) return val;
  }
  // Coba partial match (BMS 10 juga cocok untuk "10")
  for (const [key, val] of Object.entries(RIG_PIC_MAP)) {
    const k = key.toUpperCase().replace("BMS ", "");
    if (rig === k || rig.includes(k) || rig === `BMS ${k}`) return val;
  }
  return null;
}

export default function VehicleList() {
  const toast = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRig, setSelectedRig] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [cardMode, setCardMode] = useState(null); // 'view' | 'edit' | null
  const [saving, setSaving] = useState(false);
  const [activeCard, setActiveCard] = useState(null); // 'total' | 'active' | 'maintenance' | 'inactive'

  const loadVehicles = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.getVehicles();
      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setVehicles(data);
    } catch (error) {
      console.error("Get vehicles error:", error);
      setErrorMessage(error.message || "Gagal mengambil data armada kendaraan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

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

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const getDocStatus = (expiryDate) => {
    if (!expiryDate) return { label: "Tidak Ada Data", color: "text-gray-400 bg-gray-50 border-gray-200", status: "none" };
    const now = new Date();
    const exp = new Date(expiryDate);
    if (Number.isNaN(exp.getTime())) return { label: expiryDate, color: "text-gray-400 bg-gray-50 border-gray-200", status: "none" };

    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return {
        label: `Expired (${Math.abs(diffDays)} hr lalu)`,
        color: "bg-rose-50 text-rose-700 border-rose-200",
        status: "expired",
        diffDays,
      };
    }
    if (diffDays <= 30) {
      return {
        label: `Habis dlm ${diffDays} hari`,
        color: "bg-amber-50 text-amber-700 border-amber-200",
        status: "warning",
        diffDays,
      };
    }
    return {
      label: `Valid (${formatDate(expiryDate)})`,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      status: "valid",
      diffDays,
    };
  };

  // Overall compliance helper for table indicator
  const getOverallCompliance = (v) => {
    const dates = [v.kir_expiry, v.pass_expiry, v.pajak_expiry, v.stnk_expiry].filter(Boolean);
    if (dates.length === 0) return { label: "Data Belum Lengkap", type: "none" };

    const now = new Date();
    let hasExpired = false;
    let hasWarning = false;

    for (const d of dates) {
      const exp = new Date(d);
      if (!isNaN(exp.getTime())) {
        const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) hasExpired = true;
        else if (diffDays <= 30) hasWarning = true;
      }
    }

    if (hasExpired) return { label: "Dokumen Expired", type: "expired" };
    if (hasWarning) return { label: "Segera Expired", type: "warning" };
    return { label: "Legalitas Valid", type: "valid" };
  };

  // Summary statistics
  const stats = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter(
      (v) => String(v.status || "").toLowerCase() === "active"
    ).length;
    const maintenance = vehicles.filter(
      (v) => String(v.status || "").toLowerCase() === "maintenance"
    ).length;
    const inactive = vehicles.filter(
      (v) => String(v.status || "").toLowerCase() === "inactive"
    ).length;
    return { total, active, maintenance, inactive };
  }, [vehicles]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return vehicles.filter((v) => {
      // KPI card quick-filter
      if (activeCard === "active") {
        if (String(v.status || "").toLowerCase() !== "active") return false;
      } else if (activeCard === "maintenance") {
        if (String(v.status || "").toLowerCase() !== "maintenance") return false;
      } else if (activeCard === "inactive") {
        if (String(v.status || "").toLowerCase() !== "inactive") return false;
      }

      // Rig filter
      if (selectedRig !== "All") {
        const vehicleRig = String(v.rig || "").toLowerCase().replace(/\s+/g, "");
        const targetRig = String(selectedRig).toLowerCase().replace(/\s+/g, "");
        const cleanTarget = targetRig.replace("bms", "");
        if (vehicleRig !== targetRig && vehicleRig !== cleanTarget && !vehicleRig.includes(cleanTarget)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "All") {
        const vehicleCat = String(v.category || "").toLowerCase().trim();
        const targetCat = String(selectedCategory).toLowerCase().trim();
        if (vehicleCat !== targetCat) return false;
      }

      // Status filter
      if (statusFilter !== "All") {
        const vehicleStatus = String(v.status || "").toLowerCase().trim();
        if (vehicleStatus !== statusFilter.toLowerCase().trim()) return false;
      }

      if (!keyword) return true;

      return (
        String(v.plate_number || v.plate || "").toLowerCase().includes(keyword) ||
        String(v.type || "").toLowerCase().includes(keyword) ||
        String(v.brand || "").toLowerCase().includes(keyword) ||
        String(v.category || "").toLowerCase().includes(keyword) ||
        String(v.rig || "").toLowerCase().includes(keyword) ||
        String(v.rig_baru || "").toLowerCase().includes(keyword) ||
        String(v.owner_name || "").toLowerCase().includes(keyword) ||
        String(v.year || "").toLowerCase().includes(keyword) ||
        String(v.color || "").toLowerCase().includes(keyword) ||
        String(v.axle || "").toLowerCase().includes(keyword) ||
        String(v.description || "").toLowerCase().includes(keyword) ||
        String(v.pic_name || "").toLowerCase().includes(keyword) ||
        String(v.pic_phone || "").toLowerCase().includes(keyword)
      );
    });
  }, [vehicles, search, selectedRig, selectedCategory, statusFilter, activeCard]);

  const handleDelete = async (vehicle) => {
    const plate = vehicle.plate_number || vehicle.plate || vehicle.id;
    if (!window.confirm(`Hapus armada kendaraan dengan plat ${plate}?`)) return;

    try {
      await api.deleteVehicle(vehicle.id);
      setVehicles((prev) => prev.filter((item) => item.id !== vehicle.id));
      if (selectedVehicle?.id === vehicle.id) handleClose();
      toast.success("Armada kendaraan berhasil dihapus.");
    } catch (error) {
      console.error("Delete vehicle error:", error);
      toast.error(error.message || "Gagal menghapus kendaraan.");
    }
  };

  const handleView = (v) => {
    setSelectedVehicle(v);
    setCardMode("view");
  };

  const handleEdit = (v) => {
    setSelectedVehicle(v);
    setEditForm({
      id: v.id,
      plateNumber: v.plate_number || v.plate || "",
      brand: v.brand || "",
      type: v.type || "",
      ownerName: v.owner_name || "PT. BESMINDO MATERI SEWATAMA",
      category: v.category || "",
      axle: v.axle || "",
      year: v.year || "",
      color: v.color || "",
      rig: v.rig || "",
      rigBaru: v.rig_baru || "",
      stnkExpiry: formatDateForInput(v.stnk_expiry),
      pajakExpiry: formatDateForInput(v.pajak_expiry),
      kirExpiry: formatDateForInput(v.kir_expiry),
      passExpiry: formatDateForInput(v.pass_expiry),
      pic_name: v.pic_name || "",
      pic_phone: v.pic_phone || "",
      status: v.status || "Active",
      description: v.description || "",
    });
    setCardMode("edit");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm) return;

    setSaving(true);
    try {
      const payload = {
        plate_number: editForm.plateNumber.trim().toUpperCase(),
        type: editForm.type.trim(),
        brand: editForm.brand.trim() || null,
        owner_name: editForm.ownerName.trim() || null,
        category: editForm.category.trim() || null,
        axle: editForm.axle.trim() || null,
        year: editForm.year ? Number(editForm.year) : null,
        color: editForm.color.trim() || null,
        rig: editForm.rig ? editForm.rig.trim() : null,
        rig_baru: editForm.rigBaru ? editForm.rigBaru.trim() : null,
        stnk_expiry: editForm.stnkExpiry || null,
        pajak_expiry: editForm.pajakExpiry || null,
        kir_expiry: editForm.kirExpiry || null,
        pass_expiry: editForm.passExpiry || null,
        pic_name: editForm.pic_name ? editForm.pic_name.trim() : null,
        pic_phone: editForm.pic_phone ? editForm.pic_phone.trim() : null,
        status: editForm.status,
        description: editForm.description.trim() || null,
      };

      const res = await api.updateVehicle(editForm.id, payload);
      const updated = res.data || payload;

      setVehicles((prev) =>
        prev.map((v) => (v.id === editForm.id ? { ...v, ...updated } : v))
      );
      setSelectedVehicle({ ...selectedVehicle, ...updated });
      setCardMode("view");
      toast.success("Data kendaraan berhasil diperbarui.");
    } catch (err) {
      console.error("Update vehicle error:", err);
      toast.error(err.message || "Gagal memperbarui data kendaraan.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedVehicle(null);
    setCardMode(null);
    setEditForm(null);
  };

  // Dapatkan PIC efektif: prioritas dari DB, fallback dari data rig Excel
  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight">
            Manajemen Kendaraan & Armada Rig BMS
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Pusat database seluruh armada operasional rig pengeboran, kepatuhan izin jalan, dan legalitas K3LL.
          </p>
        </div>

        <Link
          to="/vehicles/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D8FF00] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#12372A] shadow-md shadow-[#D8FF00]/20 transition hover:bg-[#c9ee00] hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Tambah Kendaraan</span>
        </Link>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <button
          type="button"
          onClick={() => setActiveCard(activeCard === "total" ? null : "total")}
          className={`rounded-2xl border p-4 shadow-xs text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
            activeCard === "total"
              ? "border-[#12372A] bg-[#12372A]/5 ring-2 ring-[#12372A]/30"
              : "border-gray-200/70 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Total Armada Terdaftar
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-[#12372A]">{stats.total}</h3>
            <span className="text-xs text-gray-400 font-medium">Unit Armada</span>
          </div>
          {activeCard === "total" && (
            <span className="mt-2 inline-block text-[10px] font-bold text-[#12372A] bg-[#D8FF00] px-2 py-0.5 rounded-full">
              ▼ Menampilkan Semua
            </span>
          )}
        </button>

        {/* Active */}
        <button
          type="button"
          onClick={() => setActiveCard(activeCard === "active" ? null : "active")}
          className={`rounded-2xl border p-4 shadow-xs text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
            activeCard === "active"
              ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300"
              : "border-emerald-100 bg-emerald-50/40 hover:border-emerald-200"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Siap Operasional
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-emerald-700">{stats.active}</h3>
            <span className="text-xs text-emerald-600 font-semibold">Aktif Lapangan</span>
          </div>
          {activeCard === "active" && (
            <span className="mt-2 inline-block text-[10px] font-bold text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-full">
              ▼ Filter: Status Active
            </span>
          )}
        </button>

        {/* Maintenance */}
        <button
          type="button"
          onClick={() => setActiveCard(activeCard === "maintenance" ? null : "maintenance")}
          className={`rounded-2xl border p-4 shadow-xs text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
            activeCard === "maintenance"
              ? "border-orange-500 bg-orange-50 ring-2 ring-orange-300"
              : "border-orange-100 bg-orange-50/40 hover:border-orange-200"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            Dalam Perawatan / Servis
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-orange-700">{stats.maintenance}</h3>
            <span className="text-xs text-orange-600 font-semibold">Workshop</span>
          </div>
          {activeCard === "maintenance" && (
            <span className="mt-2 inline-block text-[10px] font-bold text-orange-800 bg-orange-200 px-2 py-0.5 rounded-full">
              ▼ Filter: Maintenance
            </span>
          )}
        </button>

        {/* Inactive */}
        <button
          type="button"
          onClick={() => setActiveCard(activeCard === "inactive" ? null : "inactive")}
          className={`rounded-2xl border p-4 shadow-xs text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
            activeCard === "inactive"
              ? "border-gray-500 bg-gray-100 ring-2 ring-gray-300"
              : "border-gray-200/70 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Non-Aktif / Yard Pool
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-700">{stats.inactive}</h3>
            <span className="text-xs text-gray-400 font-medium">Standby</span>
          </div>
          {activeCard === "inactive" && (
            <span className="mt-2 inline-block text-[10px] font-bold text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">
              ▼ Filter: Non-Aktif
            </span>
          )}
        </button>
      </div>


      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {errorMessage}
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="rounded-3xl border border-gray-200/70 bg-white p-5 shadow-xs space-y-4">
        {/* RIG & CATEGORY ROW */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* STATUS PILLS */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Active", "Maintenance", "Inactive"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === s
                    ? "bg-[#12372A] text-white shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s === "All" ? "Semua Status" : s}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* CATEGORY FILTER WITH CUSTOM OPTIONS */}
            <FilterSelectWithCustom
              label="Kategori"
              value={selectedCategory}
              onChange={setSelectedCategory}
              defaultOptions={categoryOptions}
              storageKey="vehicle_category"
              placeholderAll="Semua Kategori"
            />

            {/* RIG DROPDOWN WITH CUSTOM OPTIONS */}
            <FilterSelectWithCustom
              label="Penugasan Rig"
              icon={HardHat}
              value={selectedRig}
              onChange={setSelectedRig}
              defaultOptions={rigOptions}
              storageKey="vehicle_rig"
              placeholderAll="Semua Rig & Yard"
            />
          </div>
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
            placeholder="Cari plat nomor, brand (Hino, Iveco), model, rig..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/70 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
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

      {/* VEHICLES TABLE */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-4 pl-6">Plat Nomor & Pabrikan</th>
                <th className="py-4">Tipe & Kategori</th>
                <th className="py-4">Alokasi Rig</th>
                <th className="py-4">Axle / Tahun</th>
                <th className="py-4">PIC Kendaraan</th>
                <th className="py-4">Kepatuhan Legalitas K3LL</th>
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
                      <p className="font-semibold text-[#12372A]">Memuat data armada kendaraan BMS...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-gray-400">
                    <Car size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-bold text-gray-600">Tidak ada armada kendaraan yang sesuai filter</p>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => {
                  const plate = v.plate_number || v.plate || "-";
                  const compliance = getOverallCompliance(v);

                  return (
                    <tr
                      key={v.id}
                      className="group hover:bg-emerald-50/20 transition-colors"
                    >
                      {/* PLATE & BRAND */}
                      <td className="py-4 pl-6">
                        <div className="flex flex-col gap-1">
                          <div className="inline-flex items-center gap-2 self-start rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-black tracking-wider text-white border border-gray-700 shadow-xs font-mono">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#D8FF00]" />
                            <span>{plate}</span>
                          </div>
                          <span className="text-[11px] font-bold text-gray-500 pl-0.5">
                            {v.brand || "Umum"} {v.color ? `• ${v.color}` : ""}
                          </span>
                        </div>
                      </td>

                      {/* TYPE & CATEGORY */}
                      <td className="py-4">
                        <p className="font-bold text-gray-800">{v.type || "Vehicle"}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="inline-block rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/50">
                            {v.category || "LV"}
                          </span>
                        </div>
                      </td>

                      {/* RIG */}
                      <td className="py-4">
                        {v.rig ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 self-start rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200/60">
                              <HardHat size={12} />
                              {v.rig.startsWith("BMS") || v.rig === "SUPPORT" || v.rig === "YARD" ? v.rig : `Rig #${v.rig}`}
                            </span>
                            {v.rig_baru && (
                              <span className="text-[10px] text-gray-400 font-medium pl-0.5">
                                Baru: {v.rig_baru}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Pool / Standby</span>
                        )}
                      </td>

                      {/* AXLE / YEAR */}
                      <td className="py-4">
                        <p className="font-semibold text-gray-700">{v.axle || "-"}</p>
                        <p className="text-[11px] text-gray-400 font-medium">Tahun {v.year || "-"}</p>
                      </td>

                      {/* PIC */}
                      <td className="py-4">
                        {(() => {
                          const pic = getPicForVehicle(v);
                          if (!pic) return <span className="text-gray-400 text-xs">-</span>;
                          const isFromDB = !!v.pic_name;
                          return (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-800">
                                <UserCog size={12} className={`shrink-0 ${isFromDB ? "text-blue-500" : "text-amber-500"}`} />
                                {pic.name}
                              </span>
                              <span className="text-[11px] text-gray-400 font-medium pl-0.5">
                                {pic.position}
                              </span>
                              {pic.phone && (
                                <span className="text-[11px] text-gray-400 font-medium pl-0.5 flex items-center gap-1">
                                  <Phone size={10} />
                                  {pic.phone}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* COMPLIANCE INDICATOR */}
                      <td className="py-4">
                        {compliance.type === "valid" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            {compliance.label}
                          </span>
                        ) : compliance.type === "warning" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
                            <AlertTriangle size={13} className="text-amber-600" />
                            {compliance.label}
                          </span>
                        ) : compliance.type === "expired" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 border border-rose-200">
                            <AlertTriangle size={13} className="text-rose-600" />
                            {compliance.label}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">
                            {compliance.label}
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="py-4">
                        <StatusBadge status={v.status || "Active"} size="sm" />
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleView(v)}
                            title="Detail Spesifikasi Kendaraan"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-[#12372A] transition"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(v)}
                            title="Edit Kendaraan"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-700 transition"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(v)}
                            title="Hapus Kendaraan"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      {selectedVehicle && cardMode === "view" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={handleClose}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl p-6 sm:p-7 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00] shadow-sm">
                  <Car size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-gray-950 px-2.5 py-0.5 text-xs font-mono font-black tracking-wider text-white">
                      {selectedVehicle.plate_number || selectedVehicle.plate}
                    </span>
                    <StatusBadge status={selectedVehicle.status || "Active"} size="sm" />
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 mt-1">
                    {selectedVehicle.brand ? `${selectedVehicle.brand} • ` : ""}{selectedVehicle.type}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-5 text-xs">
              {/* SECTION 1: SPESIFIKASI KENDARAAN */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers size={13} />
                  Spesifikasi Teknis & Kepemilikan
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-2xl border border-gray-100 p-3 bg-[#F8FAFC]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Pemilik (Owner)</span>
                    <p className="text-xs font-bold text-gray-800 mt-0.5 truncate" title={selectedVehicle.owner_name}>
                      {selectedVehicle.owner_name || "PT. BESMINDO MATERI SEWATAMA"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-3 bg-[#F8FAFC]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Kategori Armada</span>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">
                      {selectedVehicle.category || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-3 bg-[#F8FAFC]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Konfigurasi Axle</span>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">
                      {selectedVehicle.axle || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-3 bg-[#F8FAFC]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Tahun Rakit</span>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">
                      {selectedVehicle.year || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-3 bg-[#F8FAFC]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Warna Fisik</span>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">
                      {selectedVehicle.color || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-3 bg-[#F8FAFC]">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Alokasi Rig BMS</span>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">
                      {selectedVehicle.rig ? `Rig ${selectedVehicle.rig}` : "Standby Pool"}
                    </p>
                  </div>
                </div>

                {/* PIC INFO - Semua Driver di Rig */}
                {(() => {
                  const pic = getPicForVehicle(selectedVehicle);
                  const allDrivers = getAllDriversByRig(selectedVehicle.rig);
                  if (!pic && allDrivers.length === 0) return null;
                  return (
                    <div className="mt-2.5 rounded-2xl border border-blue-100 bg-blue-50/40 p-3.5">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <UserCog size={13} className="text-blue-600" />
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                          PIC & Driver Rig {selectedVehicle.rig || "—"}
                        </span>
                      </div>
                      {pic && pic.source === "db" && (
                        <div className="mb-2 rounded-xl bg-blue-600 text-white px-3 py-2 flex items-center gap-2">
                          <UserCog size={13} className="shrink-0" />
                          <div>
                            <p className="text-xs font-bold">{pic.name}</p>
                            {pic.phone && <p className="text-[11px] opacity-80">{pic.phone}</p>}
                            <p className="text-[10px] opacity-70">PIC Terdaftar (Database)</p>
                          </div>
                        </div>
                      )}
                      {allDrivers.length > 0 && (
                        <div className="space-y-1.5">
                          {allDrivers.map((d, i) => (
                            <div key={i} className="flex items-center justify-between rounded-xl bg-white border border-blue-100 px-3 py-2">
                              <div>
                                <p className="text-xs font-bold text-gray-800">{d.name}</p>
                                <p className="text-[10px] text-blue-600 font-semibold">{d.position}</p>
                              </div>
                              {d.phone && d.phone !== "-" && (
                                <a href={`tel:${d.phone}`}
                                   className="text-[11px] text-gray-500 font-medium flex items-center gap-1 hover:text-blue-600 transition">
                                  <Phone size={10} /> {d.phone}
                                </a>
                              )}
                            </div>
                          ))}
                          <p className="text-[10px] text-gray-400 mt-1 text-right">Sumber: Data Karyawan AUG 2026</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                                {selectedVehicle.rig_baru && (
                  <div className="mt-2.5 rounded-2xl border border-amber-100 bg-amber-50/50 p-3">
                    <span className="text-[10px] font-bold text-amber-800 uppercase">Posisi / Rig Baru</span>
                    <p className="text-xs font-semibold text-amber-900 mt-0.5">
                      {selectedVehicle.rig_baru}
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 2: MASA BERLAKU DOKUMEN LEGALITAS K3LL */}
              <div>
                <h4 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  Masa Berlaku Dokumen Legalitas & Izin Jalan Migas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* STNK */}
                  {(() => {
                    const st = getDocStatus(selectedVehicle.stnk_expiry);
                    return (
                      <div className="rounded-2xl border border-gray-100 p-3.5 bg-white shadow-xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">STNK Kendaraan</span>
                          <span className="text-xs font-bold text-gray-800">{formatDate(selectedVehicle.stnk_expiry)}</span>
                        </div>
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })()}

                  {/* PAJAK */}
                  {(() => {
                    const st = getDocStatus(selectedVehicle.pajak_expiry);
                    return (
                      <div className="rounded-2xl border border-gray-100 p-3.5 bg-white shadow-xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Pajak Tahunan</span>
                          <span className="text-xs font-bold text-gray-800">{formatDate(selectedVehicle.pajak_expiry)}</span>
                        </div>
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })()}

                  {/* KIR DLLAJ */}
                  {(() => {
                    const st = getDocStatus(selectedVehicle.kir_expiry);
                    return (
                      <div className="rounded-2xl border border-gray-100 p-3.5 bg-white shadow-xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Uji Berkala KIR DLLAJ</span>
                          <span className="text-xs font-bold text-gray-800">{formatDate(selectedVehicle.kir_expiry)}</span>
                        </div>
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })()}

                  {/* RIG GATE PASS */}
                  {(() => {
                    const st = getDocStatus(selectedVehicle.pass_expiry);
                    return (
                      <div className="rounded-2xl border border-gray-100 p-3.5 bg-white shadow-xs flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">Rig Gate Pass</span>
                          <span className="text-xs font-bold text-gray-800">{formatDate(selectedVehicle.pass_expiry)}</span>
                        </div>
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* SECTION 3: CATATAN TAMBAHAN */}
              {selectedVehicle.description && (
                <div className="rounded-2xl border border-gray-100 p-3.5 bg-gray-50/70">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Catatan / Keterangan Tambahan</span>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed whitespace-pre-line">
                    {selectedVehicle.description}
                  </p>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-gray-100 pt-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleEdit(selectedVehicle)}
                className="rounded-xl bg-[#D8FF00] px-4 py-2 text-xs font-bold text-[#12372A] hover:bg-[#c9ee00] transition"
              >
                Ubah Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {selectedVehicle && cardMode === "edit" && editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={handleClose}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Edit Data Armada Kendaraan
                </h3>
                <p className="text-xs text-gray-400">
                  Perbarui spesifikasi, penetapan rig, atau tanggal kedaluwarsa dokumen izin jalan.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* PLATE NUMBER */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nomor Plat Polisi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="plateNumber"
                    value={editForm.plateNumber}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono font-bold text-gray-800 uppercase outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* OWNER NAME */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Pemilik (Owner)
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={editForm.ownerName}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* BRAND */}
                <FormSelectWithCustom
                  label="Brand / Pabrikan"
                  name="brand"
                  value={editForm.brand}
                  onChange={handleEditChange}
                  defaultOptions={brandOptions}
                  storageKey="vehicle_brand"
                  placeholder="-- Pilih Brand --"
                />

                {/* CATEGORY */}
                <FormSelectWithCustom
                  label="Kategori Armada BMS"
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  defaultOptions={categoryOptions.filter((c) => c !== "All")}
                  storageKey="vehicle_category"
                  placeholder="-- Pilih Kategori --"
                />

                {/* TYPE */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tipe / Model Kendaraan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    list="edit-type-suggestions"
                    type="text"
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                  <datalist id="edit-type-suggestions">
                    {vehicleTypeSuggestions.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>

                {/* AXLE */}
                <FormSelectWithCustom
                  label="Konfigurasi Axle"
                  name="axle"
                  value={editForm.axle}
                  onChange={handleEditChange}
                  defaultOptions={axleOptions}
                  storageKey="vehicle_axle"
                  placeholder="-- Pilih Gandar --"
                />

                {/* YEAR */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tahun Pembuatan
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={editForm.year}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* COLOR */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Warna Kendaraan
                  </label>
                  <input
                    list="edit-color-suggestions"
                    type="text"
                    name="color"
                    value={editForm.color}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                  <datalist id="edit-color-suggestions">
                    {colorSuggestions.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                {/* RIG */}
                <FormSelectWithCustom
                  label="Alokasi Rig"
                  name="rig"
                  value={editForm.rig}
                  onChange={handleEditChange}
                  defaultOptions={rigOptions.filter((r) => r !== "All")}
                  storageKey="vehicle_rig"
                  placeholder="Pool / Standby (Belum ditentukan)"
                />

                {/* RIG BARU */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Rig Baru / Posisi Terakhir
                  </label>
                  <input
                    type="text"
                    name="rigBaru"
                    value={editForm.rigBaru}
                    onChange={handleEditChange}
                    placeholder="Contoh: YARD, YARD / RUSAK..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* PIC NAME */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama PIC / Penanggung Jawab
                  </label>
                  <div className="relative">
                    <UserCog size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="pic_name"
                      value={editForm.pic_name}
                      onChange={handleEditChange}
                      placeholder="Nama penanggung jawab"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                    />
                  </div>
                </div>

                {/* PIC PHONE */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    No. HP / WhatsApp PIC
                  </label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="pic_phone"
                      value={editForm.pic_phone}
                      onChange={handleEditChange}
                      placeholder="0812-3456-7890"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                    />
                  </div>
                </div>

                {/* STATUS */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Status Armada
                  </label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  >
                    <option value="Active">Active (Siap Jalan)</option>
                    <option value="Maintenance">Maintenance (Workshop)</option>
                    <option value="Inactive">Inactive (Standby)</option>
                  </select>
                </div>

                {/* LEGALITAS DATES */}
                <div className="sm:col-span-2 pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Masa Berlaku Dokumen Legalitas & K3LL
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">STNK s/d</label>
                      <input
                        type="date"
                        name="stnkExpiry"
                        value={editForm.stnkExpiry}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Pajak s/d</label>
                      <input
                        type="date"
                        name="pajakExpiry"
                        value={editForm.pajakExpiry}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">KIR DLLAJ s/d</label>
                      <input
                        type="date"
                        name="kirExpiry"
                        value={editForm.kirExpiry}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Rig Gate Pass s/d</label>
                      <input
                        type="date"
                        name="passExpiry"
                        value={editForm.passExpiry}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Catatan Spesifikasi Kendaraan
                  </label>
                  <textarea
                    rows={2}
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#D8FF00] px-4 py-2 text-xs font-bold text-[#12372A] hover:bg-[#c9ee00] transition disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}