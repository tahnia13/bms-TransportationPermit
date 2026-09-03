import { useEffect, useState, useMemo } from "react";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Upload,
  Download,
  Mail,
  Trash2,
  PlusCircle,
  FileEdit,
  UserCheck,
  ShieldCheck,
  Calendar,
  X,
} from "lucide-react";
import { api } from "../../services/api";

const modules = ["All", "Permit", "Vehicle", "Driver", "Trip", "Archive", "Report", "Notification"];
const actions = ["All", "APPROVE", "REJECT", "CREATE", "UPDATE", "DELETE", "UPLOAD", "DOWNLOAD", "EMAIL"];

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("All");
  const [selectedAction, setSelectedAction] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (search) params.search = search;
      if (selectedModule !== "All") params.module = selectedModule;
      if (selectedAction !== "All") params.action = selectedAction;
      if (selectedDate) params.date = selectedDate;

      const res = await api.getAuditLogs(params);
      const list = Array.isArray(res?.data) ? res.data : [];
      setLogs(list);
    } catch (err) {
      console.error("Load audit logs error:", err);
      setError(err?.message || "Gagal memuat rekam jejak aktivitas sistem.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedModule, selectedAction, selectedDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLogs();
  };

  const getActionBadge = (action) => {
    switch (action?.toUpperCase()) {
      case "APPROVE":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          label: "Persetujuan",
        };
      case "REJECT":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: XCircle,
          label: "Penolakan",
        };
      case "CREATE":
        return {
          bg: "bg-teal-50 text-teal-700 border-teal-200",
          icon: PlusCircle,
          label: "Pembuatan",
        };
      case "UPDATE":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: FileEdit,
          label: "Pembaruan",
        };
      case "DELETE":
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          icon: Trash2,
          label: "Penghapusan",
        };
      case "UPLOAD":
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: Upload,
          label: "Unggah File",
        };
      case "DOWNLOAD":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Download,
          label: "Unduh Berkas",
        };
      case "EMAIL":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: Mail,
          label: "Kirim Email",
        };
      default:
        return {
          bg: "bg-gray-100 text-gray-700 border-gray-200",
          icon: History,
          label: action || "Aktivitas",
        };
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // KPI Summary
  const stats = useMemo(() => {
    let approvals = 0;
    let files = 0;
    let emails = 0;
    logs.forEach((log) => {
      const act = log.action?.toUpperCase();
      if (act === "APPROVE" || act === "REJECT") approvals++;
      if (act === "UPLOAD" || act === "DOWNLOAD") files++;
      if (act === "EMAIL") emails++;
    });
    return {
      total: logs.length,
      approvals,
      files,
      emails,
    };
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00] shadow-xs">
              <History size={18} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight">
              Audit Log & Rekam Jejak Sistem
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Pencatatan transparan seluruh aktivitas operasional, approval, pengunggahan berkas, dan notifikasi email.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-gray-200 px-4 py-2.5 text-xs font-bold text-[#12372A] shadow-xs transition hover:bg-gray-50 active:scale-[0.98]"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Segarkan Log</span>
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Log Tercatat</p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-[#12372A]">{stats.total}</h3>
            <span className="text-xs text-gray-400">Aktivitas</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Keputusan Otorisasi</p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-emerald-800">{stats.approvals}</h3>
            <span className="text-xs text-emerald-600 font-semibold">Approve / Reject</span>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Manajemen Berkas</p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-indigo-800">{stats.files}</h3>
            <span className="text-xs text-indigo-600 font-semibold">Upload & Download</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4.5 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Email Dispatch</p>
          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold text-amber-800">{stats.emails}</h3>
            <span className="text-xs text-amber-600 font-semibold">Terkirim</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama user, nomor dokumen, deskripsi aktivitas..."
              className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] py-2.5 pl-10 pr-9 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  loadLogs();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* DATE FILTER */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2.5 text-xs text-gray-700 outline-none focus:border-[#12372A] focus:bg-white"
            />

            <button
              type="submit"
              className="rounded-2xl bg-[#12372A] px-4 py-2.5 text-xs font-bold text-[#D8FF00] shadow-md shadow-[#12372A]/10 hover:bg-[#0c261d] transition"
            >
              Cari Log
            </button>
          </div>
        </form>

        {/* PILLS MODUL & AKSI */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 mr-1">Modul:</span>
            {modules.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedModule(m)}
                className={`rounded-2xl px-3 py-1 text-xs font-bold transition ${
                  selectedModule === m
                    ? "bg-[#12372A] text-[#D8FF00]"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {m === "All" ? "Semua" : m}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 mr-1">Aksi:</span>
            {actions.map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => setSelectedAction(act)}
                className={`rounded-2xl px-3 py-1 text-xs font-bold transition ${
                  selectedAction === act
                    ? "bg-[#12372A] text-[#D8FF00]"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {act === "All" ? "Semua Aksi" : act}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-[#F5F7F6]/80 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-4 pl-6">Waktu Kejadian</th>
                <th className="py-4">Pengguna & Peran</th>
                <th className="py-4">Aksi</th>
                <th className="py-4">Modul</th>
                <th className="py-4">Rincian Aktivitas</th>
                <th className="py-4">IP Address</th>
                <th className="py-4 pr-6 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#D8FF00] border-t-[#12372A]" />
                      <p className="font-semibold text-[#12372A]">Memuat rekam jejak audit...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-400">
                    <History size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-600">Tidak ada catatan audit yang sesuai.</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Sesuaikan kata kunci pencarian atau filter modul.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const BadgeIcon = badge.icon;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 pl-6 text-gray-500 font-medium whitespace-nowrap">
                        {formatTimestamp(log.created_at)}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-2xl bg-[#12372A]/10 text-[#12372A] font-bold text-xs">
                            {log.user_name ? log.user_name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">{log.user_name}</p>
                            <p className="text-[10px] text-gray-400">{log.user_role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-2xl border px-2.5 py-1 text-[11px] font-bold ${badge.bg}`}
                        >
                          <BadgeIcon size={12} />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-4 font-semibold text-gray-700">
                        {log.module}
                      </td>
                      <td className="py-4 text-gray-600 max-w-xs truncate" title={log.description}>
                        {log.description}
                      </td>
                      <td className="py-4 font-mono text-[11px] text-gray-400">
                        {log.ip_address || "127.0.0.1"}
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-2xl text-gray-500 hover:bg-emerald-50 hover:text-[#12372A] transition"
                          title="Lihat Rincian Log"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00]">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Rincian Catatan Audit</h3>
                  <p className="text-xs text-gray-400">ID Log: #{selectedLog.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="flex h-8 w-8 items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-100 bg-[#F5F7F6] p-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Pengguna & Peran</span>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedLog.user_name}</p>
                  <p className="text-[11px] text-gray-500">{selectedLog.user_role}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-[#F5F7F6] p-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Aksi & Modul</span>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedLog.action}</p>
                  <p className="text-[11px] text-gray-500">{selectedLog.module}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-[#F5F7F6] p-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Waktu Kejadian</span>
                <p className="font-semibold text-gray-800 mt-0.5">{formatTimestamp(selectedLog.created_at)}</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-[#F5F7F6] p-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Deskripsi Aktivitas</span>
                <p className="text-gray-700 mt-1 leading-relaxed">{selectedLog.description}</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-[#F5F7F6] p-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase">IP Address Pengakses</span>
                <p className="font-mono text-gray-700 mt-0.5">{selectedLog.ip_address || "127.0.0.1"}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-2xl bg-[#12372A] px-5 py-2 text-xs font-bold text-[#D8FF00] hover:bg-[#0d2b20]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
