import { d as defineEventHandler, r as readBody, c as createError, h as getAccounts, f as createDropboxClient } from '../../../_/nitro.mjs';
import 'crypto';
import 'util';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:crypto';
import 'node:util';
import 'node:path';
import 'node:process';
import 'node:tty';
import 'node:fs';

const tokenCache = /* @__PURE__ */ new Map();
async function getAccessTokenForAccount(account) {
  const now = Date.now();
  const cached = tokenCache.get(account.id);
  if (cached && cached.expiry > now + 5 * 60 * 1e3) {
    return cached.token;
  }
  if (!account.refresh_token || !account.app_key || !account.app_secret) {
    throw new Error(`Missing credentials for account ${account.name}`);
  }
  const response = await $fetch("https://api.dropbox.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
      client_id: account.app_key,
      client_secret: account.app_secret
    }).toString()
  });
  const expiry = now + response.expires_in * 1e3;
  tokenCache.set(account.id, { token: response.access_token, expiry });
  return response.access_token;
}
const allocate_post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { files } = body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Files array is required"
      });
    }
    const accounts = await getAccounts();
    if (accounts.length === 0) {
      throw createError({
        statusCode: 503,
        statusMessage: "No accounts available for upload"
      });
    }
    console.log(`[Allocate] Allocating ${files.length} files across ${accounts.length} accounts...`);
    const accountsWithStorage = await Promise.all(
      accounts.map(async (account) => {
        try {
          const accessToken = await getAccessTokenForAccount(account);
          const dbx = createDropboxClient(accessToken);
          const space = await dbx.usersGetSpaceUsage();
          let allocated = 0;
          if (space.result.allocation[".tag"] === "individual") {
            allocated = space.result.allocation.allocated || 0;
          } else if (space.result.allocation[".tag"] === "team") {
            allocated = space.result.allocation.allocated || 0;
          }
          const available = allocated - space.result.used;
          console.log(`[Allocate] ${account.name}: ${Math.round(available / 1024 / 1024)} MB available`);
          return {
            account,
            accessToken,
            available
          };
        } catch (err) {
          console.error(`[Allocate] Error checking ${account.name}:`, err);
          return null;
        }
      })
    ).then((results) => results.filter((r) => r !== null));
    if (accountsWithStorage.length === 0) {
      throw createError({
        statusCode: 503,
        statusMessage: "No accessible accounts available"
      });
    }
    accountsWithStorage.sort((a, b) => b.available - a.available);
    const sortedFiles = [...files].sort((a, b) => b.size - a.size);
    const remainingSpace = /* @__PURE__ */ new Map();
    accountsWithStorage.forEach((a) => remainingSpace.set(a.account.id, a.available));
    const allocations = [];
    const unallocated = [];
    for (const file of sortedFiles) {
      let allocated = false;
      for (const acc of accountsWithStorage) {
        const remaining = remainingSpace.get(acc.account.id);
        if (remaining >= file.size) {
          allocations.push({
            index: file.index,
            name: file.name,
            size: file.size,
            accountId: acc.account.id,
            accountName: acc.account.name,
            accessToken: acc.accessToken
          });
          remainingSpace.set(acc.account.id, remaining - file.size);
          allocated = true;
          console.log(`[Allocate] ${file.name} (${Math.round(file.size / 1024 / 1024)}MB) \u2192 ${acc.account.name}`);
          break;
        }
      }
      if (!allocated) {
        unallocated.push(file);
        console.warn(`[Allocate] Cannot fit ${file.name} (${Math.round(file.size / 1024 / 1024)}MB) - no account has enough space`);
      }
    }
    allocations.sort((a, b) => a.index - b.index);
    const totalAvailable = accountsWithStorage.reduce((sum, a) => sum + a.available, 0);
    const totalRequested = files.reduce((sum, f) => sum + f.size, 0);
    if (unallocated.length > 0) {
      throw createError({
        statusCode: 507,
        statusMessage: `Insufficient storage. Need ${Math.round(totalRequested / 1024 / 1024)}MB but only ${Math.round(totalAvailable / 1024 / 1024)}MB available across all accounts.`
      });
    }
    const byAccount = /* @__PURE__ */ new Map();
    allocations.forEach((a) => {
      byAccount.set(a.accountName, (byAccount.get(a.accountName) || 0) + 1);
    });
    console.log(`[Allocate] Allocation complete:`, Object.fromEntries(byAccount));
    return {
      success: true,
      allocations,
      summary: {
        totalFiles: files.length,
        totalSize: totalRequested,
        accountsUsed: byAccount.size,
        distribution: Object.fromEntries(byAccount)
      }
    };
  } catch (error) {
    if (error.statusCode) throw error;
    console.error("[Allocate] Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to allocate files"
    });
  }
});

export { allocate_post as default };
//# sourceMappingURL=allocate.post.mjs.map
