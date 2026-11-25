import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Check, Layers } from "lucide-react";

/**
 * FormSelectWithCustom
 * Dropdown form input yang mendukung penambahan opsi baru secara instan oleh pengguna.
 * Pilihan baru langsung tersimpan persisten ke localStorage browser,
 * sehingga muncul seterusnya di dropdown form tersebut maupun di filter terkait.
 */
export default function FormSelectWithCustom({
  label,
  name,
  value,
  onChange,
  defaultOptions = [],
  storageKey,
  placeholder = "-- Pilih --",
  required = false,
  className = "",
  icon: Icon,
}) {
  const getSavedOptions = () => {
    if (!storageKey) return [];
    try {
      const saved = localStorage.getItem(`custom_filter_${storageKey}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const [customOptions, setCustomOptions] = useState(getSavedOptions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOptionInput, setNewOptionInput] = useState("");
  const [inputError, setInputError] = useState("");
  const inputRef = useRef(null);

  // Sinkronisasi jika storageKey berubah atau ada event custom_option_added dari komponen lain
  useEffect(() => {
    setCustomOptions(getSavedOptions());

    const handleSync = (e) => {
      if (!storageKey) return;
      if (!e.detail || e.detail.storageKey === storageKey) {
        setCustomOptions(getSavedOptions());
      }
    };

    window.addEventListener("custom_option_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("custom_option_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [storageKey]);

  // Gabungkan opsi bawaan + opsi kustom yang tersimpan
  const allOptions = useMemo(() => {
    return Array.from(
      new Set([
        ...defaultOptions.filter((opt) => opt !== "All"),
        ...customOptions.filter((opt) => opt !== "All"),
      ])
    );
  }, [defaultOptions, customOptions]);

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isModalOpen]);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === "__ADD_CUSTOM__") {
      setIsModalOpen(true);
      setNewOptionInput("");
      setInputError("");
      return;
    }
    onChange(e);
  };

  const handleSaveCustomOption = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const trimmed = newOptionInput.trim().toUpperCase();

    if (!trimmed) {
      setInputError("Pilihan baru tidak boleh kosong.");
      return;
    }

    if (allOptions.some((opt) => opt.toUpperCase() === trimmed)) {
      // Jika sudah ada dalam daftar, langsung pilih saja
      onChange({
        target: {
          name,
          value: trimmed,
        },
      });
      setIsModalOpen(false);
      setNewOptionInput("");
      setInputError("");
      return;
    }

    const currentSaved = getSavedOptions();
    const updated = Array.from(new Set([...currentSaved, trimmed]));
    setCustomOptions(updated);

    if (storageKey) {
      try {
        localStorage.setItem(`custom_filter_${storageKey}`, JSON.stringify(updated));
        // Kirim event agar select / filter lain yang menggunakan storageKey ini langsung terupdate
        window.dispatchEvent(
          new CustomEvent("custom_option_updated", {
            detail: { storageKey, newOption: trimmed },
          })
        );
      } catch (err) {
        console.error("Failed to save custom option:", err);
      }
    }

    // Set nilai form ke opsi baru yang baru saja ditambahkan
    onChange({
      target: {
        name,
        value: trimmed,
      },
    });

    setIsModalOpen(false);
    setNewOptionInput("");
    setInputError("");
  };

  const handleRemoveCustomOption = (optToRemove, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const updated = customOptions.filter((opt) => opt !== optToRemove);
    setCustomOptions(updated);

    if (storageKey) {
      try {
        localStorage.setItem(`custom_filter_${storageKey}`, JSON.stringify(updated));
        window.dispatchEvent(
          new CustomEvent("custom_option_updated", {
            detail: { storageKey },
          })
        );
      } catch (err) {
        console.error("Failed to update custom option:", err);
      }
    }

    if (value === optToRemove) {
      onChange({
        target: {
          name,
          value: "",
        },
      });
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-gray-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <Icon size={15} />
          </div>
        )}

        <select
          name={name}
          value={value}
          onChange={handleSelectChange}
          required={required}
          className={`w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-xs sm:text-sm text-gray-800 outline-none transition focus:border-[#12372A] focus:bg-white cursor-pointer ${
            Icon ? "pl-10 pr-4" : "px-3.5"
          }`}
        >
          <option value="">{placeholder}</option>
          {allOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option
            value="__ADD_CUSTOM__"
            className="font-bold text-[#12372A] bg-emerald-50"
          >
            + Tambah Pilihan Baru...
          </option>
        </select>
      </div>

      {/* MODAL TAMBAH PILIHAN BARU DENGAN PORTAL AGAR TIDAK TERPENGARUH FORM INDUK */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(false);
            }}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D8FF00] text-[#12372A]">
                    <Layers size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#12372A]">
                      Tambah Pilihan {label || "Baru"}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Pilihan akan tersimpan otomatis dan bisa digunakan seterusnya
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama / Nilai Pilihan Baru:
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newOptionInput}
                    onChange={(e) => {
                      setNewOptionInput(e.target.value);
                      if (inputError) setInputError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSaveCustomOption(e);
                      }
                    }}
                    placeholder="Ketik nama pilihan baru..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:border-[#12372A] focus:bg-white transition uppercase"
                  />
                  {inputError && (
                    <p className="mt-1 text-[11px] font-semibold text-rose-600">
                      {inputError}
                    </p>
                  )}
                </div>

                {/* LIST OPSI KUSTOM YANG SUDAH PERNAH DITAMBAHKAN */}
                {customOptions.length > 0 && (
                  <div className="pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Pilihan Kustom Tersimpan:
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {customOptions.map((opt) => (
                        <span
                          key={opt}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700"
                        >
                          {opt}
                          <button
                            type="button"
                            onClick={(e) => handleRemoveCustomOption(opt, e)}
                            title={`Hapus ${opt}`}
                            className="text-gray-400 hover:text-rose-600 transition"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustomOption}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#12372A] px-4 py-1.5 text-xs font-bold text-[#D8FF00] hover:bg-[#0d281f] transition shadow-xs cursor-pointer"
                  >
                    <Check size={14} strokeWidth={2.5} />
                    <span>Simpan & Gunakan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
