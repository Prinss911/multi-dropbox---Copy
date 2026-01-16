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

const bulkDownload_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const { paths } = body;
  if (!paths || !Array.isArray(paths) || paths.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "paths array is required"
    });
  }
  try {
    const { getActiveClient } = useDropboxServer();
    const { client: dbx } = await getActiveClient();
    if (paths.length === 1) {
      const response2 = await dbx.filesGetTemporaryLink({
        path: paths[0]
      });
      return {
        type: "single",
        link: response2.result.link,
        name: response2.result.metadata.name
      };
    }
    const response = await dbx.filesDownloadZip({
      path: paths[0].split("/").slice(0, -1).join("/") || "/"
      // Use parent folder
    });
    const links = await Promise.all(
      paths.map(async (path) => {
        try {
          const result = await dbx.filesGetTemporaryLink({ path });
          return {
            path,
            link: result.result.link,
            name: result.result.metadata.name
          };
        } catch (e) {
          return null;
        }
      })
    );
    return {
      type: "multiple",
      links: links.filter(Boolean)
    };
  } catch (error) {
    console.error("Bulk download error:", error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: ((_a = error.error) == null ? void 0 : _a.error_summary) || error.message || "Failed to get download links"
    });
  }
});

export { bulkDownload_post as default };
//# sourceMappingURL=bulk-download.post.mjs.map
