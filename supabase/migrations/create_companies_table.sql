-- Create companies table
create table if not exists public.companies (
    id uuid not null default gen_random_uuid() primary key,
    name text not null,
    description text,
    website text,
    logo_url text,
    culture_text text, -- For "Fit Cultural" analysis
    owner_id uuid references auth.users(id) on delete cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.companies enable row level security;

-- Policies for companies
create policy "Users can view their own company"
    on public.companies for select
    using (auth.uid() = owner_id);

create policy "Users can insert their own company"
    on public.companies for insert
    with check (auth.uid() = owner_id);

create policy "Users can update their own company"
    on public.companies for update
    using (auth.uid() = owner_id);

-- Add company_id to vagas table
alter table public.vagas 
add column if not exists company_id uuid references public.companies(id) on delete set null;

-- Policy to allow public read of companies (for job listings)
create policy "Public can view companies"
    on public.companies for select
    using (true);
