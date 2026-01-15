export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { path, accountId } = body

    if (!path) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Path is required'
        })
    }

    try {
        const { getActiveClient, getClientForAccount } = useDropboxServer()

        let dbx
        let targetAccountId = accountId
        if (accountId) {
            dbx = await getClientForAccount(accountId)
        } else {
            const res = await getActiveClient()
            dbx = res.client
            targetAccountId = res.account.id
        }

        // Try to permanently delete (only works for Dropbox Business)
        // For personal accounts, this will fail - we catch and handle gracefully
        try {
            await dbx.filesPermanentlyDelete({
                path: path
            })

            // Also cleanup related shares from database
            try {
                const supabase = useSupabase()
                await supabase
                    .from('shares')
                    .delete()
                    .eq('file_path', path)
                    .eq('account_id', targetAccountId)
            } catch (dbError) {
                console.warn('Failed to cleanup shares:', dbError)
            }

            return {
                success: true,
                message: 'File permanently deleted'
            }
        } catch (permError: any) {
            // Check if it's a "not supported" error for personal accounts
            const errorSummary = permError.error?.error_summary || ''

            if (errorSummary.includes('not_supported') ||
                errorSummary.includes('no_permission') ||
                errorSummary.includes('access_denied')) {
                // Personal account - permanent delete not available
                // The file will be auto-deleted after 30 days in trash
                throw createError({
                    statusCode: 403,
                    statusMessage: 'Permanent delete is only available for Dropbox Business accounts. Files in trash will be automatically deleted after 30 days.'
                })
            }

            // For path_lookup errors (file not found in trash), try soft delete first
            if (errorSummary.includes('path_lookup')) {
                // File might not be in trash yet, do soft delete first
                await dbx.filesDeleteV2({ path })

                // Then try permanent delete again
                try {
                    await dbx.filesPermanentlyDelete({ path })
                } catch {
                    // Ignore if permanent delete fails after soft delete
                    // For personal accounts, it's expected
                }
            } else {
                throw permError
            }

            // Cleanup related shares
            try {
                const supabase = useSupabase()
                await supabase
                    .from('shares')
                    .delete()
                    .eq('file_path', path)
                    .eq('account_id', targetAccountId)
            } catch (dbError) {
                console.warn('Failed to cleanup shares:', dbError)
            }

            return {
                success: true,
                message: 'File deleted (will be permanently removed after 30 days for personal accounts)'
            }
        }
    } catch (error: any) {
        console.error('Permanent delete error:', error)

        if (error.statusCode) throw error

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to permanently delete'
        })
    }
})
