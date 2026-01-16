import { a6 as createClient } from '../_/nitro.mjs';
import { e as useRuntimeConfig, c as useNuxtApp } from './server.mjs';
import { v as vueExports } from '../routes/renderer.mjs';

const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = vueExports.toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (vueExports.isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const useSupabaseClient = () => {
  {
    const config2 = useRuntimeConfig();
    return createClient(
      config2.public.supabaseUrl || "",
      config2.public.supabaseAnonKey || "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
  }
};
const useSupabaseUser = () => {
  const user = useState("supabase-user", () => null);
  useState("supabase-auth-initialized", () => false);
  return user;
};

export { useSupabaseClient as a, useSupabaseUser as b, useState as u };
//# sourceMappingURL=useSupabase-BKfis0hW.mjs.map
