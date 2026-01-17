import pkg from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  app: {
    head: {
      meta: [
        { name: 'application-version', content: pkg.version },
        { name: 'application-build-time', content: new Date().toISOString() }
      ]
    }
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },

  modules: [
    '@nuxt/devtools',
    '@nuxtjs/tailwindcss',
    'reka-ui/nuxt',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/fonts',
  ],

  css: [
    'video.js/dist/video-js.css'
  ],

  // Cloudflare Pages deployment
  nitro: {
    preset: 'cloudflare_pages'
  },

  routeRules: {
    '/': { redirect: '/drive/upload' },
    '/upload': { redirect: '/drive/upload' },
    '/user': { redirect: '/drive' },
    '/download/**': { redirect: '/file/**' }
  },

  // Allow Cloudflare Tunnel hosts
  vite: {
    server: {
      allowedHosts: true
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: '_nuxt/[name].[hash].js',
          chunkFileNames: '_nuxt/[name].[hash].js',
          assetFileNames: '_nuxt/[name].[hash][extname]'
        }
      }
    }
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