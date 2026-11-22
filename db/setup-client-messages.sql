-- Client zone thread: messages from Lucie / Luca (team) to a client and the
-- client's replies. Run in the Supabase SQL editor. Idempotent: safe to run
-- again. Requires public.is_admin() (already present, used by other RLS
-- policies) and the auth schema.
--
-- Access model:
--   * client (authenticated): reads only own thread, may mark team messages
--     as read (read_at only), may insert own replies (author_kind = 'client').
--   * admin (public.is_admin()): reads, inserts and updates everything.
--   * service role (server API routes) bypasses RLS.
--   * nobody deletes through the API; rows go away with the auth user.


create table if not exists public.client_messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  author_kind text not null,
  author_id uuid references auth.users(id) on delete set null,
  body text not null,
  property_id text null,
  created_at timestamptz not null default now(),
  read_at timestamptz null
);

-- Constraints are added separately so re-running never fails.
alter table public.client_messages drop constraint if exists client_messages_author_kind_check;
alter table public.client_messages
  add constraint client_messages_author_kind_check
  check (author_kind in ('lucie', 'luca', 'team', 'client'));

alter table public.client_messages drop constraint if exists client_messages_body_length_check;
alter table public.client_messages
  add constraint client_messages_body_length_check
  check (length(trim(body)) between 1 and 4000);

alter table public.client_messages drop constraint if exists client_messages_property_id_length_check;
alter table public.client_messages
  add constraint client_messages_property_id_length_check
  check (property_id is null or length(property_id) between 1 and 300);

create index if not exists client_messages_client_created_idx
  on public.client_messages (client_id, created_at desc);

-- Unread team messages per client (zone badge / read endpoint).
create index if not exists client_messages_unread_idx
  on public.client_messages (client_id)
  where read_at is null and author_kind <> 'client';

alter table public.client_messages enable row level security;

-- Privileges: no anon access at all. authenticated may only change read_at.
revoke all on public.client_messages from anon;
revoke all on public.client_messages from authenticated;
grant select, insert on public.client_messages to authenticated;
grant update (read_at) on public.client_messages to authenticated;
grant all on public.client_messages to service_role;

drop policy if exists "Clients read own messages" on public.client_messages;
create policy "Clients read own messages"
  on public.client_messages for select
  to authenticated
  using (client_id = auth.uid());

drop policy if exists "Clients mark team messages read" on public.client_messages;
create policy "Clients mark team messages read"
  on public.client_messages for update
  to authenticated
  using (client_id = auth.uid() and author_kind <> 'client')
  with check (client_id = auth.uid() and author_kind <> 'client');

drop policy if exists "Clients insert own replies" on public.client_messages;
create policy "Clients insert own replies"
  on public.client_messages for insert
  to authenticated
  with check (
    client_id = auth.uid()
    and author_kind = 'client'
    and author_id = auth.uid()
  );

drop policy if exists "Admins read all client messages" on public.client_messages;
create policy "Admins read all client messages"
  on public.client_messages for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins insert team messages" on public.client_messages;
create policy "Admins insert team messages"
  on public.client_messages for insert
  to authenticated
  with check (
    public.is_admin()
    and author_kind in ('lucie', 'luca', 'team')
    and author_id = auth.uid()
  );

drop policy if exists "Admins update client messages" on public.client_messages;
create policy "Admins update client messages"
  on public.client_messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Defense in depth for end-user sessions (anon/authenticated roles): the
-- server clock sets created_at, read_at can only go from empty to a time,
-- and nothing except read_at may change on update. The service role and
-- the SQL editor (postgres) are not restricted.
create or replace function public.client_messages_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.created_at := now();
    if new.author_kind = 'client' then
      new.read_at := null;
    end if;
    return new;
  end if;

  if new.id is distinct from old.id
    or new.client_id is distinct from old.client_id
    or new.author_kind is distinct from old.author_kind
    or new.author_id is distinct from old.author_id
    or new.body is distinct from old.body
    or new.property_id is distinct from old.property_id
    or new.created_at is distinct from old.created_at then
    raise exception 'client_messages: only read_at can be changed'
      using errcode = '42501';
  end if;

  if old.read_at is not null and new.read_at is distinct from old.read_at then
    raise exception 'client_messages: read_at is already set'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists client_messages_guard on public.client_messages;
create trigger client_messages_guard
  before insert or update on public.client_messages
  for each row execute function public.client_messages_guard();

select 'client_messages ready' as message;
