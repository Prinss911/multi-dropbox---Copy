import { d as defineEventHandler, b as requireAdmin, r as readBody, c as createError, k as useDropboxServer } from '../../../_/nitro.mjs';
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

const restore_post = defineEventHandler(async (event) => {
  var _a;
  await requireAdmin(event);
  const body = await readBody(event);
  const { path } = body;
  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: "Path is required"
    });
  }
  try {
    const { getActiveClient, getClientForAccount } = useDropboxServer();
    let dbx;
    if (body.accountId) {
      dbx = await getClientForAccount(body.accountId);
    } else {
      const res = await getActiveClient();
      dbx = res.client;
    }
    const revisions = await dbx.filesListRevisions({
      path,
      limit: 10
    });
    const validRevision = revisions.result.entries[0];
    if (!validRevision) {
      throw createError({
        statusCode: 404,
        statusMessage: "No valid revision found to restore"
      });
    }
    const response = await dbx.filesRestore({
      path,
      rev: validRevision.rev
    });
    return {
      success: true,
      metadata: response.result
    };
  } catch (error) {
    console.error("Restore error:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: error.status || 500,
      statusMessage: ((_a = error.error) == null ? void 0 : _a.error_summary) || error.message || "Failed to restore file"
    });
  }
});

export { restore_post as default };
//# sourceMappingURL=restore.post.mjs.map
