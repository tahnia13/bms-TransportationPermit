import React from "react";

export default function DrivingPermitCardView({
  driverName = "JEFRINALDO",
  position = "OPR - FOCO",
  licenseNo = "09279809000042",
  licenseExpiryYear = "2026",
  permitNumber = "BMSD/1000/PERMIT/03/26",
  licenseCategory = "BII.U",
  ddcTrainingDate = "12 - 03 - 2026",
  permitExpiryDate = "31 - 03 - 2027",
  equipmentType = "FOCO / BUS / LV / 4 X 4",
  photoUrl = "/default-driver-photo.png",
  hseSignatureUrl = null,  // base64 TTD HSE & ISO Jr.Manager (dari localStorage / SignaturePad)
  opsSignatureUrl = null,  // base64 TTD Ops. Manager (dari localStorage / SignaturePad)
  viewSide = "both", // 'both' | 'front' | 'back'
  layout = "stack", // 'stack' | 'row'
}) {
  const logoSrc = `${window.location.origin}/besmindo-emblem.png`;

  return (
    <div
      className={`flex items-center justify-center ${
        layout === "row" ? "flex-row gap-6 flex-wrap" : "flex-col gap-6"
      }`}
    >
      {/* =========================================================
          FRONT CARD (HALAMAN DEPAN)
      ========================================================= */}
      {(viewSide === "both" || viewSide === "front") && (
        <div
          className="permit-card-front relative flex flex-col justify-between overflow-hidden rounded-[18px] border-2 border-black text-black font-sans select-none shadow-2xl"
          style={{
            width: "320px",
            height: "490px",
            backgroundColor: "#9ec127",
            boxSizing: "border-box",
            padding: "8px",
          }}
        >
          {/* Inner border frame matching exact photo border */}
          <div
            className="relative flex h-full w-full flex-col justify-between rounded-[12px] border border-black/80"
            style={{ padding: "8px 10px 6px 10px" }}
          >
            {/* 1. HEADER: EMBLEM + COMPANY NAME + DRIVING PERMIT */}
            <div className="flex flex-col items-center text-center">
              {/* White box with emblem */}
              <div className="flex h-11 w-24 items-center justify-center rounded-xs border border-black bg-white p-1 shadow-2xs">
                <img
                  src={logoSrc}
                  alt="PT Besmindo Emblem"
                  className="h-full w-full object-contain"
                />
              </div>

              {/* Company Title */}
              <div className="mt-1">
                <h2 className="text-[13px] font-bold tracking-tight leading-tight text-black uppercase">
                  PT.BESMINDO MATERI
                </h2>
                <h2 className="text-[13px] font-bold tracking-tight leading-tight text-black uppercase">
                  SEWATAMA
                </h2>
              </div>

              {/* Title DRIVING PERMIT */}
              <h1 className="mt-1 text-[18px] font-black tracking-wider text-black uppercase leading-none">
                DRIVING PERMIT
              </h1>
            </div>

            {/* 2. YELLOW DATA GRID WITH BLACK BORDERS */}
            <div className="mt-1.5 overflow-hidden rounded-xs border-2 border-black bg-[#fed826] shadow-2xs">
              <table className="w-full border-collapse text-left text-[11px] font-bold text-black">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="w-[30%] py-1 pl-2 font-bold border-r border-black">
                      Nama
                    </td>
                    <td className="w-[8%] py-1 text-center font-bold border-r border-black">
                      :
                    </td>
                    <td className="w-[62%] py-1 pl-2 font-black uppercase truncate max-w-[160px]">
                      {driverName}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="py-1 pl-2 font-bold border-r border-black">
                      Jabatan
                    </td>
                    <td className="py-1 text-center font-bold border-r border-black">
                      :
                    </td>
                    <td className="py-1 pl-2 font-black uppercase truncate max-w-[160px]">
                      {position}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="py-1 pl-2 font-bold border-r border-black">
                      SIM No - Exp
                    </td>
                    <td className="py-1 text-center font-bold border-r border-black">
                      :
                    </td>
                    <td className="py-1 pl-2 font-black font-mono">
                      {licenseNo} - {licenseExpiryYear}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pl-2 font-bold border-r border-black">
                      Permit No
                    </td>
                    <td className="py-1 text-center font-bold border-r border-black">
                      :
                    </td>
                    <td className="py-1 pl-2 font-black font-mono uppercase truncate max-w-[160px]">
                      {permitNumber}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. MIDDLE SECTION: PHOTO + BOLD LICENSE CLASS + TRAINING DATES */}
            <div className="flex items-stretch gap-2.5 my-1.5">
              {/* Driver Photo */}
              <div className="relative h-[130px] w-[105px] shrink-0 overflow-hidden rounded-xs border-2 border-black bg-slate-200 shadow-2xs">
                {photoUrl && photoUrl !== "/default-driver-photo.png" ? (
                  <img
                    src={photoUrl}
                    alt={driverName}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-sky-200 text-slate-700 p-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#12372A] text-[#D8FF00] font-black text-lg shadow-xs">
                      {driverName ? driverName.charAt(0).toUpperCase() : "D"}
                    </div>
                    <span className="mt-1 text-[9px] font-black uppercase leading-tight truncate w-full">
                      {driverName}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Side: License Badge & Date Strips */}
              <div className="flex flex-1 flex-col justify-between">
                {/* Big Bold License Class */}
                <div className="flex items-center justify-center flex-1">
                  <span
                    className="font-black text-black tracking-tight leading-none"
                    style={{ fontSize: "50px", letterSpacing: "1px" }}
                  >
                    {licenseCategory}
                  </span>
                </div>

                {/* DDC Training Yellow Strip */}
                <div className="rounded-xs border border-black/80 bg-[#fed826] py-1 px-1 text-center font-bold text-[10px] shadow-2xs">
                  <span>DDC Training : {ddcTrainingDate}</span>
                </div>

                {/* Expired Date Yellow Strip */}
                <div className="mt-1 rounded-xs border border-black/80 bg-[#fed826] py-1 px-1 text-center font-bold text-[10px] shadow-2xs">
                  <span>Expired Date : {permitExpiryDate}</span>
                </div>
              </div>
            </div>

            {/* 4. SIGNATURE SECTION */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-black/20 text-center">
              {/* Approved by (HSE & ISO Jr.Manager) */}
              <div className="flex flex-col items-center justify-between">
                <span className="text-[10px] font-bold text-black">
                  Approved by
                </span>
                <div className="h-10 w-24 flex items-center justify-center my-0.5 relative">
                  {hseSignatureUrl ? (
                    /* TTD nyata dari SignaturePad */
                    <img
                      src={hseSignatureUrl}
                      alt="TTD HSE"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    /* SVG placeholder default */
                    <svg
                      viewBox="0 0 120 40"
                      className="h-full w-full text-black stroke-current fill-none"
                      style={{ strokeWidth: 2.2, strokeLinecap: "round" }}
                    >
                      <path d="M 12 28 Q 28 6, 40 25 T 62 12 Q 80 28, 108 16" />
                      <path d="M 28 10 Q 32 38, 38 12" />
                      <path d="M 44 8 Q 48 36, 52 14" />
                      <path d="M 18 30 L 88 28" />
                    </svg>
                  )}
                </div>
                <div className="w-full rounded-xs border border-black bg-[#fed826] py-0.5 text-[9.5px] font-black text-black leading-tight text-center px-0.5">
                  HSE & ISO Jr.Manager
                </div>
              </div>

              {/* Acknowledged by (Ops. Manager) */}
              <div className="flex flex-col items-center justify-between">
                <span className="text-[10px] font-bold text-black">
                  Acknowledged by
                </span>
                <div className="h-10 w-24 flex items-center justify-center my-0.5 relative">
                  {opsSignatureUrl ? (
                    /* TTD nyata dari SignaturePad */
                    <img
                      src={opsSignatureUrl}
                      alt="TTD Ops. Manager"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    /* SVG placeholder default */
                    <svg
                      viewBox="0 0 120 40"
                      className="h-full w-full text-[#082a54] stroke-current fill-none"
                      style={{ strokeWidth: 2.4, strokeLinecap: "round" }}
                    >
                      <path d="M 18 36 L 42 12 L 64 32 L 86 10 L 98 22" />
                      <path d="M 35 24 L 75 22" />
                      <path d="M 96 12 Q 106 20, 112 30" />
                    </svg>
                  )}
                </div>
                <div className="w-full rounded-xs border border-black bg-[#fed826] py-0.5 text-[9.5px] font-black text-black">
                  Ops. Manager
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          BACK CARD (HALAMAN BELAKANG)
      ========================================================= */}
      {(viewSide === "both" || viewSide === "back") && (
        <div
          className="permit-card-back relative flex flex-col justify-between overflow-hidden rounded-[18px] border-2 border-black text-black font-sans select-none shadow-2xl"
          style={{
            width: "320px",
            height: "490px",
            backgroundColor: "#9ec127",
            boxSizing: "border-box",
            padding: "8px",
          }}
        >
          {/* Inner border frame matching exact photo border */}
          <div
            className="relative flex h-full w-full flex-col justify-between rounded-[12px] border border-black/80"
            style={{ padding: "14px 10px 10px 10px" }}
          >
            {/* 1. TOP PLEDGE HEADER BOX */}
            <div className="rounded-xs border-2 border-black bg-[#fed826] py-2 px-2 text-center shadow-2xs">
              <h2 className="text-[13px] font-black tracking-wider text-black uppercase">
                IKRAR PENGEMUDI SELAMAT
              </h2>
            </div>

            {/* 2. MAIN SAFETY PLEDGE TEXT BOX */}
            <div className="my-auto rounded-xs border-2 border-black bg-[#fed826] p-4 text-center shadow-2xs flex items-center justify-center">
              <p
                className="font-black text-black tracking-wide uppercase leading-relaxed"
                style={{ fontSize: "14px", lineHeight: "1.55" }}
              >
                SAYA ADALAH PENGEMUDI
                <br />
                YANG MENGUTAMAKAN
                <br />
                KESELAMATAN SERTA SOPAN
                <br />
                SANTUN DALAM BERLALU
                <br />
                LINTAS DAN SELALU
                <br />
                MENERAPKAN SMITH SYSTEM
              </p>
            </div>

            {/* 3. DIVIDER LINE & BOTTOM EQUIPMENT TYPE */}
            <div className="w-full">
              {/* Solid black horizontal divider line matching photo */}
              <div className="w-full border-b-2 border-black mb-2" />

              {/* Equipment Type Title on Green Background */}
              <div className="text-center">
                <h3 className="text-[17px] font-black tracking-wide text-black leading-tight">
                  Equipment Type
                </h3>
              </div>

              {/* Equipment Type Value on Green Background */}
              <div className="text-center mt-2 pb-1">
                <p className="text-[13px] font-black tracking-wider text-black uppercase">
                  {equipmentType}
                </p>
              </div>

              {/* Subtle bottom tab accent matching photo */}
              <div className="flex justify-center mt-1">
                <div className="h-1.5 w-16 rounded-full bg-[#fed826]/80" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
