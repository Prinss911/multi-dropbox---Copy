import { d as defineEventHandler, e as useRuntimeConfig, c as createError, v as sendRedirect } from '../../../../_/nitro.mjs';
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

const authorize_get = defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const appKey = config.dropboxAppKey;
  const redirectUri = config.dropboxRedirectUri;
  if (!appKey || !redirectUri) {
    throw createError({
      statusCode: 500,
      statusMessage: "Dropbox OAuth not configured. Set DROPBOX_APP_KEY and DROPBOX_REDIRECT_URI in .env"
    });
  }
  const authUrl = new URL("https://www.dropbox.com/oauth2/authorize");
  authUrl.searchParams.set("client_id", appKey);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("token_access_type", "offline");
  return sendRedirect(event, authUrl.toString());
});

export { authorize_get as default };
//# sourceMappingURL=authorize.get.mjs.map
