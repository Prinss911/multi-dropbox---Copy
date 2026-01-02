import { getShareById, incrementDownloadCount } from '../../../utils/shares'
import { getAccounts, type DropboxAccount } from '../../../utils/accounts'
import { createDropboxClient } from '../../../utils/dropbox'

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
    const shareId = getRouterParam(event, 'id')
    const query = getQuery(event)
    const fileIndex = query.fileIndex !== undefined ? parseInt(query.fileIndex as string) : undefined

    if (!shareId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Share ID is required'
        })
    }

    try {
        // Get share info
        const share = await getShareById(shareId)

        if (!share) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Share link not found or has been deleted'
            })
        }

        // Check expiration
        if (new Date(share.expiresAt) < new Date()) {
            throw createError({
                statusCode: 410,
                statusMessage: 'This share link has expired'
            })
        }

        // Get account
        const accounts = await getAccounts()
        const account = accounts.find(a => a.id === share.accountId)

        if (!account) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Account not found'
            })
        }

        // Get access token
        const accessToken = await getAccessTokenForAccount(account)
        const dbx = createDropboxClient(accessToken)

        // Determine which file(s) to return
        const files = share.files || []
        const isBatch = files.length > 1

        // If fileIndex is provided, get specific file download link
        if (fileIndex !== undefined) {
            if (fileIndex < 0 || fileIndex >= files.length) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Invalid file index'
                })
            }

            const file = files[fileIndex]
            try {
                const response = await dbx.filesGetTemporaryLink({ path: file.path })

                await incrementDownloadCount(shareId)

                return {
                    success: true,
                    fileName: file.name,
                    downloadUrl: response.result.link,
                    expiresAt: share.expiresAt,
                    downloadCount: share.downloadCount + 1
                }
            } catch (err: any) {
                if (err.error?.error_summary?.includes('path/not_found')) {
                    throw createError({
                        statusCode: 404,
                        statusMessage: 'File not found. It may have been deleted.'
                    })
                }
                throw err
            }
        }

        // For single file or legacy share
        if (!isBatch && files.length === 1) {
            const file = files[0]
            try {
                await dbx.filesGetMetadata({ path: file.path })

                return {
                    success: true,
                    fileName: file.name,
                    files: [{ ...file, available: true }],
                    expiresAt: share.expiresAt,
                    downloadCount: share.downloadCount,
                    // No downloadUrl returned - use stream endpoint
                }
            } catch (err: any) {
                if (err.error?.error_summary?.includes('path/not_found')) {
                    return {
                        success: true,
                        fileName: file.name,
                        files: [{ ...file, available: false }],
                        expiresAt: share.expiresAt,
                        downloadCount: share.downloadCount
                    }
                }
                throw err
            }
        }

        // For batch shares, check availability of each file
        const filesWithStatus = await Promise.all(
            files.map(async (file) => {
                try {
                    await dbx.filesGetMetadata({ path: file.path })
                    return { ...file, available: true }
                } catch (err: any) {
                    if (err.error?.error_summary?.includes('path/not_found')) {
                        return { ...file, available: false }
                    }
                    return { ...file, available: true } // Assume available if error is not path_not_found
                }
            })
        )

        const availableCount = filesWithStatus.filter(f => f.available).length
        const missingCount = filesWithStatus.filter(f => !f.available).length

        return {
            success: true,
            fileName: share.fileName,
            files: filesWithStatus,
            isBatch: true,
            expiresAt: share.expiresAt,
            downloadCount: share.downloadCount,
            availableCount,
            missingCount
        }

    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('Share download error:', {
            message: error.message,
            status: error.status,
            errorSummary: error.error?.error_summary
        })

        if (error.error?.error_summary?.includes('path/not_found')) {
            throw createError({
                statusCode: 404,
                statusMessage: 'File not found. It may have been moved or deleted.'
            })
        }

        throw createError({
            statusCode: error.status || 400,
            statusMessage: error.error?.error_summary || error.message || 'Failed to get download link'
        })
    }
})

