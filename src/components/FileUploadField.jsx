import { useRef } from "react";
import { Upload, X, FileText, Image, Eye, Download } from "lucide-react";

/**
 * FileUploadField — Komponen upload file (foto/PDF) yang reusable.
 *
 * Props:
 *   label         — Label field (string)
 *   name          — Nama field, dipakai untuk id & htmlFor
 *   accept        — MIME types yang diterima, default "image/*,application/pdf"
 *   file          — File object baru yang dipilih (File | null)
 *   onFileChange  — Callback (File | null) => void
 *   existingUrl   — URL file yang sudah ada di server (string | null)
 *   existingName  — Nama file existing untuk ditampilkan (string | null)
 *   hint          — Teks hint tambahan di bawah field (string | null)
 */
export default function FileUploadField({
  label = "Upload Dokumen",
  name = "file",
  accept = "image/*,application/pdf",
  file = null,
  onFileChange,
  existingUrl = null,
  existingName = null,
  hint = null,
}) {
  const inputRef = useRef(null);

  // -------------------------------------------------------
  // Helpers
  // -------------------------------------------------------

  const isPDF = (f) => {
    if (!f) return false;
    if (typeof f === "string") return f.toLowerCase().endsWith(".pdf");
    return f.type === "application/pdf";
  };

  const isImage = (f) => {
    if (!f) return false;
    if (typeof f === "string") return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f);
    return f.type?.startsWith("image/");
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // -------------------------------------------------------
  // Handlers
  // -------------------------------------------------------

  const handleInputChange = (e) => {
    const selected = e.target.files?.[0] || null;
    if (onFileChange) onFileChange(selected);
    // Reset input agar bisa memilih file yang sama lagi
    e.target.value = "";
  };

  const handleRemoveNew = () => {
    if (onFileChange) onFileChange(null);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  // -------------------------------------------------------
  // Derived preview URL untuk file baru (gambar)
  // -------------------------------------------------------

  const newPreviewUrl = file && isImage(file) ? URL.createObjectURL(file) : null;

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------

  return (
    <div className="sm:col-span-2">
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-xs font-bold text-gray-700 mb-1.5"
      >
        {label}
      </label>

      {/* Hidden input */}
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="sr-only"
      />

      {/* ---- State 1: File baru dipilih ---- */}
      {file ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5">
          {/* Preview / Icon */}
          {newPreviewUrl ? (
            <img
              src={newPreviewUrl}
              alt="Preview"
              className="h-14 w-14 rounded-xl object-cover border border-emerald-100 shrink-0"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-100 text-rose-500">
              <FileText size={24} />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">{file.name}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isPDF(file) ? "PDF Document" : "Image"} · {formatSize(file.size)}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              ✓ Siap diupload
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleClick}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={handleRemoveNew}
              className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-100 transition"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : existingUrl ? (
        /* ---- State 2: File sudah ada di server ---- */
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-3.5">
          {/* Preview / Icon */}
          {isImage(existingUrl) ? (
            <img
              src={existingUrl}
              alt="Dokumen existing"
              className="h-14 w-14 rounded-xl object-cover border border-blue-100 shrink-0"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-500">
              <FileText size={24} />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">
              {existingName || "Dokumen Tersimpan"}
            </p>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
              ✓ File tersimpan di sistem
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Upload file baru untuk mengganti
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <a
              href={existingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition"
            >
              <Eye size={10} />
              Lihat
            </a>
            <button
              type="button"
              onClick={handleClick}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Ganti
            </button>
          </div>
        </div>
      ) : (
        /* ---- State 3: Belum ada file ---- */
        <button
          type="button"
          onClick={handleClick}
          className="group w-full flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/60 py-6 px-4 text-center transition hover:border-[#12372A]/40 hover:bg-emerald-50/30 focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition">
            <Upload size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 group-hover:text-[#12372A]">
              Klik untuk memilih file
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Foto (JPG/PNG) atau Dokumen PDF · Maks. 10 MB
            </p>
          </div>
        </button>
      )}

      {/* Hint */}
      {hint && (
        <p className="mt-1.5 text-[11px] text-gray-400">{hint}</p>
      )}
    </div>
  );
}
