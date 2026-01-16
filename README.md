# MultiBox - Multi-Dropbox Manager

Aplikasi web modern untuk mengelola multiple akun Dropbox dengan fitur file sharing, smart storage management, dan user authentication.

## ✨ Features

### 🔐 Authentication & User Management
- ✅ Supabase Auth dengan email/password
- ✅ Role-based access (Admin & User)
- ✅ Admin dashboard dengan user invitation
- ✅ Session management & auto-refresh
- ✅ Protected routes dengan middleware

### 📁 File Management
- ✅ Browse files & folders dengan navigasi breadcrumb
- ✅ Upload files dengan drag & drop
- ✅ Download files (single & bulk)
- ✅ **Virtual Folder System** - Organize files tanpa mengubah lokasi di Dropbox
- ✅ **Drag & drop to folder** - Drag files ke folder untuk organisasi
- ✅ **Remove from folder** - Tombol untuk mengeluarkan file dari folder
- ✅ File preview (image, video, audio, PDF)
- ✅ File type icons dengan colored containers
- ✅ Robust upload dengan retry & resume
- ✅ Wake lock untuk mencegah sleep saat upload besar

### 📂 Virtual Folder System
- ✅ **Persistent folders** - Folders remain visible even when empty
- ✅ **Organize locally** - Files diorganisir di aplikasi, tidak dipindahkan di Dropbox
- ✅ **Dedicated table** - Folders stored in `virtual_folders` database table
- ✅ **Drag & drop** - Drag file ke folder untuk memasukkan
- ✅ **Long-press to drag** - Hold 400ms before drag activates (prevents accidental)
- ✅ **Drop on breadcrumbs** - Drag to breadcrumb to move files out of folder
- ✅ **Click to open** - Klik folder untuk melihat isi
- ✅ **Breadcrumb navigation** - "My Files" → folder name
- ✅ **Delete empty folders** - Remove folders you don't need anymore
- ✅ **Remove button** - Tombol folder-minus untuk keluarkan file

### ✨ Bulk Operations
- ✅ Select multiple files dengan checkbox
- ✅ Select All / Deselect All
- ✅ **Floating Bulk Action Bar** - UI modern untuk bulk actions
- ✅ Bulk Delete - Hapus banyak file sekaligus
- ✅ Bulk Download - Download banyak file sekaligus
- ✅ Bulk Copy Links (untuk shares)
- ✅ Visual feedback saat file terseleksi

### 📤 Multi-File Batch Upload
- ✅ Upload multiple files sekaligus
- ✅ Parallel upload (max 5 concurrent)
- ✅ Per-file progress tracking dengan status icons
- ✅ Total size limit 1GB
- ✅ Single share link untuk semua files
- ✅ Network-aware dengan auto-pause saat offline

### 🔗 Sharing & Embedding
- ✅ Generate shareable download links
- ✅ Customizable expiration (1 day, 7 days, 30 days, never)
- ✅ **Embeddable video player** - Embed videos in external websites
- ✅ **Embed URL** - Direct URL for video players (`/embed/SHARE_ID`)
- ✅ **iFrame code** - Ready-to-use HTML embed code
- ✅ **Quick Embed** - One-click embed generation with auto share
- ✅ **View counter** - Accurate tracking of embed/stream views
- ✅ **Delete share link** - Revoke active links with inline confirmation
- ✅ **Duplicate prevention** - Prevents creating multiple links for same file
- ✅ **Expiry display** - Shows "X days left" in file list
- ✅ Download individual files atau semua sebagai ZIP
- ✅ Track download count
- ✅ Auto-detect deleted files
- ✅ Copy link to clipboard

### 💾 Smart Storage Management
- ✅ Multiple Dropbox accounts support
- ✅ Auto-select account dengan storage terbanyak
- ✅ Combined storage view di dashboard
- ✅ Per-account storage monitoring
- ✅ Visual storage usage dengan progress bars

