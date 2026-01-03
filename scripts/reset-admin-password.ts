/**
 * Script untuk reset password admin user menggunakan Supabase Admin API
 * Jalankan dengan: npx tsx scripts/reset-admin-password.ts
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zyazrzghqnwqpslabjmn.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5YXpyemdocW53cXBzbGFiam1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzE4MDY0NCwiZXhwIjoyMDgyNzU2NjQ0fQ.YB3XMVnUuQIRu-vAJWtA1auB0f44IgrCSr3z1SMw20A'

async function resetAdminPassword() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const NEW_PASSWORD = 'MultiDrop2026!'
    const USER_ID = '25ede554-ae56-4c58-89c0-f654ae7117b8'

    console.log('🔐 Resetting password for admin user...')

    const { data, error } = await supabase.auth.admin.updateUserById(USER_ID, {
        password: NEW_PASSWORD
    })

    if (error) {
        console.error('❌ Error resetting password:', error.message)
        process.exit(1)
    }

    console.log('✅ Password reset successful!')
    console.log('📧 Email:', data.user.email)
    console.log('🔑 New Password:', NEW_PASSWORD)
}

resetAdminPassword()
