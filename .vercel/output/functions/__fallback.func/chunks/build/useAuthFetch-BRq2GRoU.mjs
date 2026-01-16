import { a as useSupabaseClient } from './useSupabase-BKfis0hW.mjs';

const useAuthFetch = () => {
  const client = useSupabaseClient();
  const authFetch = async (url, options = {}) => {
    let { data: { session } } = await client.auth.getSession();
    if (!(session == null ? void 0 : session.access_token)) {
      console.log("[authFetch] No session found, attempting refresh...");
      const { data: refreshData, error: refreshError } = await client.auth.refreshSession();
      if (refreshError) {
        console.error("[authFetch] Session refresh failed:", refreshError.message);
        throw new Error("Not authenticated - please login again");
      }
      session = refreshData.session;
    }
    if (!(session == null ? void 0 : session.access_token)) {
      console.error("[authFetch] No access token available after refresh attempt");
      throw new Error("Not authenticated - please login again");
    }
    console.log("[authFetch] Making request to:", url, "Method:", options.method || "GET");
    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${session.access_token}`
    };
    try {
      const result = await $fetch(url, {
        method: options.method || "GET",
        body: options.body,
        headers
      });
      console.log("[authFetch] Request successful");
      return result;
    } catch (err) {
      console.error("[authFetch] Request failed:", err.message || err);
      throw err;
    }
  };
  return { authFetch };
};

export { useAuthFetch as u };
//# sourceMappingURL=useAuthFetch-BRq2GRoU.mjs.map
