import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileCheck2,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  UserRound,
  Car,
  MapPin,
  CalendarDays,
  FileText,
  Building2,
  Printer,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Mail,
  ShieldCheck,
  Download,
  AlertCircle,
  FileBadge2,
} from "lucide-react";
import { api } from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import EmailModal from "../../components/EmailModal";

export default function PermitList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedPermit, setSelectedPermit] = useState(null);
  const [cardMode, setCardMode] = useState(null); // 'view' | 'edit' | 'pdf' | null
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Approval action states
  const [approvalModal, setApprovalModal] = useState({
    open: false,
    permit: null,
    type: "approve", // 'approve' | 'reject'
    notes: "",
  });

  // Email modal state
  const [emailModal, setEmailModal] = useState({
    open: false,
    permit: null,
    type: "expiry_alert",
  });

  // User session & role
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("transportation_user");
      return saved ? JSON.parse(saved) : { username: "Admin", role: "Transportation Admin" };
    } catch {
      return { username: "Admin", role: "Transportation Admin" };
    }
  });

  const isAdmin = currentUser.role?.toLowerCase().includes("admin");

  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem("transportation_user");
        if (saved) setCurrentUser(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const loadPermits = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.getPermits();
      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setPermits(data);
    } catch (error) {
      console.error("Get permits error:", error);
      setErrorMessage(error.message || "Gagal mengambil data permit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermits();
    async function preloadAssets() {
      try {
        const [vRes, dRes] = await Promise.all([
          api.getVehicles(),
          api.getDrivers(),
        ]);
        setVehicles(Array.isArray(vRes?.data) ? vRes.data : Array.isArray(vRes) ? vRes : []);
        setDrivers(Array.isArray(dRes?.data) ? dRes.data : Array.isArray(dRes) ? dRes : []);
      } catch (err) {
        console.warn("Could not preload assets for permit edit:", err);
      }
    }
    preloadAssets();
  }, []);

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return Number.isNaN(d.getTime())
      ? String(date).substring(0, 10)
      : d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    return String(date).substring(0, 10);
  };

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = {
      All: permits.length,
      Approved: 0,
      Pending: 0,
      "Expiring Soon": 0,
      Expired: 0,
      Rejected: 0,
    };

    permits.forEach((p) => {
      const s = p.status || "Pending";
      if (counts[s] !== undefined) counts[s]++;
      else counts[s] = 1;
    });

    return counts;
  }, [permits]);

  // Filtered permits
  const filteredPermits = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return permits.filter((permit) => {
      // Filter by status tab
      if (statusFilter !== "All") {
        const permitStatus = String(permit.status || "").toLowerCase();
        if (permitStatus !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Keyword search
      if (!keyword) return true;

      return (
        String(permit.permit_number || "").toLowerCase().includes(keyword) ||
        String(permit.requester || "").toLowerCase().includes(keyword) ||
        String(permit.driver || "").toLowerCase().includes(keyword) ||
        String(permit.vehicle || "").toLowerCase().includes(keyword) ||
        String(permit.origin || "").toLowerCase().includes(keyword) ||
        String(permit.destination || "").toLowerCase().includes(keyword) ||
        String(permit.status || "").toLowerCase().includes(keyword)
      );
    });
  }, [permits, search, statusFilter]);

  const handleDelete = async (permit) => {
    if (!isAdmin) {
      alert("Hanya Administrator yang memiliki akses untuk menghapus data permit.");
      return;
    }

    if (!window.confirm(`Hapus permohonan permit ${permit.permit_number}?`)) {
      return;
    }

    try {
      await api.deletePermit(permit.id);
      setPermits((prev) => prev.filter((p) => p.id !== permit.id));
      if (selectedPermit?.id === permit.id) handleClose();
      alert("Permit berhasil dihapus.");
    } catch (error) {
      console.error("Delete permit error:", error);
      alert(error.message || "Gagal menghapus permit.");
    }
  };

  const handleView = (permit) => {
    setSelectedPermit(permit);
    setCardMode("view");
  };

  const handleEdit = (permit) => {
    setSelectedPermit(permit);
    setEditForm({
      id: permit.id,
      permit_number: permit.permit_number || "",
      requester: permit.requester || "",
      department: permit.department || "",
      vehicle: permit.vehicle || "",
      driver: permit.driver || "",
      origin: permit.origin || "",
      destination: permit.destination || "",
      start_date: formatDateForInput(permit.start_date),
      end_date: formatDateForInput(permit.end_date),
      purpose: permit.purpose || "",
      status: permit.status || "Pending",
      description: permit.description || "",
    });
    setCardMode("edit");
  };

  const handleOpenApproval = (permit, type) => {
    if (!isAdmin) {
      alert("Akses Terbatas: Hanya Administrator yang berwenang menyetujui atau menolak permohonan permit.");
      return;
    }

    setApprovalModal({
      open: true,
      permit,
      type,
      notes:
        type === "approve"
          ? "Disetujui. Berkas verifikasi armada dan lisensi pengemudi telah memenuhi standar K3."
          : "Ditolak. Persyaratan uji kelayakan kendaraan atau izin pengemudi belum lengkap.",
    });
  };

  const executeApprovalAction = async (e) => {
    e.preventDefault();
    const { permit, type, notes } = approvalModal;
    if (!permit) return;

    try {
      if (type === "approve") {
        const res = await api.approvePermit(permit.id, {
          approver: currentUser.username || "Transportation Admin",
          approval_notes: notes,
          current_user_role: currentUser.role,
        });
        const updated = res.data || { ...permit, status: "Approved" };
        setPermits((prev) => prev.map((p) => (p.id === permit.id ? updated : p)));
        if (selectedPermit?.id === permit.id) setSelectedPermit(updated);
        alert(`Permit #${permit.permit_number} berhasil disetujui.`);
      } else {
        const res = await api.rejectPermit(permit.id, {
          approver: currentUser.username || "Transportation Admin",
          rejection_reason: notes,
          current_user_role: currentUser.role,
        });
        const updated = res.data || { ...permit, status: "Rejected" };
        setPermits((prev) => prev.map((p) => (p.id === permit.id ? updated : p)));
        if (selectedPermit?.id === permit.id) setSelectedPermit(updated);
        alert(`Permit #${permit.permit_number} telah ditolak.`);
      }
      setApprovalModal({ open: false, permit: null, type: "approve", notes: "" });
    } catch (err) {
      console.error("Approval error:", err);
      alert(err.message || "Gagal memproses otorisasi permit.");
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!editForm) return;

    setSaving(true);
    try {
      const payload = {
        permit_number: editForm.permit_number,
        requester: editForm.requester,
        department: editForm.department || null,
        vehicle: editForm.vehicle || null,
        driver: editForm.driver || null,
        origin: editForm.origin,
        destination: editForm.destination,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        purpose: editForm.purpose,
        status: editForm.status,
        description: editForm.description || null,
      };

      const response = await api.updatePermit(editForm.id, payload);
      const updatedPermit = response.data || payload;

      setPermits((prev) =>
        prev.map((p) => (p.id === editForm.id ? { ...p, ...updatedPermit } : p))
      );
      setSelectedPermit({ ...selectedPermit, ...updatedPermit });
      setCardMode("view");
      alert("Permit berhasil diperbarui.");
    } catch (error) {
      console.error("Update permit error:", error);
      alert(error.message || "Gagal memperbarui permit.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedPermit(null);
    setCardMode(null);
    setEditForm(null);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight">
            Permit Management & Approval
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Alur otorisasi berjenjang izin jalan, penugasan armada, dan peringatan kedaluwarsa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/permit/create"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D8FF00] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#12372A] shadow-md shadow-[#D8FF00]/20 transition-all hover:bg-[#c9ee00] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Ajukan Permit Baru</span>
          </Link>
        </div>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {errorMessage}
        </div>
      )}

      {/* ROLE INFORMATION BANNER */}
      <div className="flex items-center justify-between rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-gray-800">
                Mode Akses Saat Ini: {currentUser.role}
              </span>
              <span
                className={`rounded-2xl px-2 py-0.5 text-[10px] font-bold ${
                  isAdmin ? "bg-[#D8FF00] text-[#12372A]" : "bg-sky-100 text-sky-800"
                }`}
              >
                {isAdmin ? "Otoritas Penuh" : "Pengajuan & Operasional"}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {isAdmin
                ? "Anda dapat menyetujui, menolak permohonan jalan, mengedit, menghapus, serta mengirim notifikasi email."
                : "Staff berwenang membuat pengajuan permit baru dan memantau status. Otorisasi persetujuan diproses oleh Admin."}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          FILTER TABS & SEARCH BAR
      ========================================================= */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs space-y-4">
        {/* STATUS FILTER PILLS */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              "All",
              "Approved",
              "Pending",
              "Expiring Soon",
              "Expired",
              "Rejected",
            ].map((tab) => {
              const count = statusCounts[tab] || 0;
              const active = statusFilter === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-1.5 text-xs font-bold transition ${
                    active
                      ? "bg-[#12372A] text-[#D8FF00] shadow-xs"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{tab === "All" ? "Semua Status" : tab}</span>
                  <span
                    className={`rounded-2xl px-1.5 py-0.2 text-[10px] font-bold ${
                      active
                        ? "bg-[#D8FF00] text-[#12372A]"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari permit, requester, supir..."
              className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] py-2.5 pl-10 pr-9 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition"
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

      {/* =========================================================
          PERMIT TABLE
      ========================================================= */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-[#F5F7F6]/80 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-4 pl-6">Nomor Permit</th>
                <th className="py-4">Pemohon & Unit</th>
                <th className="py-4">Kendaraan & Supir</th>
                <th className="py-4">Rute Jalan</th>
                <th className="py-4">Masa Berlaku</th>
                <th className="py-4">Status & Otorisasi</th>
                <th className="py-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#D8FF00] border-t-[#12372A]" />
                      <p className="font-semibold text-[#12372A]">Memuat data permit...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPermits.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-400">
                    <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-600">Tidak ada permit yang ditemukan.</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Coba sesuaikan kata kunci pencarian atau filter status Anda.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPermits.map((permit) => {
                  const isPending = (permit.status || "").toLowerCase() === "pending";
                  const isExpiring = (permit.status || "").toLowerCase() === "expiring soon";

                  return (
                    <tr
                      key={permit.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* NOMOR PERMIT */}
                      <td className="py-4 pl-6 font-mono font-bold text-[#12372A]">
                        {permit.permit_number || `PM-${permit.id}`}
                      </td>

                      {/* REQUESTER & DEPT */}
                      <td className="py-4">
                        <p className="font-bold text-gray-800">{permit.requester}</p>
                        <p className="text-[10px] text-gray-400">{permit.department || "-"}</p>
                      </td>

                      {/* VEHICLE & DRIVER */}
                      <td className="py-4">
                        <p className="font-semibold text-gray-800">{permit.vehicle || "-"}</p>
                        <p className="text-[10px] text-gray-500">Supir: {permit.driver || "-"}</p>
                      </td>

                      {/* ROUTE */}
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 font-medium text-gray-700">
                          <span className="truncate max-w-[90px]">{permit.origin}</span>
                          <ArrowRight size={11} className="text-gray-400 shrink-0" />
                          <span className="truncate max-w-[90px]">{permit.destination}</span>
                        </div>
                      </td>

                      {/* VALIDITY */}
                      <td className="py-4 text-gray-500 font-medium">
                        {formatDate(permit.end_date)}
                      </td>

                      {/* STATUS & APPROVER */}
                      <td className="py-4">
                        <StatusBadge status={permit.status || "Pending"} size="sm" />
                        {permit.approver && (
                          <p className="text-[10px] text-gray-400 mt-1">
                            Oleh: {permit.approver}
                          </p>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* QUICK APPROVAL BUTTONS FOR ADMIN */}
                          {isAdmin && isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenApproval(permit, "approve")}
                                title="Setujui Permohonan Permit"
                                className="flex h-8 w-8 items-center justify-center rounded-2xl text-emerald-600 hover:bg-emerald-50 transition"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenApproval(permit, "reject")}
                                title="Tolak Permohonan Permit"
                                className="flex h-8 w-8 items-center justify-center rounded-2xl text-rose-600 hover:bg-rose-50 transition"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}

                          {/* EMAIL NOTIFICATION BUTTON */}
                          <button
                            type="button"
                            onClick={() =>
                              setEmailModal({
                                open: true,
                                permit,
                                type: isExpiring ? "expiry_alert" : "approval_notice",
                              })
                            }
                            title="Kirim Notifikasi Email"
                            className="flex h-8 w-8 items-center justify-center rounded-2xl text-gray-500 hover:bg-amber-50 hover:text-amber-700 transition"
                          >
                            <Mail size={15} />
                          </button>

                          {/* VIEW BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleView(permit)}
                            title="Lihat Detail & Workflow"
                            className="flex h-8 w-8 items-center justify-center rounded-2xl text-gray-500 hover:bg-emerald-50 hover:text-[#12372A] transition"
                          >
                            <Eye size={16} />
                          </button>

                          {/* EDIT BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleEdit(permit)}
                            title="Edit Permit"
                            className="flex h-8 w-8 items-center justify-center rounded-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* DELETE BUTTON (ADMIN ONLY) */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(permit)}
                              title="Hapus Permit"
                              className="flex h-8 w-8 items-center justify-center rounded-2xl text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
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

      {/* =========================================================
          VIEW MODAL (WITH APPROVAL WORKFLOW TIMELINE)
      ========================================================= */}
      {selectedPermit && cardMode === "view" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={handleClose}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl space-y-5 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* DOSSIER HEADER */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00] shadow-sm">
                  <FileCheck2 size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Surat Izin Transportasi Resmi PT Besmindo Makmur
                  </span>
                  <h2 className="text-lg font-extrabold text-[#12372A]">
                    {selectedPermit.permit_number || `PM-${selectedPermit.id}`}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCardMode("pdf")}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs"
                >
                  <Printer size={13} />
                  <span>PDF Surat Izin</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-2xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* VISUAL 3-STAGE APPROVAL WORKFLOW */}
            <div className="rounded-2xl border border-gray-200/80 bg-[#F5F7F6] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-[#12372A] uppercase tracking-wider">
                  Alur Persetujuan Izin Jalan (Approval Workflow)
                </h4>
                <span className="text-[10px] text-gray-400 font-medium">Multi-stage compliance</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {/* STEP 1 */}
                <div className="rounded-2xl bg-white p-2.5 border border-emerald-200">
                  <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <CheckCircle2 size={13} /> 1. Pengajuan
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 truncate">{selectedPermit.requester || "Staff"}</p>
                  <p className="text-[9px] text-gray-400">{formatDate(selectedPermit.created_at || selectedPermit.start_date)}</p>
                </div>

                {/* STEP 2 */}
                <div className="rounded-2xl bg-white p-2.5 border border-emerald-200">
                  <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <CheckCircle2 size={13} /> 2. Verifikasi
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 truncate">{selectedPermit.vehicle || "Armada"}</p>
                  <p className="text-[9px] text-emerald-600 font-semibold">Layak Operasional</p>
                </div>

                {/* STEP 3 */}
                <div
                  className={`rounded-2xl bg-white p-2.5 border ${
                    selectedPermit.status === "Approved"
                      ? "border-emerald-300 bg-emerald-50/20"
                      : selectedPermit.status === "Rejected"
                      ? "border-rose-300 bg-rose-50/20"
                      : "border-amber-300 bg-amber-50/20"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center gap-1 font-bold text-[11px] ${
                      selectedPermit.status === "Approved"
                        ? "text-emerald-700"
                        : selectedPermit.status === "Rejected"
                        ? "text-rose-700"
                        : "text-amber-700"
                    }`}
                  >
                    {selectedPermit.status === "Approved" ? (
                      <CheckCircle2 size={13} />
                    ) : selectedPermit.status === "Rejected" ? (
                      <XCircle size={13} />
                    ) : (
                      <Clock size={13} />
                    )}
                    <span>3. Otorisasi</span>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1 font-semibold">
                    {selectedPermit.status || "Pending Review"}
                  </p>
                  <p className="text-[9px] text-gray-400">
                    {selectedPermit.approver ? `Oleh: ${selectedPermit.approver}` : "Menunggu Otorisator"}
                  </p>
                </div>
              </div>

              {/* APPROVAL NOTES / REJECTION REASON */}
              {(selectedPermit.approval_notes || selectedPermit.rejection_reason) && (
                <div className="rounded-2xl bg-white p-3 border border-gray-200 text-xs text-gray-700 space-y-0.5">
                  <p className="font-bold text-[11px] text-[#12372A]">Catatan Otorisator:</p>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    {selectedPermit.approval_notes || selectedPermit.rejection_reason}
                  </p>
                </div>
              )}
            </div>

            {/* QUICK ACTIONS FOR PENDING APPROVAL */}
            {selectedPermit.status === "Pending" && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <AlertCircle size={18} className="text-amber-700 shrink-0" />
                  <div>
                    <p className="font-bold text-amber-900">Permohonan Izin Menunggu Keputusan</p>
                    <p className="text-[11px] text-amber-700">
                      {isAdmin
                        ? "Sebagai Administrator, Anda dapat memberikan persetujuan jalan atau menolak permohonan ini."
                        : "Permohonan ini telah diserahkan kepada Administrator untuk diverifikasi dan disetujui."}
                    </p>
                  </div>
                </div>

                {isAdmin ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenApproval(selectedPermit, "reject")}
                      className="rounded-2xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                    >
                      Tolak
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenApproval(selectedPermit, "approve")}
                      className="rounded-2xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      Setujui Permit
                    </button>
                  </div>
                ) : (
                  <span className="rounded-2xl bg-amber-200/80 px-2.5 py-1 text-[10px] font-bold text-amber-900">
                    Menunggu Verifikasi Admin
                  </span>
                )}
              </div>
            )}

            {/* DOSSIER INFORMATION GRID */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pemohon (*Requester*)</p>
                <p className="mt-1 font-bold text-[#12372A]">{selectedPermit.requester || "-"}</p>
                <p className="text-[10px] text-gray-500">{selectedPermit.department || "-"}</p>
              </div>

              <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Kendaraan & Supir</p>
                <p className="mt-1 font-bold text-[#12372A]">{selectedPermit.vehicle || "-"}</p>
                <p className="text-[10px] text-gray-500">Driver: {selectedPermit.driver || "-"}</p>
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Rute Perjalanan</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-2xl bg-white p-2 border border-gray-200/80 text-center">
                    <span className="text-[9px] text-gray-400 block font-medium">Asal</span>
                    <span className="font-bold text-gray-800 text-xs">{selectedPermit.origin}</span>
                  </div>
                  <ArrowRight size={16} className="text-[#12372A] shrink-0" />
                  <div className="flex-1 rounded-2xl bg-white p-2 border border-gray-200/80 text-center">
                    <span className="text-[9px] text-gray-400 block font-medium">Tujuan</span>
                    <span className="font-bold text-gray-800 text-xs">{selectedPermit.destination}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Periode Izin</p>
                <p className="mt-1 font-bold text-[#12372A]">
                  {formatDate(selectedPermit.start_date)} s/d {formatDate(selectedPermit.end_date)}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 p-3 bg-gray-50/50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Keperluan (*Purpose*)</p>
                <p className="mt-1 font-semibold text-gray-700">{selectedPermit.purpose || "-"}</p>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex flex-wrap items-center justify-between border-t border-gray-100 pt-4 gap-2">
              <button
                type="button"
                onClick={() =>
                  setEmailModal({
                    open: true,
                    permit: selectedPermit,
                    type: "expiry_alert",
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Mail size={13} />
                <span>Kirim Email Pengingat</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(selectedPermit)}
                  className="rounded-2xl bg-[#D8FF00] px-4 py-2 text-xs font-bold text-[#12372A] hover:bg-[#c9ee00]"
                >
                  Edit Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          APPROVAL / REJECTION CONFIRMATION MODAL
      ========================================================= */}
      {approvalModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setApprovalModal({ ...approvalModal, open: false })}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                  approvalModal.type === "approve"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {approvalModal.type === "approve" ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <XCircle size={22} />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {approvalModal.type === "approve"
                    ? "Otorisasi Persetujuan Permit"
                    : "Penolakan Permohonan Permit"}
                </h3>
                <p className="text-xs text-gray-400">
                  Permit #{approvalModal.permit?.permit_number}
                </p>
              </div>
            </div>

            <form onSubmit={executeApprovalAction} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Nama Pejabat Otorisator
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.username} (${currentUser.role})`}
                  className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 text-xs font-semibold text-gray-700"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {approvalModal.type === "approve"
                    ? "Catatan Otorisasi & Rekomendasi K3"
                    : "Alasan Penolakan Permohonan"}
                </label>
                <textarea
                  rows={3}
                  required
                  value={approvalModal.notes}
                  onChange={(e) =>
                    setApprovalModal({ ...approvalModal, notes: e.target.value })
                  }
                  placeholder="Masukkan pertimbangan keselamatan/kelayakan..."
                  className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] p-3 text-xs outline-none focus:border-[#12372A] focus:bg-white transition"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() =>
                    setApprovalModal({ ...approvalModal, open: false })
                  }
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`rounded-2xl px-5 py-2 text-xs font-bold text-white shadow-md ${
                    approvalModal.type === "approve"
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {approvalModal.type === "approve" ? "Konfirmasi Setujui" : "Konfirmasi Tolak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          OFFICIAL PRINTABLE PDF SURAT IZIN MODAL
      ========================================================= */}
      {selectedPermit && cardMode === "pdf" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => setCardMode("view")}
        >
          <div
            className="relative my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl p-8 space-y-6 print:m-0 print:p-6 print:shadow-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* TOP ACTIONS */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 print:hidden">
              <span className="text-xs font-bold text-gray-500">Pratinjau Dokumen Resmi (PDF)</span>
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
                  onClick={() => setCardMode("view")}
                  className="rounded-2xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* OFFICIAL LETTERHEAD */}
            <div className="border-b-2 border-[#12372A] pb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00] font-black text-2xl">
                  B
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-wide text-[#12372A]">
                    PT BESMINDO MAKMUR
                  </h2>
                  <p className="text-[11px] font-bold text-gray-700">
                    DEPARTEMEN TRANSPORTASI, LOGISTIK & OPERASIONAL RIG
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Kawasan Industri Tenayan, Pekanbaru - Riau | Telp: (0761) 889201 | Email: ops@besmindo.co.id
                  </p>
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="rounded-2xl border border-[#12372A] px-2.5 py-1 text-[10px] font-extrabold text-[#12372A]">
                  DOKUMEN RESMI PERUSAHAAN
                </span>
              </div>
            </div>

            {/* TITLE */}
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-gray-900 underline">
                SURAT IZIN OPERASIONAL PENGANGKUTAN JALAN (PERMIT)
              </h3>
              <p className="font-mono text-xs font-bold text-gray-600">
                Nomor Registrasi: {selectedPermit.permit_number || `PM-${selectedPermit.id}`}
              </p>
            </div>

            {/* DOCUMENT BODY */}
            <div className="space-y-4 text-xs text-gray-800 leading-relaxed">
              <p>
                Berdasarkan hasil pemeriksaan kelayakan armada, kesesuaian muatan, dan kepatuhan K3LL (*HSE Compliance*), Departemen Transportasi PT Besmindo Makmur dengan ini menerbitkan Izin Operasional Angkutan kepada:
              </p>

              <table className="w-full border border-gray-300 rounded-2xl overflow-hidden">
                <tbody className="divide-y divide-gray-200">
                  <tr className="bg-gray-50/70">
                    <td className="py-2 px-3 font-bold w-1/3 text-gray-600">Nama Pemohon (Requester)</td>
                    <td className="py-2 px-3 font-semibold">{selectedPermit.requester} ({selectedPermit.department || "Operasional"})</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-600">Identitas Pengemudi (Driver)</td>
                    <td className="py-2 px-3 font-semibold">{selectedPermit.driver || "-"} (SIM B2 Umum Aktif)</td>
                  </tr>
                  <tr className="bg-gray-50/70">
                    <td className="py-2 px-3 font-bold text-gray-600">Kendaraan / Nomor Plat</td>
                    <td className="py-2 px-3 font-semibold">{selectedPermit.vehicle || "-"}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-600">Rute Perjalanan Resmi</td>
                    <td className="py-2 px-3 font-semibold">{selectedPermit.origin} &rarr; {selectedPermit.destination}</td>
                  </tr>
                  <tr className="bg-gray-50/70">
                    <td className="py-2 px-3 font-bold text-gray-600">Masa Berlaku Izin</td>
                    <td className="py-2 px-3 font-semibold text-emerald-800">
                      {formatDate(selectedPermit.start_date)} s/d {formatDate(selectedPermit.end_date)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-600">Keperluan / Kategori Muatan</td>
                    <td className="py-2 px-3">{selectedPermit.purpose || "Mobilisasi Alat & Perlengkapan Rig"}</td>
                  </tr>
                </tbody>
              </table>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-3 space-y-1 text-[11px]">
                <p className="font-bold text-gray-800">Ketentuan & Syarat Keselamatan Operasional:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-gray-600">
                  <li>Pengemudi wajib mematuhi batas kecepatan maksimal 60 km/jam di jalan lintas dan 20 km/jam di area Rig Site.</li>
                  <li>Wajib membawa kelengkapan APD standar K3 (Helm, Rompi Reflektif, Safety Shoes) saat memasuki fasilitas.</li>
                  <li>Surat Izin ini wajib ditunjukkan kepada petugas sekuriti / gate guard saat check-in dan check-out.</li>
                </ol>
              </div>
            </div>

            {/* SIGNATURE BLOCK */}
            <div className="grid grid-cols-2 pt-6 text-xs text-center border-t border-gray-200">
              <div className="space-y-12">
                <p className="font-bold text-gray-700">Dibuat Oleh (Staff Operasional):</p>
                <div>
                  <p className="font-bold text-gray-900 underline">{selectedPermit.requester || "Staff Logistik"}</p>
                  <p className="text-[10px] text-gray-500">PT Besmindo Makmur</p>
                </div>
              </div>

              <div className="space-y-12">
                <p className="font-bold text-gray-700">Disetujui & Diotorisasi Oleh:</p>
                <div>
                  <p className="font-bold text-gray-900 underline">{selectedPermit.approver || "Kepala Bagian Transportasi"}</p>
                  <p className="text-[10px] text-gray-500">Status Otorisasi: {selectedPermit.status || "Approved"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          EDIT PERMIT MODAL
      ========================================================= */}
      {selectedPermit && cardMode === "edit" && editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={handleClose}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00]">
                  <Pencil size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Edit Data Permohonan Permit
                  </h3>
                  <p className="text-xs text-gray-400">
                    Nomor Permit: {editForm.permit_number}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nomor Permit
                  </label>
                  <input
                    type="text"
                    required
                    name="permit_number"
                    value={editForm.permit_number}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 outline-none focus:border-[#12372A] focus:bg-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Pemohon (*Requester*)
                  </label>
                  <input
                    type="text"
                    required
                    name="requester"
                    value={editForm.requester}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Departemen / Divisi
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={editForm.department}
                    onChange={handleEditChange}
                    placeholder="Contoh: Logistik / Operasional Rig"
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Status Otorisasi
                  </label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 outline-none focus:border-[#12372A] focus:bg-white font-semibold"
                  >
                    <option value="Pending">Pending (Menunggu Persetujuan)</option>
                    <option value="Approved">Approved (Disetujui)</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Expired">Expired</option>
                    <option value="Rejected">Rejected (Ditolak)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Kendaraan / Plat Nomor
                  </label>
                  <input
                    type="text"
                    name="vehicle"
                    value={editForm.vehicle}
                    onChange={handleEditChange}
                    list="vehicle-list"
                    placeholder="Contoh: BM 1234 AB"
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                  <datalist id="vehicle-list">
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.plate_number || v.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Pengemudi (*Driver*)
                  </label>
                  <input
                    type="text"
                    name="driver"
                    value={editForm.driver}
                    onChange={handleEditChange}
                    list="driver-list"
                    placeholder="Pilih atau ketik supir..."
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                  <datalist id="driver-list">
                    {drivers.map((d) => (
                      <option key={d.id} value={d.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Titik Asal (*Origin*)
                  </label>
                  <input
                    type="text"
                    required
                    name="origin"
                    value={editForm.origin}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tujuan (*Destination*)
                  </label>
                  <input
                    type="text"
                    required
                    name="destination"
                    value={editForm.destination}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tanggal Mulai Berlaku
                  </label>
                  <input
                    type="date"
                    required
                    name="start_date"
                    value={editForm.start_date}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tanggal Berakhir
                  </label>
                  <input
                    type="date"
                    required
                    name="end_date"
                    value={editForm.end_date}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Keperluan / Muatan (*Purpose*)
                </label>
                <input
                  type="text"
                  required
                  name="purpose"
                  value={editForm.purpose}
                  onChange={handleEditChange}
                  placeholder="Contoh: Pengangkutan Material Drilling Rig Minas #02"
                  className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2 outline-none focus:border-[#12372A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Catatan / Keterangan K3
                </label>
                <textarea
                  rows={2}
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="Catatan rute khusus, muatan berbahaya, atau syarat APD..."
                  className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] p-2.5 outline-none focus:border-[#12372A] focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-[#12372A] px-5 py-2 text-xs font-bold text-[#D8FF00] shadow-md hover:bg-[#0c261d] transition disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan Permit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          EMAIL NOTIFICATION MODAL
      ========================================================= */}
      <EmailModal
        isOpen={emailModal.open}
        onClose={() => setEmailModal({ open: false, permit: null, type: "expiry_alert" })}
        permit={emailModal.permit}
        defaultType={emailModal.type}
      />
    </div>
  );
}