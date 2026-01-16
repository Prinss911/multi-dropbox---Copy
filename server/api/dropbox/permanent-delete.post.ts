import { requireAdmin } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
    // SECURITY: Only admins can permanently delete files
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

        // For personal accounts, filesPermanentlyDelete is NOT supported
        // We need to inform the user that files will be auto-deleted after 30 days
        // 
        // For business accounts, this API would work, but most users have personal accounts
        //
        // Best approach: Just return success with a message that the file is in trash
        // and will be permanently deleted after 30 days

        // First, check if the file exists in files (not deleted yet)
        try {
            const metadata = await dbx.filesGetMetadata({ path })

            // File exists - delete it first (move to trash)
            await dbx.filesDeleteV2({ path })

            // Try permanent delete (will fail for personal accounts)
            try {
                await dbx.filesPermanentlyDelete({ path })

                // Cleanup shares
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
                // Permanent delete not supported for personal accounts
                // File is still in trash, will be auto-deleted after 30 days
                return {
                    success: true,
                    message: 'File moved to trash. Will be permanently deleted after 30 days.',
                    isPersonalAccount: true
                }
            }
        } catch (metaError: any) {
            // File not found normally - might already be in trash
            const metaErrorSummary = metaError.error?.error_summary || ''

            if (metaErrorSummary.includes('path/not_found') || metaErrorSummary.includes('path_lookup')) {
                // File is already deleted/in trash or doesn't exist
                // For personal accounts, we can't do permanent delete
                // Just return success - the file is already in trash or gone

                // Cleanup shares from database
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
                    message: 'File is in trash and will be permanently deleted after 30 days.',
                    alreadyInTrash: true
                }
            }

            throw metaError
        }
    } catch (error: any) {
        console.error('Permanent delete error:', error)

        if (error.statusCode) throw error

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.error?.error_summary || error.message || 'Failed to delete file'
        })
    }
})
