import { setActiveAccount } from '../../utils/accounts'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { accountId } = body

    if (!accountId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Account ID is required'
        })
    }

    const success = await setActiveAccount(accountId)

    if (!success) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to set active account'
        })
    }

    return { success: true }
})
