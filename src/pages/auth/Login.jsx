import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  ShieldCheck,
  KeyRound,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  UserPlus,
} from 'lucide-react'
import { useToast } from '../../components/Toast'
import { verifyAdminCredentials, resetAdminPassword } from '../../services/authStorage'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [error, setError] = useState('')

  // Prefill jika baru saja mendaftar dari halaman /register
  useEffect(() => {
    if (location.state?.registeredUsername) {
      setFormData((prev) => ({
        ...prev,
        username: location.state.registeredUsername,
      }))
    }
  }, [location.state])

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [resetForm, setResetForm] = useState({
    identifier: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [resetMessage, setResetMessage] = useState({ text: '', type: '' })

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

    const inputUser = formData.username.trim()
    const inputPass = formData.password.trim()

    if (!inputUser || !inputPass) {
      setError('Username dan password wajib diisi.')
      return
    }

    // Verifikasi terhadap akun administrator terdaftar (termasuk tahnia / tahnia123 dan akun hasil register)
    const matchedAccount = verifyAdminCredentials(inputUser, inputPass)

    if (!matchedAccount) {
      setError('Username atau kata sandi salah! Akses ditolak. Silakan gunakan akun yang valid atau daftarkan akun baru.')
      toast.error('Kredensial salah. Akses ditolak.')
      return
    }

    // Login sukses sebagai Transportation Admin
    const user = {
      username: matchedAccount.fullName || matchedAccount.username,
      role: 'Transportation Admin',
    }

    localStorage.setItem(
      'transportation_user',
      JSON.stringify(user)
    )

    toast.success(`Login berhasil! Selamat datang, ${user.username}.`)
    navigate('/')
  }

  const handleResetPassword = (e) => {
    e.preventDefault()
    setResetMessage({ text: '', type: '' })

    const identifier = resetForm.identifier.trim()
    const newPass = resetForm.newPassword.trim()
    const confirmPass = resetForm.confirmPassword.trim()

    if (!identifier) {
      setResetMessage({
        text: 'Harap masukkan username atau email akun Administrator Anda.',
        type: 'error',
      })
      return
    }

    if (!newPass || newPass.length < 5) {
      setResetMessage({
        text: 'Kata sandi baru minimal harus 5 karakter.',
        type: 'error',
      })
      return
    }

    if (newPass !== confirmPass) {
      setResetMessage({
        text: 'Konfirmasi kata sandi tidak cocok. Harap periksa kembali.',
        type: 'error',
      })
      return
    }

    try {
      resetAdminPassword(identifier, newPass)
      setFormData((prev) => ({
        ...prev,
        username: identifier,
        password: newPass,
      }))
      setError('')
      setResetMessage({
        text: 'Kata sandi berhasil diperbarui! Anda dapat langsung masuk dengan sandi baru.',
        type: 'success',
      })
      toast.success('Kata sandi berhasil diatur ulang.')

      setTimeout(() => {
        setShowForgotModal(false)
        setResetForm({ identifier: '', newPassword: '', confirmPassword: '' })
        setResetMessage({ text: '', type: '' })
      }, 1200)
    } catch (err) {
      setResetMessage({
        text: err.message || 'Gagal mengatur ulang kata sandi.',
        type: 'error',
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F8F7]">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* ================= LEFT ================= */}

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

                <ShieldCheck size={30} />

              </div>

              <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Transportation
                <span className="block text-[#D8FF00]">
                  Admin Portal
                </span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-6 text-white/60">
                Sistem terpusat otorisasi perizinan jalan (permit), manajemen armada rig,
                dan pengawasan operasional logistik PT Besmindo Materi Sewatama.
              </p>


              <div className="mt-8 space-y-4">

                <Feature
                  title="Otorisasi & Approval Permit"
                  description="Verifikasi kelayakan dan pengesahan izin operasional angkutan."
                />

                <Feature
                  title="Kontrol Penuh Armada & Driver"
                  description="Monitoring kesiapan unit truk rig, masa berlaku SIM & sertifikasi K3."
                />

                <Feature
                  title="Laporan Eksekutif & Audit Log"
                  description="Cetak dokumen resmi PDF dan rekam jejak aktivitas operasional."
                />

              </div>

            </div>


            {/* FOOTER */}

            <p className="text-xs text-white/30">
              Transportation Department • Internal System
            </p>

          </div>

        </div>


        {/* ================= RIGHT ================= */}

        <div className="flex items-center justify-center px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

            {/* MOBILE BRAND */}
            <div className="mb-8 flex flex-col items-center justify-center gap-1.5 lg:hidden">
              <img
                src="/besmindo-logo.png"
                alt="Besmindo Materi Sewatama"
                className="h-12 w-auto object-contain"
              />
              <p className="text-[11px] font-medium text-gray-500">
                Transportation Permit System
              </p>
            </div>


            {/* TITLE */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#12372A]/10 border border-[#12372A]/20 px-3 py-1 text-[11px] font-bold text-[#12372A] mb-3">
                <ShieldCheck size={14} className="text-[#12372A]" />
                <span>Portal Khusus Administrator</span>
              </div>

              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Administrator Sign In
              </h1>

              <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                Masuk dengan akun Administrator untuk mengelola seluruh otorisasi perizinan dan armada transportasi.
              </p>
            </div>


            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* USERNAME */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Username
                </label>

                <div className="relative">

                  <UserRound
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#12372A] focus:bg-white"
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-12 text-sm outline-none transition focus:border-[#12372A] focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >

                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}

                  </button>

                </div>

              </div>





              {/* REMEMBER */}

              <div className="flex items-center justify-between">

                <label className="flex items-center gap-2 text-sm text-gray-500">

                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 accent-[#12372A]"
                  />

                  Remember me

                </label>


                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true)
                    setResetMessage({ text: '', type: '' })
                  }}
                  className="text-sm font-medium text-[#12372A] hover:underline"
                >
                  Forgot password?
                </button>

              </div>


              {/* BUTTON */}

              <button
                type="submit"
                className="w-full rounded-xl bg-[#12372A] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d2b20] hover:shadow-md"
              >
                Sign In
              </button>

              {/* REGISTER LINK */}
              <div className="pt-2 text-center text-xs text-gray-500">
                Belum memiliki akun Administrator?{' '}
                <Link
                  to="/register"
                  className="font-bold text-[#12372A] hover:underline"
                >
                  Daftar Akun Baru
                </Link>
              </div>

            </form>


            {/* FOOTER */}

            <p className="mt-8 text-center text-xs text-gray-400">
              Authorized personnel only.
            </p>

          </div>

        </div>

      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00] shadow-xs">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                    Reset Kata Sandi Administrator
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Atur ulang sandi akun PT Besmindo Materi Sewatama
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* RESET FORM */}
            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              {resetMessage.text && (
                <div
                  className={`rounded-xl p-3 border text-xs leading-snug flex items-start gap-2 ${
                    resetMessage.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  {resetMessage.type === 'error' ? (
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                  )}
                  <span>{resetMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Username atau Email Administrator
                </label>
                <input
                  type="text"
                  value={resetForm.identifier}
                  onChange={(e) =>
                    setResetForm({ ...resetForm, identifier: e.target.value })
                  }
                  placeholder="Masukkan username atau email terdaftar"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 outline-none focus:border-[#12372A] focus:bg-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={resetForm.newPassword}
                  onChange={(e) =>
                    setResetForm({ ...resetForm, newPassword: e.target.value })
                  }
                  placeholder="Minimal 5 karakter"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 outline-none focus:border-[#12372A] focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={resetForm.confirmPassword}
                  onChange={(e) =>
                    setResetForm({ ...resetForm, confirmPassword: e.target.value })
                  }
                  placeholder="Ulangi kata sandi baru"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 outline-none focus:border-[#12372A] focus:bg-white text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#12372A] px-4 py-2 text-xs font-bold text-[#D8FF00] hover:bg-[#0d2b20] transition shadow-xs"
                >
                  <RotateCcw size={13} />
                  <span>Simpan Kata Sandi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}


function Feature({
  title,
  description,
}) {
  return (
    <div className="flex gap-3">

      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D8FF00]">

        <span className="h-1.5 w-1.5 rounded-full bg-[#12372A]" />

      </div>

      <div>

        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-xs text-white/40">
          {description}
        </p>

      </div>

    </div>
  )
}

export default Login