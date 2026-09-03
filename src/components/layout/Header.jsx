import {
  Menu,
  Bell,
  ChevronDown,
} from 'lucide-react'

function Header({ onMenuClick }) {
  return (
    <header
      className="
        sticky
        top-0
        z-20
        h-20
        border-b
        border-gray-100
        bg-white/95
        backdrop-blur
      "
    >
      <div
        className="
          flex
          h-full
          items-center
          justify-between
          px-4
          sm:px-6
          lg:px-8
        "
      >

        {/* LEFT */}

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={onMenuClick}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-gray-100
              text-gray-500
              lg:hidden
            "
          >
            <Menu size={20} />
          </button>


          <div className="hidden sm:block">

            <p
              className="
                text-[11px]
                font-medium
                uppercase
                tracking-wider
                text-gray-400
              "
            >
              Transportation Department
            </p>

            <p
              className="
                mt-0.5
                text-sm
                font-semibold
                text-gray-700
              "
            >
              Permit Management System
            </p>

          </div>

        </div>


        {/* RIGHT */}

        <div className="flex items-center gap-3">

          {/* NOTIFICATION */}

          <button
            type="button"
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-gray-400
              hover:bg-gray-50
            "
          >

            <Bell size={19} />

            <span
              className="
                absolute
                right-2.5
                top-2
                h-1.5
                w-1.5
                rounded-full
                bg-red-500
              "
            />

          </button>


          {/* USER */}

          <button
            type="button"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-2
              py-1.5
              hover:bg-gray-50
            "
          >

            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-[#12372A]
                text-xs
                font-bold
                text-[#D8FF00]
              "
            >
              AD
            </div>


            <div className="hidden text-left md:block">

              <p
                className="
                  text-xs
                  font-semibold
                  text-gray-700
                "
              >
                Admin
              </p>

              <p
                className="
                  text-[10px]
                  text-gray-400
                "
              >
                Transportation
              </p>

            </div>


            <ChevronDown
              size={15}
              className="
                hidden
                text-gray-400
                md:block
              "
            />

          </button>

        </div>

      </div>
    </header>
  )
}

export default Header