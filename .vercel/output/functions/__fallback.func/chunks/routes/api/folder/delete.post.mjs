import { d as defineEventHandler, z as serverSupabaseUser, c as createError, r as readBody, y as serverSupabaseClient } from '../../../_/nitro.mjs';
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
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  const body = await readBody(event);
  const { folderId, folderName } = body;
  if (!folderId && !folderName) {
    throw createError({
      statusCode: 400,
      statusMessage: "folderId or folderName is required"
    });
  }
  const client = await serverSupabaseClient(event);
  let targetFolderName = folderName;
  if (folderId && !folderName) {
    const { data: folder } = await client.from("virtual_folders").select("name").eq("id", folderId).eq("user_id", user.id).single();
    if (!folder) {
      throw createError({
        statusCode: 404,
        statusMessage: "Folder not found"
      });
    }
    targetFolderName = folder.name;
  }
  const { count } = await client.from("files").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("virtual_folder", targetFolderName);
  if (count && count > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Cannot delete folder: it still contains ${count} file(s). Move or delete files first.`
    });
  }
  let deleteQuery = client.from("virtual_folders").delete().eq("user_id", user.id);
  if (folderId) {
    deleteQuery = deleteQuery.eq("id", folderId);
  } else {
    deleteQuery = deleteQuery.eq("name", targetFolderName);
  }
  const { error } = await deleteQuery;
  if (error) {
    console.error("Error deleting folder:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete folder"
    });
  }
  return {
    success: true,
    message: `Folder "${targetFolderName}" deleted successfully`
  };
});

export { delete_post as default };
//# sourceMappingURL=delete.post.mjs.map