### 👑 Admin Dashboard
- ✅ Overview statistics (storage, files, shares, downloads)
- ✅ Per-account storage breakdown
- ✅ Top downloaded files
- ✅ Recent shares activity
- ✅ User management (invite, list, role change)
- ✅ Bulk operations di semua halaman admin

### ⚙️ Account Management
- ✅ View all connected Dropbox accounts
- ✅ Add new Dropbox account dengan credential verification
- ✅ Delete account
- ✅ Storage usage per account dengan color-coded badges

### 🗑️ Trash Management
- ✅ View deleted files from all connected accounts
- ✅ Restore deleted files
- ✅ Bulk restore/delete operations
- ✅ Expiration countdown (30 days retention)
- ✅ Filter expired entries automatically

### 🧪 Testing & Quality Assurance
- ✅ **Unit Testing** - Comprehensive test suite using Vitest
- ✅ **Composable Testing** - Logic validation for critical features
- ✅ **Skeleton Loading** - Realistic loading states for better UX

## ⚠️ Known Limitations

### Dropbox Personal Account
- **Permanent Delete** - Dropbox Personal accounts do NOT support permanent delete via API
  - Files in trash will be automatically deleted after 30 days
  - To delete immediately, use [Dropbox.com](https://www.dropbox.com/deleted_files) directly
  - This is a Dropbox API limitation, not a bug

### Development Warnings
- `/_nuxt/` route warnings - Normal Vite development behavior, ignored in production
- `Symbol(route location)` warnings - May appear during HMR, does not affect functionality

## 🔒 Security

### API Authorization
All sensitive API endpoints are protected with role-based authorization:

| Endpoint Category | Protection | Description |
|------------------|------------|-------------|
| `/api/accounts/*` | Admin Only | Dropbox account management |
| `/api/admin/*` | Admin Only | Dashboard, shares, cleanup |
| `/api/dropbox/delete` | Admin Only | Admin file deletion (any file) |
| `/api/dropbox/trash` | Admin Only | Trash management |
| `/api/files/delete` | Owner | User can delete own files only |
| `/api/files/update-folder` | Owner | Virtual folder organization |
| `/api/shares/[id].delete` | Owner/Admin | Share link deletion |
| `/api/user/[id].delete` | Admin Only | User deletion |

### Public Endpoints (Intentional)
These endpoints are public by design for sharing functionality:
- `/api/shares/[id]/download` - Public file download links
- `/api/shares/[id]/stream` - Public file streaming
- `/api/shares/[id]/transcode` - HLS stream URL for videos
- `/api/shares/[id]/view` - View/play count tracking
- `/embed/[id]` - Embeddable video player page
- `/api/anonymous/*` - Anonymous file upload

### Authentication Flow
1. Supabase Auth handles user authentication
2. `permissions.ts` helper validates user roles
3. `requireAdmin` / `requireUser` middleware enforces access control
4. Client-side middleware protects routes via `auth.global.ts`

## 🚀 Setup

### 1. Prerequisites

- Node.js 18+
- Supabase account (untuk database & auth)
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
2. Enable Email Auth di Authentication settings
3. Jalankan migration untuk membuat tables:

```sql
-- Users table with roles
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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

-- Files table (for user's virtual file system)
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  filename TEXT NOT NULL,
  dropbox_path TEXT NOT NULL,
  dropbox_account_id UUID REFERENCES dropbox_accounts(id),
  size BIGINT DEFAULT 0,
  content_type TEXT,
  share_id TEXT,
  share_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Shares table
CREATE TABLE shares (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  file_id TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  files JSONB DEFAULT '[]',
  account_id UUID REFERENCES dropbox_accounts(id),
  account_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
```

### 5. Environment Variables

Copy `.env.example` ke `.env` dan isi:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# App Settings
NUXT_PUBLIC_BASE_URL=http://localhost:3000
ANONYMOUS_UPLOAD_PATH=/uploads
```

### 6. Create Admin User

1. Register user pertama via Supabase Dashboard atau API
2. Update role menjadi 'admin':
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 7. Run

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## 📁 Project Structure

```
├── pages/                 # Vue pages (file-based routing)
├── server/api/            # API endpoints
├── components/            # UI components
├── composables/           # Reusable logic (State, API, Logic)
│   ├── useFileBrowser.ts  # File browsing logic
│   ├── useFileSelection.ts # Selection state
│   ├── useFileUpload.ts   # Upload logic
│   └── ...
├── middleware/            # Nuxt middleware
├── layouts/               # Page layouts
├── tests/                 # Unit tests (Vitest)
└── server/utils/          # Server utilities
```

## 🛠 Tech Stack

- **Nuxt 3** - Vue.js framework with SSR
- **Tailwind CSS** - Utility-first styling
- **Supabase** - PostgreSQL database & Auth
- **Dropbox SDK** - Cloud storage API
- **Lucide Icons** - Beautiful icons
- **Video.js** - Video player for previews
- **Vitest** - Unit Testing Framework

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user
- `POST /api/auth/logout` - Logout user

### Accounts (Admin)
- `GET /api/accounts` - List all Dropbox accounts
- `POST /api/accounts` - Add new account
- `DELETE /api/accounts/:id` - Delete account

### Files (User)
- `GET /api/my-files` - List user's files and folders
- `POST /api/files/delete` - Delete own file (ownership verified)
- `POST /api/files/update-folder` - Update virtual folder assignment
- `POST /api/folder/create` - Create new virtual folder
- `POST /api/folder/delete` - Delete empty virtual folder

### Files (Admin)
- `GET /api/dropbox/all-files` - List all files (admin)
- `POST /api/dropbox/upload` - Upload file chunk
- `POST /api/dropbox/folder` - Create folder
- `POST /api/dropbox/delete` - Delete any file/folder
- `GET /api/dropbox/download` - Get download link
- `GET /api/dropbox/storage-all` - Get all accounts storage

### Shares
- `POST /api/shares/create` - Create share link (returns existing if active)
- `GET /api/shares/:id/download` - Get share info & download links
- `GET /api/shares/:id/download-all` - Download all files as ZIP
- `GET /api/shares/:id/stream` - Stream file content (for player)
- `GET /api/shares/:id/transcode` - Get HLS stream URL for video
- `POST /api/shares/:id/view` - Track view/play count
- `DELETE /api/shares/:id` - Delete share link (owner/admin)
- `GET /api/admin/shares` - List all shares (admin)

### Embed
- `GET /embed/:id` - Embeddable video player page (public)
- `POST /api/embed/generate` - Auto-create share & get embed URL (auth required)

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/invite` - Invite new user
- `PUT /api/admin/users/:id/role` - Change user role
- `POST /api/admin/cleanup` - Cleanup expired shares

### Anonymous Upload
- `POST /api/anonymous/session` - Get smart upload session
- `POST /api/anonymous/upload` - Upload file chunk
- `POST /api/anonymous/complete` - Complete upload & create share

## 🎨 UI Features

### Floating Bulk Action Bar
Modern floating action bar yang muncul di bagian bawah layar saat ada item terseleksi:
- Selection count badge
- Quick action buttons (Download, Delete, Copy Links)
- Clear selection button
- Smooth slide-up animation
- Konsisten di semua halaman (user files, admin files, admin shares)

### File Icons with Colored Containers
Setiap tipe file memiliki ikon dan warna container yang berbeda:
- 📄 PDF - Red
- 📝 Documents - Blue
- 📊 Spreadsheets - Green
- 🖼 Images - Purple
- 🎬 Videos - Pink
- 🎵 Audio - Indigo
- 📦 Archives - Amber
- 📁 Folders - Blue

## 📄 License

MIT
