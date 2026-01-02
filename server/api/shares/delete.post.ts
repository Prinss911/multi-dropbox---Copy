import { deleteShare } from '../../utils/shares'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { shareId } = body

    if (!shareId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Share ID is required'
        })
    }

    try {
        const deleted = await deleteShare(shareId)

        if (!deleted) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Share link not found'
            })
        }

        return {
            success: true
        }
    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('Delete share error:', error)

        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.message || 'Failed to delete share'
        })
    }
})
