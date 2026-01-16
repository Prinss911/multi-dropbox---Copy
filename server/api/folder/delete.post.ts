import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
    // 1. Authenticate User
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    // 2. Parse Body
    const body = await readBody(event)
    const { folderId, folderName } = body

    if (!folderId && !folderName) {
        throw createError({
            statusCode: 400,
            statusMessage: 'folderId or folderName is required'
        })
    }

    const client = await serverSupabaseClient<Database>(event)

    // 3. Check if folder has files
    let targetFolderName = folderName

    if (folderId && !folderName) {
        // Get folder name by ID
        const { data: folder } = await client
            .from('virtual_folders')
            .select('name')
            .eq('id', folderId)
            .eq('user_id', user.id)
            .single()

        if (!folder) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Folder not found'
            })
        }
        targetFolderName = folder.name
    }

    // Check if any files are in this folder
    const { count } = await client
        .from('files')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('virtual_folder', targetFolderName)

    if (count && count > 0) {
        throw createError({
            statusCode: 400,
            statusMessage: `Cannot delete folder: it still contains ${count} file(s). Move or delete files first.`
        })
    }

    // 4. Delete the folder
    let deleteQuery = client
        .from('virtual_folders')
        .delete()
        .eq('user_id', user.id)

    if (folderId) {
        deleteQuery = deleteQuery.eq('id', folderId)
    } else {
        deleteQuery = deleteQuery.eq('name', targetFolderName)
    }

    const { error } = await deleteQuery

    if (error) {
        console.error('Error deleting folder:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete folder'
        })
    }

    return {
        success: true,
        message: `Folder "${targetFolderName}" deleted successfully`
    }
})
