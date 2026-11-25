import React, { useState } from "react";

/**
 * FilterSelectWithCustom
 * Dropdown filter yang rapi dan konsisten untuk filter tabel/laporan.
 * Tombol [+] dan popup modal telah dihapus sepenuhnya sesuai permintaan pengguna
 * agar tampilan halaman bersih, rapi, dan profesional.
 *
 * Props:
 * - label: string (e.g. "Departemen", "Kategori", "Penugasan Rig")
 * - icon: Lucide icon component (optional)
 * - value: string (selected value)
 * - onChange: (newValue: string) => void
 * - defaultOptions: Array<string> (opsi bawaan sistem)
 * - storageKey: string (kunci penyimpanan localStorage)
 * - placeholderAll: string (label untuk nilai 'All', default: "Semua")
 * - className: string (container class)
 * - selectClassName: string (custom select element class)
 */
export default function FilterSelectWithCustom({
  label,
  icon: Icon,
  value,
  onChange,
  defaultOptions = [],
  storageKey,
  placeholderAll = "Semua",
  className = "",
  selectClassName = "",
}) {
  // Ambil opsi kustom dari localStorage jika sebelumnya pernah ada
  const [customOptions] = useState(() => {
    if (!storageKey) return [];
    try {
      const saved = localStorage.getItem(`custom_filter_${storageKey}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Gabungkan opsi bawaan + opsi kustom (tanpa duplikat)
  const allOptions = Array.from(
    new Set([
      "All",
      ...defaultOptions.filter((opt) => opt !== "All"),
      ...customOptions.filter((opt) => opt !== "All"),
    ])
  );

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      {Icon && <Icon size={14} className="text-gray-400 shrink-0" />}
      {label && <span className="text-xs font-bold text-gray-600 shrink-0">{label}:</span>}

      <div className="relative w-full">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={
            selectClassName ||
            "w-full rounded-xl border border-gray-200 bg-gray-50/90 py-1.5 pl-3 pr-8 text-xs font-semibold text-gray-800 outline-none transition focus:border-[#12372A] focus:bg-white cursor-pointer hover:bg-white"
          }
        >
          {allOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "All" ? placeholderAll : opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
