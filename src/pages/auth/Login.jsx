import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  ShieldCheck,
} from 'lucide-react'

function Login() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Transportation Admin',
  })

  const [error, setError] = useState('')

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

    if (!formData.username || !formData.password) {
      setError('Username dan password wajib diisi.')
      return
    }

    // Simpan user sementara di localStorage
    const user = {
      username: formData.username,
      role: formData.role,
    }

    localStorage.setItem(
      'transportation_user',
      JSON.stringify(user)
    )

    navigate('/')
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

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D8FF00] text-[#12372A]">

                <span className="text-xl font-black">
                  B
                </span>

              </div>

              <div>

                <h1 className="text-lg font-bold text-white">
                  BESMINDO
                </h1>

                <p className="text-xs text-white/40">
                  Materi Sewatama
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
                  Permit System
                </span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-6 text-white/50">
                Digital transportation permit and fleet management
                system for efficient operational activities.
              </p>


              <div className="mt-8 space-y-4">

                <Feature
                  title="Permit Management"
                  description="Manage transportation permits digitally."
                />

                <Feature
                  title="Fleet Management"
                  description="Monitor vehicles and drivers."
                />

                <Feature
                  title="Digital Archive"
                  description="Store transportation documents securely."
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

            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#12372A] text-[#D8FF00]">

                <span className="text-lg font-black">
                  B
                </span>

              </div>

              <div>

                <h1 className="text-base font-bold text-gray-800">
                  BESMINDO
                </h1>

                <p className="text-[10px] text-gray-400">
                  Transportation System
                </p>

              </div>

            </div>


            {/* TITLE */}

            <div className="mb-8">

              <h1 className="text-2xl font-bold text-gray-800">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Sign in to access Transportation Permit System.
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


              {/* ROLE */}

              <div>

                <label className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Hak Akses & Peran (Role)
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-4 py-3.5 text-sm outline-none transition focus:border-[#12372A] focus:bg-white font-medium"
                >

                  <option value="Transportation Admin">
                    Transportation Admin (Otorisator & Full Control)
                  </option>

                  <option value="Transportation Staff">
                    Transportation Staff (Operasional & Pengajuan Izin)
                  </option>

                </select>

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

            </form>


            {/* FOOTER */}

            <p className="mt-8 text-center text-xs text-gray-400">
              Authorized personnel only.
            </p>

          </div>

        </div>

      </div>

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