Berikut adalah rencana komprehensif untuk analisis dan peningkatan UI/UX proyek MultiBox Anda.

## Analisis UI/UX Saat Ini

### 1. Evaluasi Visual
*   **Kekuatan**: Menggunakan basis desain yang solid (mirip Shadcn/UI) dengan Tailwind CSS dan variabel warna CSS (`--primary`, `--background`), memberikan fondasi yang bersih.
*   **Area Perbaikan**:
    *   **Inkonsistensi Warna**: Terdapat penggunaan warna hex hardcoded (contoh: `#0061FE` di sidebar, `#1E1919` di header) yang seharusnya menggunakan variabel CSS tema.
    *   **Spacing**: Padding pada Sidebar (`px-6` di header vs `px-3` di menu) dan Header sedikit tidak selaras.
    *   **Typography**: Kontras pada `text-muted-foreground` mungkin terlalu rendah di beberapa background, terutama untuk informasi penting seperti ukuran file.

### 2. Peningkatan UX
*   **Navigasi**: Breadcrumb pada `FileBrowser.vue` menggunakan campuran tombol teks biasa yang kurang menonjol secara visual sebagai navigasi hierarki.
*   **Interaksi File**: Klik baris tabel melakukan aksi "masuk folder" atau "preview file", namun checkbox seleksi terpisah. Area klik bisa diperjelas.
*   **Feedback Drag & Drop**: Overlay drag & drop sudah ada, tapi transisinya bisa dibuat lebih halus dan informatif.

## Rencana Implementasi

### Fase 1: Harmonisasi Visual & Layout (Prioritas Tinggi)
Fokus pada konsistensi global dan perbaikan layout dasar.
1.  **Refactor `layouts/default.vue`**:
    *   Menyamakan padding horizontal (misalnya konsisten `px-4` atau `px-6`).
    *   Mengganti warna hardcoded dengan variabel Tailwind (e.g., `bg-blue-600` -> `bg-primary`).
    *   Memperbaiki alignment logo dan menu item.
2.  **Update `FileBrowser.vue` (Header & Breadcrumbs)**:
    *   Mengubah navigasi breadcrumb menjadi komponen yang lebih jelas (style "chips" atau link dengan separator yang konsisten).
    *   Menyamakan tinggi dan style tombol aksi (Upload, New Folder) dengan search bar.

### Fase 2: Peningkatan Interaksi FileBrowser (Prioritas Menengah)
Fokus pada core experience pengguna saat mengelola file.
1.  **Optimasi Tabel File**:
    *   Memperbaiki tampilan mobile: Pastikan nama file tidak terpotong dengan buruk dan informasi penting tetap terlihat.
    *   **Hover States**: Memperjelas indikator baris yang bisa diklik vs area seleksi.
2.  **Visual Hierarchy**:
    *   Membedakan ikon folder dan file dengan warna yang lebih harmonis namun kontras (folder biasanya lebih hangat/kuning, file lebih netral/biru).
    *   Menebalkan nama file/folder untuk keterbacaan lebih baik.

### Fase 3: Micro-interactions & Polish (Prioritas Rendah)
1.  **Feedback Visual**: Menambahkan transisi halus pada hover button dan list item.
2.  **Loading States**: Memastikan skeleton loading (yang sudah ada) konsisten ukurannya dengan konten asli untuk mengurangi layout shift.

Apakah Anda setuju dengan rencana perbaikan ini? Silakan konfirmasi untuk memulai Fase 1.