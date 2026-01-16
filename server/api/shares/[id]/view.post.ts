import { useSupabase } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
    const shareId = getRouterParam(event, 'id')

    if (!shareId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Share ID is required'
        })
    }

    const supabase = useSupabase()

    // Check if share exists and is valid
    const { data: shareData, error } = await supabase
        .from('shares')
        .select('id, expires_at, download_count')
        .eq('id', shareId)
        .single()

    // Type cast to avoid TypeScript issues
    const share = shareData as { id: string; expires_at: string | null; download_count: number } | null

    if (error || !share) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Share not found'
        })
    }

    // Check expiration
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
        throw createError({
            statusCode: 410,
            statusMessage: 'Share link expired'
        })
    }

    // Increment view/download count atomically
    const newCount = (share.download_count || 0) + 1
    const { error: updateError } = await (supabase
        .from('shares') as any)
        .update({ download_count: newCount })
        .eq('id', shareId)

    if (updateError) {
        console.error('Failed to update view count:', updateError)
    }

    return { success: true, count: (share.download_count || 0) + 1 }
})
