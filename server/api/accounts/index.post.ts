import { addAccount } from '../../utils/accounts'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const { name, app_key, app_secret, refresh_token, email } = body

    if (!name || !app_key || !app_secret || !refresh_token) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields: name, app_key, app_secret, refresh_token'
        })
    }

    try {
        // Verify the credentials by getting account info from Dropbox
        const tokenResponse = await $fetch<{
            access_token: string
            expires_in: number
        }>('https://api.dropbox.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token,
                client_id: app_key,
                client_secret: app_secret,
            }).toString(),
        })

        // Get account info
        const accountInfo = await $fetch<{
            account_id: string
            email: string
            name: { display_name: string }
        }>('https://api.dropboxapi.com/2/users/get_current_account', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenResponse.access_token}`,
            }
        })

        const account = await addAccount({
            name,
            email: accountInfo.email || email || null,
            account_id: accountInfo.account_id,
            refresh_token,
            app_key,
            app_secret
        })

        return {
            success: true,
            account: {
                id: account?.id,
                name: account?.name,
                email: account?.email
            }
        }
    } catch (err: any) {
        console.error('Add account error:', err)
        throw createError({
            statusCode: 400,
            statusMessage: err.message || 'Failed to add account. Check your credentials.'
        })
    }
})
