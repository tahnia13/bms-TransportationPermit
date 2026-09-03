import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileCheck2,
  Car,
  Users,
  Route,
  Archive,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { api } from "../services/api";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const [permits, setPermits] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [archives, setArchives] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const extractData = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [permitsRes, vehiclesRes, driversRes, tripsRes, archivesRes] =
        await Promise.all([
          api.getPermits(),
          api.getVehicles(),
          api.getDrivers(),
          api.getTrips(),
          api.getArchives(),
        ]);

      setPermits(extractData(permitsRes));
      setVehicles(extractData(vehiclesRes));
      setDrivers(extractData(driversRes));
      setTrips(extractData(tripsRes));
      setArchives(extractData(archivesRes));
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(err?.message || "Gagal mengambil data dashboard dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Helper field extractor
  const getField = (item, fields, fallback = null) => {
    for (const field of fields) {
      if (
        item &&
        item[field] !== undefined &&
        item[field] !== null &&
        item[field] !== ""
      ) {
        return item[field];
      }
    }
    return fallback;
  };

  const normalizeDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  // Permit status distribution
  const permitStatus = useMemo(() => {
    let active = 0;
    let soon = 0;
    let expired = 0;
    let pending = 0;

    const now = new Date();

    permits.forEach((permit) => {
      const explicitStatus = String(permit.status || "").toLowerCase();
      if (explicitStatus === "pending") {
        pending++;
        return;
      }
      if (explicitStatus === "expired" || explicitStatus === "rejected") {
        expired++;
        return;
      }

      const expiryValue = getField(permit, [
        "end_date",
        "expiry_date",
        "expired_date",
        "expiration_date",
        "valid_until",
      ]);

      const expiryDate = normalizeDate(expiryValue);
      if (!expiryDate) {
        active++;
        return;
      }

      const diffTime = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        expired++;
      } else if (daysRemaining <= 30) {
        soon++;
      } else {
        active++;
      }
    });

    const total = permits.length || 1;
    return {
      active,
      soon,
      expired,
      pending,
      activePercent: Math.round((active / total) * 100),
      soonPercent: Math.round((soon / total) * 100),
      expiredPercent: Math.round((expired / total) * 100),
    };
  }, [permits]);

  // Vehicle status breakdown
  const vehicleStats = useMemo(() => {
    const active = vehicles.filter(
      (v) => String(v.status || "Active").toLowerCase() === "active"
    ).length;
    const maintenance = vehicles.filter(
      (v) => String(v.status || "").toLowerCase() === "maintenance"
    ).length;
    return { active, maintenance, total: vehicles.length };
  }, [vehicles]);

  // Driver status breakdown
  const driverStats = useMemo(() => {
    const active = drivers.filter(
      (d) => String(d.status || "Active").toLowerCase() === "active"
    ).length;
    return { active, total: drivers.length };
  }, [drivers]);

  // Monthly trips calculation
  const monthlyTrips = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const result = months.map((month, index) => ({
      month,
      count: 0,
      monthIndex: index,
    }));

    trips.forEach((trip) => {
      const tripDateValue = getField(trip, [
        "departure_date",
        "trip_date",
        "date",
        "start_date",
        "created_at",
      ]);
      const tripDate = normalizeDate(tripDateValue);
      if (!tripDate || tripDate.getFullYear() !== currentYear) return;

      const monthIndex = tripDate.getMonth();
      if (result[monthIndex]) {
        result[monthIndex].count++;
      }
    });

    return result;
  }, [trips]);

  const maxMonthlyTrips = Math.max(
    ...monthlyTrips.map((item) => item.count),
    1
  );

  const peakMonth = useMemo(() => {
    let peak = monthlyTrips[0];
    for (const m of monthlyTrips) {
      if (m.count > (peak?.count || 0)) peak = m;
    }
    return peak?.count > 0 ? peak : null;
  }, [monthlyTrips]);

  // Recent permits sorted by creation/date
  const recentPermits = useMemo(() => {
    return [...permits]
      .sort((a, b) => {
        const dateA = normalizeDate(
          getField(a, ["created_at", "start_date", "date"])
        );
        const dateB = normalizeDate(
          getField(b, ["created_at", "start_date", "date"])
        );
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      })
      .slice(0, 6);
  }, [permits]);

  const formatDate = (value) => {
    const date = normalizeDate(value);
    if (!date) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[460px] flex-col items-center justify-center gap-4 rounded-3xl border border-gray-100 bg-white p-12 shadow-xs">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute h-full w-full animate-ping rounded-full bg-[#D8FF00] opacity-30" />
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#D8FF00] border-t-[#12372A]" />
        </div>
        <p className="text-sm font-semibold text-[#12372A]">
          Sinkronisasi Data Dashboard...
        </p>
        <p className="text-xs text-gray-400">
          Mengambil informasi armada, permit, pengemudi, dan trip.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              Gagal Memuat Data Dashboard
            </h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              type="button"
              onClick={loadDashboard}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#12372A] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0c261d] shadow-sm"
            >
              <RefreshCw size={14} />
              Coba Muat Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* =========================================================
          HERO EXECUTIVE BANNER
      ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12372A] via-[#103025] to-[#0A2018] p-6 sm:p-8 text-white shadow-xl shadow-[#12372A]/10">
        {/* Decorative Grid and Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#D8FF00]/15 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 -bottom-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-xs">
              <Sparkles size={13} className="text-[#D8FF00]" />
              <span>Sistem Manajemen Transportasi Besmindo</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Pusat Kendali Operasional Transportasi
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/75 leading-relaxed">
              Pantau status izin jalan (*permit*), ketersediaan armada truk rig,
              kepatuhan lisensi pengemudi, dan arsip digital secara terpusat dan *real-time*.
            </p>
          </div>

          {/* QUICK ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/permit/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#D8FF00] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#12372A] shadow-md shadow-[#D8FF00]/20 transition-all hover:bg-[#c9ee00] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Buat Permit Baru</span>
            </Link>

            <Link
              to="/trips/create"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20"
            >
              <Route size={16} />
              <span>Jadwal Trip</span>
            </Link>

            <button
              type="button"
              onClick={loadDashboard}
              title="Perbarui data"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-xs transition hover:bg-white/20 hover:text-[#D8FF00]"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          KEY PERFORMANCE INDICATORS (KPI)
      ========================================================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL PERMITS */}
        <div className="group relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Total Permit
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#12372A]">
                {permits.length}
              </h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#12372A] border border-emerald-100 group-hover:bg-[#D8FF00]/25 transition-colors">
              <FileCheck2 size={24} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {permitStatus.active} Aktif
            </span>
            <span className="text-gray-400">•</span>
            <span className="flex items-center gap-1.5 font-semibold text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {permitStatus.soon} Segera Expired
            </span>
          </div>
        </div>

        {/* TOTAL VEHICLES */}
        <div className="group relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Armada Kendaraan
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#12372A]">
                {vehicles.length}
              </h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 border border-sky-100 group-hover:bg-[#D8FF00]/25 transition-colors">
              <Car size={24} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {vehicleStats.active} Operasional
            </span>
            <span className="text-gray-400">•</span>
            <span className="flex items-center gap-1.5 font-semibold text-orange-600">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              {vehicleStats.maintenance} Perawatan
            </span>
          </div>
        </div>

        {/* TOTAL DRIVERS */}
        <div className="group relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Pengemudi Terdaftar
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#12372A]">
                {drivers.length}
              </h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 group-hover:bg-[#D8FF00]/25 transition-colors">
              <Users size={24} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {driverStats.active} Siap Ditugaskan
            </span>
            <Link
              to="/drivers"
              className="font-semibold text-[#12372A] hover:underline inline-flex items-center gap-0.5"
            >
              Lihat detail <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* TOTAL TRIPS */}
        <div className="group relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Total Perjalanan Trip
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#12372A]">
                {trips.length}
              </h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 group-hover:bg-[#D8FF00]/25 transition-colors">
              <Route size={24} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
            <span className="text-gray-500">Aktivitas Tahun {new Date().getFullYear()}</span>
            <Link
              to="/trips"
              className="font-semibold text-[#12372A] hover:underline inline-flex items-center gap-0.5"
            >
              Jadwal Trip <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN ANALYTICS GRID
      ========================================================= */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* PERMIT HEALTH & STATUS */}
        <div className="flex flex-col rounded-3xl border border-gray-200/70 bg-white p-6 shadow-xs xl:col-span-1">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Kondisi Masa Berlaku Permit
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Pemantauan validitas izin operasional
              </p>
            </div>
            <Link
              to="/permit"
              className="text-xs font-semibold text-[#12372A] hover:underline"
            >
              Kelola Permit
            </Link>
          </div>

          <div className="mt-5 space-y-4 flex-1">
            {/* ACTIVE */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 transition hover:bg-emerald-50/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Aktif & Berlaku</p>
                    <p className="text-[11px] text-gray-500">Izin dalam masa validitas aman</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-emerald-800">
                    {permitStatus.active}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-medium">
                    {permitStatus.activePercent}%
                  </span>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${permitStatus.activePercent}%` }}
                />
              </div>
            </div>

            {/* EXPIRING SOON */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 transition hover:bg-amber-50/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Clock3 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Segera Kedaluwarsa</p>
                    <p className="text-[11px] text-gray-500">Habis dalam waktu ≤ 30 hari</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-amber-800">
                    {permitStatus.soon}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-medium">
                    {permitStatus.soonPercent}%
                  </span>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-amber-100">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${permitStatus.soonPercent}%` }}
                />
              </div>
            </div>

            {/* EXPIRED */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 transition hover:bg-rose-50/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Kedaluwarsa / Ditutup</p>
                    <p className="text-[11px] text-gray-500">Izin telah melewati tanggal akhir</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-rose-800">
                    {permitStatus.expired}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-medium">
                    {permitStatus.expiredPercent}%
                  </span>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-rose-100">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${permitStatus.expiredPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* MONTHLY TRIPS BAR CHART */}
        <div className="flex flex-col rounded-3xl border border-gray-200/70 bg-white p-6 shadow-xs xl:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base">
                  Volume Perjalanan Trip Bulanan
                </h3>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/60">
                  Tahun {new Date().getFullYear()}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Intensitas operasional transportasi antarlokasi & rig
              </p>
            </div>

            {peakMonth && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#12372A]/5 px-3 py-1 text-xs font-semibold text-[#12372A]">
                <TrendingUp size={13} className="text-[#12372A]" />
                <span>Puncak: {peakMonth.month} ({peakMonth.count} trip)</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-1 items-end justify-between gap-2 sm:gap-3 min-h-[220px] px-2">
            {monthlyTrips.map((item) => {
              const heightPercent =
                item.count === 0
                  ? 5
                  : Math.max((item.count / maxMonthlyTrips) * 100, 10);
              const isPeak = peakMonth && peakMonth.month === item.month;

              return (
                <div
                  key={item.month}
                  className="group flex flex-1 flex-col items-center justify-end h-full relative"
                >
                  {/* Floating Count on Hover / Peak */}
                  <span
                    className={`mb-2 text-[11px] font-bold transition-all ${
                      isPeak
                        ? "text-[#12372A] scale-110"
                        : "text-gray-400 group-hover:text-[#12372A]"
                    }`}
                  >
                    {item.count}
                  </span>

                  {/* The Bar */}
                  <div className="w-full max-w-[38px] rounded-t-xl overflow-hidden bg-gray-100 group-hover:bg-[#12372A]/10 transition-all flex items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isPeak
                          ? "bg-gradient-to-t from-[#12372A] to-emerald-700 ring-2 ring-[#D8FF00]"
                          : item.count > 0
                          ? "bg-gradient-to-t from-[#12372A] to-[#205743] group-hover:brightness-110"
                          : "bg-gray-200"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Month Label */}
                  <span
                    className={`mt-2.5 text-xs font-medium ${
                      isPeak
                        ? "text-[#12372A] font-bold"
                        : "text-gray-500 group-hover:text-gray-800"
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================
          LOWER SECTION: DIGITAL ARCHIVE & RECENT PERMITS
      ========================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* DIGITAL ARCHIVE SUMMARY */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-xs lg:col-span-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                <Archive size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Arsip Digital
                </h3>
                <p className="text-xs text-gray-400">
                  Dokumen & sertifikat digital
                </p>
              </div>
            </div>

            <Link
              to="/archive"
              className="text-xs font-semibold text-[#12372A] hover:underline"
            >
              Buka Arsip
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5 text-center">
              <p className="text-[11px] font-semibold text-gray-400">Total Berkas</p>
              <p className="mt-1 text-2xl font-black text-[#12372A]">
                {archives.length}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-center">
              <p className="text-[11px] font-semibold text-emerald-600">Terverifikasi</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">
                {archives.filter((a) => String(a.status).toLowerCase() === "active").length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-center">
              <p className="text-[11px] font-semibold text-slate-500">Tersimpan</p>
              <p className="mt-1 text-2xl font-black text-slate-700">
                {archives.filter((a) => String(a.status).toLowerCase() === "archived").length}
              </p>
            </div>
          </div>

          {/* Quick Upload Box */}
          <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-4 text-center">
            <p className="text-xs font-semibold text-gray-700">
              Perlu mengunggah dokumen baru?
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Simpan berkas permit, surat jalan, dan sertifikat uji emisi.
            </p>
            <Link
              to="/archive"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#12372A] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0c261d] transition"
            >
              <Plus size={13} /> Unggah ke Arsip
            </Link>
          </div>
        </div>

        {/* RECENT PERMITS TABLE */}
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-xs lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Permit Terbaru Diajukan
              </h3>
              <p className="text-xs text-gray-400">
                Permohonan izin transportasi terakhir yang tercatat
              </p>
            </div>

            <Link
              to="/permit"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#12372A] hover:underline"
            >
              <span>Lihat Semua Permit</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mt-4 flex-1 overflow-x-auto">
            {recentPermits.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <FileCheck2 size={28} className="text-gray-300 mb-1" />
                <p className="text-sm font-medium text-gray-500">
                  Belum ada data permit yang tercatat.
                </p>
                <Link
                  to="/permit/create"
                  className="mt-2 text-xs font-bold text-[#12372A] underline"
                >
                  Buat permit pertama sekarang
                </Link>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="pb-3 pl-2">Permit ID</th>
                    <th className="pb-3">Pemohon</th>
                    <th className="pb-3">Rute Transportasi</th>
                    <th className="pb-3">Jadwal</th>
                    <th className="pb-3 text-right pr-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {recentPermits.map((permit) => {
                    const permitNo =
                      getField(permit, [
                        "permit_number",
                        "permit_no",
                        "number",
                        "code",
                      ]) || `PM-${permit.id}`;
                    const requester =
                      getField(permit, ["requester", "requester_name"]) || "-";
                    const origin = getField(permit, ["origin"]) || "Pekanbaru";
                    const dest =
                      getField(permit, ["destination"]) || "Rig Site";
                    const date = getField(permit, [
                      "start_date",
                      "departure_date",
                      "created_at",
                    ]);

                    return (
                      <tr
                        key={permit.id}
                        className="group hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="py-3 pl-2">
                          <span className="font-mono font-bold text-[#12372A]">
                            {permitNo}
                          </span>
                        </td>
                        <td className="py-3 font-medium text-gray-700">
                          {requester}
                        </td>
                        <td className="py-3">
                          <div className="inline-flex items-center gap-1.5 text-gray-600">
                            <span className="font-medium text-gray-800 truncate max-w-[90px]">
                              {origin}
                            </span>
                            <span className="text-gray-400">➔</span>
                            <span className="font-medium text-gray-800 truncate max-w-[110px]">
                              {dest}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-500 font-medium">
                          {formatDate(date)}
                        </td>
                        <td className="py-3 text-right pr-2">
                          <StatusBadge
                            status={permit.status || "Pending"}
                            size="sm"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}