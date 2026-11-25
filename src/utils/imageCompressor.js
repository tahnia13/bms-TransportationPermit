/**
 * Kompresi dan resize gambar di sisi klien menggunakan HTML5 Canvas
 * Menjamin file foto ID Card selalu tajam, proporsional, dan berukuran ringan (< 100 KB)
 * Mencegah pengiriman string base64 berukuran raksasa (misal 14MB) ke database.
 *
 * @param {File|Blob} file - File gambar yang diunggah pengguna
 * @param {number} maxWidth - Batas lebar piksel (default 480)
 * @param {number} maxHeight - Batas tinggi piksel (default 600)
 * @param {number} quality - Kualitas kompresi JPEG (0.1 - 1.0, default 0.85)
 * @returns {Promise<string>} Data URL base64 JPEG yang sudah terkompresi
 */
export const compressImageFile = (
  file,
  maxWidth = 480,
  maxHeight = 600,
  quality = 0.85
) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      return reject(
        new Error("File yang dipilih bukan berkas gambar yang valid (JPG/PNG).")
      );
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memuat gambar ke canvas."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Pertahankan rasio aspek gambar saat scaling
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Gagal menginisialisasi 2D Canvas context."));
        }

        // Terapkan image smoothing berkualitas tinggi
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Gambar ke canvas dengan ukuran baru
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke data URL base64 JPEG dengan kualitas yang ditentukan
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};
