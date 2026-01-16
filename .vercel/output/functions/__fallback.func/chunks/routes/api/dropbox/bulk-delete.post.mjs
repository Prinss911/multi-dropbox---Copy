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

const bulkDelete_post = defineEventHandler(async (event) => {
  var _a;
  await requireAdmin(event);
  const body = await readBody(event);
  const { paths, accountId } = body;
  if (!paths || !Array.isArray(paths) || paths.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "paths array is required"
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
    const entries = paths.map((path) => ({ path }));
    const response = await dbx.filesDeleteBatch({
      entries
    });
    if (response.result[".tag"] === "async_job_id") {
      let jobStatus = await dbx.filesDeleteBatchCheck({
        async_job_id: response.result.async_job_id
      });
      let attempts = 0;
      while (jobStatus.result[".tag"] === "in_progress" && attempts < 30) {
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        jobStatus = await dbx.filesDeleteBatchCheck({
          async_job_id: response.result.async_job_id
        });
        attempts++;
      }
      if (jobStatus.result[".tag"] === "complete") {
        return {
          success: true,
          deleted: jobStatus.result.entries.length
        };
      } else {
        throw new Error("Batch delete timed out or failed");
      }
    }
    return {
      success: true,
      deleted: paths.length
    };
  } catch (error) {
    console.error("Bulk delete error:", error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: ((_a = error.error) == null ? void 0 : _a.error_summary) || error.message || "Failed to delete files"
    });
  }
});

export { bulkDelete_post as default };
//# sourceMappingURL=bulk-delete.post.mjs.map
