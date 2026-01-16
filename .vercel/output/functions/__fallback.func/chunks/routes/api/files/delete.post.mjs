import { d as defineEventHandler, z as serverSupabaseUser, c as createError, r as readBody, y as serverSupabaseClient, k as useDropboxServer, l as useSupabase } from '../../../_/nitro.mjs';
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const delete_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  const body = await readBody(event);
  const { fileId } = body;
  if (!fileId) {
    throw createError({
      statusCode: 400,
      statusMessage: "fileId is required"
    });
  }
  if (!UUID_REGEX.test(fileId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid file ID format. Virtual folders cannot be deleted."
    });
  }
  const client = await serverSupabaseClient(event);
  const { data: file, error: fetchError } = await client.from("files").select("*").eq("id", fileId).eq("user_id", user.id).single();
  if (fetchError || !file) {
    console.error("[User Delete] File not found:", { fileId, error: fetchError });
    throw createError({
      statusCode: 404,
      statusMessage: "File not found or access denied"
    });
  }
  const hasValidAccountId = UUID_REGEX.test(file.dropbox_account_id);
  try {
    if (hasValidAccountId) {
      const { getClientForAccount } = useDropboxServer();
      const dbx = await getClientForAccount(file.dropbox_account_id);
      await dbx.filesDeleteV2({
        path: file.dropbox_path
      });
    } else {
      console.warn("[User Delete] Skipping Dropbox delete - invalid account ID:", file.dropbox_account_id);
    }
    const { error: deleteError } = await client.from("files").delete().eq("id", fileId).eq("user_id", user.id);
    if (deleteError) {
      console.error("[User Delete] Database delete error:", deleteError);
    }
    if (hasValidAccountId) {
      const adminSupabase = useSupabase();
      await adminSupabase.from("shares").delete().eq("file_path", file.dropbox_path).eq("account_id", file.dropbox_account_id);
    }
    return {
      success: true,
      message: `File "${file.filename}" deleted successfully`
    };
  } catch (error) {
    console.error("[User Delete] Dropbox delete error:", error);
    const errorTag = (_b = (_a = error.error) == null ? void 0 : _a.error) == null ? void 0 : _b[".tag"];
    const isNotFound = errorTag === "path_lookup" || ((_c = error.message) == null ? void 0 : _c.includes("not found"));
    if (isNotFound || !hasValidAccountId) {
      await client.from("files").delete().eq("id", fileId).eq("user_id", user.id);
      return {
        success: true,
        message: "File record removed"
      };
    }
    throw createError({
      statusCode: error.status || 500,
      statusMessage: ((_d = error.error) == null ? void 0 : _d.error_summary) || error.message || "Failed to delete file"
    });
  }
});

export { delete_post as default };
//# sourceMappingURL=delete.post.mjs.map
