import { d as defineEventHandler, r as readBody, c as createError, B as getAccountById, j as getActiveAccount, f as createDropboxClient, H as cleanExpiredShares, o as getHeader, n as createShare } from '../../../_/nitro.mjs';
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

const tokenCache = /* @__PURE__ */ new Map();
async function getAccessToken(account) {
  const now = Date.now();
  const cached = tokenCache.get(account.id);
  if (cached && cached.expiry > now + 5 * 60 * 1e3) {
    return cached.token;
  }
  const response = await $fetch("https://api.dropbox.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
      client_id: account.app_key,
      client_secret: account.app_secret
    }).toString()
  });
  const expiry = now + response.expires_in * 1e3;
  tokenCache.set(account.id, { token: response.access_token, expiry });
  return response.access_token;
}
const create_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const { filePath, fileName, fileId, expirationDays, expirationUnit = "days" } = body;
  if (!filePath || !fileName) {
    throw createError({
      statusCode: 400,
      statusMessage: "File path and name are required"
    });
  }
  const expiresAt = /* @__PURE__ */ new Date();
  if (expirationDays === "never") ; else if (expirationUnit === "seconds") {
    expiresAt.setSeconds(expiresAt.getSeconds() + (expirationDays || 10));
  } else {
    const validDays = [1, 3, 7, 30, 90];
    const days = validDays.includes(expirationDays) ? expirationDays : 7;
    expiresAt.setDate(expiresAt.getDate() + days);
  }
  try {
    let account;
    if (body.accountId) {
      account = await getAccountById(body.accountId);
      if (!account) throw createError({ statusCode: 404, statusMessage: "Account not found" });
    } else {
      account = await getActiveAccount();
      if (!account) throw createError({ statusCode: 400, statusMessage: "No active account" });
    }
    console.log(`[Share] Validating file "${filePath}" exists in account "${account.name}"...`);
    try {
      const accessToken = await getAccessToken(account);
      const dbx = createDropboxClient(accessToken);
      await dbx.filesGetMetadata({ path: filePath });
      console.log(`[Share] File validated successfully in ${account.name}`);
    } catch (err) {
      if ((_b = (_a = err.error) == null ? void 0 : _a.error_summary) == null ? void 0 : _b.includes("path/not_found")) {
        console.error(`[Share] File NOT found in account ${account.name}: ${filePath}`);
        throw createError({
          statusCode: 400,
          statusMessage: `File not found in account "${account.name}". Make sure the file exists and the correct account is selected.`
        });
      }
      console.warn(`[Share] Could not validate file, proceeding anyway:`, err.message);
    }
    await cleanExpiredShares();
    const { useSupabase } = await import('../../../_/nitro.mjs').then(function (n) { return n.aa; });
    const supabase = useSupabase();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const { data: existingShareData } = await supabase.from("shares").select("id, expires_at").eq("file_path", filePath).eq("account_id", account.id).or(`expires_at.gt.${now},expires_at.is.null`).limit(1).maybeSingle();
    const existingShare = existingShareData;
    if (existingShare) {
      console.log(`[Share] Active share already exists for "${filePath}", returning existing link.`);
      const host2 = getHeader(event, "host") || "localhost:3000";
      const protocol2 = host2.includes("localhost") ? "http" : "https";
      const shareUrl2 = `${protocol2}://${host2}/file/${existingShare.id}`;
      return {
        success: true,
        existing: true,
        // Flag to indicate this was an existing share
        share: {
          id: existingShare.id,
          expiresAt: existingShare.expires_at,
          url: shareUrl2
        }
      };
    }
    const files = [{
      name: fileName,
      path: filePath,
      size: body.fileSize || 0
    }];
    const share = await createShare({
      fileId: fileId || filePath,
      fileName,
      filePath,
      files,
      accountId: account.id,
      accountName: account.name,
      expiresAt: expirationDays === "never" ? null : expiresAt.toISOString()
    });
    const host = getHeader(event, "host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const shareUrl = `${protocol}://${host}/file/${share.id}`;
    return {
      success: true,
      share: {
        ...share,
        url: shareUrl
      }
    };
  } catch (error) {
    console.error("Create share error:", error);
    throw createError({
      statusCode: error.statusCode || error.status || 500,
      statusMessage: error.statusMessage || error.message || "Failed to create share link"
    });
  }
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
