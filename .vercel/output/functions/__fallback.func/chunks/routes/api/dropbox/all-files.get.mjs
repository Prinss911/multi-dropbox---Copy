import { d as defineEventHandler, b as requireAdmin, k as useDropboxServer, h as getAccounts, x as setHeader, c as createError } from '../../../_/nitro.mjs';
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

async function getAllFilesRecursive(dbx, path, accountId, accountName, maxDepth = 3, currentDepth = 0) {
  var _a, _b;
  if (currentDepth >= maxDepth) return [];
  const files = [];
  try {
    let response = await dbx.filesListFolder({
      path,
      recursive: true,
      // Get all files recursively
      include_media_info: true,
      include_deleted: false,
      limit: 2e3
    });
    for (const entry of response.result.entries) {
      if (entry[".tag"] === "file") {
        const fileEntry = entry;
        files.push({
          id: `${accountId}:${fileEntry.id}`,
          name: fileEntry.name,
          path: fileEntry.path_lower,
          size: fileEntry.size,
          modified: fileEntry.server_modified,
          extension: ((_a = fileEntry.name.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || null,
          accountId,
          accountName
        });
      }
    }
    while (response.result.has_more) {
      response = await dbx.filesListFolderContinue({
        cursor: response.result.cursor
      });
      for (const entry of response.result.entries) {
        if (entry[".tag"] === "file") {
          const fileEntry = entry;
          files.push({
            id: `${accountId}:${fileEntry.id}`,
            name: fileEntry.name,
            path: fileEntry.path_lower,
            size: fileEntry.size,
            modified: fileEntry.server_modified,
            extension: ((_b = fileEntry.name.split(".").pop()) == null ? void 0 : _b.toLowerCase()) || null,
            accountId,
            accountName
          });
        }
      }
    }
  } catch (err) {
    console.error(`Error listing files for ${accountName}:`, err.message);
  }
  return files;
}
const allFiles_get = defineEventHandler(async (event) => {
  await requireAdmin(event);
  try {
    const { getClientForAccount } = useDropboxServer();
    const accounts = await getAccounts();
    if (accounts.length === 0) {
      return {
        files: [],
        accounts: [],
        totalFiles: 0,
        message: "No accounts configured"
      };
    }
    console.log(`[All Files API] Fetching files from ${accounts.length} accounts...`);
    const allFilesPromises = accounts.map(async (account) => {
      try {
        const dbx = await getClientForAccount(account.id);
        const files = await getAllFilesRecursive(dbx, "", account.id, account.name);
        console.log(`[All Files API] Found ${files.length} files in ${account.name}`);
        return files;
      } catch (err) {
        console.error(`Error fetching files from ${account.name}:`, err.message);
        return [];
      }
    });
    const filesArrays = await Promise.all(allFilesPromises);
    const allFiles = filesArrays.flat();
    allFiles.sort((a, b) => {
      return new Date(b.modified).getTime() - new Date(a.modified).getTime();
    });
    setHeader(event, "Cache-Control", "no-store, no-cache, must-revalidate");
    return {
      files: allFiles,
      accounts: accounts.map((a) => ({ id: a.id, name: a.name })),
      totalFiles: allFiles.length,
      totalAccounts: accounts.length
    };
  } catch (error) {
    console.error("All files API Error:", error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to fetch all files"
    });
  }
});

export { allFiles_get as default };
//# sourceMappingURL=all-files.get.mjs.map
