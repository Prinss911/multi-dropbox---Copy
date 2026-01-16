import { createShare, findActiveShare } from '../../utils/shares'
import { getAccountById } from '../../utils/accounts'
import { useSupabase } from '../../utils/supabase'

/**
 * Generate or get embed link for a file
 * POST /api/embed/generate
 * Body: { fileId: string }
 * 
 * This endpoint will:
 * 1. Find the file in the database
 * 2. Check if an active share link already exists
 * 3. If not, create a new share link (never expires for embed)
 * 4. Return the embed URL and share ID
 */
export default defineEventHandler(async (event) => {
    // Verify user is authenticated
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const body = await readBody(event)
    const { fileId } = body

    if (!fileId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'File ID is required'
        })
    }

    const supabase = useSupabase()

    // Get file info from database
    const { data: fileData, error: fileError } = await supabase
        .from('files')
        .select('id, filename, dropbox_path, dropbox_account_id, user_id')
        .eq('id', fileId)
        .single()

    const file = fileData as {
        id: string
        filename: string
        dropbox_path: string
        dropbox_account_id: string
        user_id: string
    } | null

    if (fileError || !file) {
        throw createError({
            statusCode: 404,
            statusMessage: 'File not found'
        })
    }

    // Verify ownership
    if (file.user_id !== user.id) {
        throw createError({
            statusCode: 403,
            statusMessage: 'You can only embed your own files'
        })
    }

    // Check for existing active share
    const existingShare = await findActiveShare(file.dropbox_account_id, file.dropbox_path)

    if (existingShare) {
        // Return existing share
        const host = getHeader(event, 'host') || 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'

        return {
            success: true,
            existing: true,
            shareId: existingShare.id,
            embedUrl: `${protocol}://${host}/embed/${existingShare.id}`,
            shareUrl: `${protocol}://${host}/file/${existingShare.id}`,
            expiresAt: existingShare.expiresAt
        }
    }

    // Get account info
    const account = await getAccountById(file.dropbox_account_id)
    if (!account) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Dropbox account not found'
        })
    }

    // Create new share (never expires for embed)
    const share = await createShare({
        fileId: file.id,
        fileName: file.filename,
        filePath: file.dropbox_path,
        files: [{
            name: file.filename,
            path: file.dropbox_path,
            size: 0
        }],
        accountId: account.id,
        accountName: account.name,
        expiresAt: null, // Never expires
        userId: user.id
    })

    const host = getHeader(event, 'host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'

    return {
        success: true,
        existing: false,
        shareId: share.id,
        embedUrl: `${protocol}://${host}/embed/${share.id}`,
        shareUrl: `${protocol}://${host}/file/${share.id}`,
        expiresAt: null
    }
})
