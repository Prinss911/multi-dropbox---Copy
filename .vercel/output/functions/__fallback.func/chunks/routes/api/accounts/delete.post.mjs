import { d as defineEventHandler, r as readBody, c as createError, h as getAccounts, a as deleteAccount } from '../../../_/nitro.mjs';
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

const delete_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { accountId } = body;
  if (!accountId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Account ID is required"
    });
  }
  const accounts = await getAccounts();
  if (accounts.length <= 1) {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot delete the last account"
    });
  }
  const success = await deleteAccount(accountId);
  if (!success) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete account"
    });
  }
  return { success: true };
});

export { delete_post as default };
//# sourceMappingURL=delete.post.mjs.map
