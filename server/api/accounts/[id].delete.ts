import { deleteAccount } from '../../utils/accounts'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Account ID is required'
        })
    }

    const success = await deleteAccount(id)

    if (!success) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete account'
        })
    }

    return { success: true }
})
