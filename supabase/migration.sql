-- Jalankan SQL ini di Supabase SQL Editor
-- https://supabase.com/dashboard/project/zyazrzghqnwqpslabjmn/sql

CREATE TABLE IF NOT EXISTS dropbox_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  account_id TEXT UNIQUE NOT NULL,
  refresh_token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_dropbox_accounts_active ON dropbox_accounts(is_active);

-- Enable RLS
ALTER TABLE dropbox_accounts ENABLE ROW LEVEL SECURITY;

-- Policy untuk allow all (app pribadi tanpa user auth)
CREATE POLICY "Allow all operations" ON dropbox_accounts
  FOR ALL USING (true) WITH CHECK (true);

-- Insert akun pertama (dari .env yang sudah ada)
-- Ganti dengan refresh token Anda
INSERT INTO dropbox_accounts (name, account_id, refresh_token, is_active)
VALUES ('Main Account', 'default', 'RK1MkbxHF3MAAAAAAAAAAf2O1dRMdL3NccUkAZKad60nsGzIR7_4sqQuKYWKVmTP', true)
ON CONFLICT (account_id) DO NOTHING;
