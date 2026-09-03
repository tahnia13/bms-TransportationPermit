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
} from "lucide-react";
import { api } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";

const rigOptions = [
  "All",
  "02",
  "03",
  "03A",
  "5",
  "6",
  "7",
  "8",
  "10",
  "11",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
];

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRig, setSelectedRig] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [cardMode, setCardMode] = useState(null); // 'view' | 'edit' | null
  const [saving, setSaving] = useState(false);

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
      setErrorMessage(error.message || "Gagal mengambil data kendaraan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

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
      // Rig filter
      if (selectedRig !== "All") {
        const vehicleRig = String(v.rig || "").toLowerCase().trim();
        const targetRig = String(selectedRig).toLowerCase().trim();
        if (vehicleRig !== targetRig) return false;
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
        String(v.category || "").toLowerCase().includes(keyword) ||
        String(v.rig || "").toLowerCase().includes(keyword) ||
        String(v.year || "").toLowerCase().includes(keyword) ||
        String(v.description || "").toLowerCase().includes(keyword)
      );
    });
  }, [vehicles, search, selectedRig, statusFilter]);

  const handleDelete = async (vehicle) => {
    const plate = vehicle.plate_number || vehicle.plate || vehicle.id;
    if (!window.confirm(`Hapus kendaraan dengan plat ${plate}?`)) return;

    try {
      await api.deleteVehicle(vehicle.id);
      setVehicles((prev) => prev.filter((item) => item.id !== vehicle.id));
      if (selectedVehicle?.id === vehicle.id) handleClose();
      alert("Kendaraan berhasil dihapus.");
    } catch (error) {
      console.error("Delete vehicle error:", error);
      alert(error.message || "Gagal menghapus kendaraan.");
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
      type: v.type || "",
      category: v.category || "",
      year: v.year || "",
      rig: v.rig || "",
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
        category: editForm.category.trim() || null,
        year: editForm.year ? Number(editForm.year) : null,
        rig: editForm.rig ? editForm.rig.trim() : null,
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
      alert("Data kendaraan berhasil diperbarui.");
    } catch (err) {
      console.error("Update vehicle error:", err);
      alert(err.message || "Gagal memperbarui data kendaraan.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedVehicle(null);
    setCardMode(null);
    setEditForm(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight">
            Manajemen Kendaraan & Armada Rig
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Inventaris seluruh kendaraan operasional, alokasi rig, dan riwayat pemeliharaan.
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
        <div className="rounded-2xl border border-gray-200/70 bg-white p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Total Armada
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-[#12372A]">{stats.total}</h3>
            <span className="text-xs text-gray-400">Unit terdaftar</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Siap Operasional
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-emerald-700">{stats.active}</h3>
            <span className="text-xs text-emerald-600 font-semibold">Aktif</span>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            Dalam Perawatan
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-orange-700">{stats.maintenance}</h3>
            <span className="text-xs text-orange-600 font-semibold">Workshop</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/70 bg-white p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Non-Aktif / Standby
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-gray-700">{stats.inactive}</h3>
            <span className="text-xs text-gray-400">Standby</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {errorMessage}
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="rounded-3xl border border-gray-200/70 bg-white p-5 shadow-xs space-y-4">
        {/* RIG & STATUS ROW */}
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

          {/* RIG DROPDOWN */}
          <div className="flex items-center gap-2">
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
            placeholder="Cari plat nomor, model kendaraan, kategori..."
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
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-4 pl-6">Plat Nomor</th>
                <th className="py-4">Tipe & Kategori</th>
                <th className="py-4">Alokasi Rig</th>
                <th className="py-4">Tahun</th>
                <th className="py-4">Status</th>
                <th className="py-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#D8FF00] border-t-[#12372A]" />
                      <p className="font-semibold text-[#12372A]">Memuat data armada kendaraan...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-gray-400">
                    <Car size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-bold text-gray-600">Tidak ada kendaraan ditemukan</p>
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => {
                  const plate = v.plate_number || v.plate || "-";

                  return (
                    <tr
                      key={v.id}
                      className="group hover:bg-emerald-50/20 transition-colors"
                    >
                      {/* PLATE BADGE */}
                      <td className="py-4 pl-6">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-2.5 py-1 text-xs font-black tracking-widest text-white border border-gray-700 shadow-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#D8FF00]" />
                          <span>{plate}</span>
                        </div>
                      </td>

                      {/* TYPE & CATEGORY */}
                      <td className="py-4">
                        <p className="font-bold text-gray-800">{v.type || "Vehicle"}</p>
                        <p className="text-[11px] text-gray-400 font-medium">
                          {v.category || "Light Truck"}
                        </p>
                      </td>

                      {/* RIG */}
                      <td className="py-4">
                        {v.rig ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200/60">
                            <HardHat size={12} />
                            Rig #{v.rig}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Pool / Standby</span>
                        )}
                      </td>

                      {/* YEAR */}
                      <td className="py-4 font-semibold text-gray-600">
                        {v.year || "-"}
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
                            title="Detail Kendaraan"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-[#12372A]"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(v)}
                            title="Edit Kendaraan"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(v)}
                            title="Hapus Kendaraan"
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

      {/* VIEW MODAL */}
      {selectedVehicle && cardMode === "view" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={handleClose}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00]">
                  <Car size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Spesifikasi Kendaraan
                  </h3>
                  <p className="text-xs text-gray-400">
                    {selectedVehicle.plate_number || selectedVehicle.plate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center rounded-2xl bg-[#F6F8F7] p-4 border border-gray-100">
                <span className="font-semibold text-gray-600">Status Operasi</span>
                <StatusBadge status={selectedVehicle.status || "Active"} size="md" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Tipe Model</span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {selectedVehicle.type || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Kategori</span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {selectedVehicle.category || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Alokasi Rig</span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {selectedVehicle.rig ? `Rig #${selectedVehicle.rig}` : "Tidak ditugaskan"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Tahun Rakit</span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {selectedVehicle.year || "-"}
                  </p>
                </div>
              </div>

              {selectedVehicle.description && (
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Catatan / Keterangan</span>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                    {selectedVehicle.description}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleEdit(selectedVehicle)}
                className="rounded-xl bg-[#D8FF00] px-4 py-2 text-xs font-bold text-[#12372A] hover:bg-[#c9ee00]"
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
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Edit Data Kendaraan
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Plat Nomor
                  </label>
                  <input
                    type="text"
                    name="plateNumber"
                    value={editForm.plateNumber}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tipe / Model
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Alokasi Rig
                  </label>
                  <select
                    name="rig"
                    value={editForm.rig}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  >
                    <option value="">Tidak Ditugaskan</option>
                    {rigOptions.filter((r) => r !== "All").map((r) => (
                      <option key={r} value={r}>Rig #{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Tahun
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={editForm.year}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Status Kendaraan
                  </label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  >
                    <option value="Active">Active (Siap Operasional)</option>
                    <option value="Maintenance">Maintenance (Dalam Perawatan)</option>
                    <option value="Inactive">Inactive (Non-Aktif)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Catatan
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
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#D8FF00] px-4 py-2 text-xs font-bold text-[#12372A] hover:bg-[#c9ee00] transition disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Kendaraan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}