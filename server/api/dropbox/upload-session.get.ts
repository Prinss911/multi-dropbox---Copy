import { getActiveAccount } from '../../utils/accounts'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const path = (query.path as string) || ''

    try {
        // Get active account from database
        const account = await getActiveAccount()

        if (!account) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No active account found'
            })
        }

        if (!account.app_key || !account.app_secret) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Account missing app credentials'
            })
        }

        if (!account.refresh_token) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Account missing refresh token'
            })
        }

        // Get fresh access token for the ACTIVE account
        const tokenResponse = await $fetch<{
            access_token: string
        }>('https://api.dropbox.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: account.refresh_token,
                client_id: account.app_key,
                client_secret: account.app_secret,
            }).toString(),
        })

        // Return upload parameters for client-side upload
        return {
            accessToken: tokenResponse.access_token,
            uploadPath: path || '',
            accountId: account.id,
            accountName: account.name
        }
    } catch (error: any) {
        console.error('Upload session error:', error)

        if (error.statusCode) throw error

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.message || 'Failed to get upload session'
        })
    }
})
