-- Feature requests table
create table if not exists public.feature_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hub text default 'cognitive',
  title text,
  description text not null,
  status text not null default 'new',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Simple hub and status validation
do $$ begin
  if not exists (
    select 1 from information_schema.constraint_column_usage 
    where table_name='feature_requests' and constraint_name='feature_requests_hub_check'
  ) then
    alter table public.feature_requests add constraint feature_requests_hub_check
      check (hub in ('marketing','sales','finance','ops','hr','legal','cognitive','other'));
  end if;
  if not exists (
    select 1 from information_schema.constraint_column_usage 
    where table_name='feature_requests' and constraint_name='feature_requests_status_check'
  ) then
    alter table public.feature_requests add constraint feature_requests_status_check
      check (status in ('new','triaged','in_progress','done','rejected'));
  end if;
end $$;

-- RLS
alter table public.feature_requests enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='feature_requests' and policyname='feature_requests_select_own'
  ) then
    create policy feature_requests_select_own on public.feature_requests
      for select using (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='feature_requests' and policyname='feature_requests_insert_own'
  ) then
    create policy feature_requests_insert_own on public.feature_requests
      for insert with check (auth.uid() = user_id);
  end if;
end $$;


