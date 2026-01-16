Berikut adalah hasil investigasi dan rencana perbaikan untuk masalah "500 Cannot read properties of undefined (reading 'meta')".

## Analisis Akar Masalah
Error ini spesifik dari **Vue Router** saat mencoba menavigasi ke rute yang `undefined` atau `null`.
Dari hasil analisis kode, kemungkinan besar penyebabnya ada di komponen `layouts/default.vue` atau `pages/drive/files.vue` yang menggunakan `NuxtLink` atau `navigateTo` dengan nilai dinamis yang belum siap (undefined) saat render awal atau update state.

### Temuan Spesifik:
1.  **`layouts/default.vue`**:
    *   Terdapat penggunaan `route.path` di dalam watcher dan computed properties.
    *   Penggunaan `NuxtLink` di dalam sidebar menu bergantung pada `route.path`.
2.  **`pages/drive/files.vue`**:
    *   Menggunakan `navigateTo` untuk preview file (line 931 dan 2235).
    *   Jika `previewUrl` bernilai `undefined` atau `null` saat tombol diklik, ini akan memicu crash.
3.  **`app.vue`**:
    *   Struktur standar `<NuxtLayout><NuxtPage /></NuxtLayout>` sudah benar, namun error injeksi simbol rute menunjukkan kegagalan pada level router internal Nuxt.

## Rencana Perbaikan
Kita akan menerapkan strategi **Defensive Programming** untuk mencegah nilai `undefined` masuk ke fungsi navigasi router.

### Langkah 1: Perbaikan `pages/drive/files.vue`
Fokus pada fungsi `openPreview` dan tombol yang memanggil `navigateTo`.
*   **Validasi URL Preview**: Memastikan `previewUrl` divalidasi sebelum dipanggil di `navigateTo`.
*   **Handling `open: { target: '_blank' }`**: Opsi ini kadang bermasalah jika URL tidak valid. Kita akan menggantinya dengan `window.open` native yang lebih aman untuk link eksternal, karena tidak melibatkan Vue Router.

### Langkah 2: Perbaikan `layouts/default.vue`
*   **Safe Route Access**: Memastikan akses ke `route.path` selalu aman.

### Langkah 3: Global Error Boundary (Opsional namun Disarankan)
*   Membuat `error.vue` custom untuk menangkap error 500 dengan elegan tanpa harus restart server, memberikan opsi "Reload Page" kepada user.

## Rincian Teknis Perubahan
1.  **Refactor Preview Button (`pages/drive/files.vue`)**:
    *   Ganti `<button @click="navigateTo(previewUrl...)">` menjadi pemanggilan fungsi `handleExternalLink(previewUrl)`.
    *   Implementasi `handleExternalLink` dengan validasi:
        ```typescript
        const handleExternalLink = (url: string | null) => {
          if (!url) {
            toast.error('Invalid URL')
            return
          }
          window.open(url, '_blank')
        }
        ```

2.  **Validasi di `layouts/default.vue`**:
    *   Pastikan properti `to` pada `NuxtLink` tidak pernah `undefined`.

Apakah Anda setuju dengan rencana perbaikan ini? Silakan konfirmasi untuk eksekusi.