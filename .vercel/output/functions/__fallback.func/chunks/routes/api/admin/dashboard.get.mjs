import { d as defineEventHandler, b as requireAdmin, k as useDropboxServer, h as getAccounts, l as useSupabase, c as createError } from '../../../_/nitro.mjs';
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

const dashboard_get = defineEventHandler(async (event) => {
  await requireAdmin(event);
  try {
    const { getClientForAccount } = useDropboxServer();
    const accounts = await getAccounts();
    const supabase = useSupabase();
    const accountStats = await Promise.all(
      accounts.map(async (account) => {
        var _a;
        try {
          const dbx = await getClientForAccount(account.id);
          const usage = await dbx.usersGetSpaceUsage();
          return {
            id: account.id,
            name: account.name,
            email: account.email,
            used: usage.result.used,
            allocated: ((_a = usage.result.allocation) == null ? void 0 : _a.allocated) || 0
          };
        } catch (err) {
          console.error(`Error getting storage for ${account.name}:`, err);
          return {
            id: account.id,
            name: account.name,
            email: account.email,
            used: 0,
            allocated: 0,
            error: true
          };
        }
      })
    );
    const totalUsed = accountStats.reduce((sum, a) => sum + (a.used || 0), 0);
    const totalAllocated = accountStats.reduce((sum, a) => sum + (a.allocated || 0), 0);
    const { data: shares } = await supabase.from("shares").select("id, created_at, expires_at, download_count, file_name, account_name, account_id").order("created_at", { ascending: false });
    const allShares = shares || [];
    const now = /* @__PURE__ */ new Date();
    const activeShares = allShares.filter(
      (s) => !s.expires_at || new Date(s.expires_at) > now
    );
    const expiredShares = allShares.filter(
      (s) => s.expires_at && new Date(s.expires_at) <= now
    );
    const totalDownloads = allShares.reduce((sum, s) => sum + (s.download_count || 0), 0);
    const topDownloaded = [...allShares].filter((s) => s.download_count > 0).sort((a, b) => b.download_count - a.download_count).slice(0, 5).map((s) => ({
      fileName: s.file_name,
      accountName: s.account_name,
      accountId: s.account_id,
      downloads: s.download_count
    }));
    const recentShares = allShares.slice(0, 5).map((s) => ({
      id: s.id,
      fileName: s.file_name,
      accountName: s.account_name,
      accountId: s.account_id,
      createdAt: s.created_at,
      expiresAt: s.expires_at,
      downloads: s.download_count
    }));
    return {
      accounts: accountStats,
      storage: {
        used: totalUsed,
        allocated: totalAllocated,
        percentage: totalAllocated > 0 ? Math.round(totalUsed / totalAllocated * 100) : 0
      },
      shares: {
        total: allShares.length,
        active: activeShares.length,
        expired: expiredShares.length,
        totalDownloads
      },
      topDownloaded,
      recentShares,
      accountCount: accounts.length
    };
  } catch (error) {
    console.error("Dashboard API error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to load dashboard data"
    });
  }
});

export { dashboard_get as default };
//# sourceMappingURL=dashboard.get.mjs.map
