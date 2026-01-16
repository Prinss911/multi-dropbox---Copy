# Changelog

All notable changes to this project will be documented in this file.

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

