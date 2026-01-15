import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
    if (supabaseClient) return supabaseClient

    const config = useRuntimeConfig()

    // Get values with fallback to environment variables
    const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL
    const supabaseServiceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY

    // Validate required credentials
    if (!supabaseUrl) {
        console.error('[accounts.ts] SUPABASE_URL is missing!')
        throw new Error('Missing SUPABASE_URL - check your .env file')
    }

    if (!supabaseServiceKey) {
        console.error('[accounts.ts] SUPABASE_SERVICE_KEY is missing!')
        throw new Error('Missing SUPABASE_SERVICE_KEY - check your .env file')
    }

    supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    return supabaseClient
}

export interface DropboxAccount {
    id: string
    name: string
    email: string | null
    account_id: string
    refresh_token: string
    app_key: string | null
    app_secret: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

// Get all accounts
export async function getAccounts(): Promise<DropboxAccount[]> {
    const supabase = getSupabase()

    const { data, error } = await supabase
        .from('dropbox_accounts')
        .select('*')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching accounts:', error)
        return []
    }

    return data || []
}

// Get active account (legacy - now uses smart selection)
export async function getActiveAccount(): Promise<DropboxAccount | null> {
    // Delegate to smart selection
    return getBestAccount()
}

// Smart account selection - picks account with most available storage
export async function getBestAccount(requiredSpace: number = 0): Promise<DropboxAccount | null> {
    const accounts = await getAccounts()

    if (accounts.length === 0) {
        console.log('[getBestAccount] No accounts found!')
        return null
    }

    if (accounts.length === 1) {
        console.log(`[getBestAccount] Only one account available: ${accounts[0].name}`)
        return accounts[0]
    }

    console.log(`[getBestAccount] Checking storage for ${accounts.length} accounts...`)

    // Get storage info for all accounts in parallel
    const accountsWithStorage = await Promise.all(accounts.map(async (account) => {
        try {
            const { createDropboxClient } = await import('./dropbox')
            const accessToken = await getAccessTokenForAccount(account)
            const dbx = createDropboxClient(accessToken)
            const space = await dbx.usersGetSpaceUsage()

            let allocated = 0
            if (space.result.allocation['.tag'] === 'individual') {
                allocated = (space.result.allocation as any).allocated || 0
            } else if (space.result.allocation['.tag'] === 'team') {
                allocated = (space.result.allocation as any).allocated || 0
            }

            const available = allocated - space.result.used
            console.log(`[getBestAccount] ${account.name}: ${Math.round(available / 1024 / 1024 / 1024 * 100) / 100} GB available`)

            return {
                account,
                available
            }
        } catch (err) {
            console.error(`[getBestAccount] Error checking storage for ${account.name}:`, err)
            return { account, available: 0 }
        }
    }))

    // Filter accounts with enough space
    const validAccounts = accountsWithStorage.filter(a => a.available >= requiredSpace)

    if (validAccounts.length === 0) {
        console.log('[getBestAccount] No account has enough space, returning first account')
        return accounts[0]
    }

    // Sort by available space (descending) and pick the best
    validAccounts.sort((a, b) => b.available - a.available)
    const best = validAccounts[0]

    console.log(`[getBestAccount] Selected: ${best.account.name} (${Math.round(best.available / 1024 / 1024 / 1024 * 100) / 100} GB available)`)

    return best.account
}

// Helper to get access token for an account
async function getAccessTokenForAccount(account: DropboxAccount): Promise<string> {
    if (!account.refresh_token || !account.app_key || !account.app_secret) {
        throw new Error(`Missing credentials for account ${account.name}`)
    }

    const response = await $fetch<{
        access_token: string
        expires_in: number
    }>('https://api.dropbox.com/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: account.refresh_token,
            client_id: account.app_key,
            client_secret: account.app_secret,
        }).toString(),
    })

    return response.access_token
}

// Get account by ID
export async function getAccountById(id: string): Promise<DropboxAccount | null> {
    const supabase = getSupabase()

    const { data, error } = await supabase
        .from('dropbox_accounts')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching account:', error)
        return null
    }

    return data
}

// Add new account
export async function addAccount(account: {
    name: string
    email: string | null
    account_id: string
    refresh_token: string
    app_key: string
    app_secret: string
}): Promise<DropboxAccount | null> {
    const supabase = getSupabase()

    const { data, error } = await supabase
        .from('dropbox_accounts')
        .insert({
            name: account.name,
            email: account.email,
            account_id: account.account_id,
            refresh_token: account.refresh_token,
            app_key: account.app_key,
            app_secret: account.app_secret,
            is_active: true
        })
        .select()
        .single()

    if (error) {
        console.error('Error adding account:', error)
        throw error
    }

    return data
}

// Update account
export async function updateAccount(id: string, updates: Partial<DropboxAccount>): Promise<DropboxAccount | null> {
    const supabase = getSupabase()

    const { data, error } = await supabase
        .from('dropbox_accounts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating account:', error)
        return null
    }

    return data
}

// Delete account
export async function deleteAccount(id: string): Promise<boolean> {
    const supabase = getSupabase()

    const { error } = await supabase
        .from('dropbox_accounts')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting account:', error)
        return false
    }

    return true
}

// Set active account
export async function setActiveAccount(id: string): Promise<boolean> {
    const supabase = getSupabase()
    console.log(`[Accounts] Switching active account to ${id}`)

    // 1. Reset all to inactive
    const { error: resetError } = await supabase
        .from('dropbox_accounts')
        .update({ is_active: false })
        .neq('id', '0') // Apply to all rows (assuming id != '0') - safer than empty string

    if (resetError) {
        console.error('[Accounts] Error resetting accounts:', resetError)
    }

    // 2. Set target to active
    const { error, data } = await supabase
        .from('dropbox_accounts')
        .update({ is_active: true })
        .eq('id', id)
        .select()

    if (error) {
        console.error('[Accounts] Error setting active account:', error)
        return false
    }

    if (!data || data.length === 0) {
        console.error('[Accounts] No account found with ID:', id)
        return false
    }

    console.log(`[Accounts] Successfully switched to ${data[0].name} (${data[0].id})`)
    return true
}
