import { getAuthUser } from '../../utils/auth'
import { getSharesByUser } from '../../utils/shares'

export default defineEventHandler(async (event) => {
    const user = await getAuthUser(event)

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    try {
        const shares = await getSharesByUser(user.id)
        return shares
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }
})
