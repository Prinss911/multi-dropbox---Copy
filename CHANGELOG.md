# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-01-16

### Added

#### Persistent Virtual Folders 📁
- **New `virtual_folders` table** - Dedicated database table for storing folders
- **Folders persist when empty** - Folders now remain visible even without files
- **Delete empty folders** - New API endpoint `/api/folder/delete` to remove empty folders
- **Data migration** - Existing virtual folder tags automatically migrated to new table

#### Improved Drag & Drop UX 🖱️
- **Long-press to drag** - Drag operation only activates after 400ms hold (prevents accidental drags)
- **Visual feedback** - Blue ring and slight scale when long-press activates
- **Haptic feedback** - Vibration on mobile devices when drag ready
- **Drop on breadcrumbs** - Drag files to breadcrumb navigation to move them out of folders
- **No more cursor-move on hover** - Clean `cursor-pointer` instead of immediate move cursor

#### Link Expiration Display ⏰
- **"X days left" display** - Shows remaining days until share link expires in file list
- **Color-coded urgency** - Red for ≤3 days, orange for ≤7 days
- **Expires today/tomorrow** - Human-readable labels for imminent expiration

#### Embeddable Video Player 🎬
- **Embed page** - New `/embed/[id]` page for embedding videos in external websites
- **Full-screen player** - Clean player without UI chrome (no header/footer)
- **Auto-play** - Videos automatically play when embedded
- **Embed URL** - Direct URL for use in video players (`/embed/SHARE_ID`)
- **iFrame Code** - Ready-to-use HTML iframe code for websites
- **Public access** - Embed pages accessible without authentication
- **Quick Embed button** - One-click embed generation (auto-creates share link)
- **View counter** - Track embed views via `/api/shares/[id]/view` endpoint

#### Share Link Management 🔗
- **Delete share link** - Users can delete/revoke active share links from Share Modal
- **Inline confirmation** - Beautiful confirmation UI instead of browser dialog
- **Duplicate prevention** - System prevents creating new links if active link exists
- **Return existing link** - If share already exists, API returns existing link instead of creating duplicate
- **Pre-populate modal** - Share Modal auto-loads existing link info when opened
- **Generate embed API** - New `/api/embed/generate` endpoint for auto-creating shares

### Changed
- **Folder creation** - Now inserts into `virtual_folders` table instead of `files` table
- **API response** - `my-files.get.ts` returns folders with `isVirtualFolder: true` flag
- **Frontend merging** - Combines persistent folders with virtual tag folder counts
- **Share Modal UI** - Added tabs for "Share Link" and "Embed Code"
- **Stream counter removed** - View tracking moved to dedicated endpoint to avoid double-counting

### Fixed
- **Share delete authorization** - Now checks file ownership for legacy shares without userId
- **getShareById missing userId** - Fixed function to return userId for ownership checks

### Database
- **New table: `virtual_folders`**
  - `id` (UUID) - Primary key
  - `user_id` (UUID) - Foreign key to auth.users
  - `name` (TEXT) - Folder name
  - `created_at` (TIMESTAMPTZ)
  - `UNIQUE(user_id, name)` - One folder name per user
- **RLS enabled** - Row Level Security policies for user isolation

### Technical
- Created `pages/embed/[id].vue` for embeddable video player with view tracking
- Created `server/api/shares/[id]/view.post.ts` for accurate view counting
- Created `server/api/embed/generate.post.ts` for one-click embed generation
- Updated `middleware/auth.global.ts` to allow public access to `/embed` routes
- Updated `server/api/shares/create.post.ts` with duplicate share prevention
- Updated `server/api/shares/[id].delete.ts` with file ownership fallback
- Updated `server/api/shares/[id]/stream.get.ts` - removed counter (moved to view endpoint)
- Updated `server/utils/shares.ts` - getShareById now returns userId
- Updated `pages/drive/files.vue` with embed helpers, delete share, inline confirmation
- Updated `types/supabase.ts` with `virtual_folders` table types
- Updated `server/api/my-files.get.ts` to fetch from `virtual_folders`
- Updated `server/api/folder/create.post.ts` to use new table
- Created `server/api/folder/delete.post.ts` for folder deletion

---

## [1.2.0] - 2026-01-16

### Added

#### Virtual Folder System (Local Organization)
- **Virtual folders** - Organize files into folders without moving them in Dropbox
- **Database column `virtual_folder`** - Added to `files` table for local organization
- **Drag & drop to folder** - Drag files onto folders to organize them
- **Remove from folder** - Button to move files back to root (folder-minus icon)
- **Click to open folder** - Click virtual folder to see files inside
- **Breadcrumb navigation** - "My Files" → folder name path with proper Home icon
- **Auto-hide empty folders** - Virtual folders disappear when no files are assigned

#### User File Management
- **User delete endpoint** - `/api/files/delete` allows users to delete their own files only
- **Ownership verification** - Backend verifies file belongs to user before deletion
- **Bulk delete for users** - Users can delete multiple files at once

