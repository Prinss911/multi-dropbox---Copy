import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const body = await readBody(event)
    const { fileId, virtualFolder } = body

    if (!fileId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'fileId is required'
        })
    }

    const client = await serverSupabaseClient<Database>(event)

    // Update the file's virtual folder (only if the file belongs to this user)
    const { data, error } = await client
        .from('files')
        .update({ virtual_folder: virtualFolder || null })
        .eq('id', fileId)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('[Update Folder] Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    if (!data) {
        throw createError({
            statusCode: 404,
            statusMessage: 'File not found or access denied'
        })
    }

    return {
        success: true,
        file: {
            id: data.id,
            name: data.filename,
            virtualFolder: data.virtual_folder
        }
    }
})
