# Security Policy

## 🔒 Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.5.x   | :white_check_mark: |
| 1.4.x   | :white_check_mark: |
| 1.3.x   | :white_check_mark: |
| 1.2.x   | :x:                |
| 1.1.x   | :x:                |
| 1.0.x   | :x:                |

## 🛡️ Security Features

### Authentication
- **Supabase Auth** - Email/password authentication with session management
- **JWT Token Verification** - All API requests verify JWT tokens
- **Role-Based Access Control** - Admin and User roles with different permissions
- **Anti-Flash Protection** - Protected pages show loading state until auth is verified (no content leak)

### API Authorization
All sensitive API endpoints are protected with role-based middleware:

| Protection Level | Helper Function | Usage |
|-----------------|-----------------|-------|
| Admin Only | `requireAdmin(event)` | Dropbox management, user admin |
| Authenticated | `requireUser(event)` | User-specific operations |
| Public | No middleware | Download links, anonymous upload |

### Protected Endpoints
```
/api/accounts/*          → Admin only
/api/admin/*             → Admin only  
/api/dropbox/delete      → Admin only
/api/dropbox/trash       → Admin only
/api/dropbox/restore     → Admin only
/api/dropbox/all-files   → Admin only
/api/user/[id].delete    → Admin only
/api/shares/[id].delete  → Owner or Admin
```

### Public Endpoints (By Design)
```
/api/shares/[id]/download   → Public (for sharing)
/api/shares/[id]/stream     → Public (for streaming)
/api/anonymous/*            → Public (for anonymous upload)
```

## 🔐 Environment Variables

Never commit these to version control:

```env
SUPABASE_SERVICE_KEY=...     # Server-side only
DROPBOX_APP_SECRET=...       # Server-side only
```

Use `.env` file locally and configure these in your hosting platform (Cloudflare Pages, Vercel, etc.).

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email the maintainer directly
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work on a fix ASAP.

## ✅ Security Checklist for Contributors

Before submitting a PR:

- [ ] All sensitive API endpoints use `requireAdmin` or `requireUser`
- [ ] No hardcoded secrets or credentials in code
- [ ] Environment variables used for all sensitive config
- [ ] User input is validated before use
- [ ] No sensitive data logged to console
- [ ] Error messages don't expose internal details

## 🔄 Security Updates

Security updates are released as patch versions (e.g., 1.1.1).
Always keep your installation up to date.

```bash
npm update
```
