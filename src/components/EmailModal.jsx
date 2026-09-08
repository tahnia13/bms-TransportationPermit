import { useState } from "react";
import { Mail, Send, X, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { api } from "../services/api";

export default function EmailModal({ isOpen, onClose, permit, defaultType = "expiry_alert", onSent }) {
  if (!isOpen) return null;

  const defaultSubject =
    defaultType === "expiry_alert"
      ? `[PERINGATAN KEDALUWARSA] Surat Izin Permit #${permit?.permit_number || ""}`
      : defaultType === "approval_notice"
      ? `[PEMBERITAHUAN PERSETUJUAN] Permit #${permit?.permit_number || ""} Telah Disetujui`
      : `[NOTIFIKASI PERMIT] Pembaruan Dokumen #${permit?.permit_number || ""}`;

  const [recipient, setRecipient] = useState(
    permit?.requester_email || (permit?.driver ? `${permit.driver.toLowerCase().replace(/\s+/g, ".")}@besmindo.co.id` : "logistics.ops@besmindo.co.id")
  );
  const [subject, setSubject] = useState(defaultSubject);
  const [notes, setNotes] = useState(
    defaultType === "expiry_alert"
      ? `Yth. Rekan Tim Operasional,\n\nMohon perhatian bahwa izin operasional (Permit) dengan nomor #${permit?.permit_number} untuk kendaraan ${permit?.vehicle || "-"} dengan driver ${permit?.driver || "-"} akan kedaluwarsa pada ${permit?.end_date || "-"}.\n\nSegera ajukan pembaharuan dokumen melalui sistem transportasi PT Besmindo Materi Sewatama.`
      : `Yth. Tim Operasional & Pengemudi,\n\nSurat izin jalan #${permit?.permit_number} untuk rute ${permit?.origin} -> ${permit?.destination} telah disetujui oleh Kepala Departemen Transportasi.\n\nHarap patuhi SOP keselamatan berkendara.`
  );
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    if (!recipient) {
      setErrorMsg("Email penerima wajib diisi.");
      return;
    }

    setSending(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        recipient_email: recipient,
        subject: subject,
        message: notes,
        permit_id: permit?.id || null,
        type: defaultType,
        sender_name: "Transportation System",
      };

      await api.sendEmailNotification(payload);
      setSuccessMsg(`Notifikasi email berhasil dikirim ke ${recipient}`);
      if (onSent) onSent();
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      console.error("Email send error:", err);
      setErrorMsg(err?.message || "Gagal mengirimkan notifikasi email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#12372A] text-[#D8FF00]">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#12372A]">Kirim Notifikasi Email Resmi</h3>
              <p className="text-xs text-gray-500">PT Besmindo Materi Sewatama Notification Dispatcher</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* EMAIL FORM */}
        <form onSubmit={handleSend} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Email Penerima (PIC / Driver / Dept)</label>
            <input
              type="email"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="contoh: driver@besmindo.co.id"
              className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2.5 outline-none focus:border-[#12372A] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Subjek Email</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] px-3.5 py-2.5 outline-none focus:border-[#12372A] focus:bg-white transition"
            />
          </div>

          {/* EMAIL PREVIEW CARD */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Pratinjau Isi Surat & Catatan</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-[#F5F7F6] p-3 text-xs text-gray-700 outline-none focus:border-[#12372A] focus:bg-white transition leading-relaxed"
            />
          </div>

          {/* BRANDED EMAIL FOOTER PREVIEW */}
          <div className="rounded-2xl border border-emerald-100 bg-[#12372A]/5 p-3 text-[11px] text-gray-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#12372A]" />
              <span className="font-semibold text-[#12372A]">PT Besmindo Materi Sewatama Transportation Mailer</span>
            </div>
            <span className="text-gray-400">Enkripsi TLS Aktif</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#12372A] px-5 py-2 text-xs font-bold text-[#D8FF00] shadow-md shadow-[#12372A]/20 hover:bg-[#0d2a20] transition disabled:opacity-50"
            >
              <Send size={13} />
              <span>{sending ? "Mengirim..." : "Kirim Email Notifikasi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
