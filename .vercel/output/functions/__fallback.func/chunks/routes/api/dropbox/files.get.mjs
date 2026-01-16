import { d as defineEventHandler, q as getQuery, k as useDropboxServer, c as createError, x as setHeader } from '../../../_/nitro.mjs';
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

const files_get = defineEventHandler(async (event) => {
  var _a;
  const query = getQuery(event);
  const path = query.path || "";
  const accountId = query.accountId;
  try {
    const { getClientForAccount, getActiveClient } = useDropboxServer();
    let dbx, account;
    if (accountId) {
      const { getAccountById } = await import('../../../_/nitro.mjs').then(function (n) { return n.a9; });
      account = await getAccountById(accountId);
      if (!account) {
        throw createError({
          statusCode: 404,
          statusMessage: "Account not found"
        });
      }
      dbx = await getClientForAccount(accountId);
    } else {
      const result = await getActiveClient();
      dbx = result.client;
      account = result.account;
    }
    console.log(`[Files API] Fetching files for account: ${account.name} (${account.id}), path: ${path || "root"}`);
    console.log(`[Files API] Using Dropbox account_id: ${account.account_id}`);
    setHeader(event, "Cache-Control", "no-store, no-cache, must-revalidate");
    setHeader(event, "Pragma", "no-cache");
    setHeader(event, "X-Active-Account-Name", account.name);
    setHeader(event, "X-Active-Account-Id", account.id);
    setHeader(event, "X-Dropbox-Real-Account-Id", account.account_id);
    const response = await dbx.filesListFolder({
      path,
      include_media_info: true,
      include_deleted: false,
      include_has_explicit_shared_members: false,
      include_mounted_folders: true,
      limit: 100
    });
    const entries = response.result.entries.map((entry) => {
      var _a2;
      const isFolder = entry[".tag"] === "folder";
      const fileEntry = entry;
      const folderEntry = entry;
      return {
        id: isFolder ? folderEntry.id : fileEntry.id,
        name: entry.name,
        path: isFolder ? folderEntry.path_lower : fileEntry.path_lower,
        type: isFolder ? "folder" : "file",
        size: isFolder ? null : fileEntry.size,
        modified: isFolder ? null : fileEntry.server_modified,
        extension: isFolder ? null : (_a2 = entry.name.split(".").pop()) == null ? void 0 : _a2.toLowerCase()
      };
    });
    entries.sort((a, b) => {
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name);
    });
    return {
      entries,
      cursor: response.result.cursor,
      hasMore: response.result.has_more,
      accountId: account.id,
      accountName: account.name
    };
  } catch (error) {
    console.error("Dropbox API Error:", error);
    const errorSummary = ((_a = error.error) == null ? void 0 : _a.error_summary) || "";
    if (errorSummary.includes("path/not_found")) {
      throw createError({
        statusCode: 404,
        statusMessage: "Folder not found"
      });
    }
    throw createError({
      statusCode: error.status || 500,
      statusMessage: errorSummary || error.message || "Failed to fetch files from Dropbox"
    });
  }
});

export { files_get as default };
//# sourceMappingURL=files.get.mjs.map
