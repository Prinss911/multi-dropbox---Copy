// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    'reka-ui/nuxt',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/fonts',
  ],

  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },

  runtimeConfig: {
    // Server-side only (not exposed to client)
    dropboxAppKey: process.env.DROPBOX_APP_KEY || '',
    dropboxAppSecret: process.env.DROPBOX_APP_SECRET || '',
    dropboxRefreshToken: process.env.DROPBOX_REFRESH_TOKEN || '',

    // Supabase (server-side)
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },
})