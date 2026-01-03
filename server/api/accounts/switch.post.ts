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

    console.log(`[Switch API] Switching to account: ${accountId}`)
    const success = await setActiveAccount(accountId)
    console.log(`[Switch API] Switch result: ${success}`)

    if (!success) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Account not found'
        })
    }

    return { success: true, activeAccountId: accountId }
})
