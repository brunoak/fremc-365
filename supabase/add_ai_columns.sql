-- Add columns for AI analysis
ALTER TABLE candidatos ADD COLUMN IF NOT EXISTS weaknesses TEXT[];
ALTER TABLE candidatos ADD COLUMN IF NOT EXISTS recommendation TEXT;
