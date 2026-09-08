import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Car,
  UserRound,
  ArrowRight,
  Route,
  Printer,
  FileText,
} from "lucide-react";
import { api } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../components/Toast";

export default function TripList() {
  const toast = useToast();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError("");

      const [tripRes, vehicleRes, driverRes] = await Promise.all([
        api.getTrips(),
        api.getVehicles(),
        api.getDrivers(),
      ]);

      const rawTrips = Array.isArray(tripRes?.data)
        ? tripRes.data
        : Array.isArray(tripRes)
        ? tripRes
        : [];

      const mappedTrips = rawTrips.map((trip) => ({
        id: `TRP-${String(trip.id).padStart(3, "0")}`,
        databaseId: trip.id,
        tripNumber: trip.trip_number || `TRP-${String(trip.id).padStart(3, "0")}`,
        tripDate: trip.departure_date || "",
        returnDate: trip.return_date || "",
        origin: trip.origin || "Pekanbaru",
        destination: trip.destination || "Rig Site",
        vehicleId: trip.vehicle_id || null,
        vehicle:
          trip.vehicle?.plate_number ||
          trip.vehicle?.plate ||
          trip.vehicle?.registration_number ||
          "",
        driverId: trip.driver_id || null,
        driver: trip.driver?.name || "",
        permitId: trip.permit_id || null,
        purpose: trip.purpose || "",
        description: trip.description || "",
        status: trip.status || "Planned",
      }));

      setTrips(mappedTrips);
      setVehicles(Array.isArray(vehicleRes?.data) ? vehicleRes.data : Array.isArray(vehicleRes) ? vehicleRes : []);
      setDrivers(Array.isArray(driverRes?.data) ? driverRes.data : Array.isArray(driverRes) ? driverRes : []);
    } catch (err) {
      console.error("Failed to load trips:", err);
      setError(err?.message || "Gagal mengambil data perjalanan trip.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
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

  // Status counts
  const stats = useMemo(() => {
    const total = trips.length;
    let planned = 0;
    let inTransit = 0;
    let completed = 0;

    trips.forEach((t) => {
      const s = String(t.status || "").toLowerCase();
      if (s === "planned" || s === "scheduled") planned++;
      else if (s === "in transit" || s === "running") inTransit++;
      else if (s === "completed") completed++;
    });

    return { total, planned, inTransit, completed };
  }, [trips]);

  // Filtered trips
  const filteredTrips = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return trips.filter((t) => {
      if (statusFilter !== "All") {
        if (String(t.status).toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      if (!keyword) return true;

      return (
        t.tripNumber.toLowerCase().includes(keyword) ||
        t.origin.toLowerCase().includes(keyword) ||
        t.destination.toLowerCase().includes(keyword) ||
        t.vehicle.toLowerCase().includes(keyword) ||
        t.driver.toLowerCase().includes(keyword) ||
        t.purpose.toLowerCase().includes(keyword) ||
        t.status.toLowerCase().includes(keyword)
      );
    });
  }, [trips, search, statusFilter]);

  const handleDelete = async (trip) => {
    if (!window.confirm(`Hapus jadwal perjalanan trip ${trip.tripNumber}?`)) return;

    try {
      await api.deleteTrip(trip.databaseId);
      setTrips((prev) => prev.filter((t) => t.databaseId !== trip.databaseId));
      if (selectedTrip?.databaseId === trip.databaseId) {
        setShowViewModal(false);
        setSelectedTrip(null);
      }
      toast.success("Perjalanan trip berhasil dihapus.");
    } catch (err) {
      console.error("Delete trip error:", err);
      toast.error(err.message || "Gagal menghapus data trip.");
    }
  };

  const handleView = (t) => {
    setSelectedTrip(t);
    setShowViewModal(true);
  };

  const handlePrint = (t) => {
    setSelectedTrip(t);
    setShowPrintModal(true);
  };

  const handleEdit = (t) => {
    setSelectedTrip(t);
    setEditForm({
      databaseId: t.databaseId,
      tripNumber: t.tripNumber,
      tripDate: t.tripDate ? String(t.tripDate).substring(0, 10) : "",
      returnDate: t.returnDate ? String(t.returnDate).substring(0, 10) : "",
      origin: t.origin,
      destination: t.destination,
      vehicleId: t.vehicleId || "",
      driverId: t.driverId || "",
      purpose: t.purpose,
      description: t.description,
      status: t.status,
    });
    setShowEditModal(true);
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
        trip_number: editForm.tripNumber.trim(),
        departure_date: editForm.tripDate,
        return_date: editForm.returnDate || null,
        origin: editForm.origin.trim(),
        destination: editForm.destination.trim(),
        vehicle_id: editForm.vehicleId ? Number(editForm.vehicleId) : null,
        driver_id: editForm.driverId ? Number(editForm.driverId) : null,
        purpose: editForm.purpose.trim() || null,
        status: editForm.status,
        description: editForm.description.trim() || null,
      };

      await api.updateTrip(editForm.databaseId, payload);

      const matchedVehicle = vehicles.find((v) => v.id === Number(editForm.vehicleId));
      const matchedDriver = drivers.find((d) => d.id === Number(editForm.driverId));

      const updated = {
        ...selectedTrip,
        ...editForm,
        vehicle: matchedVehicle ? (matchedVehicle.plate_number || matchedVehicle.plate) : selectedTrip.vehicle,
        driver: matchedDriver ? matchedDriver.name : selectedTrip.driver,
      };

      setTrips((prev) =>
        prev.map((t) => (t.databaseId === editForm.databaseId ? updated : t))
      );
      setSelectedTrip(updated);
      setShowEditModal(false);
      setShowViewModal(true);
      toast.success("Data trip berhasil diperbarui.");
    } catch (err) {
      console.error("Update trip error:", err);
      toast.error(err.message || "Gagal memperbarui trip.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight">
            Jadwal Operasional Perjalanan (Trips)
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Pemantauan pengiriman logistik rig, status keberangkatan, dan armada bertugas.
          </p>
        </div>

        <Link
          to="/trips/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D8FF00] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#12372A] shadow-md shadow-[#D8FF00]/20 transition hover:bg-[#c9ee00] hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Jadwalkan Trip Baru</span>
        </Link>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200/70 bg-white p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Total Perjalanan
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-[#12372A]">{stats.total}</h3>
            <span className="text-xs text-gray-400">Semua trip</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            Dijadwalkan (Planned)
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-amber-700">{stats.planned}</h3>
            <span className="text-xs text-amber-600 font-semibold">Siap Berangkat</span>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
            Dalam Perjalanan
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-sky-700">{stats.inTransit}</h3>
            <span className="text-xs text-sky-600 font-semibold">In Transit</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Selesai (Completed)
          </p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-emerald-700">{stats.completed}</h3>
            <span className="text-xs text-emerald-600 font-semibold">Sukses</span>
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* STATUS PILLS */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Planned", "In Transit", "Completed", "Cancelled"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  statusFilter === s
                    ? "bg-[#12372A] text-white shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s === "All" ? "Semua Status" : s}
              </button>
            ))}
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
              placeholder="Cari nomor trip, pengemudi, rute tujuan..."
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
      </div>

      {/* TRIPS TABLE */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-4 pl-6">Trip ID / No</th>
                <th className="py-4">Jadwal Berangkat</th>
                <th className="py-4">Rute Perjalanan</th>
                <th className="py-4">Kendaraan</th>
                <th className="py-4">Pengemudi</th>
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
                      <p className="font-semibold text-[#12372A]">Memuat jadwal trip...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-400">
                    <Route size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-bold text-gray-600">Tidak ada jadwal perjalanan ditemukan</p>
                  </td>
                </tr>
              ) : (
                filteredTrips.map((t) => (
                  <tr
                    key={t.databaseId}
                    className="group hover:bg-emerald-50/20 transition-colors"
                  >
                    {/* TRIP NUMBER */}
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#12372A]">
                          {t.tripNumber}
                        </span>
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="py-4 font-semibold text-gray-700">
                      {formatDate(t.tripDate)}
                    </td>

                    {/* ROUTE */}
                    <td className="py-4">
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 border border-gray-100 text-gray-700">
                        <span className="font-semibold text-gray-800">{t.origin}</span>
                        <ArrowRight size={11} className="text-gray-400 shrink-0" />
                        <span className="font-semibold text-gray-800">{t.destination}</span>
                      </div>
                    </td>

                    {/* VEHICLE */}
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                        <Car size={13} className="text-gray-400" />
                        <span>{t.vehicle || "-"}</span>
                      </div>
                    </td>

                    {/* DRIVER */}
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <UserRound size={13} className="text-gray-400" />
                        <span>{t.driver || "-"}</span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="py-4">
                      <StatusBadge status={t.status} size="sm" />
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleView(t)}
                          title="Detail Perjalanan"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-[#12372A]"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrint(t)}
                          title="Cetak Surat Jalan / SPPD"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-sky-50 hover:text-sky-700"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(t)}
                          title="Edit Trip"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t)}
                          title="Hapus Trip"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW TRIP MODAL */}
      {selectedTrip && showViewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00]">
                  <Route size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Rincian Perjalanan Trip
                  </h3>
                  <p className="text-xs text-gray-400">{selectedTrip.tripNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3.5 border border-gray-100">
                <span className="font-bold text-gray-600">Status Operasi</span>
                <StatusBadge status={selectedTrip.status} size="md" />
              </div>

              {/* ROUTE FLOW */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-2">
                  Alur Rute Perjalanan
                </span>
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-xl bg-white p-3 border border-gray-200/70 flex-1 text-center">
                    <span className="text-[10px] text-gray-400 block font-medium">Asal Keberangkatan</span>
                    <span className="font-bold text-gray-800 text-xs sm:text-sm">{selectedTrip.origin}</span>
                  </div>
                  <ArrowRight size={20} className="text-[#12372A] shrink-0" />
                  <div className="rounded-xl bg-white p-3 border border-gray-200/70 flex-1 text-center">
                    <span className="text-[10px] text-gray-400 block font-medium">Tujuan Akhir / Rig</span>
                    <span className="font-bold text-gray-800 text-xs sm:text-sm">{selectedTrip.destination}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Kendaraan Ditugaskan</span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{selectedTrip.vehicle || "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Pengemudi Bertugas</span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{selectedTrip.driver || "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Tanggal Berangkat</span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{formatDate(selectedTrip.tripDate)}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Estimasi Selesai</span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{formatDate(selectedTrip.returnDate)}</p>
                </div>
              </div>

              {selectedTrip.purpose && (
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Misi / Keperluan</span>
                  <p className="text-xs text-gray-800 mt-0.5 font-medium leading-relaxed">{selectedTrip.purpose}</p>
                </div>
              )}

              {selectedTrip.description && (
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Catatan Operasional</span>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{selectedTrip.description}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  handlePrint(selectedTrip);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#12372A] bg-white px-3.5 py-2 text-xs font-bold text-[#12372A] hover:bg-emerald-50 transition"
              >
                <Printer size={14} />
                <span>Cetak SPPD</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedTrip);
                }}
                className="rounded-xl bg-[#D8FF00] px-4 py-2 text-xs font-bold text-[#12372A] hover:bg-[#c9ee00]"
              >
                Ubah Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TRIP MODAL */}
      {selectedTrip && showEditModal && editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                Edit Jadwal Perjalanan Trip
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nomor Trip
                  </label>
                  <input
                    type="text"
                    name="tripNumber"
                    value={editForm.tripNumber}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Status Perjalanan
                  </label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  >
                    <option value="Planned">Planned (Terjadwal)</option>
                    <option value="In Transit">In Transit (Dalam Perjalanan)</option>
                    <option value="Completed">Completed (Selesai)</option>
                    <option value="Cancelled">Cancelled (Dibatalkan)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Titik Asal
                  </label>
                  <input
                    type="text"
                    name="origin"
                    value={editForm.origin}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tujuan Akhir
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={editForm.destination}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tanggal Keberangkatan
                  </label>
                  <input
                    type="date"
                    name="tripDate"
                    value={editForm.tripDate}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tanggal Kepulangan (Opsional)
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    value={editForm.returnDate}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Pilih Kendaraan
                  </label>
                  <select
                    name="vehicleId"
                    value={editForm.vehicleId}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  >
                    <option value="">Pilih Kendaraan Armada</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plate_number || v.plate} - {v.type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Pilih Pengemudi
                  </label>
                  <select
                    name="driverId"
                    value={editForm.driverId}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  >
                    <option value="">Pilih Pengemudi</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.license_type || "SIM"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Maksud / Keperluan Trip
                  </label>
                  <input
                    type="text"
                    name="purpose"
                    value={editForm.purpose}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Catatan
                  </label>
                  <textarea
                    rows={2}
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-800 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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

      {/* PRINTABLE SPPD / SURAT JALAN MODAL */}
      {selectedTrip && showPrintModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowPrintModal(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl p-6 sm:p-8 space-y-6 print:p-0 print:shadow-none print:max-w-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* TOP ACTIONS */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 print:hidden">
              <span className="text-xs font-bold text-gray-500">Pratinjau Surat Tugas Perjalanan (SPPD)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-[#12372A] px-4 py-2 text-xs font-bold text-[#D8FF00] shadow-md hover:bg-[#0c261d] transition"
                >
                  <Printer size={14} /> Cetak / Simpan PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="rounded-2xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* OFFICIAL LETTERHEAD */}
            <div className="border-b-2 border-[#12372A] pb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/besmindo-logo.png"
                  alt="PT Besmindo Materi Sewatama"
                  className="h-14 w-auto object-contain"
                />
                <div className="border-l-2 border-gray-200 pl-3">
                  <p className="text-[11px] font-black text-[#12372A] tracking-wider uppercase">
                    DEPARTEMEN TRANSPORTASI & LOGISTIK ARMADA RIG
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Kawasan Industri Tenayan, Pekanbaru - Riau | Telp: (0761) 889201 | Email: logistics@besmindo.co.id
                  </p>
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="rounded-2xl border border-[#12372A] px-2.5 py-1 text-[10px] font-extrabold text-[#12372A]">
                  SURAT JALAN RESMI
                </span>
              </div>
            </div>

            {/* TITLE */}
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-gray-900 underline">
                SURAT PERINTAH TUGAS PERJALANAN / SURAT JALAN
              </h3>
              <p className="font-mono text-xs font-bold text-gray-600">
                Nomor Registrasi: {selectedTrip.tripNumber || `TRIP-${selectedTrip.id}`}
              </p>
            </div>

            {/* DOCUMENT BODY */}
            <div className="space-y-4 text-xs text-gray-800 leading-relaxed">
              <p>
                Manajemen Transportasi PT Besmindo Materi Sewatama dengan ini menugaskan armada dan personil pengemudi di bawah ini untuk melaksanakan mobilisasi operasional logistik:
              </p>

              <table className="w-full border border-gray-300 rounded-2xl overflow-hidden">
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-gray-50/70">
                    <td className="py-2 px-3 font-bold w-1/3 text-gray-600">Pengemudi Ditugaskan</td>
                    <td className="py-2 px-3 font-bold text-gray-900">{selectedTrip.driver || "Driver Besmindo"}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-600">Unit Kendaraan / Truk</td>
                    <td className="py-2 px-3 font-semibold">{selectedTrip.vehicle || "Armada Besmindo"}</td>
                  </tr>
                  <tr className="bg-gray-50/70">
                    <td className="py-2 px-3 font-bold text-gray-600">Rute Perjalanan</td>
                    <td className="py-2 px-3 font-semibold">
                      {selectedTrip.origin} &rarr; {selectedTrip.destination}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-600">Jadwal Keberangkatan</td>
                    <td className="py-2 px-3 font-semibold">{formatDate(selectedTrip.tripDate)}</td>
                  </tr>
                  <tr className="bg-gray-50/70">
                    <td className="py-2 px-3 font-bold text-gray-600">Estimasi Kembali / Tiba</td>
                    <td className="py-2 px-3 font-semibold">{formatDate(selectedTrip.returnDate)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-600">Keperluan / Muatan</td>
                    <td className="py-2 px-3 font-semibold">{selectedTrip.purpose || "Mobilisasi Komponen Peralatan Drilling & Logistik Rig"}</td>
                  </tr>
                  <tr className="bg-gray-50/70">
                    <td className="py-2 px-3 font-bold text-gray-600">Status Operasi</td>
                    <td className="py-2 px-3 font-bold text-[#12372A]">{selectedTrip.status || "Planned"}</td>
                  </tr>
                  {selectedTrip.description && (
                    <tr>
                      <td className="py-2 px-3 font-bold text-gray-600">Instruksi / Catatan</td>
                      <td className="py-2 px-3 text-gray-700">{selectedTrip.description}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* HSE NOTICE */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 space-y-1">
                <p className="font-bold text-amber-900 text-[11px]">Kepatuhan Keselamatan Transportasi (HSE / K3LL):</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-[10px] text-amber-800">
                  <li>Pengemudi wajib melakukan inspeksi harian kelayakan kendaraan (P2H) sebelum berangkat.</li>
                  <li>Kecepatan maksimal di jalan umum 60 km/jam dan di kawasan rig 20-40 km/jam.</li>
                  <li>Wajib beristirahat minimal 15 menit setiap mengemudi selama 4 jam tanpa jeda.</li>
                  <li>Surat tugas ini wajib dibawa dan diperlihatkan kepada petugas Pos Penjagaan Rig.</li>
                </ol>
              </div>
            </div>

            {/* SIGNATURE BLOCK */}
            <div className="grid grid-cols-2 pt-6 text-xs text-center border-t border-gray-200">
              <div className="space-y-12">
                <p className="font-bold text-gray-700">Pengemudi Bertugas:</p>
                <div>
                  <p className="font-bold text-gray-900 underline">{selectedTrip.driver || "Driver Besmindo"}</p>
                  <p className="text-[10px] text-gray-500">Divisi Transportasi Darat</p>
                </div>
              </div>

              <div className="space-y-12">
                <p className="font-bold text-gray-700">Diotorisasi Oleh:</p>
                <div>
                  <p className="font-bold text-gray-900 underline">Transportation Administrator</p>
                  <p className="text-[10px] text-gray-500">PT Besmindo Materi Sewatama</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}