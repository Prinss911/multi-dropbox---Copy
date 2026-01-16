import { d as defineEventHandler, m as getAuthUser, c as createError, w as useSupabaseAdmin, g as getRouterParam } from '../../../_/nitro.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  const currentUser = await getAuthUser(event);
  if (!currentUser) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const supabase = useSupabaseAdmin();
  const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single();
  if (!adminProfile || adminProfile.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden - Admin access required" });
  }
  const userIdToDelete = getRouterParam(event, "id");
  if (!userIdToDelete) {
    throw createError({ statusCode: 400, statusMessage: "User ID is required" });
  }
  if (userIdToDelete === currentUser.id) {
    throw createError({ statusCode: 400, statusMessage: "Cannot delete your own account" });
  }
  const { error: profileError } = await supabase.from("profiles").delete().eq("id", userIdToDelete);
  if (profileError) {
    console.error("[DeleteUser] Profile deletion error:", profileError);
  }
  const { error: filesError } = await supabase.from("files").delete().eq("user_id", userIdToDelete);
  if (filesError) {
    console.error("[DeleteUser] Files deletion error:", filesError);
  }
  const { error: authError } = await supabase.auth.admin.deleteUser(userIdToDelete);
  if (authError) {
    console.error("[DeleteUser] Auth user deletion error:", authError);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete user: ${authError.message}`
    });
  }
  console.log(`[DeleteUser] Successfully deleted user: ${userIdToDelete}`);
  return {
    success: true,
    message: "User deleted successfully"
  };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
