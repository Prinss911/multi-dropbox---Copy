# Rencana Perbaikan UI Floating Bulk Action & Cache Busting

Saya akan melakukan perbaikan komprehensif untuk mengatasi masalah tampilan (warna yang tidak sesuai) dan masalah caching aset.

## 1. Refaktorisasi Komponen (Component Extraction)
Untuk memastikan konsistensi dan mempermudah debugging styling, saya akan memisahkan *floating bar* menjadi komponen mandiri.
*   **Buat File Baru**: `components/drive/FloatingActionBar.vue`
*   **Tujuan**: Mengisolasi logic dan styling dari halaman utama, memudahkan maintenance.
*   **Styling**: Memperbaiki kontras warna pada tombol "Delete" dan "Download" agar lebih konsisten dengan design system (menggunakan palette Tailwind standar yang aman).

## 2. Implementasi Cache Busting & Versioning (Nuxt Config)
Untuk mencegah masalah browser cache yang menyimpan versi CSS/JS lama:
*   **Update `nuxt.config.ts`**:
    *   Mengkonfigurasi `vite.build.rollupOptions` untuk memaksa penamaan file menggunakan hash (`[name].[hash].js`) secara eksplisit.
    *   Menambahkan meta tag `application-version` di head untuk pelacakan versi deploy.
*   **Manfaat**: Setiap kali ada perubahan build, nama file akan berubah, memaksa browser memuat aset terbaru.

## 3. Integrasi & Pembersihan
*   **Update `pages/drive/files.vue`**: Mengganti kode inline dengan komponen `FloatingActionBar` yang baru.
*   **Verifikasi**: Memastikan props dan event handler terhubung dengan benar (download, delete, clear selection).

## Langkah Implementasi:
1.  **Buat** `components/drive/FloatingActionBar.vue` dengan styling yang diperbaiki (kontras warna lebih tegas untuk light/dark mode).
2.  **Modifikasi** `nuxt.config.ts` untuk menambahkan strategi *hashing* pada output build.
3.  **Refactor** `pages/drive/files.vue` untuk menggunakan komponen baru.
4.  **Testing** Verifikasi tampilan dan fungsionalitas.
