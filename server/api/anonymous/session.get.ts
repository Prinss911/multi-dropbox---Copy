import { getAccounts, type DropboxAccount } from '../../utils/accounts'
import { Dropbox } from 'dropbox'

// Token cache
const tokenCache = new Map<string, { token: string; expiry: number }>()

async function getAccessTokenForAccount(account: DropboxAccount): Promise<string> {
    const now = Date.now()
    const cached = tokenCache.get(account.id)

    if (cached && cached.expiry > now + 5 * 60 * 1000) {
        return cached.token
    }

    if (!account.refresh_token || !account.app_key || !account.app_secret) {
        throw new Error(`Missing credentials for account`)
    }

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
    tokenCache.set(account.id, { token: response.access_token, expiry })

    return response.access_token
}

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const fileSize = Number(query.fileSize) || 0

        // Get all accounts
        const accounts = await getAccounts()

        if (accounts.length === 0) {
            throw createError({
                statusCode: 503,
                statusMessage: 'No accounts available for upload'
            })
        }

        // Get storage info for all accounts in parallel
        const accountsWithStorage = await Promise.all(accounts.map(async (account) => {
            try {
                const accessToken = await getAccessTokenForAccount(account)
                // Fix fetch for Cloudflare - use globalThis.fetch explicitly
                const customFetch = (url: any, init: any) => globalThis.fetch(url, init)
                const dbx = new Dropbox({ accessToken, fetch: customFetch })
                const space = await dbx.usersGetSpaceUsage()

                let allocated = 0
                if (space.result.allocation['.tag'] === 'individual') {
                    allocated = space.result.allocation.allocated
                } else if (space.result.allocation['.tag'] === 'team') {
                    allocated = space.result.allocation.allocated
                }

                return {
                    ...account,
                    accessToken,
                    used: space.result.used,
                    allocated,
                    available: allocated - space.result.used
                }
            } catch (err) {
                console.error(`Error checking storage for ${account.name}:`, err)
                return null
            }
        }))

        // Filter valid accounts and those with enough space
        const validAccounts = accountsWithStorage
            .filter((acc): acc is NonNullable<typeof acc> => acc !== null)
            .filter(acc => acc.available >= fileSize)

        if (validAccounts.length === 0) {
            throw createError({
                statusCode: 507,
                statusMessage: 'Insufficient storage space across all accounts'
            })
        }

        // Sort by available space (descending) - Pick the one with MOST space
        validAccounts.sort((a, b) => b.available - a.available)
        const bestAccount = validAccounts[0]

        return {
            accessToken: bestAccount.accessToken,
            accountId: bestAccount.id,
            accountName: bestAccount.name,
            uploadPath: '/Uploads', // Default upload folder
            availableSpace: bestAccount.available
        }
    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('Anonymous session error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.message || 'Failed to create upload session'
        })
    }
})
