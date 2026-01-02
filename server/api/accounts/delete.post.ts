import { deleteAccount, getAccounts } from '../../utils/accounts'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { accountId } = body

    if (!accountId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Account ID is required'
        })
    }

    // Check if it's the last account
    const accounts = await getAccounts()
    if (accounts.length <= 1) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Cannot delete the last account'
        })
    }

    const success = await deleteAccount(accountId)

    if (!success) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete account'
        })
    }

    return { success: true }
})
