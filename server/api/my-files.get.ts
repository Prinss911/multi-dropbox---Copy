import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const client = await serverSupabaseClient<Database>(event)

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

    return files.map(file => ({
        id: file.id,
        name: file.filename,
        path: file.dropbox_path,
        size: file.size,
        modified: file.uploaded_at,
        type: 'file',
        // Extension helper
        extension: file.filename.split('.').pop()?.toLowerCase() || null,
        accountId: file.dropbox_account_id
    }))
})
