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
} from "lucide-react";
import { api } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";

const rigOptions = [
  "All",
  "02", "03", "03A", "5", "6", "7", "8", "10", "11",
  "15", "16", "17", "18", "19", "20", "21",
];

export default function DriverList() {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRig, setSelectedRig] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [cardMode, setCardMode] = useState(null); // 'view' | 'edit' | null
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

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
        licenseNumber: d.license_number || "",
        phone: d.phone || "",
        licenseType: d.license_type || "SIM BII Umum",
        expiryDate: d.expiry_date || "",
        trainingDate: d.training_date || "",
        rig: d.rig || "",
        status: d.status || "Active",
        description: d.description || "",
      }));

      setDrivers(formatted);
    } catch (err) {
      console.error("Error loading drivers:", err);
      setError(err?.message || "Gagal mengambil data pengemudi.");
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

  const getLicenseStatus = (expiryDate) => {
    if (!expiryDate) return { label: "Tidak Ada Data", color: "text-gray-400", isExpired: false, isSoon: false };
    const now = new Date();
    const exp = new Date(expiryDate);
    if (Number.isNaN(exp.getTime())) return { label: expiryDate, color: "text-gray-400" };

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

    drivers.forEach((d) => {
      if (String(d.status).toLowerCase() === "active") active++;
      if (d.rig) assignedRig++;
      const lStatus = getLicenseStatus(d.expiryDate);
      if (lStatus.isSoon || lStatus.isExpired) expiringSoon++;
    });

    return { total, active, expiringSoon, assignedRig };
  }, [drivers]);

  // Filtered drivers
  const filteredDrivers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return drivers.filter((d) => {
      if (selectedRig !== "All") {
        const dRig = String(d.rig || "").toLowerCase().trim();
        const tRig = String(selectedRig).toLowerCase().trim();
        if (dRig !== tRig) return false;
      }

      if (!keyword) return true;

      return (
        d.id.toLowerCase().includes(keyword) ||
        d.name.toLowerCase().includes(keyword) ||
        d.licenseNumber.toLowerCase().includes(keyword) ||
        d.phone.toLowerCase().includes(keyword) ||
        d.licenseType.toLowerCase().includes(keyword) ||
        d.rig.toLowerCase().includes(keyword) ||
        d.description.toLowerCase().includes(keyword)
      );
    });
  }, [drivers, search, selectedRig]);

  const handleDelete = async (driver) => {
    if (!window.confirm(`Hapus data pengemudi ${driver.name}?`)) return;

    try {
      await api.deleteDriver(driver.databaseId);
      setDrivers((prev) => prev.filter((d) => d.databaseId !== driver.databaseId));
      if (selectedDriver?.databaseId === driver.databaseId) handleClose();
      alert("Pengemudi berhasil dihapus.");
    } catch (err) {
      console.error("Delete driver error:", err);
      alert(err.message || "Gagal menghapus driver.");
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
      licenseNumber: d.licenseNumber,
      phone: d.phone,
      licenseType: d.licenseType,
      expiryDate: d.expiryDate,
      trainingDate: d.trainingDate,
      rig: d.rig,
      status: d.status,
      description: d.description,
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
        name: editForm.name.trim(),
        license_number: editForm.licenseNumber.trim(),
        phone: editForm.phone.trim() || null,
        license_type: editForm.licenseType,
        expiry_date: editForm.expiryDate,
        training_date: editForm.trainingDate || null,
        rig: editForm.rig ? editForm.rig.trim() : null,
        status: editForm.status,
        description: editForm.description ? editForm.description.trim() : null,
      };

      await api.updateDriver(editForm.databaseId, payload);

      setDrivers((prev) =>
        prev.map((d) => (d.databaseId === editForm.databaseId ? { ...d, ...editForm } : d))
      );
      setSelectedDriver(editForm);
      setCardMode("view");
      alert("Data pengemudi berhasil diperbarui.");
    } catch (err) {
      console.error("Update driver error:", err);
      alert(err.message || "Gagal memperbarui data driver.");
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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight">
            Direktori Pengemudi & Safety Passport
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Daftar pengemudi tersertifikasi, kepatuhan masa berlaku SIM, dan penugasan lokasi rig.
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
        <div className="rounded-2xl border border-gray-200/70 bg-white p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Total Pengemudi
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-[#12372A]">{stats.total}</h3>
            <span className="text-xs text-gray-400">Orang</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Siap Tugas (Aktif)
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-emerald-700">{stats.active}</h3>
            <span className="text-xs text-emerald-600 font-semibold">Siap Jalan</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            Perhatian Masa SIM
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-amber-700">{stats.expiringSoon}</h3>
            <span className="text-xs text-amber-600 font-semibold">≤ 30 Hari / Expired</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/70 bg-white p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Ditugaskan ke Rig
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-800">{stats.assignedRig}</h3>
            <span className="text-xs text-gray-400">On Duty</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="rounded-3xl border border-gray-200/70 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pengemudi, nomor SIM, telepon, rig..."
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

          <div className="flex items-center gap-2 self-start sm:self-center">
            <HardHat size={15} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-600">Alokasi Rig:</span>
            <select
              value={selectedRig}
              onChange={(e) => setSelectedRig(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-800 outline-none focus:border-[#12372A]"
            >
              {rigOptions.map((r) => (
                <option key={r} value={r}>
                  {r === "All" ? "Semua Rig" : `Rig #${r}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* DRIVERS TABLE */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-4 pl-6">ID & Pengemudi</th>
                <th className="py-4">Kontak / Telepon</th>
                <th className="py-4">Lisensi (SIM)</th>
                <th className="py-4">Masa Berlaku SIM</th>
                <th className="py-4">Penugasan Rig</th>
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
                      <p className="font-semibold text-[#12372A]">Memuat data pengemudi...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-400">
                    <UserRound size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-bold text-gray-600">Tidak ada pengemudi ditemukan</p>
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
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#12372A] to-emerald-800 text-[#D8FF00] font-bold text-xs shadow-xs">
                            {d.name ? d.name.charAt(0).toUpperCase() : "D"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{d.name}</p>
                            <span className="font-mono text-[11px] font-semibold text-gray-400">
                              {d.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* PHONE */}
                      <td className="py-4 font-medium text-gray-600">
                        {d.phone ? (
                          <span className="inline-flex items-center gap-1">
                            <Phone size={12} className="text-gray-400" />
                            {d.phone}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* LICENSE */}
                      <td className="py-4">
                        <p className="font-bold text-gray-800">{d.licenseNumber || "-"}</p>
                        <span className="inline-block rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600">
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

                      {/* RIG */}
                      <td className="py-4">
                        {d.rig ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200/60">
                            <HardHat size={12} />
                            Rig #{d.rig}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Pool / Standby</span>
                        )}
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
                            title="Driver Passport / ID"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-[#12372A]"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(d)}
                            title="Edit Driver"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(d)}
                            title="Hapus Driver"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-rose-50 hover:text-rose-600"
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

      {/* DRIVER SAFETY PASSPORT MODAL */}
      {selectedDriver && cardMode === "view" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={handleClose}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CARD BADGE HEADER */}
            <div className="bg-[#12372A] p-6 text-white relative">
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-xl p-1 text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D8FF00] text-[#12372A] font-black text-xl shadow-md">
                  {selectedDriver.name ? selectedDriver.name.charAt(0).toUpperCase() : "D"}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D8FF00] block">
                    Besmindo Driver Passport
                  </span>
                  <h3 className="text-lg font-black text-white leading-snug">
                    {selectedDriver.name}
                  </h3>
                  <span className="font-mono text-xs text-emerald-200/70 font-semibold">
                    {selectedDriver.id}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 border border-gray-100">
                <span className="font-bold text-gray-600">Status Pengemudi</span>
                <StatusBadge status={selectedDriver.status} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Nomor SIM</span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {selectedDriver.licenseNumber || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Golongan SIM</span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {selectedDriver.licenseType}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Masa Berlaku SIM</span>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">
                    {formatDate(selectedDriver.expiryDate)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Safety Training</span>
                  <p className="text-xs font-bold text-gray-800 mt-0.5">
                    {formatDate(selectedDriver.trainingDate)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Alokasi Rig</span>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  {selectedDriver.rig ? `Rig #${selectedDriver.rig}` : "Pool / Standby"}
                </span>
              </div>

              {selectedDriver.phone && (
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Kontak</span>
                  <a
                    href={`tel:${selectedDriver.phone}`}
                    className="text-xs font-bold text-[#12372A] hover:underline"
                  >
                    {selectedDriver.phone}
                  </a>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleEdit(selectedDriver)}
                className="rounded-xl bg-[#D8FF00] px-4 py-2 text-xs font-bold text-[#12372A] hover:bg-[#c9ee00]"
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
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Edit Data Pengemudi
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Nama Lengkap
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

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nomor SIM
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={editForm.licenseNumber}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Golongan SIM
                  </label>
                  <select
                    name="licenseType"
                    value={editForm.licenseType}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  >
                    <option value="SIM A">SIM A (Mobil Pribadi)</option>
                    <option value="SIM B1">SIM B1</option>
                    <option value="SIM B1 Umum">SIM B1 Umum</option>
                    <option value="SIM B2">SIM B2 (Alat Berat)</option>
                    <option value="SIM B2 Umum">SIM B2 Umum (Truk Gandeng/Rig)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Masa Berlaku SIM
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={editForm.expiryDate}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tanggal Safety Training
                  </label>
                  <input
                    type="date"
                    name="trainingDate"
                    value={editForm.trainingDate}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Alokasi Rig
                  </label>
                  <select
                    name="rig"
                    value={editForm.rig}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  >
                    <option value="">Pool / Standby</option>
                    {rigOptions.filter((r) => r !== "All").map((r) => (
                      <option key={r} value={r}>Rig #{r}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
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
                    <option value="Inactive">Inactive (Cuti / Non-Aktif)</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
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