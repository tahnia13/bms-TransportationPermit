import { Link, useLocation } from 'react-router-dom'

import {
  LayoutDashboard,
  FileText,
  Car,
  UserRound,
  MapPin,
  FolderOpen,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'


function Sidebar({ collapsed, setCollapsed }) {

  const location = useLocation()


  /*
  |--------------------------------------------------------------------------
  | MENU
  |--------------------------------------------------------------------------
  */

  const menuItems = [

    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },

    {
      name: 'Permit Management',
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
      icon: UserRound,
    },

    {
      name: 'Trips',
      path: '/trips',
      icon: MapPin,
    },

    {
      name: 'Digital Archive',
      path: '/archive',
      icon: FolderOpen,
    },

    {
      name: 'Reports',
      path: '/reports',
      icon: BarChart3,
    },

  ]


  /*
  |--------------------------------------------------------------------------
  | CHECK ACTIVE MENU
  |--------------------------------------------------------------------------
  */

  const isActive = (path) => {

    if (path === '/') {

      return location.pathname === '/'

    }


    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    )

  }


  return (

    <aside
      className={`
        fixed
        left-0
        top-0
        z-50
        flex
        h-screen
        flex-col
        bg-[#0F3D2E]
        text-white
        transition-all
        duration-300
        ${collapsed ? 'w-[82px]' : 'w-[308px]'}
      `}
    >


      {/* =====================================================
          LOGO
      ====================================================== */}

      <div
        className={`
          flex
          h-[96px]
          shrink-0
          items-center
          border-b
          border-white/10
          ${
            collapsed
              ? 'justify-center'
              : 'px-6'
          }
        `}
      >


        {/* LOGO BOX */}

        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#C6FF00]
            text-xl
            font-black
            text-[#0F3D2E]
          "
        >
          B
        </div>


        {/* LOGO TEXT */}

        {!collapsed && (

          <div className="ml-4">

            <h1
              className="
                text-base
                font-bold
                tracking-wide
              "
            >
              BESMINDO
            </h1>


            <p
              className="
                mt-0.5
                text-xs
                text-white/60
              "
            >
              Transportation System
            </p>

          </div>

        )}

      </div>


      {/* =====================================================
          COLLAPSE BUTTON
      ====================================================== */}

      <button
        type="button"
        onClick={() =>
          setCollapsed(!collapsed)
        }
        className="
          absolute
          -right-4
          top-[106px]
          z-50
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-full
          border
          border-gray-200
          bg-white
          text-gray-600
          shadow-md
          transition
          hover:bg-gray-50
        "
      >

        {collapsed ? (

          <ChevronRight size={17} />

        ) : (

          <ChevronLeft size={17} />

        )}

      </button>


      {/* =====================================================
          MENU
      ====================================================== */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-3
          py-7
        "
      >


        {/* MAIN MENU */}

        {!collapsed && (

          <p
            className="
              mb-4
              px-4
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.15em]
              text-white/40
            "
          >
            Main Menu
          </p>

        )}


        <nav className="space-y-2">

          {menuItems.map((item) => {

            const Icon = item.icon

            const active =
              isActive(item.path)


            return (

              <Link
                key={item.path}
                to={item.path}
                title={
                  collapsed
                    ? item.name
                    : ''
                }
                className={`
                  group
                  relative
                  flex
                  h-12
                  items-center
                  rounded-xl
                  transition-all
                  duration-200

                  ${
                    collapsed
                      ? 'justify-center'
                      : 'px-4'
                  }

                  ${
                    active
                      ? 'bg-[#C6FF00] text-[#0F3D2E] shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }
                `}
              >


                {/* ACTIVE INDICATOR */}

                {active && (

                  <span
                    className="
                      absolute
                      -left-3
                      top-1/2
                      h-7
                      w-1
                      -translate-y-1/2
                      rounded-r-full
                      bg-[#C6FF00]
                    "
                  />

                )}


                {/* ICON */}

                <Icon
                  size={21}
                  strokeWidth={1.8}
                  className={`
                    shrink-0
                    ${
                      active
                        ? 'text-[#0F3D2E]'
                        : 'text-white/80'
                    }
                  `}
                />


                {/* TEXT */}

                {!collapsed && (

                  <span
                    className="
                      ml-4
                      whitespace-nowrap
                      text-sm
                      font-semibold
                    "
                  >
                    {item.name}
                  </span>

                )}

              </Link>

            )

          })}

        </nav>


        {/* =================================================
            SYSTEM
        ================================================== */}

        <div className="mt-10">

          {!collapsed && (

            <p
              className="
                mb-4
                px-4
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.15em]
                text-white/40
              "
            >
              System
            </p>

          )}


          <Link
            to="/settings"
            title={
              collapsed
                ? 'Settings'
                : ''
            }
            className={`
              flex
              h-12
              items-center
              rounded-xl
              text-white/80
              transition
              hover:bg-white/10
              hover:text-white

              ${
                collapsed
                  ? 'justify-center'
                  : 'px-4'
              }
            `}
          >

            <Settings
              size={21}
              strokeWidth={1.8}
            />


            {!collapsed && (

              <span
                className="
                  ml-4
                  text-sm
                  font-semibold
                "
              >
                Settings
              </span>

            )}

          </Link>

        </div>

      </div>


      {/* =====================================================
          USER
      ====================================================== */}

      <div
        className="
          shrink-0
          border-t
          border-white/10
          p-3
        "
      >


        <div
          className={`
            flex
            items-center
            rounded-xl
            bg-white/5

            ${
              collapsed
                ? 'justify-center p-3'
                : 'px-3 py-3'
            }
          `}
        >


          {/* AVATAR */}

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#C6FF00]
              text-[#0F3D2E]
            "
          >

            <UserRound size={19} />

          </div>


          {/* USER TEXT */}

          {!collapsed && (

            <div
              className="
                ml-3
                min-w-0
              "
            >

              <p
                className="
                  truncate
                  text-sm
                  font-bold
                "
              >
                Transportation Admin
              </p>


              <p
                className="
                  mt-0.5
                  text-[11px]
                  text-white/50
                "
              >
                Administrator
              </p>

            </div>

          )}

        </div>


        {/* LOGOUT */}

        <button
          type="button"
          onClick={() => {

            localStorage.removeItem(
              'isAuthenticated'
            )

            window.location.href =
              '/login'

          }}
          title={
            collapsed
              ? 'Logout'
              : ''
          }
          className={`
            mt-2
            flex
            h-11
            w-full
            items-center
            rounded-xl
            text-white/60
            transition
            hover:bg-red-500/10
            hover:text-red-300

            ${
              collapsed
                ? 'justify-center'
                : 'px-4'
            }
          `}
        >

          <LogOut
            size={20}
            strokeWidth={1.8}
          />


          {!collapsed && (

            <span
              className="
                ml-4
                text-sm
                font-medium
              "
            >
              Logout
            </span>

          )}

        </button>

      </div>

    </aside>

  )

}


export default Sidebar