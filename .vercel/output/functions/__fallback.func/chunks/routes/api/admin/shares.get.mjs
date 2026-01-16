import { d as defineEventHandler, b as requireAdmin, l as useSupabase, c as createError } from '../../../_/nitro.mjs';
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

const shares_get = defineEventHandler(async (event) => {
  await requireAdmin(event);
  try {
    const supabase = useSupabase();
    const { data, error } = await supabase.from("shares").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const shares = (data || []).map((item) => ({
      id: item.id,
      fileId: item.file_id,
      fileName: item.file_name,
      filePath: item.file_path,
      files: item.files || [],
      accountId: item.account_id,
      accountName: item.account_name,
      createdAt: item.created_at,
      expiresAt: item.expires_at,
      downloadCount: item.download_count,
      userId: item.user_id
    }));
    const accounts = [...new Map(shares.map((s) => [s.accountId, { id: s.accountId, name: s.accountName }])).values()];
    return {
      shares,
      accounts,
      total: shares.length
    };
  } catch (error) {
    console.error("Fetch shares error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to fetch shares"
    });
  }
});

export { shares_get as default };
//# sourceMappingURL=shares.get.mjs.map
