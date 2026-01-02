# MultiBox - Multi-Dropbox Manager

Aplikasi web modern untuk mengelola multiple akun Dropbox dengan fitur file sharing dan smart storage management.

## ✨ Features

### File Management
- ✅ Browse files & folders dengan navigasi breadcrumb
- ✅ Upload files dengan drag & drop
- ✅ Download files
- ✅ Create, rename, delete folders
- ✅ Bulk operations (select, delete, move, download)
- ✅ File type icons dengan warna

### Multi-File Batch Upload
- ✅ Upload multiple files sekaligus
- ✅ Parallel upload (max 5 concurrent)
- ✅ Per-file progress tracking
- ✅ Total size limit 1GB
- ✅ Single share link untuk semua files

### Anonymous Sharing
- ✅ Generate shareable download links
- ✅ Customizable expiration (1 min, 1 day, 7 days, 30 days)
- ✅ Download individual files atau semua sebagai ZIP
- ✅ Track download count
- ✅ Auto-detect deleted files

### Smart Storage Management
- ✅ Multiple Dropbox accounts support
- ✅ Auto-select account dengan storage terbanyak
- ✅ Combined storage view di sidebar
- ✅ Per-account storage monitoring
- ✅ Visual storage usage badges

### Account Management (/accounts)
- ✅ View all connected accounts
- ✅ Add new Dropbox account dengan credential verification
- ✅ Delete account
- ✅ Storage usage per account dengan color-coded badges

## 🚀 Setup

### 1. Prerequisites

- Node.js 18+
- Supabase account (untuk database)
- Dropbox Developer account

### 2. Buat Dropbox App

1. Buka [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Klik **"Create app"**
3. Pilih **"Scoped access"** → **"Full Dropbox"**
4. Beri nama aplikasi (contoh: `multibox-manager`)
5. Set Permissions:
   - `files.metadata.read`
   - `files.metadata.write`
   - `files.content.read`
   - `files.content.write`
   - `account_info.read`

### 3. Generate Refresh Token

1. Buka URL berikut (ganti `YOUR_APP_KEY`):
```
https://www.dropbox.com/oauth2/authorize?client_id=YOUR_APP_KEY&response_type=code&token_access_type=offline
```

2. Login dan klik **"Allow"**
3. Copy Authorization Code
4. Exchange untuk refresh token:
```bash
curl -X POST https://api.dropbox.com/oauth2/token \
  -d code=YOUR_AUTHORIZATION_CODE \
  -d grant_type=authorization_code \
  -d client_id=YOUR_APP_KEY \
  -d client_secret=YOUR_APP_SECRET
```

### 4. Setup Supabase

1. Buat project di [Supabase](https://supabase.com)
2. Jalankan migration untuk membuat tables:

```sql
-- Dropbox accounts table
CREATE TABLE dropbox_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  account_id TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  app_key TEXT NOT NULL,
  app_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Shares table
CREATE TABLE shares (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  files JSONB DEFAULT '[]',
  account_id UUID REFERENCES dropbox_accounts(id),
  account_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  download_count INTEGER DEFAULT 0
);
```

### 5. Environment Variables

Copy `.env.example` ke `.env` dan isi:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# App Settings
NUXT_PUBLIC_BASE_URL=http://localhost:3000
ANONYMOUS_UPLOAD_PATH=/uploads
```

### 6. Tambah Akun Dropbox

1. Jalankan app: `npm run dev`
2. Buka `/accounts`
3. Klik "Add Account"
4. Masukkan:
   - Account Name
   - App Key
   - App Secret
   - Refresh Token

### 7. Run

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## 📁 Project Structure

```
├── pages/
│   ├── index.vue          # File browser
│   ├── recent.vue         # Recent files
│   ├── trash.vue          # Deleted files
│   ├── upload.vue         # Anonymous upload
│   ├── accounts.vue       # Account management
│   └── download/[id].vue  # Share download page
├── server/api/
│   ├── accounts/          # Account CRUD
│   ├── dropbox/           # Dropbox operations
│   ├── shares/            # Share link management
│   └── anonymous/         # Anonymous upload APIs
├── composables/           # Vue composables
├── components/            # UI components
└── server/utils/          # Server utilities
```

## 🛠 Tech Stack

- **Nuxt 3** - Vue.js framework with SSR
- **Tailwind CSS** - Utility-first styling
- **Supabase** - PostgreSQL database
- **Dropbox SDK** - Cloud storage API
- **Lucide Icons** - Beautiful icons

## 📝 API Endpoints

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Add new account
- `DELETE /api/accounts/:id` - Delete account

### Files
- `GET /api/dropbox/files` - List files
- `POST /api/dropbox/folder` - Create folder
- `POST /api/dropbox/delete` - Delete file/folder
- `GET /api/dropbox/download` - Get download link
- `GET /api/dropbox/storage-all` - Get all accounts storage

### Shares
- `GET /api/shares/:id/download` - Get share info & download links
- `GET /api/shares/:id/download-all` - Download all files as ZIP
- `POST /api/anonymous/session` - Get smart upload session
- `POST /api/anonymous/complete` - Complete upload & create share

## 📄 License

MIT
# multi-dropbox
