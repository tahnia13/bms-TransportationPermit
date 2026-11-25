import { useRef, useState, useEffect, useCallback } from "react";
import { X, RotateCcw, Check, Pen, Trash2 } from "lucide-react";

/**
 * SignaturePad — Komponen tanda tangan online berbasis Canvas HTML5
 *
 * Props:
 *   storageKey  {string}   — key localStorage untuk menyimpan TTD (base64)
 *   label       {string}   — label tampilan, e.g. "HSE & ISO Jr.Manager"
 *   onSave      {function} — callback(base64) ketika TTD disimpan
 *   onClear     {function} — callback() ketika TTD dihapus
 *
 * TTD disimpan ke localStorage agar muncul otomatis setiap buka halaman.
 */
export default function SignaturePad({ storageKey, label, onSave, onClear }) {
  // Ambil TTD tersimpan dari localStorage saat mount
  const savedSig = localStorage.getItem(storageKey) || null;

  const [showModal, setShowModal] = useState(false);
  const [currentSig, setCurrentSig] = useState(savedSig);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Inisialisasi canvas context saat modal dibuka
  useEffect(() => {
    if (!showModal) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";
    ctxRef.current = ctx;
    // Bersihkan canvas saat buka modal
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, [showModal]);

  // Helper: dapatkan posisi relative ke canvas (mendukung touch & mouse)
  const getPos = useCallback((e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  // Mouse / Touch handlers
  const startDraw = useCallback(
    (e) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas || !ctxRef.current) return;
      setIsDrawing(true);
      setHasDrawn(true);
      const pos = getPos(e, canvas);
      lastPosRef.current = pos;
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(pos.x, pos.y);
    },
    [getPos]
  );

  const draw = useCallback(
    (e) => {
      e.preventDefault();
      if (!isDrawing || !ctxRef.current || !canvasRef.current) return;
      const pos = getPos(e, canvasRef.current);
      ctxRef.current.lineTo(pos.x, pos.y);
      ctxRef.current.stroke();
      lastPosRef.current = pos;
    },
    [isDrawing, getPos]
  );

  const stopDraw = useCallback((e) => {
    e?.preventDefault();
    setIsDrawing(false);
  }, []);

  // Hapus canvas
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Simpan TTD ke state + localStorage
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL("image/png");
    localStorage.setItem(storageKey, base64);
    setCurrentSig(base64);
    if (onSave) onSave(base64);
    setShowModal(false);
  };

  // Hapus TTD yang tersimpan
  const handleDelete = () => {
    localStorage.removeItem(storageKey);
    setCurrentSig(null);
    if (onClear) onClear();
  };

  return (
    <div className="space-y-1.5">
      {/* Label */}
      <p className="text-[11px] font-bold text-gray-700">{label}</p>

      {/* Preview area + tombol aksi */}
      <div className="flex items-center gap-2">
        {/* Preview TTD */}
        <div className="relative h-14 w-28 shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
          {currentSig ? (
            <img
              src={currentSig}
              alt={`TTD ${label}`}
              className="h-full w-full object-contain p-0.5"
            />
          ) : (
            <span className="text-[9px] text-gray-400 text-center px-1">
              Belum ada TTD
            </span>
          )}
        </div>

        {/* Tombol aksi */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition"
          >
            <Pen size={11} />
            {currentSig ? "Ubah TTD" : "Gambar TTD"}
          </button>
          {currentSig && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-100 shadow-xs transition"
            >
              <Trash2 size={11} />
              Hapus TTD
            </button>
          )}
        </div>
      </div>

      {/* ===================== MODAL CANVAS TTD ===================== */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Tanda Tangan Digital
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
              >
                <X size={14} />
              </button>
            </div>

            {/* Canvas Area */}
            <div className="p-4">
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={380}
                  height={160}
                  className="w-full cursor-crosshair touch-none"
                  style={{ display: "block" }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                />
              </div>
              {!hasDrawn && (
                <p className="text-center text-[10px] text-gray-400 mt-2">
                  ✍️ Gambar tanda tangan Anda di area di atas
                </p>
              )}
            </div>

            {/* Footer Tombol */}
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 gap-2">
              <button
                type="button"
                onClick={handleClearCanvas}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                <RotateCcw size={13} />
                Ulangi
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasDrawn}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#12372A] px-4 py-2 text-xs font-bold text-[#D8FF00] hover:bg-[#1a4d3a] transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check size={13} />
                  Simpan TTD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
