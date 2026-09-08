import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  ShieldCheck,
  Mail,
  Phone,
  UserPlus,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'
import { registerAdminAccount } from '../../services/authStorage'
import { useToast } from '../../components/Toast'

export default function Register() {
  const navigate = useNavigate()
  const toast = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const fullName = formData.fullName.trim()
    const username = formData.username.trim()
    const email = formData.email.trim()
    const password = formData.password.trim()
    const confirmPassword = formData.confirmPassword.trim()

    if (!fullName || !username || !password || !confirmPassword) {
      setError('Mohon lengkapi semua kolom yang wajib diisi.')
      return
    }

    if (username.length < 3) {
      setError('Username minimal harus 3 karakter.')
      return
    }

    if (password.length < 5) {
      setError('Kata sandi minimal harus 5 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.')
      return
    }

    setLoading(true)

    try {
      registerAdminAccount({
        fullName,
        username,
        email,
        phone: formData.phone.trim(),
        password,
      })

      toast.success('Pendaftaran akun Administrator berhasil! Silakan masuk.')
      navigate('/login', { state: { registeredUsername: username } })
    } catch (err) {
      setError(err.message || 'Gagal mendaftarkan akun baru.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F8F7]">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ================= LEFT SIDE (BRANDING) ================= */}
        <div className="relative hidden overflow-hidden bg-[#12372A] lg:flex">
          {/* DECORATION */}
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#D8FF00]/10" />
          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#D8FF00]/10" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            {/* BRAND */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1.5 shadow-lg shadow-black/20">
                <img
                  src="/besmindo-emblem.png"
                  alt="Besmindo Emblem"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-wider text-white">
                  BESMINDO
                </h1>
                <p className="text-xs font-bold tracking-wide text-[#D8FF00]">
                  MATERI SEWATAMA
                </p>
              </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-lg">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#D8FF00]">
                <UserPlus size={28} />
              </div>

              <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Registrasi Akun
                <span className="block text-[#D8FF00]">
                  Administrator
                </span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-6 text-white/60">
                Daftarkan akun administrator baru untuk mengelola otorisasi perizinan angkutan jalan, armada rig, pengemudi, dan pengawasan operasional logistik terpadu.
              </p>

              <div className="mt-8 space-y-4">
                <FeatureItem
                  title="Otoritas Penuh Sistem"
                  description="Akses langsung verifikasi izin permit jalan dan pengawasan aset rig."
                />
                <FeatureItem
                  title="Audit Trail & Keamanan K3LL"
                  description="Seluruh aksi operasional tercatat secara transparan pada log audit resmi."
                />
              </div>
            </div>

            {/* FOOTER */}
            <p className="text-xs text-white/30">
              Transportation Department • PT Besmindo Materi Sewatama
            </p>
          </div>
        </div>

        {/* ================= RIGHT SIDE (FORM) ================= */}
        <div className="flex items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-md my-auto">
            {/* MOBILE BRAND */}
            <div className="mb-6 flex flex-col items-center justify-center gap-1.5 lg:hidden">
              <img
                src="/besmindo-logo.png"
                alt="Besmindo Materi Sewatama"
                className="h-11 w-auto object-contain"
              />
              <p className="text-[11px] font-medium text-gray-500">
                Transportation Permit System
              </p>
            </div>

            {/* TITLE */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#12372A]/10 border border-[#12372A]/20 px-3 py-1 text-[11px] font-bold text-[#12372A] mb-2.5">
                <ShieldCheck size={14} className="text-[#12372A]" />
                <span>Pendaftaran Administrator Baru</span>
              </div>

              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Create Admin Account
              </h1>

              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                Lengkapi formulir di bawah ini untuk mendaftarkan akun pengelola sistem transportasi.
              </p>
            </div>

            {/* ERROR ALERT */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 animate-in fade-in duration-200">
                {error}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* FULL NAME */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Nama Lengkap Administrator <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserRound
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Contoh: Tahnia Rahma"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-xs outline-none transition focus:border-[#12372A] focus:bg-white"
                  />
                </div>
              </div>

              {/* USERNAME & EMAIL (GRID) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-gray-400">
                      @
                    </span>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="username"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-9 pr-3 text-xs font-mono outline-none transition focus:border-[#12372A] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Email Perusahaan
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@besmindo.co.id"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-xs outline-none transition focus:border-[#12372A] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* PHONE NUMBER */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Nomor Kontak / WhatsApp (Opsional)
                </label>
                <div className="relative">
                  <Phone
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-xs outline-none transition focus:border-[#12372A] focus:bg-white"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 5 karakter"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-11 text-xs outline-none transition focus:border-[#12372A] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi kata sandi"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-11 text-xs outline-none transition focus:border-[#12372A] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* ROLE BADGE (LOCKED TO ADMIN) */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-50/60 border border-emerald-200/80 p-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-900 block text-[11px]">
                      Hak Akses Otoritas
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Terkunci sebagai Administrator Utama
                    </span>
                  </div>
                </div>
                <span className="rounded-md bg-[#12372A] px-2 py-0.5 text-[9px] font-black tracking-wider text-[#D8FF00]">
                  FULL ADMIN
                </span>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#12372A] py-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0d2b20] hover:shadow-md disabled:opacity-50"
              >
                {loading ? 'Mendaftarkan...' : 'Daftar Sebagai Administrator'}
              </button>
            </form>

            {/* BACK TO LOGIN */}
            <div className="mt-6 text-center text-xs text-gray-500">
              Sudah memiliki akun Administrator?{' '}
              <Link
                to="/login"
                className="font-bold text-[#12372A] hover:underline"
              >
                Masuk di sini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ title, description }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D8FF00]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#12372A]" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-white/50">{description}</p>
      </div>
    </div>
  )
}
