import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Search,
  X,
  Printer,
  TrendingUp,
  Clock3,
  ShieldAlert,
  HardHat,
  Filter,
  Calendar,
  FileText,
  Car,
  UserRound,
  MapPinned,
  ShieldCheck,
  Building2,
  Mail,
  ArrowRight,
  FileSpreadsheet,
} from "lucide-react";
import { api } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import EmailModal from "../../components/EmailModal";
import { useToast } from "../../components/Toast";

export default function Reports() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("permits"); // 'permits' | 'fleet' | 'drivers' | 'trips'
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const [permits, setPermits] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [archives, setArchives] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // User session
  const currentUser = useMemo(() => {
    try {
      const saved = localStorage.getItem("transportation_user");
      return saved ? JSON.parse(saved) : { username: "Admin", role: "Transportation Admin" };
    } catch {
      return { username: "Admin", role: "Transportation Admin" };
    }
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError("");

      const [pRes, vRes, dRes, tRes, aRes] = await Promise.all([
        api.getPermits(),
        api.getVehicles(),
        api.getDrivers(),
        api.getTrips(),
        api.getArchives(),
      ]);

      const extract = (res) =>
        Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      setPermits(extract(pRes));
      setVehicles(extract(vRes));
      setDrivers(extract(dRes));
      setTrips(extract(tRes));
      setArchives(extract(aRes));
    } catch (err) {
      console.error("Failed to load report data:", err);
      setError(err?.message || "Gagal mengambil data laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const formatDate = (val) => {
    if (!val) return "-";
    const d = new Date(val);
    return Number.isNaN(d.getTime())
      ? String(val).substring(0, 10)
      : d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  // Process Permits with filters & remaining days
  const filteredPermits = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const kw = search.toLowerCase().trim();

    return permits.filter((p) => {
      // Status filter
      if (statusFilter !== "All") {
        if (String(p.status || "").toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Dept filter
      if (deptFilter !== "All") {
        if (String(p.department || "").toLowerCase() !== deptFilter.toLowerCase()) {
          return false;
        }
      }

      // Date range filter
      if (startDate) {
        const start = new Date(p.start_date || p.created_at);
        if (start < new Date(startDate)) return false;
      }
      if (endDate) {
        const end = new Date(p.end_date || p.created_at);
        if (end > new Date(endDate)) return false;
      }

      // Keyword search
      if (!kw) return true;
      return (
        String(p.permit_number || "").toLowerCase().includes(kw) ||
        String(p.requester || "").toLowerCase().includes(kw) ||
        String(p.vehicle || "").toLowerCase().includes(kw) ||
        String(p.driver || "").toLowerCase().includes(kw) ||
        String(p.destination || "").toLowerCase().includes(kw)
      );
    });
  }, [permits, search, statusFilter, deptFilter, startDate, endDate]);

  // Executive KPI Statistics
  const kpis = useMemo(() => {
    const totalPermits = permits.length;
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let expired = 0;

    permits.forEach((p) => {
      const s = String(p.status || "").toLowerCase();
      if (s === "approved" || s === "active") approved++;
      else if (s === "pending") pending++;
      else if (s === "rejected") rejected++;
      else if (s === "expired") expired++;
    });

    const approvalRate = totalPermits > 0 ? Math.round((approved / totalPermits) * 100) : 100;
    const activeVehicles = vehicles.filter((v) => String(v.status || "Active").toLowerCase() === "active").length;
    const fleetUtil = vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 100;

    return {
      totalPermits,
      approved,
      pending,
      rejected,
      expired,
      approvalRate,
      activeVehicles,
      totalVehicles: vehicles.length,
      fleetUtil,
      totalTrips: trips.length,
    };
  }, [permits, vehicles, trips]);

  // Export to Excel (.xlsx)
  const exportToExcel = () => {
    if (filteredPermits.length === 0) {
      toast.warning("Tidak ada data permit untuk diekspor.");
      return;
    }

    const rows = filteredPermits.map((item, idx) => ({
      No: idx + 1,
      "Nomor Permit": item.permit_number || `PM-${item.id}`,
      Pemohon: item.requester,
      Departemen: item.department || "Operasional",
      Kendaraan: item.vehicle || "-",
      Pengemudi: item.driver || "-",
      Rute: `${item.origin} -> ${item.destination}`,
      "Tgl Mulai": formatDate(item.start_date),
      "Tgl Berakhir": formatDate(item.end_date),
      Status: item.status || "Pending",
      Otorisator: item.approver || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 20 },
      { wch: 28 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Permit PT Besmindo");
    XLSX.writeFile(
      workbook,
      `Laporan_Eksekutif_Besmindo_${new Date().toISOString().slice(0, 10)}.xlsx`
    );

    toast.success(`Laporan ${rows.length} data permit berhasil diekspor ke Excel.`);

    // Audit log entry for export
    api.createAuditLog({
      action: "EXPORT",
      module: "Report",
      description: `Mengekspor ${rows.length} data permit ke format Microsoft Excel (.xlsx)`,
      user_name: currentUser.username,
      user_role: currentUser.role,
    });
  };

  const handleOpenPdfExport = () => {
    setPdfPreviewOpen(true);
    api.createAuditLog({
      action: "EXPORT",
      module: "Report",
      description: "Menghasilkan format cetak Laporan Resmi Eksekutif PT Besmindo Materi Sewatama (PDF)",
      user_name: currentUser.username,
      user_role: currentUser.role,
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight">
            Advanced Reports & Analytics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Analisis kepatuhan izin jalan armada, tingkat persetujuan, dan ekspor dokumen PDF resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setEmailModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#12372A] shadow-xs hover:bg-gray-50 transition"
          >
            <Mail size={15} />
            <span>Kirim Notifikasi Email</span>
          </button>

          <button
            type="button"
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50/50 px-3.5 py-2.5 text-xs font-bold text-emerald-800 shadow-xs hover:bg-emerald-100 transition"
          >
            <FileSpreadsheet size={15} />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handleOpenPdfExport}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#12372A] px-4 py-2.5 text-xs font-bold text-[#D8FF00] shadow-md shadow-[#12372A]/20 hover:bg-[#0c261d] transition"
          >
            <Printer size={15} />
            <span>Cetak / Ekspor PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Volume Permit</p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-[#12372A]">{kpis.totalPermits}</h3>
            <span className="text-xs text-gray-400">Pengajuan</span>
          </div>
          <div className="mt-2 text-[10px] text-gray-500 font-medium">
            Tingkat Persetujuan: <span className="font-bold text-emerald-600">{kpis.approvalRate}%</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Permit Disetujui (Approved)</p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-emerald-800">{kpis.approved}</h3>
            <span className="text-xs text-emerald-600 font-semibold">Tervalidasi</span>
          </div>
          <div className="mt-2 text-[10px] text-emerald-700 font-medium">
            Pending: <span className="font-bold">{kpis.pending}</span> | Ditolak: <span className="font-bold">{kpis.rejected}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Kesiapan Armada & Rig</p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-sky-800">{kpis.fleetUtil}%</h3>
            <span className="text-xs text-sky-600 font-semibold">{kpis.activeVehicles}/{kpis.totalVehicles} Unit</span>
          </div>
          <div className="mt-2 text-[10px] text-sky-700 font-medium">
            Armada siap mobilisasi rig
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Peringatan Kedaluwarsa</p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-amber-800">{kpis.expired}</h3>
            <span className="text-xs text-amber-600 font-semibold">Expired</span>
          </div>
          <div className="mt-2 text-[10px] text-amber-700 font-medium">
            Perlu pembaruan dokumen berkala
          </div>
        </div>
      </div>

      {/* REPORT TABS & ADVANCED MULTI-FILTER */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-4">
        {/* TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("permits")}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "permits"
                ? "bg-[#12372A] text-[#D8FF00]"
                : "bg-[#F5F7F6] text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FileText size={14} />
            <span>Laporan Permit & Kepatuhan ({filteredPermits.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fleet")}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "fleet"
                ? "bg-[#12372A] text-[#D8FF00]"
                : "bg-[#F5F7F6] text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Car size={14} />
            <span>Status Armada & Rig ({vehicles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("drivers")}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "drivers"
                ? "bg-[#12372A] text-[#D8FF00]"
                : "bg-[#F5F7F6] text-gray-600 hover:bg-gray-100"
            }`}
          >
            <UserRound size={14} />
            <span>Kepatuhan Supir & SIM ({drivers.length})</span>
          </button>
        </div>

        {/* MULTI-FILTER BAR */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 text-xs">
          {/* SEARCH */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari permit / supir / armada..."
              className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#12372A] focus:bg-white"
            />
          </div>

          {/* STATUS FILTER */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] py-2.5 px-3 text-xs outline-none focus:border-[#12372A] focus:bg-white font-medium"
            >
              <option value="All">Semua Status Izin</option>
              <option value="Approved">Approved (Disetujui)</option>
              <option value="Pending">Pending (Menunggu Otorisasi)</option>
              <option value="Expiring Soon">Expiring Soon (Segera Habis)</option>
              <option value="Expired">Expired (Kedaluwarsa)</option>
              <option value="Rejected">Rejected (Ditolak)</option>
            </select>
          </div>

          {/* START DATE */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Dari Tanggal"
              className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] py-2 px-3 text-xs outline-none focus:border-[#12372A] focus:bg-white"
            />
          </div>

          {/* END DATE */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Sampai Tanggal"
              className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] py-2 px-3 text-xs outline-none focus:border-[#12372A] focus:bg-white"
            />
          </div>

          {/* RESET FILTERS */}
          <div>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setStartDate("");
                setEndDate("");
                setDeptFilter("All");
              }}
              className="w-full rounded-2xl border border-gray-200 bg-white py-2 px-3 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* REPORT DATA DISPLAY */}
      {activeTab === "permits" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F5F7F6]/80 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-4 pl-6">No. Permit</th>
                  <th className="py-4">Pemohon</th>
                  <th className="py-4">Kendaraan</th>
                  <th className="py-4">Pengemudi</th>
                  <th className="py-4">Rute Jalan</th>
                  <th className="py-4">Masa Berlaku</th>
                  <th className="py-4">Otorisator</th>
                  <th className="py-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPermits.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-400 font-semibold">
                      Tidak ada data permit yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredPermits.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 pl-6 font-mono font-bold text-[#12372A]">
                        {p.permit_number || `PM-${p.id}`}
                      </td>
                      <td className="py-3.5 font-bold text-gray-800">{p.requester}</td>
                      <td className="py-3.5 font-medium text-gray-700">{p.vehicle || "-"}</td>
                      <td className="py-3.5 font-medium text-gray-700">{p.driver || "-"}</td>
                      <td className="py-3.5 text-gray-600">
                        {p.origin} &rarr; {p.destination}
                      </td>
                      <td className="py-3.5 text-gray-500 font-medium">
                        {formatDate(p.end_date)}
                      </td>
                      <td className="py-3.5 font-medium text-gray-600">
                        {p.approver || "-"}
                      </td>
                      <td className="py-3.5 pr-6 text-right">
                        <StatusBadge status={p.status || "Pending"} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "fleet" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F5F7F6]/80 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-4 pl-6">Kendaraan / Plat</th>
                  <th className="py-4">Tipe Armada</th>
                  <th className="py-4">Penugasan Rig</th>
                  <th className="py-4">Status Kesiapan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 pl-6 font-bold text-[#12372A]">
                      {v.plate_number || v.name}
                    </td>
                    <td className="py-3.5 font-medium text-gray-700">{v.type || "Heavy Truck"}</td>
                    <td className="py-3.5 font-semibold text-gray-800">{v.rig || "Rig Minas #02"}</td>
                    <td className="py-3.5">
                      <StatusBadge status={v.status || "Active"} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "drivers" && (
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F5F7F6]/80 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-4 pl-6">Nama Pengemudi</th>
                  <th className="py-4">Nomor Lisensi / SIM</th>
                  <th className="py-4">Jenis SIM</th>
                  <th className="py-4">Status Kepatuhan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 pl-6 font-bold text-[#12372A]">{d.name}</td>
                    <td className="py-3.5 font-mono text-gray-700">{d.license_number || `SIM-${d.id}982`}</td>
                    <td className="py-3.5 font-medium text-gray-700">{d.license_type || "B2 Umum"}</td>
                    <td className="py-3.5">
                      <StatusBadge status={d.status || "Active"} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          OFFICIAL PRINTABLE PDF MODAL (BESMINDO LETTERHEAD)
      ========================================================= */}
      {pdfPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => setPdfPreviewOpen(false)}
        >
          <div
            className="relative my-8 w-full max-w-4xl rounded-2xl bg-white shadow-2xl p-8 space-y-6 print:m-0 print:p-6 print:shadow-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* TOP BAR ACTIONS */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 print:hidden">
              <div>
                <span className="text-xs font-bold text-gray-500">Pratinjau Dokumen Eksekutif (PDF)</span>
                <p className="text-[11px] text-gray-400">Format cetak resmi PT Besmindo Materi Sewatama</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-[#12372A] px-4 py-2 text-xs font-bold text-[#D8FF00] shadow-md hover:bg-[#0c261d]"
                >
                  <Printer size={14} /> Cetak / Simpan PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPdfPreviewOpen(false)}
                  className="rounded-2xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
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
                    DEPARTEMEN OPERASIONAL TRANSPORTASI & LOGISTIK RIG
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Kawasan Industri Tenayan, Pekanbaru - Riau | Telp: (0761) 889201 | Web: besmindo.co.id
                  </p>
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="rounded-2xl border border-[#12372A] px-2.5 py-1 text-[10px] font-extrabold text-[#12372A]">
                  LAPORAN EKSEKUTIF RESMI
                </span>
                <p className="text-[10px] text-gray-400 mt-1">Dicetak: {new Date().toLocaleDateString("id-ID")}</p>
              </div>
            </div>

            {/* DOCUMENT TITLE */}
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-gray-900 underline">
                LAPORAN KEPATUHAN & AUDIT OPERASIONAL TRANSPORTASI
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                Periode Pelaporan: {startDate ? formatDate(startDate) : "Awal Operasional"} s/d {endDate ? formatDate(endDate) : "Hari Ini"}
              </p>
            </div>

            {/* KPI EXECUTIVE SUMMARY TABLE */}
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-2.5">
                <span className="text-[10px] text-gray-500 font-medium">Total Volume Izin</span>
                <p className="text-base font-extrabold text-[#12372A] mt-0.5">{kpis.totalPermits}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-2.5">
                <span className="text-[10px] text-gray-500 font-medium">Tingkat Persetujuan</span>
                <p className="text-base font-extrabold text-emerald-700 mt-0.5">{kpis.approvalRate}%</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-2.5">
                <span className="text-[10px] text-gray-500 font-medium">Kesiapan Armada</span>
                <p className="text-base font-extrabold text-sky-700 mt-0.5">{kpis.fleetUtil}%</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-2.5">
                <span className="text-[10px] text-gray-500 font-medium">Total Trip Terjadwal</span>
                <p className="text-base font-extrabold text-amber-700 mt-0.5">{kpis.totalTrips}</p>
              </div>
            </div>

            {/* DATA TABLE */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Daftar Permohonan Izin Jalan Armada ({filteredPermits.length} Catatan)
              </h4>
              <table className="w-full border border-gray-300 rounded-2xl overflow-hidden text-xs">
                <thead>
                  <tr className="bg-gray-100 text-[10px] font-bold uppercase text-gray-600 border-b border-gray-300">
                    <th className="py-2 px-3 text-left">No. Permit</th>
                    <th className="py-2 px-3 text-left">Pemohon</th>
                    <th className="py-2 px-3 text-left">Kendaraan</th>
                    <th className="py-2 px-3 text-left">Pengemudi</th>
                    <th className="py-2 px-3 text-left">Rute Jalan</th>
                    <th className="py-2 px-3 text-left">Berlaku Sampai</th>
                    <th className="py-2 px-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPermits.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 px-3 font-mono font-bold text-[#12372A]">{p.permit_number}</td>
                      <td className="py-2 px-3">{p.requester}</td>
                      <td className="py-2 px-3">{p.vehicle || "-"}</td>
                      <td className="py-2 px-3">{p.driver || "-"}</td>
                      <td className="py-2 px-3">{p.origin} &rarr; {p.destination}</td>
                      <td className="py-2 px-3">{formatDate(p.end_date)}</td>
                      <td className="py-2 px-3 font-semibold">{p.status || "Pending"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* OFFICIAL SIGNATURE SHEET */}
            <div className="grid grid-cols-3 pt-8 text-xs text-center border-t border-gray-200">
              <div className="space-y-12">
                <p className="font-bold text-gray-700">Disiapkan Oleh (Administrator):</p>
                <div>
                  <p className="font-bold text-gray-900 underline">{currentUser.username || "Transportation Admin"}</p>
                  <p className="text-[10px] text-gray-500">Transportation Administrator</p>
                </div>
              </div>

              <div className="space-y-12">
                <p className="font-bold text-gray-700">Diperiksa Oleh (K3LL / HSE):</p>
                <div>
                  <p className="font-bold text-gray-900 underline">HSE Safety Officer</p>
                  <p className="text-[10px] text-gray-500">Divisi Keselamatan Kerja</p>
                </div>
              </div>

              <div className="space-y-12">
                <p className="font-bold text-gray-700">Disetujui Oleh (Otorisator):</p>
                <div>
                  <p className="font-bold text-gray-900 underline">Kepala Departemen Transportasi</p>
                  <p className="text-[10px] text-gray-500">PT Besmindo Materi Sewatama</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL NOTIFICATION MODAL */}
      <EmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        defaultType="expiry_alert"
      />
    </div>
  );
}