# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

#### Floating Bulk Action Bar
- Modern floating action bar yang muncul di bagian bawah layar saat ada item terseleksi
- Tombol Download, Delete, Copy Links dengan ikon
- Selection count badge dengan warna biru
- Clear selection button (X)
- Smooth slide-up/down animation
- Diterapkan di semua halaman: `/drive/files`, `/admin/files`, `/admin/shares`

#### Bulk Operations
- Select multiple files dengan checkbox di setiap baris
- Select All / Deselect All di header table
- Bulk Delete - Hapus banyak file sekaligus dengan konfirmasi
- Bulk Download - Download banyak file satu per satu
- Bulk Copy Links - Copy semua URL share ke clipboard (admin shares)
- Visual feedback (highlight biru) saat file terseleksi

#### Virtual Folder System
- Create folders dengan tombol "New Folder"
- Breadcrumb navigation untuk navigasi folder
- Navigate ke folder dengan klik nama folder
- Files diorganisir dalam struktur virtual folder

#### File Icons with Colored Containers
- Setiap tipe file memiliki container berwarna
- Warna konsisten: PDF (red), Docs (blue), Spreadsheet (green), Images (purple), Videos (pink), Audio (indigo), Archives (amber)
- Folder dengan ikon dan warna biru khusus

#### Robust Upload System
- Retry otomatis saat gagal upload
- Network-aware: pause saat offline, resume saat online
- Wake lock untuk mencegah device sleep saat upload besar
- Progress tracking per-file dengan status icons

### Changed
- Upgraded icon rendering ke container-based system untuk visual yang lebih premium
- Removed old bulk action buttons dari header (diganti Floating Action Bar)
- Improved file filtering logic untuk virtual folder navigation
- Renamed internal `navigateTo` function ke `navigateToFolder` untuk menghindari konflik dengan Nuxt

### Fixed
- Fixed SSR error "navigator is undefined" dengan menginisialisasi `isOnline` ke `true` dan update di `onMounted`
- Fixed file tidak muncul di root karena filter terlalu ketat
- Fixed TypeScript type errors pada headers authorization

## [1.0.0] - 2026-01-15

### Added
- Initial release
- Multi-Dropbox account management
- File browser with upload/download
- Anonymous file sharing with expiration
- Admin dashboard with statistics
- User authentication with Supabase
- Role-based access control (Admin/User)
