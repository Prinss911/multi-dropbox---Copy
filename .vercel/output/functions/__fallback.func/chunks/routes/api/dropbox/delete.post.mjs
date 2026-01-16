import { d as defineEventHandler, b as requireAdmin, r as readBody, c as createError, k as useDropboxServer, y as serverSupabaseClient, l as useSupabase } from '../../../_/nitro.mjs';
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

const delete_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
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
    const { getClientForAccount, getActiveClient } = useDropboxServer();
    let dbx;
    if (accountId) {
      dbx = await getClientForAccount(accountId);
    } else {
      const result = await getActiveClient();
      dbx = result.client;
    }
    const response = await dbx.filesDeleteV2({
      path
    });
    try {
      const supabase = await serverSupabaseClient(event);
      const targetAccountId = accountId || (await getActiveClient()).account.id;
      await supabase.from("files").delete().eq("dropbox_path", path).eq("dropbox_account_id", targetAccountId);
      const adminSupabase = useSupabase();
      await adminSupabase.from("shares").delete().eq("file_path", path).eq("account_id", targetAccountId);
    } catch (dbError) {
      console.warn("Failed to clean up database tables:", dbError);
    }
    return {
      success: true,
      metadata: response.result.metadata
    };
  } catch (error) {
    console.error("Delete error:", error);
    const errorTag = (_b = (_a = error.error) == null ? void 0 : _a.error) == null ? void 0 : _b[".tag"];
    if (errorTag === "path_lookup") {
      throw createError({
        statusCode: 404,
        statusMessage: "File or folder not found"
      });
    }
    if (errorTag === "path_write") {
      const writeError = (_e = (_d = (_c = error.error) == null ? void 0 : _c.error) == null ? void 0 : _d.path_write) == null ? void 0 : _e[".tag"];
      if (writeError === "conflict") {
        throw createError({
          statusCode: 409,
          statusMessage: "Cannot delete: file is in use or conflict detected"
        });
      }
    }
    throw createError({
      statusCode: error.status || 500,
      statusMessage: ((_f = error.error) == null ? void 0 : _f.error_summary) || error.message || "Failed to delete"
    });
  }
});

export { delete_post as default };
//# sourceMappingURL=delete.post.mjs.map
