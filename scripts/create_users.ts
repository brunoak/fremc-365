import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Simple .env parser to avoid 'dotenv' dependency
function parseEnv(content: string) {
    const result: Record<string, string> = {}
    const lines = content.split(/\r?\n/) // Handle CRLF
    for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine || trimmedLine.startsWith('#')) continue

        const match = trimmedLine.match(/^([^=:#]+?)[=:](.*)/)
        if (match) {
            const key = match[1].trim()
            let value = match[2].trim()
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1)
            }
            result[key] = value
        }
    }
    return result
}

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
console.log(`Reading .env.local from: ${envPath}`)

if (fs.existsSync(envPath)) {
    const fileContent = fs.readFileSync(envPath, 'utf-8')
    const envConfig = parseEnv(fileContent)
    console.log('Found keys in .env.local:', Object.keys(envConfig))

    for (const k in envConfig) {
        process.env[k] = envConfig[k]
    }
} else {
    console.error('File .env.local not found!')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
    console.error('Please make sure you have SUPABASE_SERVICE_ROLE_KEY in your .env.local file.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const users = [
    { email: 'recruiter@iestgroup.com', password: 'Recruiter@25', role: 'recruiter' },
    { email: 'usuario@iestgroup.com', password: 'Usuario@25', role: 'candidate' }
]

async function createUsers() {
    console.log('Creating users...')

    for (const user of users) {
        try {
            // Check if user exists
            const { data: existingUsers } = await supabase.auth.admin.listUsers()
            const exists = existingUsers.users.find(u => u.email === user.email)

            if (exists) {
                console.log(`User ${user.email} already exists. Updating password and role...`)
                const { error } = await supabase.auth.admin.updateUserById(exists.id, {
                    password: user.password,
                    email_confirm: true,
                    user_metadata: { role: user.role }
                })
                if (error) throw error
                console.log(`Updated ${user.email}`)
            } else {
                console.log(`Creating user ${user.email}...`)
                const { error } = await supabase.auth.admin.createUser({
                    email: user.email,
                    password: user.password,
                    email_confirm: true,
                    user_metadata: { role: user.role }
                })
                if (error) throw error
                console.log(`User ${user.email} created successfully!`)
            }
        } catch (error: any) {
            console.error(`Error processing ${user.email}:`, error.message)
        }
    }
}

createUsers()
