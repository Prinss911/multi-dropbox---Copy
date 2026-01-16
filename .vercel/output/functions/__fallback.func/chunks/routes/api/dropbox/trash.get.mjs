import { d as defineEventHandler, b as requireAdmin, q as getQuery, k as useDropboxServer, c as createError } from '../../../_/nitro.mjs';
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

const trash_get = defineEventHandler(async (event) => {
  var _a;
  await requireAdmin(event);
  try {
    const query = getQuery(event);
    const accountId = query.accountId;
    const { getActiveClient, getClientForAccount } = useDropboxServer();
    let dbx, account;
    if (accountId) {
      dbx = await getClientForAccount(accountId);
      const { getAccounts } = await import('../../../_/nitro.mjs').then(function (n) { return n.a9; });
      const accounts = await getAccounts();
      account = accounts.find((a) => a.id === accountId) || { id: accountId, name: "Unknown" };
    } else {
      const result = await getActiveClient();
      dbx = result.client;
      account = result.account;
    }
    const response = await dbx.filesListFolder({
      path: "",
      recursive: true,
      include_deleted: true,
      limit: 100
    });
    const deletedEntries = response.result.entries.filter((entry) => entry[".tag"] === "deleted");
    const entriesWithDates = await Promise.all(
      deletedEntries.slice(0, 30).map(async (entry) => {
        var _a2;
        const deletedEntry = entry;
        let deletedAt = null;
        let daysRemaining = null;
        try {
          const revisions = await dbx.filesListRevisions({
            path: deletedEntry.path_lower || "",
            limit: 5
          });
          if (revisions.result.entries.length > 0) {
            const lastRevision = revisions.result.entries[0];
            deletedAt = lastRevision.server_modified;
            const deletedDate = new Date(deletedAt);
            const expiryDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1e3);
            const now = /* @__PURE__ */ new Date();
            const msRemaining = expiryDate.getTime() - now.getTime();
            daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1e3)));
          }
        } catch (err) {
        }
        return {
          id: deletedEntry.path_lower || deletedEntry.name,
          name: deletedEntry.name,
          path: deletedEntry.path_lower || "",
          type: "deleted",
          size: null,
          deletedAt,
          daysRemaining,
          extension: ((_a2 = deletedEntry.name.split(".").pop()) == null ? void 0 : _a2.toLowerCase()) || null
        };
      })
    );
    const recoverableEntries = entriesWithDates.filter(
      (entry) => entry.daysRemaining === null || entry.daysRemaining > 0
    );
    return {
      entries: recoverableEntries,
      accountId: account.id,
      accountName: account.name
    };
  } catch (error) {
    console.error("Trash files error:", error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: ((_a = error.error) == null ? void 0 : _a.error_summary) || error.message || "Failed to get trash files"
    });
  }
});

export { trash_get as default };
//# sourceMappingURL=trash.get.mjs.map
