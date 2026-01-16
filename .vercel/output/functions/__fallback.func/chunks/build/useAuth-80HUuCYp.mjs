import { b as useSupabaseUser, a as useSupabaseClient, u as useState } from './useSupabase-BKfis0hW.mjs';
import { v as vueExports } from '../routes/renderer.mjs';

const useAuth = () => {
  const user = useSupabaseUser();
  const client = useSupabaseClient();
  const role = useState("user-role", () => null);
  const fetchRole = async () => {
    var _a, _b;
    if (!user.value) {
      console.log("[fetchRole] No user, skipping");
      return;
    }
    const jwtRole = (_b = (_a = user.value.app_metadata) == null ? void 0 : _a.claims) == null ? void 0 : _b.user_role;
    console.log("[fetchRole] JWT Role check:", jwtRole);
    if (jwtRole) {
      role.value = jwtRole;
      return;
    }
    console.log("[fetchRole] Fetching from DB (profiles) for user:", user.value.id);
    const { data, error } = await client.from("profiles").select("role").eq("id", user.value.id).single();
    if (error) {
      console.error("[fetchRole] DB Error:", error);
    }
    if (data && data.role) {
      console.log("[fetchRole] DB Role found:", data.role);
      role.value = data.role;
      return data.role;
    } else {
      console.log("[fetchRole] No role found in DB, defaulting to user");
      role.value = "user";
      return "user";
    }
  };
  const isAdmin = vueExports.computed(() => role.value === "admin");
  const login = async (email, password) => {
    const { error, data } = await client.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    if (data.user) {
      try {
        await client.from("profiles").update({ status: "active", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", data.user.id);
      } catch (err) {
        console.warn("Failed to update profile status:", err);
      }
    }
  };
  const logout = async () => {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    role.value = null;
  };
  return {
    user,
    role,
    isAdmin,
    login,
    logout,
    fetchRole
  };
};

export { useAuth as u };
//# sourceMappingURL=useAuth-80HUuCYp.mjs.map
