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

const bulkCopy_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const { entries, accountId } = body;
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "entries array is required"
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
    const response = await dbx.filesCopyBatchV2({
      entries: entries.map((e) => ({
        from_path: e.from_path,
        to_path: e.to_path
      })),
      autorename: true
    });
    if (response.result[".tag"] === "async_job_id") {
      let jobStatus = await dbx.filesCopyBatchCheckV2({
        async_job_id: response.result.async_job_id
      });
      let attempts = 0;
      while (jobStatus.result[".tag"] === "in_progress" && attempts < 30) {
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        jobStatus = await dbx.filesCopyBatchCheckV2({
          async_job_id: response.result.async_job_id
        });
        attempts++;
      }
      if (jobStatus.result[".tag"] === "complete") {
        return {
          success: true,
          copied: jobStatus.result.entries.length
        };
      } else {
        throw new Error("Batch copy timed out or failed");
      }
    }
    return {
      success: true,
      copied: entries.length
    };
  } catch (error) {
    console.error("Bulk copy error:", error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: ((_a = error.error) == null ? void 0 : _a.error_summary) || error.message || "Failed to copy files"
    });
  }
});

export { bulkCopy_post as default };
//# sourceMappingURL=bulk-copy.post.mjs.map
