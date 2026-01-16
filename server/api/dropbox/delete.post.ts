import { requireAdmin } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
    // SECURITY: Only admins can delete files
    await requireAdmin(event)

    const body = await readBody(event)
    const { path, accountId } = body

    if (!path) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Path is required'
        })
    }

    try {
        const { getClientForAccount, getActiveClient } = useDropboxServer()

        let dbx
        if (accountId) {
            dbx = await getClientForAccount(accountId)
        } else {
            const result = await getActiveClient()
            dbx = result.client
        }

        const response = await dbx.filesDeleteV2({
            path: path
        })

        // Cleanup database tables
        try {
            const supabase = await serverSupabaseClient(event)
            const targetAccountId = accountId || (await getActiveClient()).account.id

            // Cleanup 'files' table
            await supabase
                .from('files')
                .delete()
                .eq('dropbox_path', path)
                .eq('dropbox_account_id', targetAccountId)

            // Cleanup related shares
            const adminSupabase = useSupabase()
            await adminSupabase
                .from('shares')
                .delete()
                .eq('file_path', path)
                .eq('account_id', targetAccountId)
        } catch (dbError) {
            console.warn('Failed to clean up database tables:', dbError)
        }

        return {
            success: true,
            metadata: response.result.metadata
        }
    } catch (error: any) {
        console.error('Delete error:', error)

        // Handle specific Dropbox errors
        const errorTag = error.error?.error?.['.tag']

        if (errorTag === 'path_lookup') {
            throw createError({
                statusCode: 404,
                statusMessage: 'File or folder not found'
            })
        }

        if (errorTag === 'path_write') {
            const writeError = error.error?.error?.path_write?.['.tag']
            if (writeError === 'conflict') {
                throw createError({
                    statusCode: 409,
                    statusMessage: 'Cannot delete: file is in use or conflict detected'
                })
            }
        }

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to delete'
        })
    }
})
