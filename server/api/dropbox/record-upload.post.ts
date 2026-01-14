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
    const { filename, dropboxPath, size, contentType, dropboxAccountId } = body

    if (!filename || !dropboxPath || !dropboxAccountId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing required fields'
        })
    }

    // 3. Insert into 'files' table
    const client = await serverSupabaseClient<Database>(event)

    const { data, error } = await client
        .from('files')
        .insert({
            user_id: user.id,
            filename: filename,
            dropbox_path: dropboxPath,
            size: size || 0,
            content_type: contentType || 'application/octet-stream',
            dropbox_account_id: dropboxAccountId
        })
        .select()
        .single()

    if (error) {
        console.error('Error recording upload:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to record upload'
        })
    }

    return { success: true, file: data }
})
