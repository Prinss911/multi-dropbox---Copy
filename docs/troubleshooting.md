# Troubleshooting Guide

Panduan untuk mengatasi masalah umum di MultiBox.

## 🔐 Authentication Issues

### Admin Page Redirects to /drive on Refresh

**Symptoms:**
- Refreshing any `/admin/*` page redirects to `/drive`
- Flash of login page before redirect

**Solution:**
1. Ensure `waitForAuthInit()` is awaited in middleware
2. Make sure `fetchRole()` completes before admin checks:

```typescript
// middleware/auth.global.ts
if (isAdminRoute) {
    await fetchRole() // Wait for role to be fetched
    if (role.value !== 'admin') {
        return navigateTo('/access-denied')
    }
}
```

### User Shows as "Not Logged In" After Refresh

**Cause:** Auth initialization race condition

**Solution:**
Check `composables/useSupabase.ts` - ensure `waitForAuthInit` uses module-level variable:

```typescript
let authInitialized = false

export const waitForAuthInit = async () => {
    if (authInitialized) return
    if (initPromise) {
        await initPromise
        authInitialized = true
    }
}
```

---

## 🎨 UI Issues

### Hydration Mismatch Errors

**Symptoms:**
- Console errors about "Hydration text content mismatch"
- UI flickers on page load

**Cause:** Dynamic content differs between SSR and client

**Solution:**
Wrap auth-dependent content with `<ClientOnly>`:

```vue
<ClientOnly>
  <div v-if="isAdmin">Admin Content</div>
  <template #fallback>
    <div class="skeleton-loader"></div>
  </template>
</ClientOnly>
```

### User Name Shows "Pending Invite" for Active Users

**Cause:** Display logic only checked for empty name

**Solution:**
Update display to check status:

```vue
{{ user.name || (user.status === 'Invited' ? 'Pending Invite' : user.email.split('@')[0]) }}
```

---

## 🗑️ Trash Issues

### Deleted Files Still Visible

**Cause:** Wrong account being queried

**Solution:**
Ensure API uses `accountId` from query:

```typescript
// server/api/dropbox/trash.get.ts
const query = getQuery(event)
const accountId = query.accountId as string | undefined
```

### Permanent Delete Doesn't Work

**Cause:** Dropbox Personal Account limitation

**Explanation:**
- Dropbox Personal accounts do NOT support `filesPermanentlyDelete` API
- Files in trash auto-delete after 30 days
- Only Business accounts can delete permanently via API

**Workaround:**
Delete manually via [Dropbox.com](https://www.dropbox.com/deleted_files)

---

## ⚠️ Development Warnings

### `/_nuxt/` Route Warnings

```
[Vue Router warn]: No match found for location with path "/_nuxt/"
```

**Status:** IGNORE - Normal Vite development behavior

### `Symbol(route location)` Not Found

```
[Vue warn]: injection "Symbol(route location)" not found
```

**Status:** IGNORE - HMR related, doesn't affect functionality

### `/sw.js` Not Found

**Solution:** Add empty service worker stub:

```javascript
// public/sw.js
self.addEventListener('install', () => {
  self.skipWaiting();
});
```

---

## 🛠️ Quick Fixes

### Clear Cache and Rebuild

```bash
# Windows PowerShell
Remove-Item -Recurse -Force .nuxt -ErrorAction SilentlyContinue
npx nuxi prepare
npm run dev

# Linux/Mac
rm -rf .nuxt
npx nuxi prepare
npm run dev
```

### Full Reinstall

```bash
# Windows PowerShell
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install
npx nuxi prepare
npm run dev

# Linux/Mac
rm -rf node_modules package-lock.json
npm install
npx nuxi prepare
npm run dev
```

### TypeScript Type Check

```bash
npx nuxi typecheck
```

---

## 📞 Getting Help

If issues persist:
1. Check browser console for errors
2. Check terminal output for server errors
3. Create an issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Console/terminal logs
   - Browser & OS version
