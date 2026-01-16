Berikut adalah rencana komprehensif untuk memperbaiki sistem preview file dan mengimplementasikan sistem notifikasi Toast yang modern.

## 1. Perbaikan Sistem Preview File
Masalah utama adalah preview menutup otomatis saat terjadi error atau untuk tipe file yang tidak didukung secara native (seperti archive).

**Solusi Teknis:**
*   **Refactor `openPreview`**: Menghapus logika yang menutup modal (`previewTarget.value = null`) saat terjadi error.
*   **State Management**: Menambahkan state `previewError` untuk menangani kegagalan loading URL preview.
*   **UI Modal Preview**:
    *   Menambahkan tampilan khusus untuk **File Arsip** (zip, rar, 7z) dengan pesan yang jelas dan tombol download yang menonjol.
    *   Menambahkan tampilan **Error State** di dalam modal dengan tombol "Retry" dan "Close", sehingga user memegang kendali penuh.
    *   Memastikan tombol "Close" (X) dan klik backdrop tetap berfungsi untuk menutup manual.

## 2. Implementasi Sistem Toast Notification
Kita akan menggantikan `alert()` browser yang kaku dengan komponen Toast dari `reka-ui` yang elegan dan informatif.

**Komponen yang akan dibuat:**
1.  **`components/ui/toast/Toaster.vue`**: Komponen wrapper yang berisi `ToastProvider`, `ToastViewport`, dan me-render list toast aktif.
2.  **`composables/useToast.ts`**: Composable global untuk memanggil toast dari mana saja (contoh: `toast.success('File deleted')`).
3.  **Integrasi Global**: Memasang `Toaster` di `layouts/default.vue` agar notifikasi bisa muncul di semua halaman.

**Analisis Area Implementasi (di `pages/drive/files.vue`):**
*   **Sukses**:
    *   Upload selesai ("File uploaded successfully").
    *   Folder dibuat ("Folder 'Projects' created").
    *   File dihapus/dipindahkan.
    *   Link share dibuat.
*   **Error**:
    *   Gagal upload.
    *   Gagal delete (misal: permission denied).
    *   Gagal generate preview.
*   **Info/Warning**:
    *   Proses bulk action sedang berjalan.

## Langkah Implementasi
1.  **Setup Toast**: Membuat komponen UI Toast dan composable `useToast` berdasarkan dokumentasi Reka UI.
2.  **Integrasi Layout**: Menambahkan `<Toaster />` ke `layouts/default.vue`.
3.  **Update `files.vue` (Preview)**: Memperbaiki logika `openPreview` dan template modal.
4.  **Update `files.vue` (Notifikasi)**: Mengganti semua `alert()` dan `console.error` yang user-facing dengan `toast.add()`.

Apakah Anda setuju dengan rencana ini? Silakan konfirmasi untuk memulai implementasi.