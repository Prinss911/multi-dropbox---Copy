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

    // Get file paths for querying shares
    const filePaths = files.map(f => f.dropbox_path)

    // Get active share links for these files (regardless of who created them)
    const now = new Date().toISOString()
    const { data: shares } = await supabase
        .from('shares')
        .select('id, file_path, account_id')
        .in('file_path', filePaths)
        .or(`expires_at.gt.${now},expires_at.is.null`)

    // Create a map of file paths to share IDs
    const shareMap = new Map<string, string>()
    const shareList = (shares || []) as { id: string; file_path: string; account_id: string }[]
    for (const share of shareList) {
        const key = `${share.account_id}:${share.file_path}`
        shareMap.set(key, share.id)
    }

    return files.map(file => {
        const shareKey = `${file.dropbox_account_id}:${file.dropbox_path}`
        const shareId = shareMap.get(shareKey)

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
            shareId: shareId || null,
            shareUrl: shareId ? `/file/${shareId}` : null
        }
    })
})

