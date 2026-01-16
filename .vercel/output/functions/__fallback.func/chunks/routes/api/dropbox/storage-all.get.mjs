import { d as defineEventHandler, h as getAccounts, f as createDropboxClient, c as createError } from '../../../_/nitro.mjs';
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
    throw new Error(`Missing credentials for account: ${account.name}`);
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
const storageAll_get = defineEventHandler(async (event) => {
  try {
    const accounts = await getAccounts();
    if (accounts.length === 0) {
      return {
        accounts: [],
        totalUsed: 0,
        totalAllocated: 0
      };
    }
    const storagePromises = accounts.map(async (account) => {
      try {
        const accessToken = await getAccessTokenForAccount(account);
        const dbx = createDropboxClient(accessToken);
        const response = await dbx.usersGetSpaceUsage();
        const used = response.result.used;
        const allocated = response.result.allocation;
        let total = 0;
        if (allocated[".tag"] === "individual") {
          total = allocated.allocated;
        } else if (allocated[".tag"] === "team") {
          total = allocated.allocated;
        }
        return {
          accountId: account.id,
          accountName: account.name,
          used,
          total,
          error: null
        };
      } catch (err) {
        console.error(`Error fetching storage for ${account.name}:`, err.message);
        return {
          accountId: account.id,
          accountName: account.name,
          used: 0,
          total: 0,
          error: err.message
        };
      }
    });
    const results = await Promise.all(storagePromises);
    const totalUsed = results.reduce((sum, r) => sum + r.used, 0);
    const totalAllocated = results.reduce((sum, r) => sum + r.total, 0);
    return {
      accounts: results,
      totalUsed,
      totalAllocated
    };
  } catch (error) {
    console.error("Storage all error:", error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to get storage info"
    });
  }
});

export { storageAll_get as default };
//# sourceMappingURL=storage-all.get.mjs.map
