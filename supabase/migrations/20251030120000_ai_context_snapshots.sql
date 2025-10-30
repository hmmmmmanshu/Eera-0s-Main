-- Create ai_context_snapshots to store compact weekly personalization context
create table if not exists public.ai_context_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start timestamptz not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique(user_id, week_start)
);

alter table public.ai_context_snapshots enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'ai_context_snapshots' and policyname = 'Allow owner access') then
    create policy "Allow owner access" on public.ai_context_snapshots
      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;


