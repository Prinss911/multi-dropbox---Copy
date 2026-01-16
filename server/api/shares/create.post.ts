import { createShare, cleanExpiredShares } from '../../utils/shares'
import { getAccountById, getActiveAccount } from '../../utils/accounts'
import { createDropboxClient } from '../../utils/dropbox'

// Token cache for validation
const tokenCache = new Map<string, { token: string; expiry: number }>()

async function getAccessToken(account: any): Promise<string> {
    const now = Date.now()
    const cached = tokenCache.get(account.id)

    if (cached && cached.expiry > now + 5 * 60 * 1000) {
        return cached.token
    }

    const response = await $fetch<{
        access_token: string
        expires_in: number
    }>('https://api.dropbox.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
    const body = await readBody(event)
    const { filePath, fileName, fileId, expirationDays, expirationUnit = 'days' } = body

    if (!filePath || !fileName) {
        throw createError({
            statusCode: 400,
            statusMessage: 'File path and name are required'
        })
    }

    // Calculate expiration
    const expiresAt = new Date()

    if (expirationDays === 'never') {
        // Never expires - set to null (handled later)
    } else if (expirationUnit === 'seconds') {
        expiresAt.setSeconds(expiresAt.getSeconds() + (expirationDays || 10))
    } else {
        // Default days logic - allow more options including 90
        const validDays = [1, 3, 7, 30, 90]
        const days = validDays.includes(expirationDays) ? expirationDays : 7
        expiresAt.setDate(expiresAt.getDate() + days)
    }

    try {
        let account

        if (body.accountId) {
            account = await getAccountById(body.accountId)
            if (!account) throw createError({ statusCode: 404, statusMessage: 'Account not found' })
        } else {
            account = await getActiveAccount()
            if (!account) throw createError({ statusCode: 400, statusMessage: 'No active account' })
        }

        // VALIDATION: Verify file exists in the specified account
        console.log(`[Share] Validating file "${filePath}" exists in account "${account.name}"...`)

        try {
            const accessToken = await getAccessToken(account)
            const dbx = createDropboxClient(accessToken)

            // Check if file exists
            await dbx.filesGetMetadata({ path: filePath })
            console.log(`[Share] File validated successfully in ${account.name}`)
        } catch (err: any) {
            if (err.error?.error_summary?.includes('path/not_found')) {
                console.error(`[Share] File NOT found in account ${account.name}: ${filePath}`)
                throw createError({
                    statusCode: 400,
                    statusMessage: `File not found in account "${account.name}". Make sure the file exists and the correct account is selected.`
                })
            }
            // For other errors, log but continue (might be permission issue)
            console.warn(`[Share] Could not validate file, proceeding anyway:`, err.message)
        }

        // Clean expired shares first
        await cleanExpiredShares()

        // CHECK: Does an active share already exist for this file + account?
        const { useSupabase } = await import('../../utils/supabase')
        const supabase = useSupabase()
        const now = new Date().toISOString()

        const { data: existingShareData } = await supabase
            .from('shares')
            .select('id, expires_at')
            .eq('file_path', filePath)
            .eq('account_id', account.id)
            .or(`expires_at.gt.${now},expires_at.is.null`)
            .limit(1)
            .maybeSingle()

        const existingShare = existingShareData as { id: string; expires_at: string | null } | null

        if (existingShare) {
            // Return existing share instead of creating new one
            console.log(`[Share] Active share already exists for "${filePath}", returning existing link.`)

            const host = getHeader(event, 'host') || 'localhost:3000'
            const protocol = host.includes('localhost') ? 'http' : 'https'
            const shareUrl = `${protocol}://${host}/file/${existingShare.id}`

            return {
                success: true,
                existing: true, // Flag to indicate this was an existing share
                share: {
                    id: existingShare.id,
                    expiresAt: existingShare.expires_at,
                    url: shareUrl
                }
            }
        }

        // Build files array (for single file share)
        const files = [{
            name: fileName,
            path: filePath,
            size: body.fileSize || 0
        }]

        // Create NEW share link
        const share = await createShare({
            fileId: fileId || filePath,
            fileName,
            filePath,
            files,
            accountId: account.id,
            accountName: account.name,
            expiresAt: expirationDays === 'never' ? null : expiresAt.toISOString()
        })

        // Get base URL from request
        const host = getHeader(event, 'host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        const shareUrl = `${protocol}://${host}/file/${share.id}`

        return {
            success: true,
            share: {
                ...share,
                url: shareUrl
            }
        }
    } catch (error: any) {
        console.error('Create share error:', error)

        throw createError({
            statusCode: error.statusCode || error.status || 500,
            statusMessage: error.statusMessage || error.message || 'Failed to create share link'
        })
    }
})
