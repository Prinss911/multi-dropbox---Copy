import { d as defineEventHandler, q as getQuery, c as createError, k as useDropboxServer } from '../../../_/nitro.mjs';
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

const download_get = defineEventHandler(async (event) => {
  var _a;
  const query = getQuery(event);
  const path = query.path;
  const accountId = query.accountId;
  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: "Path is required"
    });
  }
  try {
    const { getClientForAccount, getActiveClient } = useDropboxServer();
    let dbx, account;
    if (accountId) {
      const { getAccountById } = await import('../../../_/nitro.mjs').then(function (n) { return n.a9; });
      account = await getAccountById(accountId);
      if (!account) {
        throw createError({ statusCode: 404, statusMessage: "Account not found" });
      }
      dbx = await getClientForAccount(accountId);
    } else {
      const result = await getActiveClient();
      dbx = result.client;
      account = result.account;
    }
    console.log(`[Download API] Getting link for account: ${account.name}, path: ${path}`);
    const response = await dbx.filesGetTemporaryLink({
      path
    });
    return {
      link: response.result.link,
      metadata: {
        name: response.result.metadata.name,
        size: response.result.metadata.size
      }
    };
  } catch (error) {
    console.error("Dropbox Download Error:", error);
    const errorSummary = ((_a = error.error) == null ? void 0 : _a.error_summary) || "";
    if (errorSummary.includes("not_found")) {
      throw createError({
        statusCode: 404,
        statusMessage: "File not found"
      });
    }
    throw createError({
      statusCode: error.status || 500,
      statusMessage: errorSummary || error.message || "Failed to get download link"
    });
  }
});

export { download_get as default };
//# sourceMappingURL=download.get.mjs.map
