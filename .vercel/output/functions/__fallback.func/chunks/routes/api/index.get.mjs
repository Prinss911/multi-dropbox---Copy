import { d as defineEventHandler, b as requireAdmin, h as getAccounts, j as getActiveAccount } from '../../_/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  await requireAdmin(event);
  const accounts = await getAccounts();
  const activeAccount = await getActiveAccount();
  return {
    accounts: accounts.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      isActive: a.is_active,
      createdAt: a.created_at
    })),
    activeAccountId: (activeAccount == null ? void 0 : activeAccount.id) || ""
  };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
