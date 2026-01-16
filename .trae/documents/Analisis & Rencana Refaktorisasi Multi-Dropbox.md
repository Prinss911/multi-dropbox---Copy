# Laporan Analisis Kode & Rencana Refaktorisasi Workspace

Berdasarkan analisis mendalam terhadap workspace `multi-dropbox`, berikut adalah temuan kritis dan rencana perbaikan terstruktur.

## 1. Laporan Analisis (Current State)

### A. Komponen "God Object" (Masalah Terbesar)
Komponen-komponen berikut melanggar *Single Responsibility Principle* dengan menangani terlalu banyak tugas (UI, State, API, Drag-drop) sekaligus:
1.  **`pages/drive/files.vue` (2707 baris)** - 🚨 **CRITICAL**
    *   **Masalah:** Menggabungkan Layout, State Management, Drag & Drop, Upload Logic, Search, dan tampilan Grid/List dalam satu file.
    *   **Risiko:** Sangat sulit di-maintain, rawan regresi saat update.
2.  **`components/FileBrowser.vue` (1100 baris)** - 🚨 **HIGH**
    *   **Masalah:** Duplikasi logika yang hampir identik dengan `drive/files.vue` (sorting, filtering, selection) tetapi terpisah kodenya.
3.  **`pages/admin/files.vue` (1084 baris)**
    *   **Masalah:** Kemungkinan besar copy-paste dari halaman user, menciptakan *code drift* (perbedaan logika) antar role.

### B. Masalah Arsitektur & Duplikasi
*   **Coupling Tinggi:** Logika UI (Toolbar, Breadcrumbs) menyatu erat dengan logika data. Perubahan pada desain UI mengharuskan pengeditan file logika utama.
*   **Duplikasi Kode:** Fitur "Sticky Header", "Search Bar", dan "Filter" diimplementasikan ulang di setidaknya 3 tempat berbeda (`drive/files`, `admin/files`, `FileBrowser`) dengan kode yang sedikit berbeda.
*   **Violasi DRY (Don't Repeat Yourself):** Logika seleksi file (`selectedIds`) dan *bulk actions* tersebar.

### C. Kualitas Kode & Testing
*   **TypeScript:** Penggunaan tipe data cukup baik (interface `DropboxEntry`), namun validasi props pada komponen besar sering terabaikan.
*   **Testing:** **0% Coverage**. Tidak ditemukan unit test (`.spec.ts` atau `.test.ts`) untuk logika bisnis kritis maupun komponen UI.

---

## 2. Rencana Refaktorisasi (Action Plan)

Kami merekomendasikan pendekatan bertahap untuk memecah "God Component" utama (`pages/drive/files.vue`) tanpa menghentikan pengembangan fitur.

### Phase 1: Ekstraksi Komponen UI (High Impact, Low Risk)
Memecah tampilan raksasa menjadi komponen atomik yang dapat digunakan kembali.
1.  **Extract `FileToolbar.vue`**: Memindahkan logika search, view mode toggle, dan tombol aksi atas.
2.  **Extract `FileStats.vue`**: Memindahkan bar statistik storage/files.
3.  **Extract `FileGrid.vue` & `FileList.vue`**: Memisahkan tampilan data dari logika pengambilan data.
4.  **Extract `Breadcrumbs.vue`**: Membuat komponen navigasi yang *reusable*.

### Phase 2: Konsolidasi Logika (Composable)
Memindahkan logika bisnis keluar dari komponen `.vue`.
1.  **Refactor `useFileSelection`**: Memindahkan logika `selectedIds`, `toggleSelect`, `selectAll` ke composable khusus.
2.  **Refactor `useFileDragDrop`**: Memisahkan logika drag-and-drop yang rumit dari template utama.

### Phase 3: Setup Quality Assurance
1.  **Install Vitest**: Menyiapkan lingkungan testing.
2.  **Unit Test untuk Composable**: Menulis test pertama untuk `useFileSelection` dan `useDropboxFiles`.

## Estimasi Effort
*   **Phase 1:** ~2-3 jam (Dapat segera dimulai)
*   **Phase 2:** ~2 jam
*   **Phase 3:** ~1-2 jam

**Rekomendasi Langkah Selanjutnya:**
Saya sarankan kita mulai dengan **Phase 1** yaitu memecah `pages/drive/files.vue` menjadi komponen-komponen kecil agar kode lebih mudah dibaca dan dikelola. Apakah Anda setuju?