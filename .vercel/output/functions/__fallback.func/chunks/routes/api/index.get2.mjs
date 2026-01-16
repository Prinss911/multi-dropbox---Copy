import { d as defineEventHandler, q as getQuery, H as cleanExpiredShares, A as findActiveShare, I as getSharesByAccount, k as useDropboxServer, o as getHeader, c as createError } from '../../_/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const accountId = query.accountId;
    const filePath = query.filePath;
    await cleanExpiredShares();
    let accountShares = [];
    if (accountId && filePath) {
      const share = await findActiveShare(accountId, filePath);
      if (share) accountShares = [share];
    } else if (accountId) {
      accountShares = await getSharesByAccount(accountId);
    } else {
      const { getActiveClient } = useDropboxServer();
      const { account } = await getActiveClient();
      accountShares = await getSharesByAccount(account.id);
    }
    const host = getHeader(event, "host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const sharesWithUrl = accountShares.map((share) => ({
      ...share,
      url: `${protocol}://${host}/file/${share.id}`,
      isExpired: new Date(share.expiresAt) < /* @__PURE__ */ new Date()
    }));
    return {
      shares: sharesWithUrl,
      total: sharesWithUrl.length
    };
  } catch (error) {
    console.error("List shares error:", error);
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to list shares"
    });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
