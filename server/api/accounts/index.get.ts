import { getAccounts, getActiveAccount } from '../../utils/accounts'
import { requireAdmin } from '../../utils/permissions'

export default defineEventHandler(async (event) => {
    // SECURITY: Only admins can view Dropbox accounts
    await requireAdmin(event)

    const accounts = await getAccounts()
    const activeAccount = await getActiveAccount()

    return {
        accounts: accounts.map(a => ({
            id: a.id,
            name: a.name,
            email: a.email,
            isActive: a.is_active,
            createdAt: a.created_at
        })),
        activeAccountId: activeAccount?.id || ''
    }
})
