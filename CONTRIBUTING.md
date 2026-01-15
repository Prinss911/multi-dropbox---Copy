# Contributing to MultiBox

Terima kasih atas minat Anda untuk berkontribusi ke MultiBox! Berikut adalah panduan untuk membantu Anda memulai.

## 🚀 Quick Start

1. Fork repository ini
2. Clone fork Anda:
   ```bash
   git clone https://github.com/YOUR_USERNAME/multi-dropbox.git
   cd multi-dropbox
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` ke `.env` dan isi dengan credentials Anda
5. Jalankan development server:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
├── pages/                 # Vue pages (file-based routing)
├── server/api/            # API endpoints
├── components/            # Vue components
├── composables/           # Vue composables
├── middleware/            # Nuxt middleware
├── layouts/               # Page layouts
├── assets/                # Static assets
└── server/utils/          # Server utilities
```

## 🎯 Development Guidelines

### Code Style
- Gunakan TypeScript untuk type safety
- Ikuti Vue 3 Composition API dengan `<script setup>`
- Gunakan Tailwind CSS untuk styling
- Beri nama file dengan kebab-case

### Commit Messages
Gunakan format [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` Fitur baru
- `fix:` Bug fix
- `docs:` Dokumentasi
- `style:` Formatting, tidak ada perubahan kode
- `refactor:` Refactoring kode
- `test:` Menambah atau memperbaiki tests
- `chore:` Maintenance

Contoh:
```
feat: add bulk download feature
fix: resolve SSR navigator undefined error
docs: update README with new features
```

### Pull Request
1. Buat branch baru dari `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Buat perubahan Anda
3. Test secara lokal
4. Commit dengan pesan yang jelas
5. Push ke fork Anda
6. Buat Pull Request ke repository utama

### Testing
- Test semua fitur secara manual sebelum submit PR
- Pastikan tidak ada TypeScript errors
- Pastikan halaman load tanpa SSR errors

## 🐛 Reporting Bugs

Saat melaporkan bug, sertakan:
1. Deskripsi singkat masalah
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots jika ada
6. Browser & OS version

## 💡 Feature Requests

Kami menerima ide untuk fitur baru! Saat mengajukan:
1. Jelaskan use case
2. Jelaskan solusi yang diinginkan
3. Jelaskan alternatif yang sudah dipertimbangkan

## 📝 License

Dengan berkontribusi, Anda setuju bahwa kontribusi Anda akan dilisensikan di bawah MIT License.
