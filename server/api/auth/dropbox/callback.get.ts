// OAuth Callback - Exchange code for tokens and save account
import { v4 as uuidv4 } from 'uuid'
import { useSupabase } from '../../../utils/supabase'

interface TokenResponse {
    access_token: string
    token_type: string
    expires_in: number
    refresh_token: string
    scope: string
    uid: string
    account_id: string
}

interface AccountInfo {
    account_id: string
    name: {
        given_name: string
        surname: string
        familiar_name: string
        display_name: string
        abbreviated_name: string
    }
    email: string
    email_verified: boolean
    profile_photo_url?: string
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    const code = query.code as string
    const error = query.error as string

    // Handle user denial
    if (error) {
        return sendRedirect(event, '/accounts?error=' + encodeURIComponent(error))
    }

    if (!code) {
        return sendRedirect(event, '/accounts?error=no_code')
    }

    const appKey = config.dropboxAppKey
    const appSecret = config.dropboxAppSecret
    const redirectUri = config.dropboxRedirectUri

    if (!appKey || !appSecret || !redirectUri) {
        return sendRedirect(event, '/accounts?error=oauth_not_configured')
    }

    try {
        // Exchange code for tokens
        console.log('[OAuth] Exchanging code for tokens...')
        const tokenResponse = await $fetch<TokenResponse>('https://api.dropboxapi.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                client_id: appKey as string,
                client_secret: appSecret as string,
                redirect_uri: redirectUri as string,
            }).toString(),
        })

        console.log('[OAuth] Got tokens, access_token exists:', !!tokenResponse.access_token)
        console.log('[OAuth] Token response uid:', tokenResponse.uid)

        // Get account info using native fetch (ofetch has issues with empty body)
        console.log('[OAuth] Getting account info...')
        const accountResp = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenResponse.access_token}`,
            },
        })

        if (!accountResp.ok) {
            const errText = await accountResp.text()
            console.error('[OAuth] Account info error:', accountResp.status, errText)
            throw new Error(`Failed to get account info: ${accountResp.status} ${errText}`)
        }

        const accountInfo: AccountInfo = await accountResp.json()
        console.log('[OAuth] Got account info:', accountInfo.email, accountInfo.name?.display_name)

        // Save to database
        const supabase = useSupabase()

        // Check if account already exists (by email)
        console.log('[OAuth] Checking if account exists for email:', accountInfo.email)
        const { data: existingAccount, error: selectError } = await supabase
            .from('dropbox_accounts')
            .select('id')
            .eq('email', accountInfo.email)
            .single()

        if (selectError && selectError.code !== 'PGRST116') {
            // PGRST116 = no rows found, which is fine
            console.error('[OAuth] Supabase select error:', selectError)
        }

        if (existingAccount) {
            console.log('[OAuth] Updating existing account:', existingAccount.id)
            // Update existing account with new tokens
            const { error: updateError } = await supabase
                .from('dropbox_accounts')
                .update({
                    name: accountInfo.name.display_name,
                    refresh_token: tokenResponse.refresh_token,
                    app_key: appKey,
                    app_secret: appSecret,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existingAccount.id)

            if (updateError) {
                console.error('[OAuth] Supabase update error:', updateError)
                throw new Error(`Failed to update account: ${updateError.message}`)
            }

            console.log('[OAuth] Account updated successfully')
            return sendRedirect(event, '/accounts?success=updated')
        }

        // Create new account
        const newId = uuidv4()
        console.log('[OAuth] Creating new account with id:', newId)
        const { error: insertError } = await supabase.from('dropbox_accounts').insert({
            id: newId,
            name: accountInfo.name.display_name,
            email: accountInfo.email,
            account_id: tokenResponse.uid || tokenResponse.account_id,
            refresh_token: tokenResponse.refresh_token,
            app_key: appKey,
            app_secret: appSecret,
            is_active: false,
        })

        if (insertError) {
            console.error('[OAuth] Supabase insert error:', insertError)
            throw new Error(`Failed to save account: ${insertError.message}`)
        }

        console.log('[OAuth] Account created successfully')
        return sendRedirect(event, '/accounts?success=added')

    } catch (err: any) {
        console.error('OAuth callback error:', err)
        return sendRedirect(event, '/accounts?error=' + encodeURIComponent(err.message || 'oauth_failed'))
    }
})
