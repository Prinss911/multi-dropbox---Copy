
import { getShareById } from '../../../utils/shares'
import { getAccounts, type DropboxAccount } from '../../../utils/accounts'
import { Dropbox } from 'dropbox'

// Token cache (reused from stream.get.ts pattern, ideally should be a shared utility)
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
        throw createError({ statusCode: 400, statusMessage: 'Share ID is required' })
    }

    try {
        const share = await getShareById(shareId)
        if (!share) throw createError({ statusCode: 404, statusMessage: 'Share link not found' })

        // Expiry check
        if (new Date(share.expiresAt) < new Date()) {
            throw createError({ statusCode: 410, statusMessage: 'This share link has expired' })
        }

        const files = share.files || []
        if (files.length === 0 || fileIndex < 0 || fileIndex >= files.length) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid file index' })
        }
        const file = files[fileIndex]

        // Get account
        const accounts = await getAccounts()
        const account = accounts.find(a => a.id === share.accountId)
        if (!account) throw createError({ statusCode: 404, statusMessage: 'Account not found' })

        const accessToken = await getAccessTokenForAccount(account)
        const dbx = new Dropbox({ accessToken })

        // 1. Get or Create Public Shared Link
        let publicUrl = ''
        try {
            // first check if one exists
            const listShared = await dbx.sharingListSharedLinks({
                path: file.path,
                direct_only: true
            })

            if (listShared.result.links.length > 0) {
                publicUrl = listShared.result.links[0].url
            } else {
                // create one
                const created = await dbx.sharingCreateSharedLinkWithSettings({ path: file.path })
                publicUrl = created.result.url
            }
        } catch (e: any) {
            console.error('Dropbox sharing error:', e)
            // If we hit "shared_link_already_exists" but list didn't find it (rare?), try to handle or just fail
            if (e.error?.['.tag'] === 'shared_link_already_exists') {
                // Fallback: try listing again without direct_only? or assuming it exists.
                // For now, let's assume one of the above works.
            }
            throw createError({ statusCode: 502, statusMessage: 'Failed to generate public link for transcoding' })
        }

        console.log('Using public URL for scraping:', publicUrl)

        // 2. Fetch HTML using Browser User-Agent
        const html = await $fetch<string>(publicUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })

        // 3. Extract HLS URL
        // Regex to find registerStreamedPrefetch calls
        const prefetchMatches = html.matchAll(/registerStreamedPrefetch\s*\(\s*"[^"]*"\s*,\s*"([^"]*)"/g)
        let hlsUrl: string | null = null

        for (const match of prefetchMatches) {
            const blob = match[1]
            try {
                // Decode Base64
                const decoded = Buffer.from(blob, 'base64').toString('utf-8')

                // Find HLS master playlist URL
                // We look for https://...previews.dropboxusercontent.com...hls_master_playlist...m3u8
                // Use a stricter regex to avoid greedy matching of previous URLs in the blob
                const urlMatch = decoded.match(/(https:\/\/[a-zA-Z0-9-]+\.previews\.dropboxusercontent\.com\/p\/hls_master_playlist\/[^"\s]+\.m3u8[^"\s]*)/)
                if (urlMatch) {
                    hlsUrl = urlMatch[1]
                    break
                }
            } catch (err) {
                // ignore decoding errors
            }
        }

        if (!hlsUrl) {
            // Fallback search for any m3u8 if master not found?
            // The python script had a fallback.
            const genericMatch = html.match(/(https:\/\/[^"]+\.m3u8[^"]*)/)
            // We'd have to decode everything first. The regex above is safer inside decoded blocks.
            // If we failed to find it in blocks, we might fail.
            throw createError({ statusCode: 422, statusMessage: 'Could not extract streaming URL from Dropbox' })
        }

        return {
            url: hlsUrl
        }

    } catch (error: any) {
        console.error('Transcode error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || error.message || 'Transcode failed'
        })
    }
})
