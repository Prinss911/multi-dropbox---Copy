import { d as defineEventHandler, z as serverSupabaseUser, c as createError, y as serverSupabaseClient, l as useSupabase } from '../../_/nitro.mjs';
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

const myFiles_get = defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized"
    });
  }
  const client = await serverSupabaseClient(event);
  const supabase = useSupabase();
  const { data: files, error } = await client.from("files").select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false });
  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }
  const { data: virtualFolders } = await client.from("virtual_folders").select("id, name, created_at").eq("user_id", user.id).order("name", { ascending: true });
  const filePaths = files.map((f) => f.dropbox_path);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const { data: shares } = await supabase.from("shares").select("id, file_path, account_id, expires_at").in("file_path", filePaths).or(`expires_at.gt.${now},expires_at.is.null`);
  const shareMap = /* @__PURE__ */ new Map();
  const shareList = shares || [];
  for (const share of shareList) {
    const key = `${share.account_id}:${share.file_path}`;
    shareMap.set(key, { id: share.id, expiresAt: share.expires_at });
  }
  const fileEntries = files.map((file) => {
    var _a;
    const shareKey = `${file.dropbox_account_id}:${file.dropbox_path}`;
    const shareInfo = shareMap.get(shareKey);
    return {
      id: file.id,
      name: file.filename,
      path: file.dropbox_path,
      size: file.size,
      modified: file.uploaded_at,
      type: file.content_type === "application/x-directory" ? "folder" : "file",
      extension: file.content_type === "application/x-directory" ? null : ((_a = file.filename.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || null,
      accountId: file.dropbox_account_id,
      virtualFolder: file.virtual_folder || null,
      // Include share link if exists
      shareId: (shareInfo == null ? void 0 : shareInfo.id) || null,
      shareUrl: (shareInfo == null ? void 0 : shareInfo.id) ? `/file/${shareInfo.id}` : null,
      shareExpiresAt: (shareInfo == null ? void 0 : shareInfo.expiresAt) || null
    };
  });
  const folderEntries = (virtualFolders || []).map((folder) => ({
    id: folder.id,
    name: folder.name,
    path: `/virtual/${folder.name}`,
    size: 0,
    modified: folder.created_at,
    type: "folder",
    extension: null,
    accountId: "",
    virtualFolder: null,
    isVirtualFolder: true,
    // Flag to identify this as a persistent virtual folder
    isPersistent: true,
    shareId: null,
    shareUrl: null,
    shareExpiresAt: null
  }));
  return [...folderEntries, ...fileEntries];
});

export { myFiles_get as default };
//# sourceMappingURL=my-files.get.mjs.map
