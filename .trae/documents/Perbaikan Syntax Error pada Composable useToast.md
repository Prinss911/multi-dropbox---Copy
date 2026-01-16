Saya telah menemukan penyebab utama error tersebut.

## Analisis Masalah (Root Cause Analysis)
Error `Expected ">" but found "setup"` pada `composables/useToast.ts` disebabkan oleh **kesalahan sintaks**.
File tersebut adalah file TypeScript (`.ts`), namun di dalamnya terdapat tag `<script setup lang="ts">` yang seharusnya hanya digunakan dalam file Vue Single File Component (`.vue`).

File composable (`.ts`) seharusnya hanya berisi kode TypeScript murni (export function/variable), bukan struktur template Vue.

## Rencana Perbaikan
1.  **Koreksi `composables/useToast.ts`**:
    *   Menghapus tag `<script setup lang="ts">` di baris pertama.
    *   Memastikan tidak ada tag penutup `</script>` di akhir file (jika ada).
    *   Kode logika di dalamnya sudah benar (TypeScript), jadi hanya perlu menghapus wrapper XML-nya.

2.  **Pemeriksaan Menyeluruh**:
    *   Saya telah memeriksa file composable lain (`useAccounts.ts`) dan strukturnya sudah benar (murni TypeScript).
    *   Saya akan memverifikasi ulang semua file di folder `composables/` untuk memastikan konsistensi.

3.  **Verifikasi**:
    *   Setelah perbaikan, server Vite akan otomatis melakukan *Hot Module Replacement* (HMR).
    *   Error 500 seharusnya hilang.

Apakah Anda setuju untuk melanjutkan perbaikan ini? Silakan konfirmasi.