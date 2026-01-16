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

const recordUpload_post = defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  const body = await readBody(event);
  const { filename, dropboxPath, size, contentType, dropboxAccountId } = body;
  if (!filename || !dropboxPath || !dropboxAccountId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields"
    });
  }
  const client = await serverSupabaseClient(event);
  const { data, error } = await client.from("files").insert({
    user_id: user.id,
    filename,
    dropbox_path: dropboxPath,
    size: size || 0,
    content_type: contentType || "application/octet-stream",
    dropbox_account_id: dropboxAccountId
  }).select().single();
  if (error) {
    console.error("Error recording upload:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to record upload"
    });
  }
  return { success: true, file: data };
});

export { recordUpload_post as default };
//# sourceMappingURL=record-upload.post.mjs.map
