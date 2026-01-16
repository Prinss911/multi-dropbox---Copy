import { d as defineEventHandler, g as getRouterParam, q as getQuery, c as createError, D as getShareById, h as getAccounts, f as createDropboxClient, o as getHeader, G as setResponseStatus, x as setHeader } from '../../../../_/nitro.mjs';
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
const stream_get = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const shareId = getRouterParam(event, "id");
  const query = getQuery(event);
  const fileIndex = query.fileIndex !== void 0 ? parseInt(query.fileIndex) : 0;
  if (!shareId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Share ID is required"
    });
  }
  try {
    const share = await getShareById(shareId);
    if (!share) {
      throw createError({
        statusCode: 404,
        statusMessage: "Share link not found"
      });
    }
    if (share.expiresAt && new Date(share.expiresAt) < /* @__PURE__ */ new Date()) {
      throw createError({
        statusCode: 410,
        statusMessage: "This share link has expired"
      });
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
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid file index"
      });
    }
    const file = files[fileIndex];
    const accounts = await getAccounts();
    const account = accounts.find((a) => a.id === share.accountId);
    if (!account) {
      throw createError({
        statusCode: 404,
        statusMessage: "Account not found"
      });
    }
    const accessToken = await getAccessTokenForAccount(account);
    const dbx = createDropboxClient(accessToken);
    const linkResponse = await dbx.filesGetTemporaryLink({ path: file.path });
    const downloadUrl = linkResponse.result.link;
    const ext = ((_a = file.name.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
    const contentTypes = {
      // Video
      mp4: "video/mp4",
      webm: "video/webm",
      mkv: "video/x-matroska",
      avi: "video/x-msvideo",
      mov: "video/quicktime",
      // Audio
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      flac: "audio/flac",
      // Images
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      // Documents
      pdf: "application/pdf",
      // Default
      default: "application/octet-stream"
    };
    const contentType = contentTypes[ext] || contentTypes.default;
    const rangeHeader = getHeader(event, "range");
    if (rangeHeader && (contentType.startsWith("video/") || contentType.startsWith("audio/"))) {
      const proxyResponse2 = await fetch(downloadUrl, {
        headers: {
          "Range": rangeHeader
        }
      });
      setResponseStatus(event, proxyResponse2.status);
      const headers = ["content-range", "content-length", "accept-ranges"];
      headers.forEach((h) => {
        const value = proxyResponse2.headers.get(h);
        if (value) setHeader(event, h, value);
      });
      setHeader(event, "Content-Type", contentType);
      return proxyResponse2.body;
    }
    const proxyResponse = await fetch(downloadUrl);
    setHeader(event, "Content-Type", contentType);
    setHeader(event, "Content-Disposition", `inline; filename="${encodeURIComponent(file.name)}"`);
    const contentLength = proxyResponse.headers.get("content-length");
    if (contentLength) {
      setHeader(event, "Content-Length", parseInt(contentLength));
    }
    if (contentType.startsWith("video/") || contentType.startsWith("audio/")) {
      setHeader(event, "Accept-Ranges", "bytes");
    }
    return proxyResponse.body;
  } catch (error) {
    if (error.statusCode) throw error;
    console.error("Stream error details:", {
      shareId,
      fileIndex,
      error: error.message,
      dropboxError: error.error,
      stack: error.stack
    });
    if (((_c = (_b = error.error) == null ? void 0 : _b.error_summary) == null ? void 0 : _c.includes("missing_scope")) || JSON.stringify(error).includes("files.content.read")) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Dropbox App requires "files.content.read" permission. Please enable it in Dropbox App Console.'
      });
    }
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to stream file"
    });
  }
});

export { stream_get as default };
//# sourceMappingURL=stream.get.mjs.map
