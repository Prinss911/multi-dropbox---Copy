import { d as defineEventHandler, z as serverSupabaseUser, c as createError, r as readBody, l as useSupabase, A as findActiveShare, o as getHeader, B as getAccountById, n as createShare } from '../../../_/nitro.mjs';
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

const generate_post = defineEventHandler(async (event) => {
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
      statusMessage: "File ID is required"
    });
  }
  const supabase = useSupabase();
  const { data: fileData, error: fileError } = await supabase.from("files").select("id, filename, dropbox_path, dropbox_account_id, user_id").eq("id", fileId).single();
  const file = fileData;
  if (fileError || !file) {
    throw createError({
      statusCode: 404,
      statusMessage: "File not found"
    });
  }
  if (file.user_id !== user.id) {
    throw createError({
      statusCode: 403,
      statusMessage: "You can only embed your own files"
    });
  }
  const existingShare = await findActiveShare(file.dropbox_account_id, file.dropbox_path);
  if (existingShare) {
    const host2 = getHeader(event, "host") || "localhost:3000";
    const protocol2 = host2.includes("localhost") ? "http" : "https";
    return {
      success: true,
      existing: true,
      shareId: existingShare.id,
      embedUrl: `${protocol2}://${host2}/embed/${existingShare.id}`,
      shareUrl: `${protocol2}://${host2}/file/${existingShare.id}`,
      expiresAt: existingShare.expiresAt
    };
  }
  const account = await getAccountById(file.dropbox_account_id);
  if (!account) {
    throw createError({
      statusCode: 404,
      statusMessage: "Dropbox account not found"
    });
  }
  const share = await createShare({
    fileId: file.id,
    fileName: file.filename,
    filePath: file.dropbox_path,
    files: [{
      name: file.filename,
      path: file.dropbox_path,
      size: 0
    }],
    accountId: account.id,
    accountName: account.name,
    expiresAt: null,
    // Never expires
    userId: user.id
  });
  const host = getHeader(event, "host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return {
    success: true,
    existing: false,
    shareId: share.id,
    embedUrl: `${protocol}://${host}/embed/${share.id}`,
    shareUrl: `${protocol}://${host}/file/${share.id}`,
    expiresAt: null
  };
});

export { generate_post as default };
//# sourceMappingURL=generate.post.mjs.map
