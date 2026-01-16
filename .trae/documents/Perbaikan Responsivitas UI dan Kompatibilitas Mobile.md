Berikut adalah rencana perbaikan untuk memastikan responsivitas UI dan kompatibilitas mobile yang optimal:

## Analisis Masalah
1.  **`pages/drive/files.vue` (User View)**:
    *   **Header Toolbar**: Pada layar sempit (320px), search bar dan tombol aksi (Upload, New Folder) berpotensi bertumpuk atau terpotong karena `flex-nowrap`.
    *   **Breadcrumbs**: Tidak memiliki scroll horizontal (`overflow-x-auto`), sehingga path folder yang panjang akan merusak layout.
    *   **Layout**: Membutuhkan penyesuaian agar search bar lebih fleksibel pada mobile.

2.  **`components/FileBrowser.vue` (Admin View)**:
    *   **Aksesibilitas Aksi**: Tombol aksi (Rename, Delete, Share) hanya muncul saat *hover* (`opacity-0 group-hover:opacity-100`). Ini membuat pengguna perangkat sentuh (mobile/tablet) kesulitan mengakses menu tersebut tanpa melakukan tap yang mungkin memicu navigasi.

## Rencana Implementasi

### 1. Optimasi Header & Navigasi User (`pages/drive/files.vue`)
*   **Breadcrumbs**: Bungkus navigasi breadcrumb dalam container dengan `overflow-x-auto`, `whitespace-nowrap`, dan `no-scrollbar` (utility class) agar dapat digeser secara horizontal pada layar kecil.
*   **Toolbar Responsif**:
    *   Ubah container aksi menjadi `flex-wrap` untuk menangani layar sangat kecil.
    *   Atur input pencarian agar menggunakan `flex-1` pada mobile (mengisi ruang tersisa) atau lebar penuh (`w-full`) pada baris sendiri jika diperlukan.

### 2. Perbaikan Aksesibilitas Admin (`components/FileBrowser.vue`)
*   **Visibility Toggle**: Ubah logika visibilitas tombol aksi agar selalu terlihat pada layar sentuh/mobile, dan tetap *hover-only* pada desktop.
    *   Gunakan class: `opacity-100 lg:opacity-0 lg:group-hover:opacity-100`.

### 3. Pengecekan Akhir
*   Verifikasi padding pada `pages/login.vue` (sudah cukup baik dengan `p-8`).
*   Pastikan tidak ada scroll horizontal yang tidak diinginkan pada level `body`.

Saya akan mulai dengan memperbaiki `pages/drive/files.vue` dan kemudian `components/FileBrowser.vue`.