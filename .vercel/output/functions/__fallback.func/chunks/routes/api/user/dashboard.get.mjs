import { d as defineEventHandler, z as serverSupabaseUser, c as createError, l as useSupabase } from '../../../_/nitro.mjs';
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
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  try {
    const supabase = useSupabase();
    const { data: userFiles } = await supabase.from("files").select("*").eq("user_id", user.id);
    const files = userFiles || [];
    const storageByAccount = /* @__PURE__ */ new Map();
    for (const file of files) {
      const existing = storageByAccount.get(file.dropbox_account_id) || {
        accountId: file.dropbox_account_id,
        accountName: "",
        // Will be populated from shares or accounts
        used: 0
      };
      existing.used += file.size || 0;
      storageByAccount.set(file.dropbox_account_id, existing);
    }
    const { data: userShares } = await supabase.from("shares").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    const allShares = userShares || [];
    const now = /* @__PURE__ */ new Date();
    for (const share of allShares) {
      if (storageByAccount.has(share.account_id)) {
        const account = storageByAccount.get(share.account_id);
        if (!account.accountName && share.account_name) {
          account.accountName = share.account_name;
        }
      }
    }
    const accounts = Array.from(storageByAccount.values()).map((acc) => ({
      id: acc.accountId,
      name: acc.accountName || "Unknown Account",
      used: acc.used,
      allocated: 2 * 1024 * 1024 * 1024
      // 2GB default allocation per account (user's quota)
    }));
    const totalUsed = accounts.reduce((sum, a) => sum + a.used, 0);
    const userQuota = 4 * 1024 * 1024 * 1024;
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
      downloads: s.download_count
    }));
    const recentShares = allShares.slice(0, 5).map((s) => ({
      id: s.id,
      fileName: s.file_name,
      accountName: s.account_name,
      createdAt: s.created_at,
      expiresAt: s.expires_at,
      downloads: s.download_count
    }));
    const uniqueAccountIds = new Set(files.map((f) => f.dropbox_account_id));
    return {
      accounts,
      storage: {
        used: totalUsed,
        allocated: userQuota,
        percentage: userQuota > 0 ? Math.round(totalUsed / userQuota * 100) : 0
      },
      shares: {
        total: allShares.length,
        active: activeShares.length,
        expired: expiredShares.length,
        totalDownloads
      },
      topDownloaded,
      recentShares,
      accountCount: uniqueAccountIds.size
    };
  } catch (error) {
    console.error("User Dashboard API error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to load dashboard data"
    });
  }
});

export { dashboard_get as default };
//# sourceMappingURL=dashboard.get.mjs.map
