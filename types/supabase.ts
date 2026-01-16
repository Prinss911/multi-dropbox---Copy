export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            dropbox_accounts: {
                Row: {
                    account_id: string
                    app_key: string | null
                    app_secret: string | null
                    created_at: string | null
                    email: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    refresh_token: string
                    updated_at: string | null
                }
                Insert: {
                    account_id: string
                    app_key?: string | null
                    app_secret?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    refresh_token: string
                    updated_at?: string | null
                }
                Update: {
                    account_id?: string
                    app_key?: string | null
                    app_secret?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    refresh_token?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            files: {
                Row: {
                    content_type: string | null
                    dropbox_account_id: string
                    dropbox_path: string
                    filename: string
                    id: string
                    size: number | null
                    uploaded_at: string | null
                    user_id: string
                    virtual_folder: string | null
                }
                Insert: {
                    content_type?: string | null
                    dropbox_account_id: string
                    dropbox_path: string
                    filename: string
                    id?: string
                    size?: number | null
                    uploaded_at?: string | null
                    user_id: string
                    virtual_folder?: string | null
                }
                Update: {
                    content_type?: string | null
                    dropbox_account_id?: string
                    dropbox_path?: string
                    filename?: string
                    id?: string
                    size?: number | null
                    uploaded_at?: string | null
                    user_id?: string
                    virtual_folder?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "files_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            virtual_folders: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "virtual_folders_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            invitations: {
                Row: {
                    accepted_at: string | null
                    email: string
                    id: string
                    invited_at: string | null
                    invited_by: string | null
                    role: Database["public"]["Enums"]["app_role"]
                    status: string | null
                }
                Insert: {
                    accepted_at?: string | null
                    email: string
                    id?: string
                    invited_at?: string | null
                    invited_by?: string | null
                    role?: Database["public"]["Enums"]["app_role"]
                    status?: string | null
                }
                Update: {
                    accepted_at?: string | null
                    email?: string
                    id?: string
                    invited_at?: string | null
                    invited_by?: string | null
                    role?: Database["public"]["Enums"]["app_role"]
                    status?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "invitations_invited_by_fkey"
                        columns: ["invited_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    created_at: string | null
                    email: string | null
                    id: string
                    name: string | null
                    role: Database["public"]["Enums"]["app_role"] | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    email?: string | null
                    id: string
                    name?: string | null
                    role?: Database["public"]["Enums"]["app_role"] | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    name?: string | null
                    role?: Database["public"]["Enums"]["app_role"] | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            shares: {
                Row: {
                    account_id: string
                    account_name: string
                    created_at: string | null
                    download_count: number | null
                    expires_at: string | null
                    file_id: string
                    file_name: string
                    file_path: string
                    files: Json | null
                    id: string
                    is_active: boolean | null
                    last_accessed_at: string | null
                    password_hash: string | null
                    share_link: string
                    user_id: string | null
                    video_metadata: Json | null
                    view_count: number | null
                }
                Insert: {
                    account_id: string
                    account_name: string
                    created_at?: string | null
                    download_count?: number | null
                    expires_at?: string | null
                    file_id: string
                    file_name: string
                    file_path: string
                    files?: Json | null
                    id?: string
                    is_active?: boolean | null
                    last_accessed_at?: string | null
                    password_hash?: string | null
                    share_link: string
                    user_id?: string | null
                    video_metadata?: Json | null
                    view_count?: number | null
                }
                Update: {
                    account_id?: string
                    account_name?: string
                    created_at?: string | null
                    download_count?: number | null
                    expires_at?: string | null
                    file_id?: string
                    file_name?: string
                    file_path?: string
                    files?: Json | null
                    id?: string
                    is_active?: boolean | null
                    last_accessed_at?: string | null
                    password_hash?: string | null
                    share_link?: string
                    user_id?: string | null
                    video_metadata?: Json | null
                    view_count?: number | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            app_role: "admin" | "user"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
