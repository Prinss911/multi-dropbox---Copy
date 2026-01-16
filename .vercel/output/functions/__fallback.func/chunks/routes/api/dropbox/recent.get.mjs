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

const recent_get = defineEventHandler(async (event) => {
  var _a;
  try {
    const { getActiveClient } = useDropboxServer();
    const { client: dbx, account } = await getActiveClient();
    const response = await dbx.filesListFolder({
      path: "",
      recursive: true,
      include_media_info: true,
      include_deleted: false,
      limit: 100
    });
    const entries = response.result.entries.filter((entry) => entry[".tag"] === "file").map((entry) => {
      var _a2;
      const fileEntry = entry;
      return {
        id: fileEntry.id,
        name: fileEntry.name,
        path: fileEntry.path_lower,
        type: "file",
        size: fileEntry.size,
        modified: fileEntry.server_modified,
        extension: ((_a2 = fileEntry.name.split(".").pop()) == null ? void 0 : _a2.toLowerCase()) || null
      };
    }).sort((a, b) => {
      const dateA = new Date(a.modified || 0).getTime();
      const dateB = new Date(b.modified || 0).getTime();
      return dateB - dateA;
    }).slice(0, 20);
    return {
      entries,
      accountId: account.id,
      accountName: account.name
    };
  } catch (error) {
    console.error("Recent files error:", error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: ((_a = error.error) == null ? void 0 : _a.error_summary) || error.message || "Failed to get recent files"
    });
  }
});

export { recent_get as default };
//# sourceMappingURL=recent.get.mjs.map
