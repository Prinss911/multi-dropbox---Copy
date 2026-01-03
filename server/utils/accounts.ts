import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
    if (supabaseClient) return supabaseClient

    const config = useRuntimeConfig()

    supabaseClient = createClient(
        config.supabaseUrl,
        config.supabaseServiceKey
    )

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

// Get active account
export async function getActiveAccount(): Promise<DropboxAccount | null> {
    const supabase = getSupabase()

    console.log('[getActiveAccount] Fetching active account from database...')

    let { data, error } = await supabase
        .from('dropbox_accounts')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single()

    if (error || !data) {
        console.log('[getActiveAccount] No active account found, falling back to first account')
        const result = await supabase
            .from('dropbox_accounts')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(1)
            .single()

        data = result.data
    }

    if (data) {
        console.log(`[getActiveAccount] Returning account: ${data.name} (${data.id}), is_active: ${data.is_active}`)
    } else {
        console.log('[getActiveAccount] No accounts found!')
    }

    return data || null
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
