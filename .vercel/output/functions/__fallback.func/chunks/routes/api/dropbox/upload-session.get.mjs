import { d as defineEventHandler, q as getQuery, j as getActiveAccount, c as createError } from '../../../_/nitro.mjs';
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

const uploadSession_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const path = query.path || "";
  try {
    const account = await getActiveAccount();
    if (!account) {
      throw createError({
        statusCode: 400,
        statusMessage: "No active account found"
      });
    }
    if (!account.app_key || !account.app_secret) {
      throw createError({
        statusCode: 400,
        statusMessage: "Account missing app credentials"
      });
    }
    if (!account.refresh_token) {
      throw createError({
        statusCode: 400,
        statusMessage: "Account missing refresh token"
      });
    }
    const tokenResponse = await $fetch("https://api.dropbox.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refresh_token,
        client_id: account.app_key,
        client_secret: account.app_secret
      }).toString()
    });
    return {
      accessToken: tokenResponse.access_token,
      uploadPath: path || "",
      accountId: account.id,
      accountName: account.name
    };
  } catch (error) {
    console.error("Upload session error:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: error.status || 500,
      statusMessage: error.message || "Failed to get upload session"
    });
  }
});

export { uploadSession_get as default };
//# sourceMappingURL=upload-session.get.mjs.map
