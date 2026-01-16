import { d as defineEventHandler, g as getRouterParam, q as getQuery, c as createError, D as getShareById, h as getAccounts, f as createDropboxClient } from '../../../../_/nitro.mjs';
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
const transcode_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const shareId = getRouterParam(event, "id");
  const query = getQuery(event);
  const fileIndex = query.fileIndex !== void 0 ? parseInt(query.fileIndex) : 0;
  if (!shareId) {
    throw createError({ statusCode: 400, statusMessage: "Share ID is required" });
  }
  try {
    const share = await getShareById(shareId);
    if (!share) throw createError({ statusCode: 404, statusMessage: "Share link not found" });
    if (share.expiresAt && new Date(share.expiresAt) < /* @__PURE__ */ new Date()) {
      throw createError({ statusCode: 410, statusMessage: "This share link has expired" });
    }
    let files = share.files || [];
    if (files.length === 0 && share.filePath) {
      files = [{
        name: share.fileName,
        path: share.filePath,
        size: 0
      }];
    }
    if (files.length === 0 || fileIndex < 0 || fileIndex >= files.length) {
      throw createError({ statusCode: 400, statusMessage: "Invalid file index" });
    }
    const file = files[fileIndex];
    const accounts = await getAccounts();
    const account = accounts.find((a) => a.id === share.accountId);
    if (!account) throw createError({ statusCode: 404, statusMessage: "Account not found" });
    const accessToken = await getAccessTokenForAccount(account);
    const dbx = createDropboxClient(accessToken);
    let publicUrl = "";
    let filePath = file.path;
    if (!filePath.startsWith("/")) {
      filePath = "/" + filePath;
    }
    console.log("[Transcode] Attempting to share path:", filePath, "with account:", account.id);
    try {
      console.log("[Transcode] Creating shared link...");
      const created = await dbx.sharingCreateSharedLinkWithSettings({ path: filePath });
      publicUrl = created.result.url;
      console.log("[Transcode] Created new link:", publicUrl);
    } catch (e) {
      console.error("Dropbox sharing error:", JSON.stringify(e, null, 2));
      if (((_b = (_a = e.error) == null ? void 0 : _a.error) == null ? void 0 : _b[".tag"]) === "shared_link_already_exists") {
        console.log("[Transcode] Link already exists, extracting from error...");
        const existingMeta = (_e = (_d = (_c = e.error) == null ? void 0 : _c.error) == null ? void 0 : _d.shared_link_already_exists) == null ? void 0 : _e.metadata;
        if (existingMeta == null ? void 0 : existingMeta.url) {
          publicUrl = existingMeta.url;
          console.log("[Transcode] Got existing link from error:", publicUrl);
        } else {
          console.error("[Transcode] Could not extract URL from error metadata:", JSON.stringify(e.error, null, 2));
          throw createError({ statusCode: 502, statusMessage: "Shared link exists but could not extract URL" });
        }
      } else {
        console.error("Dropbox API Full Error:", JSON.stringify(e, null, 2));
        throw createError({ statusCode: 502, statusMessage: "Failed to generate public link: " + (((_f = e.error) == null ? void 0 : _f.error_summary) || e.message || "Unknown error") });
      }
    }
    console.log("Using public URL for scraping:", publicUrl);
    const html = await $fetch(publicUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const prefetchMatches = html.matchAll(/registerStreamedPrefetch\s*\(\s*"[^"]*"\s*,\s*"([^"]*)"/g);
    let hlsUrl = null;
    for (const match of prefetchMatches) {
      const blob = match[1];
      try {
        const decoded = Buffer.from(blob, "base64").toString("utf-8");
        const urlMatch = decoded.match(/(https:\/\/[a-zA-Z0-9-]+\.previews\.dropboxusercontent\.com\/p\/hls_master_playlist\/[^"\s]+\.m3u8[^"\s]*)/);
        if (urlMatch) {
          hlsUrl = urlMatch[1];
          break;
        }
      } catch (err) {
      }
    }
    if (!hlsUrl) {
      const genericMatch = html.match(/(https:\/\/[^"]+\.m3u8[^"]*)/);
      throw createError({ statusCode: 422, statusMessage: "Could not extract streaming URL from Dropbox" });
    }
    return {
      url: hlsUrl
    };
  } catch (error) {
    console.error("Transcode error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || "Transcode failed"
    });
  }
});

export { transcode_get as default };
//# sourceMappingURL=transcode.get.mjs.map
