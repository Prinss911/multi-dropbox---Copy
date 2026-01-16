import type { Database } from '~/types/supabase'

// UUID regex pattern for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// This endpoint allows users to delete their OWN files only
// Different from admin delete which can delete any file
export default defineEventHandler(async (event) => {
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
            statusMessage: 'fileId is required'
        })
    }

    // Validate fileId is a valid UUID (not virtual folder ID like 'vf-xxx')
    if (!UUID_REGEX.test(fileId)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid file ID format. Virtual folders cannot be deleted.'
        })
    }

    const client = await serverSupabaseClient<Database>(event)

    // First, verify the file belongs to this user
    const { data: file, error: fetchError } = await client
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !file) {
        console.error('[User Delete] File not found:', { fileId, error: fetchError })
        throw createError({
            statusCode: 404,
            statusMessage: 'File not found or access denied'
        })
    }

    // Validate dropbox_account_id is a valid UUID
    const hasValidAccountId = UUID_REGEX.test(file.dropbox_account_id)

    try {
        // Only try to delete from Dropbox if account ID is valid
        if (hasValidAccountId) {
            const { getClientForAccount } = useDropboxServer()
            const dbx = await getClientForAccount(file.dropbox_account_id)

            await dbx.filesDeleteV2({
                path: file.dropbox_path
            })
        } else {
            console.warn('[User Delete] Skipping Dropbox delete - invalid account ID:', file.dropbox_account_id)
        }

        // Delete from database
        const { error: deleteError } = await client
            .from('files')
            .delete()
            .eq('id', fileId)
            .eq('user_id', user.id)

        if (deleteError) {
            console.error('[User Delete] Database delete error:', deleteError)
        }

        // Also clean up related shares (only if valid account ID)
        if (hasValidAccountId) {
            const adminSupabase = useSupabase()
            await adminSupabase
                .from('shares')
                .delete()
                .eq('file_path', file.dropbox_path)
                .eq('account_id', file.dropbox_account_id)
        }

        return {
            success: true,
            message: `File "${file.filename}" deleted successfully`
        }
    } catch (error: any) {
        console.error('[User Delete] Dropbox delete error:', error)

        // If Dropbox file doesn't exist (already deleted) or account issue, still clean up database
        const errorTag = error.error?.error?.['.tag']
        const isNotFound = errorTag === 'path_lookup' || error.message?.includes('not found')

        if (isNotFound || !hasValidAccountId) {
            // File not in Dropbox or account issue, but we should still clean database
            await client
                .from('files')
                .delete()
                .eq('id', fileId)
                .eq('user_id', user.id)

            return {
                success: true,
                message: 'File record removed'
            }
        }

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to delete file'
        })
    }
})
