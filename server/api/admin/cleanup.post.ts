import { useSupabase } from '../../utils/supabase'

interface CleanupResult {
    filesRemoved: number
    sharesRemoved: number
    errors: string[]
}

export default defineEventHandler(async (event) => {
    try {
        const { getActiveClient, getClientForAccount } = useDropboxServer()
        const supabase = useSupabase()

        const result: CleanupResult = {
            filesRemoved: 0,
            sharesRemoved: 0,
            errors: []
        }

        // Get all files from database
        const { data: dbFiles, error: filesError } = await supabase
            .from('files')
            .select('id, dropbox_path, dropbox_account_id, filename')

        if (filesError) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to fetch files from database'
            })
        }

        // Get all shares from database
        const { data: dbShares, error: sharesError } = await supabase
            .from('shares')
            .select('id, file_path, account_id, file_name')

        if (sharesError) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to fetch shares from database'
            })
        }

        // Group files by account
        const filesByAccount = new Map<string, typeof dbFiles>()
        for (const file of dbFiles || []) {
            const accountId = file.dropbox_account_id
            if (!filesByAccount.has(accountId)) {
                filesByAccount.set(accountId, [])
            }
            filesByAccount.get(accountId)!.push(file)
        }

        // Group shares by account  
        const sharesByAccount = new Map<string, typeof dbShares>()
        for (const share of dbShares || []) {
            const accountId = share.account_id
            if (!sharesByAccount.has(accountId)) {
                sharesByAccount.set(accountId, [])
            }
            sharesByAccount.get(accountId)!.push(share)
        }

        // Get unique account IDs
        const accountIds = new Set([
            ...filesByAccount.keys(),
            ...sharesByAccount.keys()
        ])

        // Check each account's files against Dropbox
        for (const accountId of accountIds) {
            try {
                const dbx = await getClientForAccount(accountId)

                // Get all files from Dropbox for this account
                const dropboxFiles = new Set<string>()

                try {
                    let hasMore = true
                    let cursor: string | undefined

                    while (hasMore) {
                        const response = cursor
                            ? await dbx.filesListFolderContinue({ cursor })
                            : await dbx.filesListFolder({ path: '', recursive: true })

                        for (const entry of response.result.entries) {
                            if (entry['.tag'] === 'file') {
                                dropboxFiles.add(entry.path_lower || '')
                            }
                        }

                        hasMore = response.result.has_more
                        cursor = response.result.cursor
                    }
                } catch (listError: any) {
                    result.errors.push(`Failed to list files for account ${accountId}: ${listError.message}`)
                    continue
                }

                // Check files in database against Dropbox
                const accountFiles = filesByAccount.get(accountId) || []
                for (const file of accountFiles) {
                    const pathLower = file.dropbox_path?.toLowerCase()
                    if (pathLower && !dropboxFiles.has(pathLower)) {
                        // File exists in DB but not in Dropbox - delete from DB
                        const { error: deleteError } = await supabase
                            .from('files')
                            .delete()
                            .eq('id', file.id)

                        if (!deleteError) {
                            result.filesRemoved++
                            console.log(`Removed orphan file: ${file.filename}`)
                        } else {
                            result.errors.push(`Failed to delete file record ${file.id}: ${deleteError.message}`)
                        }
                    }
                }

                // Check shares in database against Dropbox
                const accountShares = sharesByAccount.get(accountId) || []
                for (const share of accountShares) {
                    const pathLower = share.file_path?.toLowerCase()
                    if (pathLower && !dropboxFiles.has(pathLower)) {
                        // Share exists in DB but file not in Dropbox - delete from DB
                        const { error: deleteError } = await supabase
                            .from('shares')
                            .delete()
                            .eq('id', share.id)

                        if (!deleteError) {
                            result.sharesRemoved++
                            console.log(`Removed orphan share: ${share.file_name}`)
                        } else {
                            result.errors.push(`Failed to delete share record ${share.id}: ${deleteError.message}`)
                        }
                    }
                }

            } catch (accountError: any) {
                result.errors.push(`Error processing account ${accountId}: ${accountError.message}`)
            }
        }

        return {
            success: true,
            message: `Cleanup complete. Removed ${result.filesRemoved} orphan files and ${result.sharesRemoved} orphan shares.`,
            ...result
        }

    } catch (error: any) {
        console.error('Cleanup error:', error)

        if (error.statusCode) throw error

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.message || 'Failed to run cleanup'
        })
    }
})
