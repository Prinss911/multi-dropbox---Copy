import { getAccounts, type DropboxAccount } from '../../utils/accounts'
import { createDropboxClient } from '../../utils/dropbox'

// Token cache for efficiency
const tokenCache = new Map<string, { token: string; expiry: number }>()

async function getAccessTokenForAccount(account: DropboxAccount): Promise<string> {
    const now = Date.now()
    const cached = tokenCache.get(account.id)

    if (cached && cached.expiry > now + 5 * 60 * 1000) {
        return cached.token
    }

    if (!account.refresh_token || !account.app_key || !account.app_secret) {
        throw new Error(`Missing credentials for account ${account.name}`)
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

interface FileToAllocate {
    index: number
    name: string
    size: number
}

interface AllocationResult {
    index: number
    name: string
    size: number
    accountId: string
    accountName: string
    accessToken: string
}

interface AccountWithStorage {
    account: DropboxAccount
    accessToken: string
    available: number
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { files } = body as { files: FileToAllocate[] }

        if (!files || !Array.isArray(files) || files.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Files array is required'
            })
        }

        // Get all accounts
        const accounts = await getAccounts()

        if (accounts.length === 0) {
            throw createError({
                statusCode: 503,
                statusMessage: 'No accounts available for upload'
            })
        }

        console.log(`[Allocate] Allocating ${files.length} files across ${accounts.length} accounts...`)

        // Get storage info for all accounts in parallel
        const accountsWithStorage: AccountWithStorage[] = await Promise.all(
            accounts.map(async (account) => {
                try {
                    const accessToken = await getAccessTokenForAccount(account)
                    const dbx = createDropboxClient(accessToken)
                    const space = await dbx.usersGetSpaceUsage()

                    let allocated = 0
                    if (space.result.allocation['.tag'] === 'individual') {
                        allocated = (space.result.allocation as any).allocated || 0
                    } else if (space.result.allocation['.tag'] === 'team') {
                        allocated = (space.result.allocation as any).allocated || 0
                    }

                    const available = allocated - space.result.used
                    console.log(`[Allocate] ${account.name}: ${Math.round(available / 1024 / 1024)} MB available`)

                    return {
                        account,
                        accessToken,
                        available
                    }
                } catch (err) {
                    console.error(`[Allocate] Error checking ${account.name}:`, err)
                    return null
                }
            })
        ).then(results => results.filter((r): r is AccountWithStorage => r !== null))

        if (accountsWithStorage.length === 0) {
            throw createError({
                statusCode: 503,
                statusMessage: 'No accessible accounts available'
            })
        }

        // Sort accounts by available space (descending)
        accountsWithStorage.sort((a, b) => b.available - a.available)

        // Allocate files to accounts using First Fit Decreasing algorithm
        // Sort files by size descending for better packing
        const sortedFiles = [...files].sort((a, b) => b.size - a.size)

        // Track remaining space per account
        const remainingSpace = new Map<string, number>()
        accountsWithStorage.forEach(a => remainingSpace.set(a.account.id, a.available))

        const allocations: AllocationResult[] = []
        const unallocated: FileToAllocate[] = []

        for (const file of sortedFiles) {
            let allocated = false

            // Find first account that can fit this file
            for (const acc of accountsWithStorage) {
                const remaining = remainingSpace.get(acc.account.id)!

                if (remaining >= file.size) {
                    // Allocate to this account
                    allocations.push({
                        index: file.index,
                        name: file.name,
                        size: file.size,
                        accountId: acc.account.id,
                        accountName: acc.account.name,
                        accessToken: acc.accessToken
                    })

                    // Update remaining space
                    remainingSpace.set(acc.account.id, remaining - file.size)
                    allocated = true

                    console.log(`[Allocate] ${file.name} (${Math.round(file.size / 1024 / 1024)}MB) → ${acc.account.name}`)
                    break
                }
            }

            if (!allocated) {
                unallocated.push(file)
                console.warn(`[Allocate] Cannot fit ${file.name} (${Math.round(file.size / 1024 / 1024)}MB) - no account has enough space`)
            }
        }

        // Sort allocations back to original order
        allocations.sort((a, b) => a.index - b.index)

        // Calculate total available across all accounts
        const totalAvailable = accountsWithStorage.reduce((sum, a) => sum + a.available, 0)
        const totalRequested = files.reduce((sum, f) => sum + f.size, 0)

        if (unallocated.length > 0) {
            throw createError({
                statusCode: 507,
                statusMessage: `Insufficient storage. Need ${Math.round(totalRequested / 1024 / 1024)}MB but only ${Math.round(totalAvailable / 1024 / 1024)}MB available across all accounts.`
            })
        }

        // Group by account for summary
        const byAccount = new Map<string, number>()
        allocations.forEach(a => {
            byAccount.set(a.accountName, (byAccount.get(a.accountName) || 0) + 1)
        })

        console.log(`[Allocate] Allocation complete:`, Object.fromEntries(byAccount))

        return {
            success: true,
            allocations,
            summary: {
                totalFiles: files.length,
                totalSize: totalRequested,
                accountsUsed: byAccount.size,
                distribution: Object.fromEntries(byAccount)
            }
        }

    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('[Allocate] Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to allocate files'
        })
    }
})
