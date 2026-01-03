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

  // Cloudflare Pages deployment
  nitro: {
    preset: 'cloudflare_pages'
  },

  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },

  runtimeConfig: {
    // Server-side only (not exposed to client)
    dropboxAppKey: process.env.DROPBOX_APP_KEY || '',
    dropboxAppSecret: process.env.DROPBOX_APP_SECRET || '',
    dropboxRedirectUri: process.env.DROPBOX_REDIRECT_URI || 'http://localhost:3000/api/auth/dropbox/callback',

    // Supabase (server-side)
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',

    public: {
      dropboxAppKey: process.env.DROPBOX_APP_KEY || '',
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
    }
  },
})