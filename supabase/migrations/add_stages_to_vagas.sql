-- Add stages column to vagas table
alter table public.vagas 
add column if not exists stages jsonb default '["Cadastro", "Screening/Conversa com RH", "Entrevista Técnica", "Entrevista com o Cliente", "Carta Oferta", "Contratação"]'::jsonb;

-- Update existing rows to have the default stages if they are null
update public.vagas 
set stages = '["Cadastro", "Screening/Conversa com RH", "Entrevista Técnica", "Entrevista com o Cliente", "Carta Oferta", "Contratação"]'::jsonb 
where stages is null;
