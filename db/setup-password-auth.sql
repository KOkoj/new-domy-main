-- Password sign-in with generated passwords (registration + forgotten password)
-- Run once in the Supabase SQL editor (production project). Idempotent.
--
-- 1) pending_passwords: a new password sent by "Zapomenuté heslo" (or a
--    repeated registration of an existing e-mail). Stored only as a scrypt
--    hash. The current password keeps working; the pending one becomes the
--    real password on the first successful sign-in with it (via the admin
--    API), then the row is deleted. One row per user, newest wins, 24 h TTL.
-- 2) auth_email_log: hashed e-mail / IP of every password e-mail request and
--    of every sign-in attempt checked against a pending password. Used for
--    rate limiting across serverless instances. Contains no plain e-mails or
--    IPs; rows older than 1 day are deleted by the app.
-- 3) find_auth_user_by_email(): lets the service role look up an auth user
--    by e-mail (the JS admin API has no lookup by e-mail).
--
-- All three are reachable only with the service-role key (RLS on, no
-- policies, no grants for anon/authenticated).

create table if not exists public.pending_passwords (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists pending_passwords_email_idx
  on public.pending_passwords (email);

alter table public.pending_passwords enable row level security;
revoke all on table public.pending_passwords from anon, authenticated;

create table if not exists public.auth_email_log (
  id bigserial primary key,
  kind text not null,
  email_hash text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists auth_email_log_email_idx
  on public.auth_email_log (kind, email_hash, created_at desc);
create index if not exists auth_email_log_ip_idx
  on public.auth_email_log (kind, ip_hash, created_at desc);
create index if not exists auth_email_log_created_idx
  on public.auth_email_log (created_at);

alter table public.auth_email_log enable row level security;
revoke all on table public.auth_email_log from anon, authenticated;
revoke all on sequence public.auth_email_log_id_seq from anon, authenticated;

create or replace function public.find_auth_user_by_email(p_email text)
returns table (
  id uuid,
  email text,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, u.email::text, u.last_sign_in_at, u.email_confirmed_at
  from auth.users u
  where lower(u.email) = lower(trim(p_email))
  limit 1
$$;

revoke all on function public.find_auth_user_by_email(text) from public, anon, authenticated;
grant execute on function public.find_auth_user_by_email(text) to service_role;

notify pgrst, 'reload schema';
