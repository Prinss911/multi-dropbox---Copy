import { d as defineEventHandler, m as getAuthUser, c as createError, g as getRouterParam, D as getShareById, w as useSupabaseAdmin, E as deleteShare } from '../../../_/nitro.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  const user = await getAuthUser(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Missing ID" });
  const share = await getShareById(id);
  if (!share) throw createError({ statusCode: 404, statusMessage: "Share not found" });
  const supabase = useSupabaseAdmin();
  let isAdmin = false;
  const { data: profileData } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profileData && profileData.role === "admin") {
    isAdmin = true;
  }
  const isShareOwner = share.userId && share.userId === user.id;
  let isFileOwner = false;
  if (!isShareOwner && share.filePath) {
    const { data: fileData } = await supabase.from("files").select("user_id").eq("dropbox_path", share.filePath).single();
    if (fileData && fileData.user_id === user.id) {
      isFileOwner = true;
    }
  }
  if (!isShareOwner && !isFileOwner && !isAdmin) {
    console.log("[Share Delete] Access denied:", {
      userId: user.id,
      shareUserId: share.userId,
      isShareOwner,
      isFileOwner,
      isAdmin
    });
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }
  const success = await deleteShare(id);
  if (!success) {
    throw createError({ statusCode: 500, statusMessage: "Failed to delete share" });
  }
  console.log("[Share Delete] Share deleted successfully:", id);
  return { success: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
