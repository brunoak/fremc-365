-- Enable RLS on candidates table if not already enabled
alter table public.candidatos enable row level security;

-- Policy to allow candidates to delete their own applications based on email
create policy "Candidates can delete their own applications"
on public.candidatos
for delete
using ( email = auth.jwt() ->> 'email' );

-- We should also ensure they can SELECT their own applications (if not already set)
create policy "Candidates can view their own applications"
on public.candidatos
for select
using ( email = auth.jwt() ->> 'email' );