### Security 🔒
- **User-safe delete** - New `/api/files/delete` endpoint verifies file ownership
- **UUID validation** - Validates file IDs to prevent virtual folder deletion attempts
- **Admin-only delete preserved** - `/api/dropbox/delete` remains admin-only for all files

### Fixed

#### Authorization
- **403 errors for non-admin users** - Fixed layout calling admin-only APIs for all users
- **fetchAccounts admin-gated** - Only admins call `/api/accounts` and `/api/admin/dashboard`
- **Conditional data loading** - Dashboard and storage info only fetched for admins

#### Hydration
- **Dashboard hydration mismatch** - Wrapped admin dashboard content in `<ClientOnly>`
- **Consistent SSR/CSR rendering** - Added fallback loading states

#### File Operations
- **Invalid account ID handling** - Gracefully handles files with corrupt dropbox_account_id
- **Virtual folder delete prevention** - Cannot delete virtual folders (only files)
- **Grid view folder click** - Fixed to use `handleFolderClick` for virtual folders

#### UI/UX
- **Breadcrumb "My Files"** - Always shows Home icon + "My Files" label
- **Breadcrumb navigation** - Click Home to return to root from virtual folder
- **Remove from folder button** - Orange folder-minus icon in actions (list & grid view)

### Changed
- **Move file logic** - Now updates `virtual_folder` in database instead of Dropbox API
- **File list filtering** - Shows virtual folders + unorganized files at root
- **Drag & drop handlers** - Separate internal (file move) vs external (file upload) drag

## [1.1.0] - 2026-01-16

### Added
- **@nuxt/devtools** - Explicitly installed DevTools module for better development experience
- **Service Worker stub** - Added `public/sw.js` to prevent browser 404 warnings
- **Trash page info message** - Added informational message about Dropbox Personal Account limitations

### Security 🔒

#### API Authorization Hardening
- **Added `requireAdmin` protection** to all sensitive API endpoints:
  - `/api/accounts/add.post.ts` - Only admins can add Dropbox accounts
  - `/api/accounts/index.get.ts` - Only admins can list accounts
  - `/api/admin/dashboard.get.ts` - Only admins can view dashboard
  - `/api/admin/shares.get.ts` - Only admins can view all shares
  - `/api/admin/cleanup.post.ts` - Only admins can run cleanup
  - `/api/dropbox/all-files.get.ts` - Only admins can view all files
  - `/api/dropbox/delete.post.ts` - Only admins can delete files
  - `/api/dropbox/bulk-delete.post.ts` - Only admins can bulk delete
  - `/api/dropbox/permanent-delete.post.ts` - Only admins can permanently delete
  - `/api/dropbox/restore.post.ts` - Only admins can restore files
  - `/api/dropbox/trash.get.ts` - Only admins can view trash
- **Leveraged existing `permissions.ts`** helper functions for consistent authorization

### Fixed

#### Authentication & Middleware
- **Admin page refresh redirect bug** - Fixed issue where refreshing admin pages would incorrectly redirect to `/drive`
- **waitForAuthInit timing** - Improved auth initialization to properly wait for authentication before route protection
- **fetchRole race condition** - Ensured role is fetched before admin route access checks

#### Hydration Issues
- **Layout hydration mismatches** - Wrapped auth-dependent components in `<ClientOnly>`:
  - Navigation sidebar
  - User profile section
  - Storage info section
  - Header title and accounts badge
  - Management section
- **useSupabase composable** - Fixed `waitForAuthInit` to use module-level variable instead of `useState` to prevent "injection not found" warnings

#### Trash Management
- **Multi-account trash API** - Fixed `/api/dropbox/trash` to correctly use `accountId` from query parameters instead of always using active account
- **Expired files filter** - Added filtering to exclude trash entries that have expired (`daysRemaining <= 0`)
- **Removed verbose logging** - Removed "Could not get revisions" console log spam

#### User Interface
- **User name display** - Fixed "Pending Invite" showing for active users with empty names; now shows email prefix instead
- **Account badge consistency** - Updated shares page account badge style to match dashboard (`rounded-full`, `whitespace-nowrap`, `truncate`)

#### Routing
- **Root redirect** - Added server-side route rule to redirect `/` to `/drive/upload` (public upload page)
- **Index page** - Simplified `pages/index.vue` to use routeRules instead of client-side navigation

### Changed
- **DevTools configuration** - Added timeline feature to devtools config
- **Route rules** - Added `/` → `/drive/upload` redirect in `nuxt.config.ts`

### Technical
- Updated `types/supabase.ts` - Added `files` and `user_id` fields to shares Insert/Update types
- Updated `server/utils/shares.ts` - Added `share_link` field to `createShare` function
- Updated `getAccountColor` function in shares.vue to accept optional second parameter

---

## [1.0.0] - 2026-01-15

### Added
- Initial release
- Multi-Dropbox account management
- File browser with upload/download
- Anonymous file sharing with expiration
- Admin dashboard with statistics
- User authentication with Supabase
- Role-based access control (Admin/User)

