import { d as defineEventHandler, b as requireAdmin, k as useDropboxServer, l as useSupabase, c as createError } from '../../../_/nitro.mjs';
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

const cleanup_post = defineEventHandler(async (event) => {
  var _a, _b;
  await requireAdmin(event);
  try {
    const { getActiveClient, getClientForAccount } = useDropboxServer();
    const supabase = useSupabase();
    const result = {
      filesRemoved: 0,
      sharesRemoved: 0,
      errors: []
    };
    const { data: dbFiles, error: filesError } = await supabase.from("files").select("id, dropbox_path, dropbox_account_id, filename");
    if (filesError) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch files from database"
      });
    }
    const { data: dbShares, error: sharesError } = await supabase.from("shares").select("id, file_path, account_id, file_name");
    if (sharesError) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch shares from database"
      });
    }
    const filesByAccount = /* @__PURE__ */ new Map();
    for (const file of dbFiles || []) {
      const accountId = file.dropbox_account_id;
      if (!filesByAccount.has(accountId)) {
        filesByAccount.set(accountId, []);
      }
      filesByAccount.get(accountId).push(file);
    }
    const sharesByAccount = /* @__PURE__ */ new Map();
    for (const share of dbShares || []) {
      const accountId = share.account_id;
      if (!sharesByAccount.has(accountId)) {
        sharesByAccount.set(accountId, []);
      }
      sharesByAccount.get(accountId).push(share);
    }
    const accountIds = /* @__PURE__ */ new Set([
      ...filesByAccount.keys(),
      ...sharesByAccount.keys()
    ]);
    for (const accountId of accountIds) {
      try {
        const dbx = await getClientForAccount(accountId);
        const dropboxFiles = /* @__PURE__ */ new Set();
        try {
          let hasMore = true;
          let cursor;
          while (hasMore) {
            const response = cursor ? await dbx.filesListFolderContinue({ cursor }) : await dbx.filesListFolder({ path: "", recursive: true });
            for (const entry of response.result.entries) {
              if (entry[".tag"] === "file") {
                dropboxFiles.add(entry.path_lower || "");
              }
            }
            hasMore = response.result.has_more;
            cursor = response.result.cursor;
          }
        } catch (listError) {
          result.errors.push(`Failed to list files for account ${accountId}: ${listError.message}`);
          continue;
        }
        const accountFiles = filesByAccount.get(accountId) || [];
        for (const file of accountFiles) {
          const pathLower = (_a = file.dropbox_path) == null ? void 0 : _a.toLowerCase();
          if (pathLower && !dropboxFiles.has(pathLower)) {
            const { error: deleteError } = await supabase.from("files").delete().eq("id", file.id);
            if (!deleteError) {
              result.filesRemoved++;
              console.log(`Removed orphan file: ${file.filename}`);
            } else {
              result.errors.push(`Failed to delete file record ${file.id}: ${deleteError.message}`);
            }
          }
        }
        const accountShares = sharesByAccount.get(accountId) || [];
        for (const share of accountShares) {
          const pathLower = (_b = share.file_path) == null ? void 0 : _b.toLowerCase();
          if (pathLower && !dropboxFiles.has(pathLower)) {
            const { error: deleteError } = await supabase.from("shares").delete().eq("id", share.id);
            if (!deleteError) {
              result.sharesRemoved++;
              console.log(`Removed orphan share: ${share.file_name}`);
            } else {
              result.errors.push(`Failed to delete share record ${share.id}: ${deleteError.message}`);
            }
          }
        }
      } catch (accountError) {
        result.errors.push(`Error processing account ${accountId}: ${accountError.message}`);
      }
    }
    return {
      success: true,
      message: `Cleanup complete. Removed ${result.filesRemoved} orphan files and ${result.sharesRemoved} orphan shares.`,
      ...result
    };
  } catch (error) {
    console.error("Cleanup error:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to run cleanup"
    });
  }
});

export { cleanup_post as default };
//# sourceMappingURL=cleanup.post.mjs.map
