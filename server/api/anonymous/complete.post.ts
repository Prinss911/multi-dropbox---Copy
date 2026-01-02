import { getAccounts, type DropboxAccount } from '../../utils/accounts'
import { createShare, type ShareFile } from '../../utils/shares'
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

interface FileInfo {
    name: string
    path: string
    size: number
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const {
        accountId,
        // Legacy single file
        filePath,
        fileName,
        // New batch upload
        files,
        folderPath,
        // Expiration
        expirationDays = 7,
        expirationUnit = 'days'
    } = body

    // Validate: either single file or batch
    const isBatch = Array.isArray(files) && files.length > 0

    if (!accountId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Account ID is required'
        })
    }

    if (!isBatch && (!filePath || !fileName)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Either files array or filePath/fileName are required'
        })
    }

    try {
        // Get account
        const accounts = await getAccounts()
        const account = accounts.find(a => a.id === accountId)

        if (!account) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Account not found'
            })
        }

        // Calculate expiration date
        const expiresAt = new Date()

        if (expirationUnit === 'seconds') {
            expiresAt.setSeconds(expiresAt.getSeconds() + (expirationDays || 10))
        } else {
            const validDays = [1, 3, 7, 30]
            const days = validDays.includes(expirationDays) ? expirationDays : 7
            expiresAt.setDate(expiresAt.getDate() + days)
        }

        // Prepare share data
        let shareFiles: ShareFile[] = []
        let displayName = fileName
        let primaryPath = filePath

        if (isBatch) {
            // Batch upload: use folder path and files array
            shareFiles = (files as FileInfo[]).map(f => ({
                name: f.name,
                path: f.path,
                size: f.size
            }))
            displayName = `${shareFiles.length} files`
            primaryPath = folderPath || shareFiles[0]?.path || ''
        } else {
            // Single file: convert to array format for consistency
            shareFiles = [{
                name: fileName,
                path: filePath,
                size: 0 // Size not provided for legacy single file
            }]
        }

        // Create share link
        const share = await createShare({
            fileId: primaryPath,
            fileName: displayName,
            filePath: primaryPath,
            files: shareFiles,
            accountId: account.id,
            accountName: account.name,
            expiresAt: expiresAt.toISOString()
        })

        // Get base URL
        const host = getHeader(event, 'host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        const shareUrl = `${protocol}://${host}/download/${share.id}`

        return {
            success: true,
            share: {
                id: share.id,
                url: shareUrl,
                fileName: share.fileName,
                files: shareFiles,
                fileCount: shareFiles.length,
                expiresAt: share.expiresAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('Create share after upload error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.message || 'Failed to create share link'
        })
    }
})

