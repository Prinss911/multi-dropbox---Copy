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

const switch_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { accountId } = body;
  if (!accountId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Account ID is required"
    });
  }
  console.log(`[Switch API] Switching to account: ${accountId}`);
  const success = await setActiveAccount(accountId);
  console.log(`[Switch API] Switch result: ${success}`);
  if (!success) {
    throw createError({
      statusCode: 404,
      statusMessage: "Account not found"
    });
  }
  return { success: true, activeAccountId: accountId };
});

export { switch_post as default };
//# sourceMappingURL=switch.post.mjs.map
