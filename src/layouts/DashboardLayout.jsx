import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileCheck2,
  Car,
  UserRound,
  MapPinned,
  FolderOpen,
  BarChart3,
  History,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Clock,
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { api } from "../services/api";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve user session & role
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("transportation_user");
      return saved ? JSON.parse(saved) : { username: "Admin", role: "Transportation Admin" };
    } catch {
      return { username: "Admin", role: "Transportation Admin" };
    }
  });

  const isAdmin = currentUser.role?.toLowerCase().includes("admin");

  const switchRole = (newRole) => {
    const updated = {
      username: newRole.includes("Admin") ? "Admin" : "Staff Operasional",
      role: newRole,
    };
    localStorage.setItem("transportation_user", JSON.stringify(updated));
    setCurrentUser(updated);
    window.dispatchEvent(new Event("storage"));
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
      localStorage.removeItem("transportation_user");
      navigate("/login");
    }
  };

  // Notification center state
  const [notifOpen, setNotifOpen] = useState(false);
  const [alerts, setAlerts] = useState({
    summary: { total: 0, expiring_soon_count: 0, expired_count: 0, pending_approval_count: 0 },
    expiring_soon: [],
    expired: [],
    pending_approval: [],
  });
  const notifRef = useRef(null);

  const loadAlerts = async () => {
    try {
      const res = await api.getAlertNotifications();
      if (res?.success) {
        setAlerts(res);
      }
    } catch (err) {
      console.warn("Failed to load live alerts:", err);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
      description: "Overview & summary",
    },
    {
      title: "Permit Management",
      icon: FileCheck2,
      path: "/permit",
      description: "Approval workflow & permits",
      badge: alerts.summary.pending_approval_count > 0 ? `${alerts.summary.pending_approval_count}` : null,
    },
    {
      title: "Vehicles",
      icon: Car,
      path: "/vehicles",
      description: "Fleet & rig trucks",
    },
    {
      title: "Drivers",
      icon: UserRound,
      path: "/drivers",
      description: "Drivers & licenses",
    },
    {
      title: "Trips",
      icon: MapPinned,
      path: "/trips",
      description: "Schedules & routes",
    },
    {
      title: "Digital Archive",
      icon: FolderOpen,
      path: "/archive",
      description: "Dokumen & berkas fisik",
    },
    {
      title: "Advanced Reports",
      icon: BarChart3,
      path: "/reports",
      description: "Analytics & PDF export",
    },
    {
      title: "Audit Log",
      icon: History,
      path: "/audit-logs",
      description: "Rekam jejak aktivitas",
      adminOnly: true,
    },
  ];

  // Route metadata for topbar
  const pageMeta = useMemo(() => {
    const path = location.pathname;
    if (path === "/") {
      return {
        title: "Dashboard Overview",
        badge: "Control Center",
        subtitle: "Real-time overview of permits, fleets, trips, and drivers.",
      };
    }
    if (path.startsWith("/permit")) {
      return {
        title: path.includes("/create") ? "Pengajuan Permit Baru" : "Permit Management & Approval Workflow",
        badge: "Transportation Permits",
        subtitle: "Kelola perizinan, verifikasi kelayakan, dan otorisasi jalan armada.",
      };
    }
    if (path.startsWith("/vehicles")) {
      return {
        title: path.includes("/create") ? "Registrasi Kendaraan" : "Manajemen Armada & Rig",
        badge: "Fleet Assets",
        subtitle: "Pantau kesiapan unit truk, rig, dan sertifikasi uji kelayakan.",
      };
    }
    if (path.startsWith("/drivers")) {
      return {
        title: path.includes("/create") ? "Registrasi Pengemudi" : "Direktori Driver & SIM",
        badge: "Personnel & Safety",
        subtitle: "Pantau pengemudi aktif, masa berlaku SIM B2, dan catatan K3.",
      };
    }
    if (path.startsWith("/trips")) {
      return {
        title: path.includes("/create") ? "Jadwal Trip Baru" : "Trip Management & Logistik",
        badge: "Operations",
        subtitle: "Jadwal perjalanan, rute rig, penugasan armada, dan status muatan.",
      };
    }
    if (path.startsWith("/archive")) {
      return {
        title: "Digital Archive & Dokumen Fisik",
        badge: "Document Repository",
        subtitle: "Penyimpanan berkas fisik scan surat izin, sertifikat, dan laporan inspeksi.",
      };
    }
    if (path.startsWith("/reports")) {
      return {
        title: "Advanced Analytics & Laporan Resmi",
        badge: "Executive Reporting",
        subtitle: "Analitik permit, utilitas armada, kepatuhan SIM, dan ekspor PDF resmi.",
      };
    }
    if (path.startsWith("/audit-logs")) {
      return {
        title: "Audit Log & Rekam Jejak Sistem",
        badge: "Security & Compliance",
        subtitle: "Catatan transparan otorisasi, perubahan data, unggah berkas, dan email.",
      };
    }
    return {
      title: "Transportation System",
      badge: "PT Besmindo Makmur",
      subtitle: "Enterprise permit & vehicle management system",
    };
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const totalAlertCount = alerts.summary.total;

  return (
    <div className="min-h-screen bg-[#F5F7F6] text-slate-800 font-sans antialiased selection:bg-[#D8FF00] selection:text-[#12372A]">
      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-emerald-950/20 bg-[#12372A] text-white transition-all duration-300 shadow-2xl ${
          sidebarOpen ? "w-64" : "w-20"
        } ${
          mobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* BRAND HEADER */}
        <div
          className={`flex h-20 shrink-0 items-center border-b border-white/10 px-4 ${
            sidebarOpen ? "justify-between" : "justify-center"
          }`}
        >
          <Link
            to="/"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex items-center gap-3 group"
          >
            {/* LOGO ICON */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D8FF00] to-[#bce400] text-[#12372A] shadow-md shadow-[#D8FF00]/20 ring-2 ring-white/10 group-hover:scale-105 transition-transform">
              <span className="text-xl font-black tracking-tight">B</span>
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#12372A]" />
            </div>

            {/* BRAND TEXT */}
            {sidebarOpen && (
              <div className="overflow-hidden leading-tight">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-extrabold tracking-wider text-white">
                    BESMINDO
                  </h1>
                  <span className="rounded-2xl bg-[#D8FF00]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#D8FF00]">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] font-medium tracking-wide text-emerald-200/60 truncate">
                  Transportation System
                </p>
              </div>
            )}
          </Link>

          {/* MOBILE CLOSE */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="rounded-2xl p-1.5 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION LIST */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          <div>
            {sidebarOpen ? (
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/40">
                Menu Utama
              </p>
            ) : (
              <div className="mb-2 flex justify-center text-emerald-200/30 text-xs">
                •••
              </div>
            )}

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                // If adminOnly and not admin, skip or show disabled
                if (item.adminOnly && !isAdmin) {
                  return null;
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    title={!sidebarOpen ? item.title : undefined}
                    className={`group relative flex items-center rounded-2xl py-2.5 transition-all duration-200 font-medium ${
                      active
                        ? "bg-[#D8FF00] text-[#12372A] shadow-md shadow-[#D8FF00]/15 font-bold"
                        : "text-emerald-100/75 hover:bg-white/10 hover:text-white"
                    } ${sidebarOpen ? "px-3.5 gap-3" : "justify-center px-0"}`}
                  >
                    <Icon
                      size={20}
                      strokeWidth={active ? 2.5 : 2}
                      className="shrink-0 transition-transform group-hover:scale-110"
                    />

                    {sidebarOpen && (
                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <span className="truncate text-xs tracking-wide">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`rounded-2xl px-1.5 py-0.5 text-[10px] font-black ${
                              active
                                ? "bg-[#12372A] text-[#D8FF00]"
                                : "bg-[#D8FF00] text-[#12372A]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* USER PROFILE & LOGOUT */}
        <div className="shrink-0 border-t border-white/10 p-3 space-y-2 bg-[#0d2a20]/60">
          <div
            className={`flex items-center rounded-2xl bg-white/5 p-2 transition-colors ${
              sidebarOpen ? "gap-3" : "justify-center"
            }`}
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#D8FF00] text-[#12372A] font-black text-sm shadow-xs">
              {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : "A"}
            </div>

            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {currentUser.username}
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isAdmin ? "bg-[#D8FF00]" : "bg-sky-400"
                    }`}
                  />
                  <p className="truncate text-[10px] text-emerald-200/70 font-medium">
                    {currentUser.role}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Keluar"
            className={`flex w-full items-center rounded-2xl py-2 text-xs font-medium text-rose-300/80 transition-colors hover:bg-rose-500/15 hover:text-rose-200 ${
              sidebarOpen ? "gap-2.5 px-3" : "justify-center px-0"
            }`}
          >
            <LogOut size={16} className="shrink-0" />
            {sidebarOpen && <span>Keluar Sistem</span>}
          </button>
        </div>

        {/* TOGGLE COLLAPSE BUTTON */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="absolute -right-3.5 top-[86px] hidden h-7 w-7 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-md transition-transform hover:scale-110 hover:text-[#12372A] lg:flex"
        >
          {sidebarOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </aside>

      {/* MAIN VIEWPORT */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 ${
          sidebarOpen ? "lg:pl-64" : "lg:pl-20"
        }`}
      >
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 h-20 border-b border-gray-200/80 bg-white/90 backdrop-blur-md transition-all">
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* LEFT: MOBILE TOGGLE & BREADCRUMB */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-xs hover:bg-gray-50 lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-2xl bg-[#12372A]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#12372A]">
                    {pageMeta.badge}
                  </span>
                  <span className="hidden sm:inline text-xs text-gray-400">/</span>
                  <span className="text-xs text-gray-500 font-medium truncate hidden sm:inline">
                    PT Besmindo Makmur
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                  {pageMeta.title}
                </h2>
              </div>
            </div>

            {/* RIGHT: NOTIFICATIONS, ROLE SWITCHER, DATE */}
            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
              {/* ROLE SWITCHER SELECTOR */}
              <div className="hidden sm:flex items-center gap-1 bg-[#F5F7F6] border border-gray-200/80 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => switchRole("Transportation Admin")}
                  className={`rounded-2xl px-2.5 py-1 text-[11px] font-bold transition ${
                    isAdmin
                      ? "bg-[#12372A] text-[#D8FF00] shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  title="Masuk sebagai Administrator dengan hak approval penuh"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => switchRole("Transportation Staff")}
                  className={`rounded-2xl px-2.5 py-1 text-[11px] font-bold transition ${
                    !isAdmin
                      ? "bg-[#12372A] text-[#D8FF00] shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  title="Masuk sebagai Staff Operasional (Pengaju Izin)"
                >
                  Staff
                </button>
              </div>

              {/* NOTIFICATION CENTER */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-xs hover:bg-gray-50 transition"
                  aria-label="Notification alerts"
                >
                  <Bell size={18} />
                  {totalAlertCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-2xl bg-rose-500 px-1 text-[10px] font-extrabold text-white shadow-xs animate-pulse">
                      {totalAlertCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATION DROPDOWN POPOVER */}
                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl z-50 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-[#12372A]" />
                        <h4 className="text-xs font-bold text-[#12372A]">Notification & Alert Center</h4>
                      </div>
                      <span className="rounded-2xl bg-[#D8FF00] px-2 py-0.5 text-[10px] font-bold text-[#12372A]">
                        {totalAlertCount} Perhatian
                      </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2 text-xs scrollbar-thin">
                      {totalAlertCount === 0 ? (
                        <div className="py-8 text-center text-gray-400">
                          <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-500" />
                          <p className="font-semibold text-gray-700">Semua permit berstatus aman!</p>
                          <p className="text-[10px]">Tidak ada perizinan yang kedaluwarsa atau tertunda.</p>
                        </div>
                      ) : (
                        <>
                          {/* PENDING APPROVALS */}
                          {alerts.pending_approval.map((item) => (
                            <div
                              key={`p-${item.id}`}
                              className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3 space-y-1 transition hover:bg-amber-50"
                            >
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 font-bold text-amber-900 text-[11px]">
                                  <AlertCircle size={13} className="text-amber-600" /> Butuh Persetujuan
                                </span>
                                <span className="text-[10px] font-bold text-gray-400">#{item.permit_number}</span>
                              </div>
                              <p className="text-[11px] text-gray-700 leading-snug">{item.message}</p>
                              <div className="pt-1 flex justify-end">
                                <Link
                                  to="/permit"
                                  onClick={() => setNotifOpen(false)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#12372A] hover:underline"
                                >
                                  Verifikasi di Permit <ArrowRight size={11} />
                                </Link>
                              </div>
                            </div>
                          ))}

                          {/* EXPIRED PERMITS */}
                          {alerts.expired.map((item) => (
                            <div
                              key={`ex-${item.id}`}
                              className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3 space-y-1 transition hover:bg-rose-50"
                            >
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 font-bold text-rose-800 text-[11px]">
                                  <AlertTriangle size={13} className="text-rose-600" /> Permit Kedaluwarsa
                                </span>
                                <span className="text-[10px] font-bold text-gray-400">#{item.permit_number}</span>
                              </div>
                              <p className="text-[11px] text-gray-700 leading-snug">{item.message}</p>
                              <div className="pt-1 flex justify-end">
                                <Link
                                  to="/permit"
                                  onClick={() => setNotifOpen(false)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:underline"
                                >
                                  Perpanjang Izin <ArrowRight size={11} />
                                </Link>
                              </div>
                            </div>
                          ))}

                          {/* EXPIRING SOON */}
                          {alerts.expiring_soon.map((item) => (
                            <div
                              key={`soon-${item.id}`}
                              className="rounded-2xl border border-yellow-200 bg-yellow-50/50 p-3 space-y-1 transition hover:bg-yellow-50"
                            >
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 font-bold text-yellow-800 text-[11px]">
                                  <Clock size={13} className="text-yellow-600" /> Segera Habis ({item.days_left} Hari)
                                </span>
                                <span className="text-[10px] font-bold text-gray-400">#{item.permit_number}</span>
                              </div>
                              <p className="text-[11px] text-gray-700 leading-snug">{item.message}</p>
                              <div className="pt-1 flex justify-end">
                                <Link
                                  to="/permit"
                                  onClick={() => setNotifOpen(false)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#12372A] hover:underline"
                                >
                                  Lihat Dokumen <ArrowRight size={11} />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-2 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="text-gray-500 hover:text-gray-800"
                      >
                        Tutup
                      </button>
                      <Link
                        to="/permit"
                        onClick={() => setNotifOpen(false)}
                        className="font-bold text-[#12372A] hover:underline"
                      >
                        Buka Semua Permit →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* DATE */}
              <div className="hidden xl:flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-[#F5F7F6] border border-gray-200/80 rounded-2xl px-3 py-1.5">
                <Clock size={14} className="text-gray-400" />
                <span>{currentDateFormatted}</span>
              </div>

              {/* USER BADGE */}
              <div className="flex items-center gap-2.5 pl-1 sm:pl-2 border-l border-gray-200">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00] font-bold text-sm shadow-xs ring-2 ring-[#D8FF00]/40">
                  {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-gray-800 leading-tight">
                    {currentUser.username}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium leading-none mt-0.5">
                    {currentUser.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT OUTLET */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}