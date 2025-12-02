-- Fix for "new row violates row-level security policy for table 'vagas'"
-- This policy allows any authenticated user to create a new job vacancy.

CREATE POLICY "Vagas insert" ON vagas FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Optional: Allow authenticated users to update/delete (if needed later)
-- CREATE POLICY "Vagas update" ON vagas FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Vagas delete" ON vagas FOR DELETE USING (auth.role() = 'authenticated');
