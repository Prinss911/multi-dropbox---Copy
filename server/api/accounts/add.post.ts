
import { addAccount, getAccounts, setActiveAccount, getAccountById } from '../../utils/accounts'
import { createDropboxClient } from '../../utils/dropbox'
import { requireAdmin } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
    // SECURITY: Only admins can add Dropbox accounts
    await requireAdmin(event)

    const body = await readBody(event)
    const { code, name, appKey, appSecret } = body
    const config = useRuntimeConfig()

    // Use provided credentials OR fallback to server-side config
    const useAppKey = appKey || config.public.dropboxAppKey || config.dropboxAppKey
    const useAppSecret = appSecret || config.dropboxAppSecret

    if (!code) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Authorization code is required'
        })
    }

    if (!useAppKey || !useAppSecret) {
        throw createError({
            statusCode: 400,
            statusMessage: 'App Key and App Secret are required (and not configured in .env)'
        })
    }

    try {
        // Exchange code for tokens using the provided app credentials
        const tokenResponse = await $fetch<{
            access_token: string
            refresh_token: string
            expires_in: number
            account_id: string
        }>('https://api.dropbox.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                client_id: useAppKey,
                client_secret: useAppSecret,
            }).toString(),
        })

        // Get account info using the access token
        const dbx = createDropboxClient(tokenResponse.access_token)
        const accountInfo = await dbx.usersGetCurrentAccount()

        // Check if account already exists
        const existingAccounts = await getAccounts()
        const existingAccount = existingAccounts.find(
            a => a.account_id === tokenResponse.account_id
        )

        if (existingAccount) {
            throw createError({
                statusCode: 409,
                statusMessage: 'This Dropbox account is already added'
            })
        }

        // Add new account to Supabase with app credentials
        const newAccount = await addAccount({
            name: name || accountInfo.result.name.display_name,
            email: accountInfo.result.email,
            account_id: tokenResponse.account_id,
            refresh_token: tokenResponse.refresh_token,
            app_key: useAppKey,
            app_secret: useAppSecret
        })

        if (!newAccount) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to save account'
            })
        }

        // Set as active account
        await setActiveAccount(newAccount.id)

        return {
            success: true,
            account: {
                id: newAccount.id,
                name: newAccount.name,
                email: newAccount.email
            }
        }
    } catch (error: any) {
        console.error('Error adding account:', error)

        if (error.statusCode) throw error

        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to add account'
        })
    }
})
