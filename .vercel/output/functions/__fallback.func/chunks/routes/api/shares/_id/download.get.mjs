import { d as defineEventHandler, g as getRouterParam, q as getQuery, c as createError, D as getShareById, h as getAccounts, f as createDropboxClient, F as incrementDownloadCount } from '../../../../_/nitro.mjs';
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
const download_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const shareId = getRouterParam(event, "id");
  const query = getQuery(event);
  const fileIndex = query.fileIndex !== void 0 ? parseInt(query.fileIndex) : void 0;
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
        statusMessage: "Share link not found or has been deleted"
      });
    }
    if (share.expiresAt && new Date(share.expiresAt) < /* @__PURE__ */ new Date()) {
      throw createError({
        statusCode: 410,
        statusMessage: "This share link has expired"
      });
    }
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
    let files = share.files || [];
    if (files.length === 0 && share.filePath) {
      files = [{
        name: share.fileName,
        path: share.filePath,
        size: 0
      }];
    }
    const isBatch = files.length > 1;
    if (fileIndex !== void 0) {
      if (fileIndex < 0 || fileIndex >= files.length) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid file index"
        });
      }
      const file = files[fileIndex];
      try {
        const response = await dbx.filesGetTemporaryLink({ path: file.path });
        await incrementDownloadCount(shareId);
        return {
          success: true,
          fileName: file.name,
          downloadUrl: response.result.link,
          expiresAt: share.expiresAt,
          downloadCount: share.downloadCount + 1
        };
      } catch (err) {
        if ((_b = (_a = err.error) == null ? void 0 : _a.error_summary) == null ? void 0 : _b.includes("path/not_found")) {
          throw createError({
            statusCode: 404,
            statusMessage: "File not found. It may have been deleted."
          });
        }
        throw err;
      }
    }
    if (!isBatch && files.length === 1) {
      const file = files[0];
      try {
        const metadata = await dbx.filesGetMetadata({ path: file.path });
        let size = file.size;
        if (metadata.result[".tag"] === "file") {
          size = metadata.result.size;
        }
        return {
          success: true,
          fileName: file.name,
          files: [{ ...file, size, available: true }],
          expiresAt: share.expiresAt,
          downloadCount: share.downloadCount
          // No downloadUrl returned - use stream endpoint
        };
      } catch (err) {
        if ((_d = (_c = err.error) == null ? void 0 : _c.error_summary) == null ? void 0 : _d.includes("path/not_found")) {
          return {
            success: true,
            fileName: file.name,
            files: [{ ...file, available: false }],
            expiresAt: share.expiresAt,
            downloadCount: share.downloadCount
          };
        }
        throw err;
      }
    }
    const filesWithStatus = await Promise.all(
      files.map(async (file) => {
        var _a2, _b2;
        try {
          await dbx.filesGetMetadata({ path: file.path });
          return { ...file, available: true };
        } catch (err) {
          if ((_b2 = (_a2 = err.error) == null ? void 0 : _a2.error_summary) == null ? void 0 : _b2.includes("path/not_found")) {
            return { ...file, available: false };
          }
          return { ...file, available: true };
        }
      })
    );
    const availableCount = filesWithStatus.filter((f) => f.available).length;
    const missingCount = filesWithStatus.filter((f) => !f.available).length;
    return {
      success: true,
      fileName: share.fileName,
      files: filesWithStatus,
      isBatch: true,
      expiresAt: share.expiresAt,
      downloadCount: share.downloadCount,
      availableCount,
      missingCount
    };
  } catch (error) {
    if (error.statusCode) throw error;
    console.error("Share download error:", {
      message: error.message,
      status: error.status,
      errorSummary: (_e = error.error) == null ? void 0 : _e.error_summary
    });
    if ((_g = (_f = error.error) == null ? void 0 : _f.error_summary) == null ? void 0 : _g.includes("path/not_found")) {
      throw createError({
        statusCode: 404,
        statusMessage: "File not found. It may have been moved or deleted."
      });
    }
    throw createError({
      statusCode: error.status || 400,
      statusMessage: ((_h = error.error) == null ? void 0 : _h.error_summary) || error.message || "Failed to get download link"
    });
  }
});

export { download_get as default };
//# sourceMappingURL=download.get.mjs.map
