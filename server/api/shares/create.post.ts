import { createShare, cleanExpiredShares } from '../../utils/shares'

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

    if (expirationUnit === 'seconds') {
        // Testing purpose: allow explicit seconds
        expiresAt.setSeconds(expiresAt.getSeconds() + (expirationDays || 10))
    } else {
        // Default days logic
        const validDays = [1, 3, 7, 30]
        const days = validDays.includes(expirationDays) ? expirationDays : 7
        expiresAt.setDate(expiresAt.getDate() + days)
    }

    try {
        const { getActiveClient } = useDropboxServer()
        const { account } = await getActiveClient()

        // Clean expired shares first
        await cleanExpiredShares()

        // Create share link (Async now)
        const share = await createShare({
            fileId: fileId || filePath,
            fileName,
            filePath,
            accountId: account.id,
            accountName: account.name,
            expiresAt: expiresAt.toISOString()
        })

        // Get base URL from request
        const host = getHeader(event, 'host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        const shareUrl = `${protocol}://${host}/download/${share.id}`

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
            statusCode: error.status || 500,
            statusMessage: error.message || 'Failed to create share link'
        })
    }
})
