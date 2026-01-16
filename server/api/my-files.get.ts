import type { Database } from '~/types/supabase'
import { useSupabase } from '../utils/supabase'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const client = await serverSupabaseClient<Database>(event)
    const supabase = useSupabase()

    // Get user's files
    const { data: files, error } = await client
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    // Get user's virtual folders from dedicated table
    const { data: virtualFolders } = await client
        .from('virtual_folders')
        .select('id, name, created_at')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

    // Get file paths for querying shares
    const filePaths = files.map(f => f.dropbox_path)

    // Get active share links for these files (regardless of who created them)
    const now = new Date().toISOString()
    const { data: shares } = await supabase
        .from('shares')
        .select('id, file_path, account_id, expires_at')
        .in('file_path', filePaths)
        .or(`expires_at.gt.${now},expires_at.is.null`)

    // Create a map of file paths to share IDs and expiry
    const shareMap = new Map<string, { id: string; expiresAt: string | null }>()
    const shareList = (shares || []) as { id: string; file_path: string; account_id: string; expires_at: string | null }[]
    for (const share of shareList) {
        const key = `${share.account_id}:${share.file_path}`
        shareMap.set(key, { id: share.id, expiresAt: share.expires_at })
    }

    // Map files to response format
    const fileEntries = files.map(file => {
        const shareKey = `${file.dropbox_account_id}:${file.dropbox_path}`
        const shareInfo = shareMap.get(shareKey)

        return {
            id: file.id,
            name: file.filename,
            path: file.dropbox_path,
            size: file.size,
            modified: file.uploaded_at,
            type: file.content_type === 'application/x-directory' ? 'folder' : 'file',
            extension: file.content_type === 'application/x-directory' ? null : (file.filename.split('.').pop()?.toLowerCase() || null),
            accountId: file.dropbox_account_id,
            virtualFolder: file.virtual_folder || null,
            // Include share link if exists
            shareId: shareInfo?.id || null,
            shareUrl: shareInfo?.id ? `/file/${shareInfo.id}` : null,
            shareExpiresAt: shareInfo?.expiresAt || null
        }
    })

    // Map virtual folders to folder entries (persistent folders)
    const folderEntries = (virtualFolders || []).map(folder => ({
        id: folder.id,
        name: folder.name,
        path: `/virtual/${folder.name}`,
        size: 0,
        modified: folder.created_at,
        type: 'folder' as const,
        extension: null,
        accountId: '',
        virtualFolder: null,
        isVirtualFolder: true, // Flag to identify this as a persistent virtual folder
        isPersistent: true,
        shareId: null,
        shareUrl: null,
        shareExpiresAt: null
    }))

    // Return combined list (folders first, then files)
    return [...folderEntries, ...fileEntries]
})
