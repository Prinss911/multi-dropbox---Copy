import { d as defineEventHandler, m as getAuthUser, r as readBody, c as createError, h as getAccounts, n as createShare, o as getHeader } from '../../../_/nitro.mjs';
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

const complete_post = defineEventHandler(async (event) => {
  var _a;
  const user = await getAuthUser(event);
  const body = await readBody(event);
  const {
    accountId,
    // Legacy single file
    filePath,
    fileName,
    // New batch upload
    files,
    folderPath,
    // Expiration
    expirationDays = 7,
    expirationUnit = "days"
  } = body;
  const isBatch = Array.isArray(files) && files.length > 0;
  if (!accountId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Account ID is required"
    });
  }
  if (!isBatch && (!filePath || !fileName)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Either files array or filePath/fileName are required"
    });
  }
  try {
    const accounts = await getAccounts();
    const account = accounts.find((a) => a.id === accountId);
    if (!account) {
      throw createError({
        statusCode: 404,
        statusMessage: "Account not found"
      });
    }
    let expiresAt = null;
    if (expirationDays !== null && expirationDays !== "never") {
      const date = /* @__PURE__ */ new Date();
      if (expirationUnit === "seconds") {
        date.setSeconds(date.getSeconds() + (expirationDays || 10));
      } else {
        const validDays = [1, 3, 7, 30];
        const days = validDays.includes(expirationDays) ? expirationDays : 7;
        date.setDate(date.getDate() + days);
      }
      expiresAt = date.toISOString();
    }
    let shareFiles = [];
    let displayName = fileName;
    let primaryPath = filePath;
    if (isBatch) {
      shareFiles = files.map((f) => ({
        name: f.name,
        path: f.path,
        size: f.size
      }));
      displayName = shareFiles.length === 1 ? shareFiles[0].name : `${shareFiles.length} files`;
      primaryPath = folderPath || ((_a = shareFiles[0]) == null ? void 0 : _a.path) || "";
    } else {
      shareFiles = [{
        name: fileName,
        path: filePath,
        size: 0
        // Size not provided for legacy single file
      }];
    }
    const share = await createShare({
      fileId: primaryPath,
      fileName: displayName,
      filePath: primaryPath,
      files: shareFiles,
      accountId: account.id,
      accountName: account.name,
      expiresAt,
      userId: user == null ? void 0 : user.id
    });
    const host = getHeader(event, "host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const shareUrl = `${protocol}://${host}/file/${share.id}`;
    return {
      success: true,
      share: {
        id: share.id,
        url: shareUrl,
        fileName: share.fileName,
        files: shareFiles,
        fileCount: shareFiles.length,
        expiresAt: share.expiresAt
      }
    };
  } catch (error) {
    if (error.statusCode) throw error;
    console.error("Create share after upload error:", error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to create share link"
    });
  }
});

export { complete_post as default };
//# sourceMappingURL=complete.post.mjs.map
