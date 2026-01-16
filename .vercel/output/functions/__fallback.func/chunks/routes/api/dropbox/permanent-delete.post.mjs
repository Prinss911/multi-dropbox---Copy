import { d as defineEventHandler, b as requireAdmin, r as readBody, c as createError, k as useDropboxServer, l as useSupabase } from '../../../_/nitro.mjs';
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

const permanentDelete_post = defineEventHandler(async (event) => {
  var _a, _b;
  await requireAdmin(event);
  const body = await readBody(event);
  const { path, accountId } = body;
  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: "Path is required"
    });
  }
  try {
    const { getActiveClient, getClientForAccount } = useDropboxServer();
    let dbx;
    let targetAccountId = accountId;
    if (accountId) {
      dbx = await getClientForAccount(accountId);
    } else {
      const res = await getActiveClient();
      dbx = res.client;
      targetAccountId = res.account.id;
    }
    try {
      const metadata = await dbx.filesGetMetadata({ path });
      await dbx.filesDeleteV2({ path });
      try {
        await dbx.filesPermanentlyDelete({ path });
        try {
          const supabase = useSupabase();
          await supabase.from("shares").delete().eq("file_path", path).eq("account_id", targetAccountId);
        } catch (dbError) {
          console.warn("Failed to cleanup shares:", dbError);
        }
        return {
          success: true,
          message: "File permanently deleted"
        };
      } catch (permError) {
        return {
          success: true,
          message: "File moved to trash. Will be permanently deleted after 30 days.",
          isPersonalAccount: true
        };
      }
    } catch (metaError) {
      const metaErrorSummary = ((_a = metaError.error) == null ? void 0 : _a.error_summary) || "";
      if (metaErrorSummary.includes("path/not_found") || metaErrorSummary.includes("path_lookup")) {
        try {
          const supabase = useSupabase();
          await supabase.from("shares").delete().eq("file_path", path).eq("account_id", targetAccountId);
        } catch (dbError) {
          console.warn("Failed to cleanup shares:", dbError);
        }
        return {
          success: true,
          message: "File is in trash and will be permanently deleted after 30 days.",
          alreadyInTrash: true
        };
      }
      throw metaError;
    }
  } catch (error) {
    console.error("Permanent delete error:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: error.status || 500,
      statusMessage: ((_b = error.error) == null ? void 0 : _b.error_summary) || error.message || "Failed to delete file"
    });
  }
});

export { permanentDelete_post as default };
//# sourceMappingURL=permanent-delete.post.mjs.map
