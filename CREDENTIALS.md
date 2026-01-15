# Development Credentials

## Admin Account
| Field | Value |
|-------|-------|
| **Email** | admin@multidrop.com |
| **Password** | MultiDrop2026! |
| **Role** | Admin |

## Standard User Account
| Field | Value |
|-------|-------|
| **Email** | user@multidrop.com |
| **Password** | MultiDrop2026! |
| **Role** | User |

## Creating New Users

### Via Admin Dashboard
1. Login sebagai Admin
2. Buka `/admin/users`
3. Klik "Invite User"
4. Masukkan email address
5. User akan menerima email invitation

### Via Supabase Dashboard
1. Buka Supabase Dashboard → Authentication → Users
2. Klik "Invite user"
3. Masukkan email dan klik "Invite"
4. Update role di table `users` jika diperlukan

## Changing User Role

```sql
-- Make user an admin
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

-- Demote admin to user
UPDATE users SET role = 'user' WHERE email = 'admin@example.com';
```

## Role Permissions

### Admin
- Access semua halaman
- Manage Dropbox accounts
- View all files across all users
- Manage share links
- Invite & manage users
- View dashboard statistics

### User
- Access `/drive/*` pages only
- Upload & manage own files
- Create share links
- View own dashboard

## ⚠️ Security Notes

> **Warning:** These credentials are for **development only**.
> 
> Before deploying to production:
> 1. Change all default passwords
> 2. Use strong, unique passwords
> 3. Enable 2FA if available
> 4. Review and restrict RLS policies
> 5. Rotate Dropbox refresh tokens regularly
