export interface AccountInfo {
    id: string
    name: string
    email: string | null
    isActive: boolean
    createdAt: string | null
}

const STORAGE_KEY = 'multibox_active_account'

export const useAccounts = () => {
    const accounts = useState<AccountInfo[]>('accounts', () => [])
    const activeAccountId = useState<string>('activeAccountId', () => '')
    const isLoading = useState<boolean>('accounts-loading', () => false)
    const isAddingAccount = useState<boolean>('adding-account', () => false)

    // Initialize from localStorage on client
    const initFromStorage = () => {
        if (import.meta.client) {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored && !activeAccountId.value) {
                activeAccountId.value = stored
            }
        }
    }

    // Save to localStorage
    const saveToStorage = (accountId: string) => {
        if (import.meta.client) {
            localStorage.setItem(STORAGE_KEY, accountId)
        }
    }

    const fetchAccounts = async () => {
        isLoading.value = true
        try {
            // Use authFetch for authenticated request
            const { authFetch } = useAuthFetch()
            const response = await authFetch<{
                accounts: AccountInfo[]
                activeAccountId: string
            }>('/api/accounts')

            accounts.value = response.accounts

            // Priority: localStorage > API response > first account
            initFromStorage()

            if (!activeAccountId.value && response.activeAccountId) {
                activeAccountId.value = response.activeAccountId
            }

            // Validate that activeAccountId exists in accounts
            if (activeAccountId.value && !accounts.value.find(a => a.id === activeAccountId.value)) {
                // Invalid ID, reset to first account
                if (accounts.value.length > 0) {
                    activeAccountId.value = accounts.value[0].id
                    saveToStorage(activeAccountId.value)
                }
            }

            // If still no active account but we have accounts, use first
            if (!activeAccountId.value && accounts.value.length > 0) {
                activeAccountId.value = accounts.value[0].id
                saveToStorage(activeAccountId.value)
            }
        } catch (error) {
            console.error('Error fetching accounts:', error)
        } finally {
            isLoading.value = false
        }
    }

    const switchAccount = async (accountId: string) => {
        // Immediately update local state
        activeAccountId.value = accountId
        saveToStorage(accountId)

        accounts.value = accounts.value.map(a => ({
            ...a,
            isActive: a.id === accountId
        }))

        // Background sync to DB (for cross-device persistence)
        try {
            const { authFetch } = useAuthFetch()
            await authFetch('/api/accounts/switch', {
                method: 'POST',
                body: { accountId }
            })
        } catch (error) {
            console.error('Error syncing account switch to DB:', error)
            // Don't fail - local state is already updated
        }

        return true
    }

    const getAuthUrl = (appKey: string) => {
        return `https://www.dropbox.com/oauth2/authorize?client_id=${appKey}&response_type=code&token_access_type=offline`
    }

    const addAccount = async (code: string, appKey: string, appSecret: string, name?: string) => {
        isAddingAccount.value = true
        try {
            const { authFetch } = useAuthFetch()
            const response = await authFetch<{
                success: boolean
                account: AccountInfo
            }>('/api/accounts/add', {
                method: 'POST',
                body: { code, appKey, appSecret, name }
            })

            if (response.success) {
                await fetchAccounts()
                // Set new account as active
                if (response.account?.id) {
                    activeAccountId.value = response.account.id
                    saveToStorage(response.account.id)
                }
                return { success: true, account: response.account }
            }
            return { success: false, error: 'Unknown error' }
        } catch (error: any) {
            console.error('Error adding account:', error)
            return {
                success: false,
                error: error.data?.message || error.message || 'Failed to add account'
            }
        } finally {
            isAddingAccount.value = false
        }
    }

    const removeAccount = async (accountId: string) => {
        try {
            const { authFetch } = useAuthFetch()
            await authFetch('/api/accounts/delete', {
                method: 'POST',
                body: { accountId }
            })

            accounts.value = accounts.value.filter(a => a.id !== accountId)

            // If removed account was active, switch to first available
            if (activeAccountId.value === accountId && accounts.value.length > 0) {
                activeAccountId.value = accounts.value[0].id
                saveToStorage(activeAccountId.value)
            } else if (accounts.value.length === 0) {
                activeAccountId.value = ''
                if (import.meta.client) {
                    localStorage.removeItem(STORAGE_KEY)
                }
            }

            return true
        } catch (error) {
            console.error('Error removing account:', error)
            return false
        }
    }

    const activeAccount = computed(() => {
        return accounts.value.find(a => a.id === activeAccountId.value)
    })

    return {
        accounts,
        activeAccountId,
        activeAccount,
        isLoading,
        isAddingAccount,
        fetchAccounts,
        switchAccount,
        getAuthUrl,
        addAccount,
        removeAccount
    }
}
