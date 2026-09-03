function Navbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-20 border-b border-gray-200 bg-white">

      <div className="flex h-full items-center justify-between px-8">

        {/* Left */}
        <div>
          <p className="text-sm text-gray-400">
            Transportation Department
          </p>

          <h2 className="text-lg font-semibold text-[#12372A]">
            Permit Management System
          </h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">

          {/* Notification */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
            🔔

            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#D7FF3F]" />
          </button>

          {/* User */}
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#12372A] font-semibold text-[#D7FF3F]">
              A
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">
                Admin
              </p>

              <p className="text-xs text-gray-400">
                Transportation
              </p>
            </div>

          </div>

        </div>

      </div>

    </header>
  )
}

export default Navbar