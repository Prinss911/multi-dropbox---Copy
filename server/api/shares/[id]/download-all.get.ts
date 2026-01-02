import { getShareById, incrementDownloadCount } from '../../../utils/shares'
import { getAccounts, type DropboxAccount } from '../../../utils/accounts'

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

    if (!shareId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Share ID is required'
        })
    }

    try {
        const share = await getShareById(shareId)

        if (!share) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Share link not found'
            })
        }

        if (new Date(share.expiresAt) < new Date()) {
            throw createError({
                statusCode: 410,
                statusMessage: 'This share link has expired'
            })
        }

        const files = share.files || []

        if (files.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No files in this share'
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

        const accessToken = await getAccessTokenForAccount(account)

        // Get folder path from first file (all files are in same batch folder)
        const firstFilePath = files[0].path
        const folderPath = firstFilePath.substring(0, firstFilePath.lastIndexOf('/'))

        console.log('Downloading ZIP for folder:', folderPath)

        // Use Dropbox download_zip API
        const zipResponse = await fetch('https://content.dropboxapi.com/2/files/download_zip', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({ path: folderPath }),
            }
        })

        if (!zipResponse.ok) {
            const errorText = await zipResponse.text()
            console.error('Dropbox ZIP error:', errorText)
            throw createError({
                statusCode: zipResponse.status,
                statusMessage: 'Failed to create ZIP file'
            })
        }

        await incrementDownloadCount(shareId)

        // Stream the ZIP response
        setHeader(event, 'Content-Type', 'application/zip')
        setHeader(event, 'Content-Disposition', `attachment; filename="multibox-${shareId}.zip"`)

        return zipResponse.body

    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('Download all error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.message || 'Failed to download files'
        })
    }
})
