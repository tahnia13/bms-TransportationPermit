import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Car,
  Users,
  Route,
  Archive,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'

function Sidebar({
  isOpen,
  onClose,
  collapsed,
  onToggle,
}) {
  const menus = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Permit',
      path: '/permits',
      icon: FileText,
    },
    {
      name: 'Vehicles',
      path: '/vehicles',
      icon: Car,
    },
    {
      name: 'Drivers',
      path: '/drivers',
      icon: Users,
    },
    {
      name: 'Trips',
      path: '/trips',
      icon: Route,
    },
    {
      name: 'Digital Archive',
      path: '/archive',
      icon: Archive,
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: BarChart3,
    },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col
          bg-[#12372A] text-white
          transition-all duration-300 ease-in-out

          ${collapsed ? 'w-20' : 'w-72'}

          ${
            isOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
        `}
      >

        {/* ================= LOGO ================= */}
        <div
          className={`
            flex h-24 items-center border-b border-white/10
            ${
              collapsed
                ? 'justify-center px-3'
                : 'justify-between px-6'
            }
          `}
        >

          <div
            className={`
              flex items-center
              ${collapsed ? 'justify-center' : 'gap-3'}
            `}
          >

            {/* Logo */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
              <img
                src="/besmindo-emblem.png"
                alt="Besmindo Logo"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Nama */}
            {!collapsed && (
              <div>
                <h1 className="text-sm font-bold tracking-wide text-white">
                  BESMINDO
                </h1>
                <p className="text-xs text-white/60">
                  Materi Sewatama
                </p>
              </div>
            )}

          </div>


          {/* Mobile Close */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>

        </div>


        {/* ================= TOGGLE ================= */}
        <button
          onClick={onToggle}
          className="
            absolute -right-3 top-20
            hidden h-7 w-7 items-center justify-center
            rounded-full
            border border-gray-200
            bg-white
            text-gray-600
            shadow-md
            transition
            hover:bg-gray-50
            lg:flex
          "
          title={
            collapsed
              ? 'Buka sidebar'
              : 'Tutup sidebar'
          }
        >

          {collapsed ? (
            <ChevronRight size={15} />
          ) : (
            <ChevronLeft size={15} />
          )}

        </button>


        {/* ================= MENU ================= */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">

          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
              Main Menu
            </p>
          )}


          <div className="space-y-1">

            {menus.map((menu) => {

              const Icon = menu.icon

              return (
                <NavLink
                  key={menu.path}
                  to={menu.path}
                  end={menu.path === '/'}
                  onClick={onClose}
                  title={collapsed ? menu.name : ''}
                  className={({ isActive }) => `
                    group flex items-center rounded-xl
                    py-3 text-sm font-medium
                    transition-all duration-200

                    ${
                      collapsed
                        ? 'justify-center px-0'
                        : 'gap-3 px-3'
                    }

                    ${
                      isActive
                        ? 'bg-[#D7FF3F] text-[#12372A]'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >

                  {({ isActive }) => (
                    <>
                      <Icon
                        size={20}
                        strokeWidth={
                          isActive ? 2.5 : 2
                        }
                        className="shrink-0"
                      />

                      {!collapsed && (
                        <span>
                          {menu.name}
                        </span>
                      )}
                    </>
                  )}

                </NavLink>
              )

            })}

          </div>

        </nav>


        {/* ================= BOTTOM ================= */}
        <div className="border-t border-white/10 p-3">

          {/* Settings */}
          <NavLink
            to="/settings"
            title={collapsed ? 'Settings' : ''}
            className={({ isActive }) => `
              flex items-center rounded-xl
              py-3 text-sm font-medium
              transition

              ${
                collapsed
                  ? 'justify-center px-0'
                  : 'gap-3 px-3'
              }

              ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              }
            `}
          >

            <Settings
              size={20}
              className="shrink-0"
            />

            {!collapsed && (
              <span>
                Settings
              </span>
            )}

          </NavLink>


          {/* Logout */}
          <button
            title={collapsed ? 'Logout' : ''}
            className={`
              mt-1 flex w-full items-center rounded-xl
              py-3 text-sm font-medium
              text-white/50 transition
              hover:bg-red-500/10 hover:text-red-300

              ${
                collapsed
                  ? 'justify-center px-0'
                  : 'gap-3 px-3'
              }
            `}
          >

            <LogOut
              size={20}
              className="shrink-0"
            />

            {!collapsed && (
              <span>
                Logout
              </span>
            )}

          </button>


          {/* User */}
          <div
            className={`
              mt-4 flex items-center rounded-xl bg-white/5

              ${
                collapsed
                  ? 'justify-center p-2'
                  : 'gap-3 p-3'
              }
            `}
          >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D7FF3F] text-sm font-bold text-[#12372A]">
              AD
            </div>

            {!collapsed && (
              <div className="min-w-0">

                <p className="truncate text-sm font-semibold">
                  Admin Transportation
                </p>

                <p className="truncate text-xs text-white/40">
                  Transportation Dept.
                </p>

              </div>
            )}

          </div>

        </div>

      </aside>
    </>
  )
}

export default Sidebar