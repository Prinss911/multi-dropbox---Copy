import { d as defineEventHandler, b as requireAdmin, r as readBody, e as useRuntimeConfig, c as createError, f as createDropboxClient, h as getAccounts, i as addAccount, s as setActiveAccount } from '../../../_/nitro.mjs';
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

const add_post = defineEventHandler(async (event) => {
  await requireAdmin(event);
  const body = await readBody(event);
  const { code, name, appKey, appSecret } = body;
  const config = useRuntimeConfig();
  const useAppKey = appKey || config.public.dropboxAppKey || config.dropboxAppKey;
  const useAppSecret = appSecret || config.dropboxAppSecret;
  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: "Authorization code is required"
    });
  }
  if (!useAppKey || !useAppSecret) {
    throw createError({
      statusCode: 400,
      statusMessage: "App Key and App Secret are required (and not configured in .env)"
    });
  }
  try {
    const tokenResponse = await $fetch("https://api.dropbox.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: useAppKey,
        client_secret: useAppSecret
      }).toString()
    });
    const dbx = createDropboxClient(tokenResponse.access_token);
    const accountInfo = await dbx.usersGetCurrentAccount();
    const existingAccounts = await getAccounts();
    const existingAccount = existingAccounts.find(
      (a) => a.account_id === tokenResponse.account_id
    );
    if (existingAccount) {
      throw createError({
        statusCode: 409,
        statusMessage: "This Dropbox account is already added"
      });
    }
    const newAccount = await addAccount({
      name: name || accountInfo.result.name.display_name,
      email: accountInfo.result.email,
      account_id: tokenResponse.account_id,
      refresh_token: tokenResponse.refresh_token,
      app_key: useAppKey,
      app_secret: useAppSecret
    });
    if (!newAccount) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to save account"
      });
    }
    await setActiveAccount(newAccount.id);
    return {
      success: true,
      account: {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email
      }
    };
  } catch (error) {
    console.error("Error adding account:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to add account"
    });
  }
});

export { add_post as default };
//# sourceMappingURL=add.post.mjs.map
