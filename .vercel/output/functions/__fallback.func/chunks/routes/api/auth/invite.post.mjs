import { d as defineEventHandler, m as getAuthUser, c as createError, w as useSupabaseAdmin, r as readBody } from '../../../_/nitro.mjs';
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

const invite_post = defineEventHandler(async (event) => {
  var _a;
  const user = await getAuthUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const supabase = useSupabaseAdmin();
  const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!adminProfile || adminProfile.role !== "admin") {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }
  const body = await readBody(event);
  const { email, role = "user" } = body;
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: "Email is required" });
  }
  const origin = event.node.req.headers.origin || "http://localhost:3000";
  const redirectUrl = `${origin}/auth/confirm`;
  let userData = null;
  let finalLinkType = "invite";
  let inviteData = { user: null };
  let inviteError = null;
  try {
    const res = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectUrl
    });
    inviteData = res.data;
    inviteError = res.error;
  } catch (e) {
    inviteError = e;
  }
  if (inviteError && ((_a = inviteError.message) == null ? void 0 : _a.includes("already been registered"))) {
    console.log(`[Invite] User ${email} already registered (caught error). Proceeding to check confirmation/reset.`);
    inviteError = null;
  }
  if (inviteError) {
    throw createError({ statusCode: 500, statusMessage: inviteError.message });
  }
  userData = inviteData == null ? void 0 : inviteData.user;
  if (!userData) {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const foundUser = usersData.users.find((u) => u.email === email);
    if (foundUser) {
      userData = foundUser;
    }
  }
  const isConfirmed = (userData == null ? void 0 : userData.email_confirmed_at) || (userData == null ? void 0 : userData.phone_confirmed_at);
  if (isConfirmed || !userData) {
    finalLinkType = "recovery";
    console.log(`[Invite] User ${email} exists/confirmed. Sending Password Reset email.`);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    if (resetError) {
      console.error("[Invite] Reset password error:", resetError);
      throw createError({ statusCode: 500, statusMessage: resetError.message });
    }
  } else {
    console.log(`[Invite] User ${email} is new. Invite email sent by Supabase.`);
  }
  if (userData) {
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userData.id,
      email,
      role
    }, { onConflict: "id" });
    if (profileError) {
      console.error("Failed to create profile with role:", profileError);
    }
  }
  return {
    success: true,
    user: userData,
    link: null,
    type: finalLinkType
  };
});

export { invite_post as default };
//# sourceMappingURL=invite.post.mjs.map
