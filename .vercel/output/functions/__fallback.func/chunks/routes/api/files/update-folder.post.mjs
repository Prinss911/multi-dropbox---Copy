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

const updateFolder_post = defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  const body = await readBody(event);
  const { fileId, virtualFolder } = body;
  if (!fileId) {
    throw createError({
      statusCode: 400,
      statusMessage: "fileId is required"
    });
  }
  const client = await serverSupabaseClient(event);
  const { data, error } = await client.from("files").update({ virtual_folder: virtualFolder || null }).eq("id", fileId).eq("user_id", user.id).select().single();
  if (error) {
    console.error("[Update Folder] Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }
  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: "File not found or access denied"
    });
  }
  return {
    success: true,
    file: {
      id: data.id,
      name: data.filename,
      virtualFolder: data.virtual_folder
    }
  };
});

export { updateFolder_post as default };
//# sourceMappingURL=update-folder.post.mjs.map
