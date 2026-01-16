import { d as defineEventHandler, k as useDropboxServer, c as createError } from '../../../_/nitro.mjs';
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

const storage_get = defineEventHandler(async (event) => {
  var _a;
  try {
    const { getActiveClient } = useDropboxServer();
    const { client: dbx, account } = await getActiveClient();
    const response = await dbx.usersGetSpaceUsage();
    const used = response.result.used;
    const allocated = response.result.allocation;
    let total = 0;
    if (allocated[".tag"] === "individual") {
      total = allocated.allocated;
    } else if (allocated[".tag"] === "team") {
      total = allocated.allocated;
    }
    return {
      used,
      total,
      accountId: account.id,
      accountName: account.name
    };
  } catch (error) {
    console.error("Storage info error:", error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: ((_a = error.error) == null ? void 0 : _a.error_summary) || error.message || "Failed to get storage info"
    });
  }
});

export { storage_get as default };
//# sourceMappingURL=storage.get.mjs.map
