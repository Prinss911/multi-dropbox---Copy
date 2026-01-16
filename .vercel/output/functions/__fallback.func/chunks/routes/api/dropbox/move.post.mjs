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

const move_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const { fromPath, toPath, accountId } = body;
  console.log("[Move API] Request:", { fromPath, toPath, accountId });
  if (!fromPath || !toPath) {
    throw createError({
      statusCode: 400,
      statusMessage: "fromPath and toPath are required"
    });
  }
  try {
    const { getClientForAccount, getActiveClient } = useDropboxServer();
    let dbx;
    if (accountId) {
      console.log("[Move API] Using account:", accountId);
      dbx = await getClientForAccount(accountId);
    } else {
      console.log("[Move API] Using active account");
      const result = await getActiveClient();
      dbx = result.client;
    }
    console.log("[Move API] Executing move from:", fromPath, "to:", toPath);
    const response = await dbx.filesMoveV2({
      from_path: fromPath,
      to_path: toPath,
      autorename: true,
      // Automatically rename if conflict
      allow_ownership_transfer: false
    });
    console.log("[Move API] Success:", response.result.metadata.path_display);
    return {
      success: true,
      metadata: response.result.metadata
    };
  } catch (error) {
    console.error("[Move API] Error:", error);
    console.error("[Move API] Error summary:", (_a = error.error) == null ? void 0 : _a.error_summary);
    const errorSummary = ((_b = error.error) == null ? void 0 : _b.error_summary) || "";
    if (errorSummary.includes("conflict") || errorSummary.includes("to/conflict")) {
      throw createError({
        statusCode: 409,
        statusMessage: "A file or folder with this name already exists"
      });
    }
    if (errorSummary.includes("not_found") || errorSummary.includes("from_lookup/not_found")) {
      throw createError({
        statusCode: 404,
        statusMessage: "Source file or folder not found"
      });
    }
    if (errorSummary.includes("cant_move_folder_into_itself")) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot move a folder into itself"
      });
    }
    throw createError({
      statusCode: error.status || 500,
      statusMessage: errorSummary || error.message || "Failed to move file"
    });
  }
});

export { move_post as default };
//# sourceMappingURL=move.post.mjs.map
