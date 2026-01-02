import { Dropbox } from 'dropbox'
import { getAccountById, getActiveAccount, type DropboxAccount } from './accounts'

// Cache for access tokens per account
const tokenCache = new Map<string, { token: string; expiry: number }>()

async function getAccessTokenForAccount(account: DropboxAccount): Promise<string> {
    const now = Date.now()
    const cached = tokenCache.get(account.id)

    // Return cached token if still valid (with 5 min buffer)
    if (cached && cached.expiry > now + 5 * 60 * 1000) {
        return cached.token
    }

    if (!account.refresh_token) {
        throw new Error(`No refresh token for account: ${account.name}`)
    }

    if (!account.app_key || !account.app_secret) {
        throw new Error(`No app credentials for account: ${account.name}`)
    }

    // Exchange refresh token for access token using account's own app credentials
    const response = await $fetch<{
        access_token: string
        expires_in: number
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

    const expiry = now + response.expires_in * 1000

    // Cache the token
    tokenCache.set(account.id, {
        token: response.access_token,
        expiry
    })

    return response.access_token
}

export function useDropboxServer() {
    return {
        async getClientForAccount(accountId: string) {
            const account = await getAccountById(accountId)
            if (!account) {
                throw new Error(`Account not found: ${accountId}`)
            }

            const accessToken = await getAccessTokenForAccount(account)
            return new Dropbox({ accessToken, fetch: fetch })
        },

        async getActiveClient() {
            const account = await getActiveAccount()
            if (!account) {
                throw new Error('No active account configured')
            }

            const accessToken = await getAccessTokenForAccount(account)
            return { client: new Dropbox({ accessToken, fetch: fetch }), account }
        }
    }
}
