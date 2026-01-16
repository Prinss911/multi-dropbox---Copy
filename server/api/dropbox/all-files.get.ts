import type { files } from 'dropbox'
import { getAccounts } from '../../utils/accounts'
import { requireAdmin } from '../../utils/permissions'

interface FileEntry {
    id: string
    name: string
    path: string
    size: number
    modified: string
    extension: string | null
    accountId: string
    accountName: string
}

// Recursive function to get all files from a folder
async function getAllFilesRecursive(
    dbx: any,
    path: string,
    accountId: string,
    accountName: string,
    maxDepth: number = 3,
    currentDepth: number = 0
): Promise<FileEntry[]> {
    if (currentDepth >= maxDepth) return []

    const files: FileEntry[] = []

    try {
        let response = await dbx.filesListFolder({
            path: path,
            recursive: true, // Get all files recursively
            include_media_info: true,
            include_deleted: false,
            limit: 2000
        })

        // Process entries
        for (const entry of response.result.entries) {
            if (entry['.tag'] === 'file') {
                const fileEntry = entry as files.FileMetadata
                files.push({
                    id: `${accountId}:${fileEntry.id}`,
                    name: fileEntry.name,
                    path: fileEntry.path_lower!,
                    size: fileEntry.size,
                    modified: fileEntry.server_modified,
                    extension: fileEntry.name.split('.').pop()?.toLowerCase() || null,
                    accountId,
                    accountName
                })
            }
        }

        // Continue if there are more results
        while (response.result.has_more) {
            response = await dbx.filesListFolderContinue({
                cursor: response.result.cursor
            })

            for (const entry of response.result.entries) {
                if (entry['.tag'] === 'file') {
                    const fileEntry = entry as files.FileMetadata
                    files.push({
                        id: `${accountId}:${fileEntry.id}`,
                        name: fileEntry.name,
                        path: fileEntry.path_lower!,
                        size: fileEntry.size,
                        modified: fileEntry.server_modified,
                        extension: fileEntry.name.split('.').pop()?.toLowerCase() || null,
                        accountId,
                        accountName
                    })
                }
            }
        }
    } catch (err: any) {
        console.error(`Error listing files for ${accountName}:`, err.message)
    }

    return files
}

export default defineEventHandler(async (event) => {
    // SECURITY: Only admins can view all files
    await requireAdmin(event)

    try {
        const { getClientForAccount } = useDropboxServer()
        const accounts = await getAccounts()

        if (accounts.length === 0) {
            return {
                files: [],
                accounts: [],
                totalFiles: 0,
                message: 'No accounts configured'
            }
        }

        console.log(`[All Files API] Fetching files from ${accounts.length} accounts...`)

        // Fetch files from all accounts in parallel
        const allFilesPromises = accounts.map(async (account) => {
            try {
                const dbx = await getClientForAccount(account.id)
                const files = await getAllFilesRecursive(dbx, '', account.id, account.name)
                console.log(`[All Files API] Found ${files.length} files in ${account.name}`)
                return files
            } catch (err: any) {
                console.error(`Error fetching files from ${account.name}:`, err.message)
                return []
            }
        })

        const filesArrays = await Promise.all(allFilesPromises)
        const allFiles = filesArrays.flat()

        // Sort by modified date (newest first)
        allFiles.sort((a, b) => {
            return new Date(b.modified).getTime() - new Date(a.modified).getTime()
        })

        // Prevent caching
        setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')

        return {
            files: allFiles,
            accounts: accounts.map(a => ({ id: a.id, name: a.name })),
            totalFiles: allFiles.length,
            totalAccounts: accounts.length
        }
    } catch (error: any) {
        console.error('All files API Error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.message || 'Failed to fetch all files',
        })
    }
})
