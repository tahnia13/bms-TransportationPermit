import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Phone,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  HardHat,
  HeartPulse,
  Mail,
  MapPin,
  ShieldCheck,
  CreditCard,
  Building,
  Users,
} from "lucide-react";
import { api } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import FilterSelectWithCustom from "../../components/FilterSelectWithCustom";
import FormSelectWithCustom from "../../components/FormSelectWithCustom";
import FileUploadField from "../../components/FileUploadField";
import { useToast } from "../../components/Toast";

const rigOptions = [
  "All",
  "BMS 02", "BMS 03", "BMS 03A", "BMS 05", "BMS 06", "BMS 07", "BMS 08",
  "BMS 10", "BMS 11", "BMS 15", "BMS 16", "BMS 17", "BMS 18", "BMS 19",
  "BMS 20", "BMS 21", "SUPPORT", "POOL", "YARD"
];

const positionFilterOptions = [
  "All",
  "BUS DRIVER",
  "RIG-BUS DRIVER",
  "POOL DRIVER",
  "FOCO OPERATOR",
  "VACUM OPERATOR",
  "TANDEM OPERATOR",
  "LOWBED OPERATOR",
  "DOZER OPERATOR",
  "CRANE OPERATOR",
  "FORKLIFT OPERATOR",
  "TRUCK PUSHER",
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

export default function DriverList() {
  const toast = useToast();
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRig, setSelectedRig] = useState("All");
  const [selectedPosition, setSelectedPosition] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [cardMode, setCardMode] = useState(null); // 'view' | 'edit' | null
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editLicenseFile, setEditLicenseFile] = useState(null); // File baru yang akan diupload saat edit
  const [activeCard, setActiveCard] = useState(null); // 'total' | 'active' | 'expiring' | 'assigned'

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.getDrivers();
      const raw = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      const formatted = raw.map((d) => ({
        id: `DR-${String(d.id).padStart(3, "0")}`,
        databaseId: d.id,
        name: d.name || "",
        badge_number: d.badge_number || "",
        position: d.position || "DRIVER",
        licenseNumber: d.license_number || "",
        licenseType: d.license_type || "SIM BII Umum",
        nik_ktp: d.nik_ktp || "",
        blood_type: d.blood_type || "",
        phone: d.phone || "",
        email: d.email || "",
        address: d.address || "",
        emergency_contact: d.emergency_contact || "",
        expiryDate: d.expiry_date || "",
        trainingDate: d.training_date || "",
        certification: d.certification || "Defensive Driving Course (DDC) & K3LL Migas",
        rig: d.rig || "",
        crew: d.crew || "",
        status: d.status || "Active",
        description: d.description || "",
      }));

      setDrivers(formatted);
    } catch (err) {
      console.error("Error loading drivers:", err);
      setError(err?.message || "Gagal mengambil data personil pengemudi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
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

  const getLicenseStatus = (expiryDate) => {
    if (!expiryDate) return { label: "Tidak Ada Data", color: "text-gray-400 bg-gray-50 border-gray-200", isExpired: false, isSoon: false };
    const now = new Date();
    const exp = new Date(expiryDate);
    if (Number.isNaN(exp.getTime())) return { label: expiryDate, color: "text-gray-400 bg-gray-50 border-gray-200", isExpired: false, isSoon: false };

    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return {
        label: `Expired (${Math.abs(diffDays)} hr lalu)`,
        color: "bg-rose-50 text-rose-700 border-rose-200",
        isExpired: true,
        isSoon: false,
      };
    }
    if (diffDays <= 30) {
      return {
        label: `Habis dlm ${diffDays} hari`,
        color: "bg-amber-50 text-amber-700 border-amber-200",
        isExpired: false,
        isSoon: true,
      };
    }
    return {
      label: `Valid s/d ${formatDate(expiryDate)}`,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      isExpired: false,
      isSoon: false,
    };
  };

  // KPI Statistics
  const stats = useMemo(() => {
    const total = drivers.length;
    let active = 0;
    let expiringSoon = 0;
    let assignedRig = 0;
    let onLeave = 0;

    drivers.forEach((d) => {
      const st = String(d.status).toLowerCase();
      if (st === "active") active++;
      else if (st === "on leave") onLeave++;
      if (d.rig) assignedRig++;
      const lStatus = getLicenseStatus(d.expiryDate);
      if (lStatus.isSoon || lStatus.isExpired) expiringSoon++;
    });

    return { total, active, expiringSoon, assignedRig, onLeave };
  }, [drivers]);

  // Filtered drivers
  const filteredDrivers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return drivers.filter((d) => {
      // KPI card quick-filter
      if (activeCard === "active") {
        if (String(d.status).toLowerCase() !== "active") return false;
      } else if (activeCard === "expiring") {
        const lStatus = getLicenseStatus(d.expiryDate);
        if (!lStatus.isSoon && !lStatus.isExpired) return false;
      } else if (activeCard === "assigned") {
        if (!d.rig) return false;
      }

      // Rig filter
      if (selectedRig !== "All") {
        const dRig = String(d.rig || "").toLowerCase().replace(/\s+/g, "");
        const tRig = String(selectedRig).toLowerCase().replace(/\s+/g, "");
        const cleanTarget = tRig.replace("bms", "");
        if (dRig !== tRig && dRig !== cleanTarget && !dRig.includes(cleanTarget)) {
          return false;
        }
      }

      // Position filter
      if (selectedPosition !== "All") {
        const dPos = String(d.position || "").toLowerCase();
        const tPos = String(selectedPosition).toLowerCase();
        if (!dPos.includes(tPos)) return false;
      }

      // Status filter
      if (selectedStatus !== "All") {
        const dStat = String(d.status || "").toLowerCase();
        const tStat = String(selectedStatus).toLowerCase();
        if (dStat !== tStat) return false;
      }

      if (!keyword) return true;

      return (
        d.id.toLowerCase().includes(keyword) ||
        d.name.toLowerCase().includes(keyword) ||
        String(d.badge_number).toLowerCase().includes(keyword) ||
        String(d.position).toLowerCase().includes(keyword) ||
        String(d.licenseNumber).toLowerCase().includes(keyword) ||
        String(d.nik_ktp).toLowerCase().includes(keyword) ||
        String(d.blood_type).toLowerCase().includes(keyword) ||
        String(d.phone).toLowerCase().includes(keyword) ||
        String(d.email).toLowerCase().includes(keyword) ||
        String(d.licenseType).toLowerCase().includes(keyword) ||
        String(d.rig).toLowerCase().includes(keyword) ||
        String(d.crew).toLowerCase().includes(keyword) ||
        String(d.description).toLowerCase().includes(keyword)
      );
    });
  }, [drivers, search, selectedRig, selectedPosition, selectedStatus, activeCard]);

  const handleDelete = async (driver) => {
    if (!window.confirm(`Hapus data personil ${driver.name} (Badge: ${driver.badge_number || driver.id})?`)) return;

    try {
      await api.deleteDriver(driver.databaseId);
      setDrivers((prev) => prev.filter((d) => d.databaseId !== driver.databaseId));
      if (selectedDriver?.databaseId === driver.databaseId) handleClose();
      toast.success("Data pengemudi berhasil dihapus.");
    } catch (err) {
      console.error("Delete driver error:", err);
      toast.error(err.message || "Gagal menghapus driver.");
    }
  };

  const handleView = (d) => {
    setSelectedDriver(d);
    setCardMode("view");
  };

  const handleEdit = (d) => {
    setSelectedDriver(d);
    setEditForm({
      databaseId: d.databaseId,
      id: d.id,
      name: d.name,
      badge_number: d.badge_number || "",
      position: d.position || "BUS DRIVER",
      licenseNumber: d.licenseNumber || "",
      licenseType: d.licenseType || "SIM BII Umum",
      nik_ktp: d.nik_ktp || "",
      blood_type: d.blood_type || "",
      phone: d.phone || "",
      email: d.email || "",
      address: d.address || "",
      emergency_contact: d.emergency_contact || "",
      expiryDate: formatDateForInput(d.expiryDate),
      trainingDate: formatDateForInput(d.trainingDate),
      certification: d.certification || "",
      rig: d.rig || "",
      crew: d.crew || "",
      status: d.status || "Active",
      description: d.description || "",
    });
    setEditLicenseFile(null); // reset file saat buka modal edit
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
        name: editForm.name.trim(),
        badge_number: editForm.badge_number.trim() || null,
        position: editForm.position.trim() || null,
        license_number: editForm.licenseNumber.trim(),
        license_type: editForm.licenseType || null,
        nik_ktp: editForm.nik_ktp.trim() || null,
        blood_type: editForm.blood_type.trim() || null,
        phone: editForm.phone.trim() || null,
        email: editForm.email.trim() || null,
        address: editForm.address.trim() || null,
        emergency_contact: editForm.emergency_contact.trim() || null,
        expiry_date: editForm.expiryDate || null,
        training_date: editForm.trainingDate || null,
        certification: editForm.certification.trim() || null,
        rig: editForm.rig ? editForm.rig.trim() : null,
        crew: editForm.crew ? editForm.crew.trim() : null,
        status: editForm.status,
        description: editForm.description ? editForm.description.trim() : null,
      };

      // Jika ada file baru yang dipilih, kirim multipart
      if (editLicenseFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([key, val]) => {
          if (val !== null && val !== undefined) fd.append(key, String(val));
        });
        fd.append("license_document", editLicenseFile);
        await api.updateDriverWithFile(editForm.databaseId, fd);
      } else {
        await api.updateDriver(editForm.databaseId, payload);
      }
      setEditLicenseFile(null);

      setDrivers((prev) =>
        prev.map((d) => (d.databaseId === editForm.databaseId ? { ...d, ...editForm } : d))
      );
      setSelectedDriver(editForm);
      setCardMode("view");
      toast.success("Data personil pengemudi berhasil diperbarui.");
    } catch (err) {
      console.error("Update driver error:", err);
      toast.error(err.message || "Gagal memperbarui data driver.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedDriver(null);
    setCardMode(null);
    setEditForm(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight">
            Direktori Pengemudi & Operator Rig BMS
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Database resmi seluruh pengemudi bus rig, operator alat berat (FOCO, Vacuum, Tandem, Lowbed, Dozer), dan safety passport K3LL.
          </p>
        </div>

        <Link
          to="/drivers/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D8FF00] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#12372A] shadow-md shadow-[#D8FF00]/20 transition hover:bg-[#c9ee00] hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Daftarkan Pengemudi</span>
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
            Total Personil Terdaftar
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-[#12372A]">{stats.total}</h3>
            <span className="text-xs text-gray-400 font-medium">Driver & Operator</span>
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
            Siap Tugas Lapangan
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-emerald-700">{stats.active}</h3>
            <span className="text-xs text-emerald-600 font-semibold">Aktif Operasional</span>
          </div>
          {activeCard === "active" && (
            <span className="mt-2 inline-block text-[10px] font-bold text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-full">
              ▼ Filter: Status Active
            </span>
          )}
        </button>

        {/* Expiring */}
        <button
          type="button"
          onClick={() => setActiveCard(activeCard === "expiring" ? null : "expiring")}
          className={`rounded-2xl border p-4 shadow-xs text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
            activeCard === "expiring"
              ? "border-amber-500 bg-amber-50 ring-2 ring-amber-300"
              : "border-amber-100 bg-amber-50/40 hover:border-amber-200"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            Perhatian Masa SIM / SIO
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-amber-700">{stats.expiringSoon}</h3>
            <span className="text-xs text-amber-600 font-semibold">≤ 30 Hari / Expired</span>
          </div>
          {activeCard === "expiring" && (
            <span className="mt-2 inline-block text-[10px] font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
              ▼ Filter: SIM Segera Habis / Expired
            </span>
          )}
        </button>

        {/* Assigned Rig */}
        <button
          type="button"
          onClick={() => setActiveCard(activeCard === "assigned" ? null : "assigned")}
          className={`rounded-2xl border p-4 shadow-xs text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
            activeCard === "assigned"
              ? "border-gray-500 bg-gray-100 ring-2 ring-gray-300"
              : "border-gray-200/70 bg-white hover:border-gray-300"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Ditugaskan Pada Rig Aktif
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-800">{stats.assignedRig}</h3>
            <span className="text-xs text-gray-400 font-medium">Rig Sites</span>
          </div>
          {activeCard === "assigned" && (
            <span className="mt-2 inline-block text-[10px] font-bold text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">
              ▼ Filter: Ada Penugasan Rig
            </span>
          )}
        </button>
      </div>


      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="rounded-3xl border border-gray-200/70 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* STATUS PILLS */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Active", "On Leave", "Standby", "Inactive"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedStatus(s)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedStatus === s
                    ? "bg-[#12372A] text-white shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s === "All" ? "Semua Status" : s}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* POSITION FILTER WITH CUSTOM OPTIONS */}
            <FilterSelectWithCustom
              label="Posisi"
              value={selectedPosition}
              onChange={setSelectedPosition}
              defaultOptions={positionFilterOptions}
              storageKey="driver_position"
              placeholderAll="Semua Jabatan"
            />

            {/* RIG FILTER WITH CUSTOM OPTIONS */}
            <FilterSelectWithCustom
              label="Alokasi Rig"
              icon={HardHat}
              value={selectedRig}
              onChange={setSelectedRig}
              defaultOptions={rigOptions}
              storageKey="driver_rig"
              placeholderAll="Semua Rig & Pool"
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
            placeholder="Cari nama karyawan, nomor badge, NIK KTP, SIM, telepon, posisi..."
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

      {/* DRIVERS TABLE */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-4 pl-6">Personil & Badge BMS</th>
                <th className="py-4">Jabatan & Penugasan</th>
                <th className="py-4">Lisensi SIM / SIO</th>
                <th className="py-4">Masa Berlaku SIM</th>
                <th className="py-4">Kontak & Medis</th>
                <th className="py-4">Status</th>
                <th className="py-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#D8FF00] border-t-[#12372A]" />
                      <p className="font-semibold text-[#12372A]">Memuat data personil pengemudi BMS...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-400">
                    <UserRound size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-bold text-gray-600">Tidak ada pengemudi / operator yang sesuai filter</p>
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((d) => {
                  const lic = getLicenseStatus(d.expiryDate);

                  return (
                    <tr
                      key={d.databaseId}
                      className="group hover:bg-emerald-50/20 transition-colors"
                    >
                      {/* DRIVER AVATAR & NAME */}
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#12372A] to-emerald-800 text-[#D8FF00] font-black text-xs shadow-xs">
                            {d.name ? d.name.charAt(0).toUpperCase() : "D"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{d.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {d.badge_number ? (
                                <span className="rounded bg-gray-900 px-1.5 py-0.2 font-mono text-[10px] font-bold text-white">
                                  #{d.badge_number}
                                </span>
                              ) : (
                                <span className="font-mono text-[11px] font-semibold text-gray-400">
                                  {d.id}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* JABATAN & PENUGASAN */}
                      <td className="py-4">
                        <p className="font-bold text-gray-800">{d.position || "DRIVER"}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {d.rig ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200/60">
                              <HardHat size={11} />
                              {d.rig.startsWith("BMS") || d.rig === "SUPPORT" || d.rig === "POOL" ? d.rig : `Rig #${d.rig}`}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Pool / Standby</span>
                          )}
                          {d.crew && (
                            <span className="text-[10px] font-semibold text-gray-400">
                              {d.crew}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* LICENSE */}
                      <td className="py-4">
                        <p className="font-mono font-bold text-gray-800">{d.licenseNumber || "-"}</p>
                        <span className="inline-block rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/50 mt-0.5">
                          {d.licenseType}
                        </span>
                      </td>

                      {/* EXPIRY COUNTDOWN */}
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${lic.color}`}>
                          {lic.isExpired && <AlertTriangle size={11} />}
                          {lic.isSoon && <Clock3 size={11} />}
                          {!lic.isExpired && !lic.isSoon && <CheckCircle2 size={11} />}
                          <span>{lic.label}</span>
                        </span>
                      </td>

                      {/* CONTACT & BLOOD TYPE */}
                      <td className="py-4">
                        <div className="flex flex-col gap-0.5">
                          {d.phone ? (
                            <span className="inline-flex items-center gap-1 text-gray-700 font-medium">
                              <Phone size={11} className="text-gray-400" />
                              {d.phone}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                          {d.blood_type && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700">
                              <HeartPulse size={10} className="text-rose-500" />
                              Goldar: {d.blood_type}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-4">
                        <StatusBadge status={d.status} size="sm" />
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleView(d)}
                            title="Detail Profil Safety Passport"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-[#12372A] transition"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(d)}
                            title="Edit Data Driver"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-700 transition"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(d)}
                            title="Hapus Driver"
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

      {/* DRIVER SAFETY PASSPORT MODAL (VIEW) */}
      {selectedDriver && cardMode === "view" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={handleClose}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CARD BADGE HEADER */}
            <div className="bg-gradient-to-r from-[#12372A] via-[#1b4e3c] to-[#12372A] p-6 text-white relative">
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-xl p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D8FF00] text-[#12372A] font-black text-2xl shadow-md shrink-0">
                  {selectedDriver.name ? selectedDriver.name.charAt(0).toUpperCase() : "D"}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#D8FF00] block">
                    PT Besmindo Materi Sewatama • Driver Safety Passport
                  </span>
                  <h3 className="text-lg font-black text-white leading-snug">
                    {selectedDriver.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {selectedDriver.badge_number && (
                      <span className="rounded bg-black/40 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-200">
                        BADGE: {selectedDriver.badge_number}
                      </span>
                    )}
                    <span className="text-xs text-emerald-100 font-medium">
                      {selectedDriver.position}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-6 sm:p-7 space-y-5 text-xs">
              <div className="flex items-center justify-between rounded-2xl bg-[#F6F8F7] p-3.5 border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-600">Status Kesiapan Kerja:</span>
                  <StatusBadge status={selectedDriver.status} size="sm" />
                </div>
                {selectedDriver.blood_type && (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700 border border-rose-200">
                    <HeartPulse size={13} className="text-rose-600" />
                    Golongan Darah {selectedDriver.blood_type}
                  </span>
                )}
              </div>

              {/* KEPEGAWAIAN & IDENTITAS */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <UserRound size={13} />
                  Data Kepegawaian & Penugasan Rig
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">NIK KTP</span>
                    <p className="text-xs font-mono font-bold text-gray-800 mt-0.5">
                      {selectedDriver.nik_ktp || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Alokasi Rig</span>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">
                      {selectedDriver.rig ? `Rig ${selectedDriver.rig}` : "Pool / Standby"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Regu Kerja (Crew)</span>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">
                      {selectedDriver.crew || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* KUALIFIKASI SIM & SAFETY */}
              <div>
                <h4 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  Kualifikasi Lisensi & Sertifikasi K3LL
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-2xl border border-gray-100 p-3.5 bg-white shadow-xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Nomor & Tipe SIM</span>
                    <p className="text-xs font-mono font-black text-gray-800 mt-0.5">
                      {selectedDriver.licenseNumber || "-"}
                    </p>
                    <span className="inline-block rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 mt-1">
                      {selectedDriver.licenseType}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-3.5 bg-white shadow-xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Masa Berlaku SIM</span>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">
                      {formatDate(selectedDriver.expiryDate)}
                    </p>
                    <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold border mt-1 ${getLicenseStatus(selectedDriver.expiryDate).color}`}>
                      {getLicenseStatus(selectedDriver.expiryDate).label}
                    </span>
                  </div>

                  <div className="col-span-2 rounded-2xl border border-gray-100 p-3.5 bg-white shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Sertifikasi & Tanggal DDC</span>
                    <p className="text-xs font-bold text-gray-800">
                      {selectedDriver.certification || "Defensive Driving Course (DDC)"}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Pelatihan / Refresh Terakhir: {formatDate(selectedDriver.trainingDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* KONTAK & ALAMAT */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Phone size={13} />
                  Kontak & Domisili Karyawan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Telepon / WhatsApp</span>
                    <a href={`tel:${selectedDriver.phone}`} className="text-xs font-bold text-[#12372A] hover:underline">
                      {selectedDriver.phone || "-"}
                    </a>
                  </div>

                  <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Email Karyawan</span>
                    <p className="text-xs font-medium text-gray-700 truncate" title={selectedDriver.email}>
                      {selectedDriver.email || "-"}
                    </p>
                  </div>

                  {selectedDriver.emergency_contact && (
                    <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50 col-span-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Kontak Darurat (Keluarga)</span>
                      <p className="text-xs font-bold text-gray-800 mt-0.5">
                        {selectedDriver.emergency_contact}
                      </p>
                    </div>
                  )}

                  {selectedDriver.address && (
                    <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50 col-span-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Alamat Domisili</span>
                      <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">
                        {selectedDriver.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* CATATAN */}
              {selectedDriver.description && (
                <div className="rounded-2xl border border-gray-100 p-3.5 bg-gray-50/70">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Catatan / Riwayat</span>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                    {selectedDriver.description}
                  </p>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleEdit(selectedDriver)}
                className="rounded-xl bg-[#D8FF00] px-4 py-2 text-xs font-bold text-[#12372A] hover:bg-[#c9ee00] transition"
              >
                Ubah Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DRIVER MODAL */}
      {selectedDriver && cardMode === "edit" && editForm && (
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
                  Edit Data Personil Pengemudi
                </h3>
                <p className="text-xs text-gray-400">
                  Perbarui identitas badge, kualifikasi SIM, alokasi rig, atau kontak darurat.
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
                {/* NAMA LENGKAP */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* BADGE NUMBER */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nomor Badge BMS
                  </label>
                  <input
                    type="text"
                    name="badge_number"
                    value={editForm.badge_number}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* JABATAN */}
                <FormSelectWithCustom
                  label="Jabatan / Posisi"
                  name="position"
                  value={editForm.position}
                  onChange={handleEditChange}
                  defaultOptions={positionFilterOptions.filter((p) => p !== "All")}
                  storageKey="driver_position"
                  placeholder="-- Pilih atau Tambah Jabatan --"
                />

                {/* NIK KTP */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    NIK KTP (16 Digit)
                  </label>
                  <input
                    type="text"
                    name="nik_ktp"
                    value={editForm.nik_ktp}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* NOMOR SIM */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nomor Lisensi SIM / SIO <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={editForm.licenseNumber}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* GOLONGAN SIM */}
                <FormSelectWithCustom
                  label="Jenis Lisensi SIM / SIO"
                  name="licenseType"
                  value={editForm.licenseType}
                  onChange={handleEditChange}
                  defaultOptions={licenseTypeOptions}
                  storageKey="driver_license_type"
                  placeholder="-- Pilih Jenis SIM / SIO --"
                />

                {/* MASA BERLAKU SIM */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Masa Berlaku SIM
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={editForm.expiryDate}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* TANGGAL TRAINING DDC */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tanggal Pelatihan DDC / K3
                  </label>
                  <input
                    type="date"
                    name="trainingDate"
                    value={editForm.trainingDate}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* ALOKASI RIG */}
                <FormSelectWithCustom
                  label="Alokasi Penugasan Rig"
                  name="rig"
                  value={editForm.rig}
                  onChange={handleEditChange}
                  defaultOptions={rigOptions.filter((r) => r !== "All")}
                  storageKey="driver_rig"
                  placeholder="Pool / Standby (Belum ditentukan)"
                />

                {/* CREW */}
                <FormSelectWithCustom
                  label="Regu Kerja (Crew)"
                  name="crew"
                  value={editForm.crew}
                  onChange={handleEditChange}
                  defaultOptions={crewOptions}
                  storageKey="driver_crew"
                  placeholder="-- Pilih Crew --"
                />

                {/* TELEPHONE */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* GOLONGAN DARAH */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Golongan Darah (K3 Medis)
                  </label>
                  <select
                    name="blood_type"
                    value={editForm.blood_type}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  >
                    <option value="">-- Belum Diketahui --</option>
                    {bloodTypeOptions.map((b) => (
                      <option key={b} value={b}>Golongan Darah {b}</option>
                    ))}
                  </select>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* STATUS */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Status Pengemudi
                  </label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  >
                    <option value="Active">Active (Siap Tugas)</option>
                    <option value="On Leave">On Leave (Cuti / Roster Off)</option>
                    <option value="Standby">Standby Pool</option>
                    <option value="Inactive">Inactive (Non-Aktif)</option>
                  </select>
                </div>

                {/* SERTIFIKASI */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Sertifikasi Keselamatan K3LL
                  </label>
                  <input
                    type="text"
                    name="certification"
                    value={editForm.certification}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* UPLOAD DOKUMEN SIM / K3LL */}
                <FileUploadField
                  label="Upload / Ganti Dokumen SIM / Sertifikat K3LL"
                  name="license_document_edit"
                  accept="image/*,application/pdf"
                  file={editLicenseFile}
                  onFileChange={setEditLicenseFile}
                  existingUrl={editForm.license_document_url || null}
                  existingName={editForm.license_document_name || null}
                  hint="Upload file baru untuk mengganti dokumen yang tersimpan. Format: JPG, PNG, atau PDF."
                />

                {/* ALAMAT */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Alamat Domisili
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                {/* CATATAN */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Catatan Khusus
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