import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Read .env manually to avoid dotenv dependency
const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
        env[key.trim()] = value.trim()
    }
})

const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_KEY
)

async function main() {
    const email = 'ilyasa.naufal40@gmail.com'
    const password = 'Admin123!'

    console.log(`Creating admin user: ${email}`)

    // 1. Create User
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    })

    let userId = user?.user?.id

    if (createError) {
        if (createError.message.includes('already registered')) {
            console.log('User already exists, finding ID...')
            const { data: users } = await supabase.auth.admin.listUsers()
            const existing = users.users.find(u => u.email === email)
            if (existing) {
                userId = existing.id
                console.log(`Found existing user ID: ${userId}`)
            } else {
                console.error('User registered but not found in list? Error:', createError)
                return
            }
        } else {
            console.error('Error creating user:', createError)
            return
        }
    } else {
        console.log('User created successfully.')
    }

    if (!userId) {
        console.error('No User ID found.')
        return
    }

    // 2. Assign Admin Role
    const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' })

    if (roleError) {
        console.error('Error assigning role:', roleError)
    } else {
        console.log('Admin role assigned.')
    }

    // 3. Create Profile
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: userId, email, name: 'Admin' }, { onConflict: 'id' })

    if (profileError) {
        console.error('Error creating profile:', profileError)
    } else {
        console.log('Profile created.')
    }
}

main()
