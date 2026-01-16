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
    const { name } = body

    if (!name) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Folder name is required'
        })
    }

    // Clean folder name (remove invalid characters)
    const cleanName = name.trim().replace(/[<>:"/\\|?*]/g, '_')

    if (!cleanName) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid folder name'
        })
    }

    // 3. Insert into 'virtual_folders' table
    const client = await serverSupabaseClient<Database>(event)

    const { data, error } = await client
        .from('virtual_folders')
        .insert({
            user_id: user.id,
            name: cleanName
        })
        .select()
        .single()

    if (error) {
        // Handle duplicate folder name error
        if (error.code === '23505') { // Unique violation
            throw createError({
                statusCode: 409,
                statusMessage: 'Folder with this name already exists'
            })
        }

        console.error('Error creating folder:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create folder'
        })
    }

    return {
        success: true,
        folder: {
            id: data.id,
            name: data.name,
            path: `/virtual/${data.name}`,
            type: 'folder',
            isPersistent: true
        }
    }
})
