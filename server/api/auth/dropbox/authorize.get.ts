// OAuth Authorize - Redirect user to Dropbox for authorization
export default defineEventHandler((event) => {
    const config = useRuntimeConfig()

    const appKey = config.dropboxAppKey
    const redirectUri = config.dropboxRedirectUri

    if (!appKey || !redirectUri) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Dropbox OAuth not configured. Set DROPBOX_APP_KEY and DROPBOX_REDIRECT_URI in .env'
        })
    }

    // Build Dropbox OAuth URL
    const authUrl = new URL('https://www.dropbox.com/oauth2/authorize')
    authUrl.searchParams.set('client_id', appKey)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('token_access_type', 'offline') // Get refresh token

    return sendRedirect(event, authUrl.toString())
})
