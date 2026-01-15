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
    const { name, parentPath } = body

    if (!name) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Folder name is required'
        })
    }

    const cleanName = name.replace(/[<>:"/\\|?*]/g, '_')
    const fullPath = parentPath === '/' ? `/${cleanName}` : `${parentPath}/${cleanName}`

    // 3. Insert into 'files' table as a folder
    const client = await serverSupabaseClient<Database>(event)

    // We need a dummy account ID because it's a required column
    // Fetch the first available account
    const { data: accounts } = await client
        .from('dropbox_accounts')
        .select('account_id')
        .limit(1)
        .single()

    const dummyAccountId = accounts?.account_id || 'virtual-folder'

    const { data, error } = await client
        .from('files')
        .insert({
            user_id: user.id,
            filename: cleanName,
            dropbox_path: fullPath,
            size: 0,
            content_type: 'application/x-directory', // Marker for folder
            dropbox_account_id: dummyAccountId
        })
        .select()
        .single()

    if (error) {
        // Handle duplicate folder name error potentially
        if (error.code === '23505') { // Unique violation
            throw createError({
                statusCode: 409,
                statusMessage: 'Folder already exists'
            })
        }

        console.error('Error creating folder:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create folder'
        })
    }

    return { success: true, folder: data }
})
