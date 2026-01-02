import type { files } from 'dropbox'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const path = (query.path as string) || ''

    try {
        const { getActiveClient } = useDropboxServer()
        const { client: dbx, account } = await getActiveClient()

        console.log(`[Files API] Fetching files for account: ${account.name} (${account.id}), path: ${path || 'root'}`)

        setHeader(event, 'X-Active-Account-Name', account.name)
        setHeader(event, 'X-Active-Account-Id', account.id)
        setHeader(event, 'X-Dropbox-Real-Account-Id', account.account_id) // The actual ID from Dropbox

        const response = await dbx.filesListFolder({
            path: path,
            include_media_info: true,
            include_deleted: false,
            include_has_explicit_shared_members: false,
            include_mounted_folders: true,
            limit: 100,
        })

        // Transform response for frontend
        const entries = response.result.entries.map((entry) => {
            const isFolder = entry['.tag'] === 'folder'
            const fileEntry = entry as files.FileMetadata
            const folderEntry = entry as files.FolderMetadata

            return {
                id: isFolder ? folderEntry.id : fileEntry.id,
                name: entry.name,
                path: isFolder ? folderEntry.path_lower : fileEntry.path_lower,
                type: isFolder ? 'folder' : 'file',
                size: isFolder ? null : fileEntry.size,
                modified: isFolder ? null : fileEntry.server_modified,
                extension: isFolder ? null : entry.name.split('.').pop()?.toLowerCase(),
            }
        })

        // Sort: folders first, then files, alphabetically
        entries.sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1
            if (a.type !== 'folder' && b.type === 'folder') return 1
            return a.name.localeCompare(b.name)
        })

        return {
            entries,
            cursor: response.result.cursor,
            hasMore: response.result.has_more,
            accountId: account.id,
            accountName: account.name
        }
    } catch (error: any) {
        console.error('Dropbox API Error:', error)

        const errorSummary = error.error?.error_summary || ''

        if (errorSummary.includes('path/not_found')) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Folder not found'
            })
        }

        throw createError({
            statusCode: error.status || 500,
            statusMessage: errorSummary || error.message || 'Failed to fetch files from Dropbox',
        })
    }
})
