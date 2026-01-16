import { d as defineEventHandler, e as useRuntimeConfig, q as getQuery, v as sendRedirect, l as useSupabase } from '../../../../_/nitro.mjs';
import { randomFillSync, randomUUID } from 'node:crypto';
import 'crypto';
import 'util';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:util';
import 'node:path';
import 'node:process';
import 'node:tty';
import 'node:fs';

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] +
        '-' +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] +
        '-' +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] +
        '-' +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] +
        '-' +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]).toLowerCase();
}

const rnds8Pool = new Uint8Array(256);
let poolPtr = rnds8Pool.length;
function rng() {
    if (poolPtr > rnds8Pool.length - 16) {
        randomFillSync(rnds8Pool);
        poolPtr = 0;
    }
    return rnds8Pool.slice(poolPtr, (poolPtr += 16));
}

const native = { randomUUID };

function _v4(options, buf, offset) {
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    return unsafeStringify(rnds);
}
function v4(options, buf, offset) {
    if (native.randomUUID && true && !options) {
        return native.randomUUID();
    }
    return _v4(options);
}

const callback_get = defineEventHandler(async (event) => {
  var _a;
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const code = query.code;
  const error = query.error;
  if (error) {
    return sendRedirect(event, "/accounts?error=" + encodeURIComponent(error));
  }
  if (!code) {
    return sendRedirect(event, "/accounts?error=no_code");
  }
  const appKey = config.dropboxAppKey;
  const appSecret = config.dropboxAppSecret;
  const redirectUri = config.dropboxRedirectUri;
  if (!appKey || !appSecret || !redirectUri) {
    return sendRedirect(event, "/accounts?error=oauth_not_configured");
  }
  try {
    console.log("[OAuth] Exchanging code for tokens...");
    const tokenResponse = await $fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: appKey,
        client_secret: appSecret,
        redirect_uri: redirectUri
      }).toString()
    });
    console.log("[OAuth] Got tokens, access_token exists:", !!tokenResponse.access_token);
    console.log("[OAuth] Token response uid:", tokenResponse.uid);
    console.log("[OAuth] Getting account info...");
    const accountResp = await fetch("https://api.dropboxapi.com/2/users/get_current_account", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokenResponse.access_token}`
      }
    });
    if (!accountResp.ok) {
      const errText = await accountResp.text();
      console.error("[OAuth] Account info error:", accountResp.status, errText);
      throw new Error(`Failed to get account info: ${accountResp.status} ${errText}`);
    }
    const accountInfo = await accountResp.json();
    console.log("[OAuth] Got account info:", accountInfo.email, (_a = accountInfo.name) == null ? void 0 : _a.display_name);
    const supabase = useSupabase();
    console.log("[OAuth] Checking if account exists for email:", accountInfo.email);
    const { data: existingAccount, error: selectError } = await supabase.from("dropbox_accounts").select("id").eq("email", accountInfo.email).single();
    if (selectError && selectError.code !== "PGRST116") {
      console.error("[OAuth] Supabase select error:", selectError);
    }
    if (existingAccount) {
      console.log("[OAuth] Updating existing account:", existingAccount.id);
      const { error: updateError } = await supabase.from("dropbox_accounts").update({
        name: accountInfo.name.display_name,
        refresh_token: tokenResponse.refresh_token,
        app_key: appKey,
        app_secret: appSecret,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", existingAccount.id);
      if (updateError) {
        console.error("[OAuth] Supabase update error:", updateError);
        throw new Error(`Failed to update account: ${updateError.message}`);
      }
      console.log("[OAuth] Account updated successfully");
      return sendRedirect(event, "/accounts?success=updated");
    }
    const newId = v4();
    console.log("[OAuth] Creating new account with id:", newId);
    const { error: insertError } = await supabase.from("dropbox_accounts").insert({
      id: newId,
      name: accountInfo.name.display_name,
      email: accountInfo.email,
      account_id: tokenResponse.uid || tokenResponse.account_id,
      refresh_token: tokenResponse.refresh_token,
      app_key: appKey,
      app_secret: appSecret,
      is_active: false
    });
    if (insertError) {
      console.error("[OAuth] Supabase insert error:", insertError);
      throw new Error(`Failed to save account: ${insertError.message}`);
    }
    console.log("[OAuth] Account created successfully");
    return sendRedirect(event, "/accounts?success=added");
  } catch (err) {
    console.error("OAuth callback error:", err);
    return sendRedirect(event, "/accounts?error=" + encodeURIComponent(err.message || "oauth_failed"));
  }
});

export { callback_get as default };
//# sourceMappingURL=callback.get.mjs.map
