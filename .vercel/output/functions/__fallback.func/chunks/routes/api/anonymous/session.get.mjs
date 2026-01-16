import { d as defineEventHandler, q as getQuery, h as getAccounts, c as createError, f as createDropboxClient } from '../../../_/nitro.mjs';
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
    throw new Error(`Missing credentials for account`);
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
const session_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const fileSize = Number(query.fileSize) || 0;
    const accounts = await getAccounts();
    if (accounts.length === 0) {
      throw createError({
        statusCode: 503,
        statusMessage: "No accounts available for upload"
      });
    }
    const accountsWithStorage = await Promise.all(accounts.map(async (account) => {
      try {
        const accessToken = await getAccessTokenForAccount(account);
        const dbx = createDropboxClient(accessToken);
        const space = await dbx.usersGetSpaceUsage();
        let allocated = 0;
        if (space.result.allocation[".tag"] === "individual") {
          allocated = space.result.allocation.allocated;
        } else if (space.result.allocation[".tag"] === "team") {
          allocated = space.result.allocation.allocated;
        }
        return {
          ...account,
          accessToken,
          used: space.result.used,
          allocated,
          available: allocated - space.result.used
        };
      } catch (err) {
        console.error(`Error checking storage for ${account.name}:`, err);
        return null;
      }
    }));
    const validAccounts = accountsWithStorage.filter((acc) => acc !== null).filter((acc) => acc.available >= fileSize);
    if (validAccounts.length === 0) {
      throw createError({
        statusCode: 507,
        statusMessage: "Insufficient storage space across all accounts"
      });
    }
    validAccounts.sort((a, b) => b.available - a.available);
    const bestAccount = validAccounts[0];
    return {
      accessToken: bestAccount.accessToken,
      accountId: bestAccount.id,
      accountName: bestAccount.name,
      uploadPath: "/Uploads",
      // Default upload folder
      availableSpace: bestAccount.available
    };
  } catch (error) {
    if (error.statusCode) throw error;
    console.error("Anonymous session error:", error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to create upload session"
    });
  }
});

export { session_get as default };
//# sourceMappingURL=session.get.mjs.map
