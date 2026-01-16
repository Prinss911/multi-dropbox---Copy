import { d as defineEventHandler, m as getAuthUser, c as createError, J as getSharesByUser } from '../../../_/nitro.mjs';
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
  const user = await getAuthUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  try {
    const shares = await getSharesByUser(user.id);
    return shares;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    });
  }
});

export { shares_get as default };
//# sourceMappingURL=shares.get.mjs.map
