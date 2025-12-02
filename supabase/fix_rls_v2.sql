-- Comprehensive fix for RLS policies on 'vagas' table

-- 1. Enable RLS (just in case)
ALTER TABLE vagas ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Vagas insert" ON vagas;
DROP POLICY IF EXISTS "Vagas update" ON vagas;
DROP POLICY IF EXISTS "Vagas delete" ON vagas;
DROP POLICY IF EXISTS "Vagas policy" ON vagas; -- In case they named it differently

-- 3. Create permissive policies for authenticated users
-- Allow any authenticated user to create a vacancy
CREATE POLICY "Vagas insert" ON vagas FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow any authenticated user to update/delete (For MVP simplicity. In production, check user_id)
CREATE POLICY "Vagas update" ON vagas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Vagas delete" ON vagas FOR DELETE USING (auth.role() = 'authenticated');

-- Ensure public read access still exists
DROP POLICY IF EXISTS "Vagas públicas" ON vagas;
CREATE POLICY "Vagas públicas" ON vagas FOR SELECT USING (true);
