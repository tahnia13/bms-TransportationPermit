import { useState, useMemo, useRef, useEffect } from "react";
import {
  Printer,
  X,
  Camera,
  Trash2,
  FileBadge,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import DrivingPermitCardView from "./DrivingPermitCardView";
import { api } from "../services/api";
import { compressImageFile } from "../utils/imageCompressor";

export default function DrivingPermitCardModal({
  isOpen,
  onClose,
  permit,
  drivers = [],
  vehicles = [],
}) {
  if (!isOpen || !permit) return null;

  // Ambil TTD dari localStorage (tersimpan via SignaturePad di PermitCreate)
  const hseSignatureUrl = localStorage.getItem("permit_hse_signature") || null;
  const opsSignatureUrl = localStorage.getItem("permit_ops_signature") || null;

  // Find linked driver info if available
  const driverData = useMemo(() => {
    if (!permit.driver) return null;
    return (
      drivers.find(
        (d) =>
          d.name?.toLowerCase().trim() === permit.driver?.toLowerCase().trim() ||
          d.id === permit.driver_id
      ) || null
    );
  }, [permit, drivers]);

  const getInitialPhoto = (p) => {
    if (p?.driver_photo && p.driver_photo !== "/default-driver-photo.png" && String(p.driver_photo).trim() !== "") {
      return p.driver_photo;
    }
    return "/default-driver-photo.png";
  };

  const formatDateCard = (val, fallback = "-") => {
    if (!val) return fallback;
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  // Form editable states for card customization
  const [driverName, setDriverName] = useState(
    permit.driver || driverData?.name || "JEFRINALDO"
  );
  const [position, setPosition] = useState(
    permit.position || driverData?.position || "OPR - FOCO"
  );
  const [licenseNo, setLicenseNo] = useState(
    permit.license_number || driverData?.license_number || "09279809000042"
  );
  const [licenseExpiryYear, setLicenseExpiryYear] = useState(() => {
    if (permit.license_expiry_year) return String(permit.license_expiry_year);
    if (driverData?.expiry_date) {
      return String(new Date(driverData.expiry_date).getFullYear());
    }
    return "2026";
  });
  const [permitNumber, setPermitNumber] = useState(
    permit.permit_number || "BMSD/1000/PERMIT/03/26"
  );
  const [licenseCategory, setLicenseCategory] = useState(() => {
    const raw = (permit.license_type || driverData?.license_type || "BII.U").toUpperCase();
    if (raw.includes("B2") || raw.includes("BII")) return "BII.U";
    if (raw.includes("B1") || raw.includes("BI")) return "BI.U";
    if (raw.includes("A")) return "A";
    if (raw.includes("C")) return "C";
    return raw || "BII.U";
  });

  const [ddcTrainingDate, setDdcTrainingDate] = useState(
    formatDateCard(permit.ddc_training_date || driverData?.training_date || permit.start_date, "12 - 03 - 2026")
  );
  const [permitExpiryDate, setPermitExpiryDate] = useState(
    formatDateCard(permit.end_date, "31 - 03 - 2027")
  );
  const [equipmentType, setEquipmentType] = useState(
    permit.equipment_type || "FOCO / BUS / LV / 4 X 4"
  );

  // Photo state (khusus per permit, fallback ke default avatar inisial)
  const [photoUrl, setPhotoUrl] = useState(() => getInitialPhoto(permit));
  const fileInputRef = useRef(null);

  // Sinkronisasi state ketika data permit atau driverData berubah/di-load
  useEffect(() => {
    if (!permit) return;
    setDriverName(permit.driver || driverData?.name || "JEFRINALDO");
    setPosition(permit.position || driverData?.position || "OPR - FOCO");
    setLicenseNo(permit.license_number || driverData?.license_number || "09279809000042");

    if (permit.license_expiry_year) {
      setLicenseExpiryYear(String(permit.license_expiry_year));
    } else if (driverData?.expiry_date) {
      setLicenseExpiryYear(String(new Date(driverData.expiry_date).getFullYear()));
    } else {
      setLicenseExpiryYear("2026");
    }

    setPermitNumber(permit.permit_number || "BMSD/1000/PERMIT/03/26");

    const raw = (permit.license_type || driverData?.license_type || "BII.U").toUpperCase();
    if (raw.includes("B2") || raw.includes("BII")) setLicenseCategory("BII.U");
    else if (raw.includes("B1") || raw.includes("BI")) setLicenseCategory("BI.U");
    else if (raw.includes("A")) setLicenseCategory("A");
    else if (raw.includes("C")) setLicenseCategory("C");
    else setLicenseCategory(raw || "BII.U");

    setDdcTrainingDate(
      formatDateCard(permit.ddc_training_date || driverData?.training_date || permit.start_date, "12 - 03 - 2026")
    );
    setPermitExpiryDate(formatDateCard(permit.end_date, "31 - 03 - 2027"));
    setEquipmentType(permit.equipment_type || "FOCO / BUS / LV / 4 X 4");

    const resolved = getInitialPhoto(permit);
    setPhotoUrl(resolved);
  }, [permit, driverData]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 480, 600, 0.85);
        setPhotoUrl(compressed);

        // Simpan foto baru hanya ke permit yang bersangkutan
        if (permit?.id) {
          await api.updatePermit(permit.id, {
            ...permit,
            driver_photo: compressed,
          });
          permit.driver_photo = compressed;
        }
      } catch (err) {
        console.warn("Could not auto-save updated photo:", err);
      }
    }
  };

  const handleRemovePhoto = async () => {
    const defaultVal = "/default-driver-photo.png";
    setPhotoUrl(defaultVal);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (permit?.id) {
      try {
        await api.updatePermit(permit.id, {
          ...permit,
          driver_photo: defaultVal,
        });
        permit.driver_photo = defaultVal;
      } catch (err) {
        console.warn("Could not remove photo:", err);
      }
    }
  };

  // View & editor states
  const [viewSide, setViewSide] = useState("both"); // 'both' | 'front' | 'back'
  const [printLayout, setPrintLayout] = useState("single_sheet"); // 'single_sheet' | 'two_pages'
  const [showEditor, setShowEditor] = useState(false);

  // Reset to original permit values
  const handleReset = () => {
    setDriverName(permit.driver || driverData?.name || "JEFRINALDO");
    setPosition(permit.position || driverData?.position || "OPR - FOCO");
    setLicenseNo(permit.license_number || driverData?.license_number || "09279809000042");
    setPermitNumber(permit.permit_number || "BMSD/1000/PERMIT/03/26");
    setLicenseCategory("BII.U");
    setDdcTrainingDate(
      formatDateCard(permit.ddc_training_date || driverData?.training_date || permit.start_date, "12 - 03 - 2026")
    );
    setPermitExpiryDate(formatDateCard(permit.end_date, "31 - 03 - 2027"));
    setEquipmentType(permit.equipment_type || "FOCO / BUS / LV / 4 X 4");
    setPhotoUrl(getInitialPhoto(permit, driverData));
  };

  // =========================================================
  // GUARANTEED PRINT ENGINE:
  // Creates a clean, isolated document in a hidden iframe
  // with complete styles, full color support, and SVG signatures.
  // =========================================================
  const handlePrint = () => {
    const frontCard = document.querySelector(".permit-card-front");
    const backCard = document.querySelector(".permit-card-back");

    let cardHtml = "";
    if (viewSide === "both") {
      if (printLayout === "two_pages") {
        cardHtml = `
          <div class="card-page">
            <div class="guide-note">
              <span class="guide-badge">HALAMAN 1 &bull; SISI DEPAN (FRONT)</span>
              <span class="guide-desc">✂️ Ukuran ID Card Standar: 54 &times; 85.6 mm</span>
            </div>
            <div class="card-single-wrap">
              <div class="card-scale-box">
                ${frontCard ? frontCard.outerHTML : ""}
              </div>
            </div>
          </div>
          <div class="page-break"></div>
          <div class="card-page">
            <div class="guide-note">
              <span class="guide-badge">HALAMAN 2 &bull; SISI BELAKANG (BACK)</span>
              <span class="guide-desc">✂️ Ukuran ID Card Standar: 54 &times; 85.6 mm</span>
            </div>
            <div class="card-single-wrap">
              <div class="card-scale-box">
                ${backCard ? backCard.outerHTML : ""}
              </div>
            </div>
          </div>
        `;
      } else {
        // DEFAULT: 1 Lembar A4 Dua Sisi Berdampingan dengan Jarak Sedikit (Sesuai Foto 1)
        cardHtml = `
          <div class="card-sheet">
            <div class="guide-note">
              <span class="guide-badge">KARTU DRIVING PERMIT &bull; STANDAR RESMI ID-1 / CR80</span>
              <span class="guide-desc">
                ✂️ Ukuran Fisik Standar ID Card: 54 &times; 85.6 mm &bull; Sisi Depan (Kiri) &amp; Sisi Belakang (Kanan)
              </span>
            </div>
            <div class="foldable-card-pair">
              <div class="card-scale-box">
                ${frontCard ? frontCard.outerHTML : ""}
              </div>
              <div class="card-scale-box">
                ${backCard ? backCard.outerHTML : ""}
              </div>
            </div>
          </div>
        `;
      }
    } else if (viewSide === "front") {
      cardHtml = `
        <div class="card-page">
          <div class="guide-note">
            <span class="guide-badge">SISI DEPAN (FRONT ONLY)</span>
            <span class="guide-desc">✂️ Ukuran ID Card Standar: 54 &times; 85.6 mm</span>
          </div>
          <div class="card-single-wrap">
            <div class="card-scale-box">
              ${frontCard ? frontCard.outerHTML : ""}
            </div>
          </div>
        </div>
      `;
    } else {
      cardHtml = `
        <div class="card-page">
          <div class="guide-note">
            <span class="guide-badge">SISI BELAKANG (BACK ONLY)</span>
            <span class="guide-desc">✂️ Ukuran ID Card Standar: 54 &times; 85.6 mm</span>
          </div>
          <div class="card-single-wrap">
            <div class="card-scale-box">
              ${backCard ? backCard.outerHTML : ""}
            </div>
          </div>
        </div>
      `;
    }

    // Create or reuse hidden printable iframe
    let iframe = document.getElementById("permit-card-print-frame");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "permit-card-print-frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>Driving Permit ID Card - ${driverName}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            *, *::before, *::after {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              -webkit-font-smoothing: antialiased;
            }
            .card-page, .card-sheet {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 80vh;
              width: 100%;
              page-break-inside: avoid;
              break-inside: avoid;
              padding: 10mm 0;
            }
            .page-break {
              page-break-after: always !important;
              break-after: page !important;
              height: 0;
            }

            /* Panduan & Guide Notes */
            .guide-note {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              margin-bottom: 6mm;
            }
            .guide-badge {
              display: inline-block;
              background-color: #12372A;
              color: #D8FF00;
              font-size: 8.5pt;
              font-weight: 800;
              padding: 2.5px 10px;
              border-radius: 4px;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
              text-transform: uppercase;
            }
            .guide-desc {
              font-size: 8pt;
              font-weight: 600;
              color: #475569;
              max-width: 140mm;
              line-height: 1.4;
            }
            .fold-guide-footer {
              display: flex;
              justify-content: center;
              margin-top: 5mm;
            }
            .fold-mark-center {
              display: inline-flex;
              align-items: center;
              font-size: 7.5pt;
              font-weight: 700;
              color: #475569;
              background-color: #f1f5f9;
              border: 1px dashed #94a3b8;
              padding: 2px 10px;
              border-radius: 4px;
            }

            /* Container Kartu Tunggal (Halaman Terpisah / Single Side) */
            .card-single-wrap {
              width: 54mm;
              height: 85.6mm;
              position: relative;
              margin: 0 auto;
              box-sizing: border-box;
            }

            /* Container Dua Kartu Berdampingan dengan Jarak Sedikit (Sesuai Foto 1) */
            .foldable-card-pair {
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              gap: 6mm;
              margin: 0 auto;
              position: relative;
              box-sizing: border-box;
            }

            /* Scaler Box per Sisi Kartu: Presisi Standar ID-1 (54mm x 85.6mm) */
            .card-scale-box {
              width: 54mm;
              height: 85.6mm;
              min-width: 54mm;
              max-width: 54mm;
              min-height: 85.6mm;
              max-height: 85.6mm;
              position: relative;
              overflow: hidden;
              box-sizing: border-box;
              flex-shrink: 0;
              margin: 0;
              padding: 0;
              border-radius: 3.2mm;
            }

            /* Elemen Kartu di Dalam Box yang di-Scale 0.6378 (Sudut Bulat Penuh & Border Hitam Utuh) */
            .card-scale-box .permit-card-front,
            .card-scale-box .permit-card-back {
              width: 320px !important;
              height: 507px !important;
              min-width: 320px !important;
              max-width: 320px !important;
              min-height: 507px !important;
              max-height: 507px !important;
              transform: scale(0.6378) !important;
              transform-origin: 0 0 !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              background-color: #9ec127 !important;
              border: 2px solid #000000 !important;
              border-radius: 18px !important;
              box-shadow: none !important;
              margin: 0 !important;
              overflow: hidden !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              box-sizing: border-box !important;
              padding: 8px !important;
            }

            .rounded-\\[18px\\] { border-radius: 18px !important; }
            .rounded-\\[12px\\] { border-radius: 12px !important; }
            .rounded-xs { border-radius: 2px !important; }
            .bg-\\[\\#fed826\\] { background-color: #fed826 !important; }
            .bg-\\[\\#fed826\\]\\/80 { background-color: rgba(254, 216, 38, 0.8) !important; }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            /* Tailwind helper classes */
            .relative { position: relative; }
            .absolute { position: absolute; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .flex-1 { flex: 1 1 0%; }
            .items-center { align-items: center; }
            .items-stretch { align-items: stretch; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .uppercase { text-transform: uppercase; }
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 900; }
            .font-mono { font-family: ui-monospace, monospace; }
            .gap-2 { gap: 0.5rem; }
            .gap-2\\.5 { gap: 0.625rem; }
            .gap-3 { gap: 0.75rem; }
            .gap-1 { gap: 0.25rem; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .w-full { width: 100%; }
            .h-full { height: 100%; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-md { border-radius: 0.375rem; }
            .rounded-full { border-radius: 9999px; }
            .rounded { border-radius: 0.25rem; }
            .border { border-width: 1px; }
            .border-2 { border-width: 2px; }
            .border-black { border-color: #000000; }
            .border-t { border-top-width: 1px; }
            .border-b { border-bottom-width: 1px; }
            .border-b-2 { border-bottom-width: 2px; }
            .border-r { border-right-width: 1px; }
            .border-l { border-left-width: 1px; }
            .border-black\\/80 { border-color: rgba(0, 0, 0, 0.8); }
            .border-black\\/40 { border-color: rgba(0, 0, 0, 0.4); }
            .border-black\\/30 { border-color: rgba(0, 0, 0, 0.3); }
            .border-black\\/20 { border-color: rgba(0, 0, 0, 0.2); }
            .bg-white { background-color: #ffffff; }
            .bg-\\[\\#ffd700\\] { background-color: #ffd700; }
            .bg-\\[\\#12372A\\] { background-color: #12372A; }
            .bg-slate-200 { background-color: #e2e8f0; }
            .text-black { color: #000000; }
            .text-white { color: #ffffff; }
            .text-\\[\\#D8FF00\\] { color: #D8FF00; }
            .text-\\[\\#082a54\\] { color: #082a54; }
            .p-1 { padding: 0.25rem; }
            .p-1\\.5 { padding: 0.375rem; }
            .p-2 { padding: 0.5rem; }
            .p-4 { padding: 1rem; }
            .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .px-0\\.5 { padding-left: 0.125rem; padding-right: 0.125rem; }
            .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
            .px-1\\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
            .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
            .pb-1 { padding-bottom: 0.25rem; }
            .pt-1 { padding-top: 0.25rem; }
            .pl-1 { padding-left: 0.25rem; }
            .pl-2 { padding-left: 0.5rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .my-0\\.5 { margin-top: 0.125rem; margin-bottom: 0.125rem; }
            .my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
            .my-1\\.5 { margin-top: 0.375rem; margin-bottom: 0.375rem; }
            .my-auto { margin-top: auto; margin-bottom: auto; }
            .mt-0\\.5 { margin-top: 0.125rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-1\\.5 { margin-top: 0.375rem; }
            .mt-2 { margin-top: 0.5rem; }
            .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
            .space-y-1\\.5 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.375rem; }
            .w-12 { width: 3rem; }
            .h-12 { height: 3rem; }
            .w-16 { width: 4rem; }
            .h-1\\.5 { height: 0.375rem; }
            .w-24 { width: 6rem; }
            .h-10 { height: 2.5rem; }
            .h-11 { height: 2.75rem; }
            .w-3 { width: 0.75rem; }
            .w-\\[30\\%\\] { width: 30%; }
            .w-\\[8\\%\\] { width: 8%; }
            .w-\\[62\\%\\] { width: 62%; }
            .max-w-\\[160px\\] { max-width: 160px; }
            .h-\\[130px\\] { height: 130px; }
            .h-\\[135px\\] { height: 135px; }
            .w-\\[105px\\] { width: 105px; }
            .shrink-0 { flex-shrink: 0; }
            .object-contain { object-fit: contain; }
            .object-cover { object-fit: cover; }
            .object-top { object-position: top; }
            .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .leading-none { line-height: 1; }
            .leading-tight { line-height: 1.25; }
            .leading-relaxed { line-height: 1.625; }
            .tracking-tight { letter-spacing: -0.025em; }
            .tracking-wide { letter-spacing: 0.025em; }
            .tracking-wider { letter-spacing: 0.05em; }
            .text-\\[9px\\] { font-size: 9px; }
            .text-\\[9\\.5px\\] { font-size: 9.5px; }
            .text-\\[10px\\] { font-size: 10px; }
            .text-\\[11px\\] { font-size: 11px; }
            .text-\\[13px\\] { font-size: 13px; }
            .text-\\[14px\\] { font-size: 14px; }
            .text-\\[15px\\] { font-size: 15px; }
            .text-\\[17px\\] { font-size: 17px; }
            .text-\\[18px\\] { font-size: 18px; }
            .text-lg { font-size: 1.125rem; }
            .stroke-current { stroke: currentColor; }
            .fill-none { fill: none; }
            .shadow-2xs { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
          </style>
        </head>
        <body>
          ${cardHtml}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 350);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  const logoSrc = `${window.location.origin}/besmindo-emblem.png`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative my-6 w-full max-w-5xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#12372A] px-6 py-4 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D8FF00] text-[#12372A] shadow-xs">
              <FileBadge size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Kartu Driving Permit Resmi
                </h3>
                <span className="rounded-md bg-[#D8FF00] px-2 py-0.5 text-[10px] font-black text-[#12372A]">
                  STANDAR ID CARD 54 &times; 85.6 MM
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                PT Besmindo Materi Sewatama &bull; Permit #{permit.permit_number || permit.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEditor(!showEditor)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                showEditor
                  ? "bg-white text-[#12372A]"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>{showEditor ? "Tutup Editor" : "Sesuaikan Data Kartu"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#D8FF00] px-4 py-2 text-xs font-extrabold text-[#12372A] shadow-md shadow-[#D8FF00]/20 hover:bg-[#cbf100] transition active:scale-[0.98]"
            >
              <Printer size={15} />
              <span>
                {printLayout === "single_sheet"
                  ? "Cetak Kartu (1 Lembar A4)"
                  : "Cetak Kartu (2 Halaman)"}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTROLS & SETTINGS */}
        <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* TAB VIEW MODE */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setViewSide("both")}
              className={`rounded-lg px-3 py-1 font-bold transition ${
                viewSide === "both"
                  ? "bg-[#12372A] text-[#D8FF00]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Dua Sisi (Depan & Belakang)
            </button>
            <button
              type="button"
              onClick={() => setViewSide("front")}
              className={`rounded-lg px-3 py-1 font-bold transition ${
                viewSide === "front"
                  ? "bg-[#12372A] text-[#D8FF00]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Halaman Depan
            </button>
            <button
              type="button"
              onClick={() => setViewSide("back")}
              className={`rounded-lg px-3 py-1 font-bold transition ${
                viewSide === "back"
                  ? "bg-[#12372A] text-[#D8FF00]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Halaman Belakang
            </button>
          </div>

          {/* PRINT FORMAT SELECTOR */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500">Format Cetak:</span>
            <select
              value={printLayout}
              onChange={(e) => setPrintLayout(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-[#12372A]"
            >
              <option value="single_sheet">1 Lembar A4 (Dua Sisi Berdampingan - 54×86 mm)</option>
              <option value="two_pages">2 Halaman Terpisah (Halaman Depan & Belakang)</option>
            </select>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs"
            >
              <Camera size={13} />
              <span>Ganti Foto Supir</span>
            </button>
            {photoUrl && photoUrl !== "/default-driver-photo.png" && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 shadow-xs transition"
                title="Hapus foto kartu ini dan kembali ke inisial nama"
              >
                <Trash2 size={12} />
                <span>Hapus Foto</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>

        {/* OPTIONAL EDITABLE PANEL */}
        {showEditor && (
          <div className="border-b border-gray-200 bg-amber-50/50 p-4 shrink-0 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-[#12372A]" />
                Kustomisasi Data Kartu Sebelum Dicetak:
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-800"
              >
                <RotateCcw size={12} />
                <span>Reset ke Data Asli</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Nama Pengemudi</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Jabatan (Position)</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">SIM No - Exp Year</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-2/3 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-mono font-semibold"
                  />
                  <input
                    type="text"
                    value={licenseExpiryYear}
                    onChange={(e) => setLicenseExpiryYear(e.target.value)}
                    className="w-1/3 rounded-lg border border-gray-300 bg-white px-1.5 py-1 text-xs font-mono text-center font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Permit Number</label>
                <input
                  type="text"
                  value={permitNumber}
                  onChange={(e) => setPermitNumber(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-mono font-semibold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Golongan SIM (Badge)</label>
                <select
                  value={licenseCategory}
                  onChange={(e) => setLicenseCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-bold text-gray-800"
                >
                  <option value="BII.U">BII.U</option>
                  <option value="BI.U">BI.U</option>
                  <option value="A">A</option>
                  <option value="C">C</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">DDC Training Date</label>
                <input
                  type="text"
                  value={ddcTrainingDate}
                  onChange={(e) => setDdcTrainingDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Expired Date Permit</label>
                <input
                  type="text"
                  value={permitExpiryDate}
                  onChange={(e) => setPermitExpiryDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Equipment Type (Belakang)</label>
                <input
                  type="text"
                  value={equipmentType}
                  onChange={(e) => setEquipmentType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* CARD CANVAS CONTAINER */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/70 flex items-center justify-center">
          <div
            id="permit-card-printable-area"
            className="flex flex-wrap items-center justify-center gap-8"
          >
            <DrivingPermitCardView
              driverName={driverName}
              position={position}
              licenseNo={licenseNo}
              licenseExpiryYear={licenseExpiryYear}
              permitNumber={permitNumber}
              licenseCategory={licenseCategory}
              ddcTrainingDate={ddcTrainingDate}
              permitExpiryDate={permitExpiryDate}
              equipmentType={equipmentType}
              photoUrl={photoUrl}
              hseSignatureUrl={hseSignatureUrl}
              opsSignatureUrl={opsSignatureUrl}
              viewSide={viewSide}
              layout={printLayout === "two_pages" ? "stack" : "row"}
            />
          </div>
        </div>

        {/* FOOTER BAR */}
        <div className="border-t border-gray-100 bg-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-gray-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Ukuran cetak presisi standar ID Card CR80 (54 &times; 85.6 mm) &bull; Format berdampingan siap cetak &amp; laminating.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#12372A] px-5 py-2 text-xs font-bold text-[#D8FF00] shadow-md shadow-[#12372A]/20 hover:bg-[#0c261d] transition"
            >
              <Printer size={14} />
              <span>Cetak / Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}