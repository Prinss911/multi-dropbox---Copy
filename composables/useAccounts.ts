export interface AccountInfo {
    id: string
    name: string
    email: string | null
    isActive: boolean
    createdAt: string | null
}

export const useAccounts = () => {
    const accounts = useState<AccountInfo[]>('accounts', () => [])
    const activeAccountId = useState<string>('activeAccountId', () => '')
    const isLoading = useState<boolean>('accounts-loading', () => false)
    const isAddingAccount = useState<boolean>('adding-account', () => false)

    const fetchAccounts = async () => {
        isLoading.value = true
        try {
            const response = await $fetch<{
                accounts: AccountInfo[]
                activeAccountId: string
            }>('/api/accounts')

            accounts.value = response.accounts
            activeAccountId.value = response.activeAccountId
        } catch (error) {
            console.error('Error fetching accounts:', error)
        } finally {
            isLoading.value = false
        }
    }

    const switchAccount = async (accountId: string) => {
        try {
            await $fetch('/api/accounts/switch', {
                method: 'POST',
                body: { accountId }
            })

            activeAccountId.value = accountId
            accounts.value = accounts.value.map(a => ({
                ...a,
                isActive: a.id === accountId
            }))

            return true
        } catch (error) {
            console.error('Error switching account:', error)
            return false
        }
    }

    const getAuthUrl = (appKey: string) => {
        return `https://www.dropbox.com/oauth2/authorize?client_id=${appKey}&response_type=code&token_access_type=offline`
    }

    const addAccount = async (code: string, appKey: string, appSecret: string, name?: string) => {
        isAddingAccount.value = true
        try {
            const response = await $fetch<{
                success: boolean
                account: AccountInfo
            }>('/api/accounts/add', {
                method: 'POST',
                body: { code, appKey, appSecret, name }
            })

            if (response.success) {
                await fetchAccounts()
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
            await $fetch('/api/accounts/delete', {
                method: 'POST',
                body: { accountId }
            })

            accounts.value = accounts.value.filter(a => a.id !== accountId)
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
