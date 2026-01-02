import { getShareById } from '../../../utils/shares'
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
    const fileIndex = query.fileIndex !== undefined ? parseInt(query.fileIndex as string) : 0

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

        if (files.length === 0 || fileIndex < 0 || fileIndex >= files.length) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid file index'
            })
        }

        const file = files[fileIndex]

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
        const dbx = createDropboxClient(accessToken)

        // Get temporary link from Dropbox
        const linkResponse = await dbx.filesGetTemporaryLink({ path: file.path })
        const downloadUrl = linkResponse.result.link

        // Determine content type
        const ext = file.name.split('.').pop()?.toLowerCase() || ''
        const contentTypes: Record<string, string> = {
            // Video
            mp4: 'video/mp4',
            webm: 'video/webm',
            mkv: 'video/x-matroska',
            avi: 'video/x-msvideo',
            mov: 'video/quicktime',
            // Audio
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            ogg: 'audio/ogg',
            flac: 'audio/flac',
            // Images
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            // Documents
            pdf: 'application/pdf',
            // Default
            default: 'application/octet-stream'
        }

        const contentType = contentTypes[ext] || contentTypes.default

        // Check if streaming video/audio (for Range requests)
        const rangeHeader = getHeader(event, 'range')

        if (rangeHeader && (contentType.startsWith('video/') || contentType.startsWith('audio/'))) {
            // For range requests, proxy the request to Dropbox
            const proxyResponse = await fetch(downloadUrl, {
                headers: {
                    'Range': rangeHeader
                }
            })

            // Forward status and headers
            setResponseStatus(event, proxyResponse.status)

            const headers = ['content-range', 'content-length', 'accept-ranges']
            headers.forEach(h => {
                const value = proxyResponse.headers.get(h)
                if (value) setHeader(event, h, value)
            })

            setHeader(event, 'Content-Type', contentType)

            return proxyResponse.body
        }

        // For non-range requests, stream the entire file
        const proxyResponse = await fetch(downloadUrl)

        setHeader(event, 'Content-Type', contentType)
        setHeader(event, 'Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`)

        const contentLength = proxyResponse.headers.get('content-length')
        if (contentLength) {
            setHeader(event, 'Content-Length', parseInt(contentLength))
        }

        // For video/audio, allow seeking
        if (contentType.startsWith('video/') || contentType.startsWith('audio/')) {
            setHeader(event, 'Accept-Ranges', 'bytes')
        }

        // Increment download count
        await incrementDownloadCount(shareId)

        return proxyResponse.body

    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('Stream error details:', {
            shareId,
            fileIndex,
            error: error.message,
            dropboxError: error.error,
            stack: error.stack
        })

        // Check for specific Dropbox permission error
        if (error.error?.error_summary?.includes('missing_scope') || JSON.stringify(error).includes('files.content.read')) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Dropbox App requires "files.content.read" permission. Please enable it in Dropbox App Console.'
            })
        }

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.message || 'Failed to stream file'
        })
    }
})
