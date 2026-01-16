import { d as defineEventHandler, r as readBody, c as createError, k as useDropboxServer } from '../../../_/nitro.mjs';
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

const folder_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const { path, name, accountId } = body;
  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Folder name is required"
    });
  }
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(name)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Folder name contains invalid characters"
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
    const folderPath = path ? `${path}/${name}` : `/${name}`;
    const response = await dbx.filesCreateFolderV2({
      path: folderPath,
      autorename: false
    });
    return {
      success: true,
      folder: {
        id: response.result.metadata.id,
        name: response.result.metadata.name,
        path: response.result.metadata.path_lower
      }
    };
  } catch (error) {
    console.error("Create folder error:", error);
    const errorSummary = ((_a = error.error) == null ? void 0 : _a.error_summary) || "";
    if (errorSummary.includes("conflict")) {
      throw createError({
        statusCode: 409,
        statusMessage: "A folder with this name already exists"
      });
    }
    throw createError({
      statusCode: error.status || 500,
      statusMessage: errorSummary || error.message || "Failed to create folder"
    });
  }
});

export { folder_post as default };
//# sourceMappingURL=folder.post.mjs.map
