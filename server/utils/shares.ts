import { useSupabase } from './supabase'

// File info for batch uploads
export interface ShareFile {
    name: string
    path: string
    size: number
    accountId?: string   // For multi-account batch uploads
}

export interface ShareLink {
    id: string
    fileId: string           // Legacy single file or folder path for batch
    fileName: string         // Legacy or batch name
    filePath: string         // Legacy single file path or folder path
    files: ShareFile[]       // Array of files for batch upload
    accountId: string
    accountName: string
    createdAt: string
    expiresAt: string | null
    downloadCount: number
    userId?: string | null
}

// Generate simple unique ID
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

// Database helpers
export async function createShare(data: Omit<ShareLink, 'id' | 'createdAt' | 'downloadCount'>): Promise<ShareLink> {
    const supabase = useSupabase()
    const id = generateId()

    const shareData = {
        id,
        file_id: data.fileId,
        file_name: data.fileName,
        file_path: data.filePath,
        files: data.files || [],  // Store as JSONB
        account_id: data.accountId,
        account_name: data.accountName,
        expires_at: data.expiresAt,
        download_count: 0,
        user_id: data.userId || null,
        share_link: `/file/${id}` // Required field - relative URL
    }

    const { error } = await supabase
        .from('shares')
        .insert(shareData)

    if (error) throw error

    return {
        ...data,
        id,
        files: data.files || [],
        createdAt: new Date().toISOString(),
        downloadCount: 0
    }
}

export async function getSharesByAccount(accountId: string): Promise<ShareLink[]> {
    const supabase = useSupabase()

    const { data, error } = await supabase
        .from('shares')
        .select('*')
        .eq('account_id', accountId)

    if (error) throw error
    if (!data) return []

    return (data as any[]).map(item => ({
        id: item.id,
        fileId: item.file_id,
        fileName: item.file_name,
        filePath: item.file_path,
        files: item.files || [],
        accountId: item.account_id,
        accountName: item.account_name,
        createdAt: item.created_at,
        expiresAt: item.expires_at,
        downloadCount: item.download_count,
        userId: item.user_id
    }))
}

export async function getSharesByUser(userId: string): Promise<ShareLink[]> {
    const supabase = useSupabase()

    const { data, error } = await supabase
        .from('shares')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    if (!data) return []

    return (data as any[]).map(item => ({
        id: item.id,
        fileId: item.file_id,
        fileName: item.file_name,
        filePath: item.file_path,
        files: item.files || [],
        accountId: item.account_id,
        accountName: item.account_name,
        createdAt: item.created_at,
        expiresAt: item.expires_at,
        downloadCount: item.download_count,
        userId: item.user_id
    }))
}

export async function getShareById(id: string): Promise<ShareLink | null> {
    const supabase = useSupabase()

    const { data, error } = await supabase
        .from('shares')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !data) return null

    return {
        id: data.id,
        fileId: data.file_id,
        fileName: data.file_name,
        filePath: data.file_path,
        files: data.files || [],
        accountId: data.account_id,
        accountName: data.account_name,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        downloadCount: data.download_count
    }
}

export async function incrementDownloadCount(id: string): Promise<void> {
    const supabase = useSupabase()

    const { data } = await supabase.from('shares').select('download_count').eq('id', id).single()
    if (data) {
        await supabase.from('shares').update({ download_count: data.download_count + 1 }).eq('id', id)
    }
}

export async function deleteShare(id: string): Promise<boolean> {
    const supabase = useSupabase()

    const { error } = await supabase
        .from('shares')
        .delete()
        .eq('id', id)

    return !error
}

export async function cleanExpiredShares(): Promise<void> {
    const supabase = useSupabase()
    const now = new Date().toISOString()

    await supabase
        .from('shares')
        .delete()
        .not('expires_at', 'is', null)
        .lt('expires_at', now)
}

export async function findActiveShare(accountId: string, filePath: string): Promise<ShareLink | null> {
    const supabase = useSupabase()
    const now = new Date().toISOString()

    const { data, error } = await supabase
        .from('shares')
        .select('*')
        .eq('account_id', accountId)
        .eq('file_path', filePath)
        .or(`expires_at.gt.${now},expires_at.is.null`)
        .order('created_at', { ascending: false }) // Get latest if multiple share links exist
        .limit(1)
        .single()

    if (error || !data) return null

    return {
        id: data.id,
        fileId: data.file_id,
        fileName: data.file_name,
        filePath: data.file_path,
        files: data.files || [],
        accountId: data.account_id,
        accountName: data.account_name,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        downloadCount: data.download_count
    }
}

