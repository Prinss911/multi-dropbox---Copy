import { d as defineEventHandler, r as readBody, c as createError, i as addAccount } from '../../_/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, app_key, app_secret, refresh_token, email } = body;
  if (!name || !app_key || !app_secret || !refresh_token) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields: name, app_key, app_secret, refresh_token"
    });
  }
  try {
    const tokenResponse = await $fetch("https://api.dropbox.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
        client_id: app_key,
        client_secret: app_secret
      }).toString()
    });
    const accountInfo = await $fetch("https://api.dropboxapi.com/2/users/get_current_account", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokenResponse.access_token}`
      }
    });
    const account = await addAccount({
      name,
      email: accountInfo.email || email || null,
      account_id: accountInfo.account_id,
      refresh_token,
      app_key,
      app_secret
    });
    return {
      success: true,
      account: {
        id: account == null ? void 0 : account.id,
        name: account == null ? void 0 : account.name,
        email: account == null ? void 0 : account.email
      }
    };
  } catch (err) {
    console.error("Add account error:", err);
    throw createError({
      statusCode: 400,
      statusMessage: err.message || "Failed to add account. Check your credentials."
    });
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
