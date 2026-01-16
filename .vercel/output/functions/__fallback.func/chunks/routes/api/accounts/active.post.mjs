import { d as defineEventHandler, r as readBody, c as createError, s as setActiveAccount } from '../../../_/nitro.mjs';
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

const active_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { accountId } = body;
  if (!accountId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Account ID is required"
    });
  }
  const success = await setActiveAccount(accountId);
  if (!success) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to set active account"
    });
  }
  return { success: true };
});

export { active_post as default };
//# sourceMappingURL=active.post.mjs.map
