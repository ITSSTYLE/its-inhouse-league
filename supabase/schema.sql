create extension if not exists "pgcrypto";

create type public.player_role as enum ('player', 'admin');
create type public.draft_status as enum ('open', 'drafting', 'complete', 'cancelled');
create type public.team_side as enum ('blue', 'red');
create type public.match_status as enum ('pending_confirmation', 'confirmed', 'overridden', 'cancelled');

create table public.players (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  discord_id text unique not null,
  username text not null,
  avatar_url text,
  joined_at timestamptz not null default now(),
  elo integer not null default 1000,
  wins integer not null default 0,
  losses integer not null default 0,
  games_played integer not null default 0,
  role public.player_role not null default 'player',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.draft_lobbies (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.players(id),
  blue_captain_id uuid not null references public.players(id),
  red_captain_id uuid not null references public.players(id),
  status public.draft_status not null default 'open',
  current_pick_team public.team_side not null default 'blue',
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint distinct_captains check (blue_captain_id <> red_captain_id)
);

create table public.draft_picks (
  id uuid primary key default gen_random_uuid(),
  draft_lobby_id uuid not null references public.draft_lobbies(id) on delete cascade,
  player_id uuid not null references public.players(id),
  team public.team_side not null,
  pick_number integer not null,
  picked_by uuid not null references public.players(id),
  created_at timestamptz not null default now(),
  unique (draft_lobby_id, player_id),
  unique (draft_lobby_id, pick_number)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  draft_lobby_id uuid unique references public.draft_lobbies(id),
  blue_captain_id uuid not null references public.players(id),
  red_captain_id uuid not null references public.players(id),
  winning_team public.team_side,
  status public.match_status not null default 'pending_confirmation',
  created_by uuid not null references public.players(id),
  confirmed_at timestamptz,
  overridden_by uuid references public.players(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint match_requires_winner_when_final check (
    status = 'pending_confirmation'
    or winning_team is not null
  )
);

create table public.match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  player_id uuid not null references public.players(id),
  team public.team_side not null,
  elo_before integer not null default 1000,
  elo_after integer,
  created_at timestamptz not null default now(),
  unique (match_id, player_id)
);

create table public.match_confirmations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  captain_id uuid not null references public.players(id),
  winning_team public.team_side not null,
  created_at timestamptz not null default now(),
  unique (match_id, captain_id)
);

create index players_elo_idx on public.players (elo desc, wins desc);
create index draft_picks_lobby_idx on public.draft_picks (draft_lobby_id, pick_number);
create index matches_created_at_idx on public.matches (created_at desc);
create index match_players_match_idx on public.match_players (match_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger players_touch_updated_at
before update on public.players
for each row execute function public.touch_updated_at();

create trigger draft_lobbies_touch_updated_at
before update on public.draft_lobbies
for each row execute function public.touch_updated_at();

create trigger matches_touch_updated_at
before update on public.matches
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_id text;
  display_name text;
  avatar text;
begin
  provider_id := coalesce(new.raw_user_meta_data ->> 'provider_id', new.raw_user_meta_data ->> 'sub');
  display_name := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email, 'Discord Player');
  avatar := new.raw_user_meta_data ->> 'avatar_url';

  if provider_id is not null then
    insert into public.players (auth_user_id, discord_id, username, avatar_url)
    values (new.id, provider_id, display_name, avatar)
    on conflict (discord_id) do update
      set auth_user_id = excluded.auth_user_id,
          username = excluded.username,
          avatar_url = excluded.avatar_url;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.players
    where auth_user_id = auth.uid()
    and role = 'admin'
  );
$$;

create or replace function public.current_player_id()
returns uuid
language sql
stable
as $$
  select id from public.players where auth_user_id = auth.uid();
$$;

create or replace function public.apply_match_result(target_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  match_record public.matches%rowtype;
  player_record record;
  expected_change integer := 24;
begin
  select * into match_record from public.matches where id = target_match_id;

  if match_record.id is null or match_record.winning_team is null then
    raise exception 'Match result is not ready';
  end if;

  for player_record in
    select mp.player_id, mp.team, p.elo
    from public.match_players mp
    join public.players p on p.id = mp.player_id
    where mp.match_id = target_match_id
  loop
    update public.match_players
    set elo_before = player_record.elo,
        elo_after = greatest(0, player_record.elo + case when player_record.team = match_record.winning_team then expected_change else -expected_change end)
    where match_id = target_match_id
    and player_id = player_record.player_id;

    update public.players
    set elo = greatest(0, player_record.elo + case when player_record.team = match_record.winning_team then expected_change else -expected_change end),
        wins = wins + case when player_record.team = match_record.winning_team then 1 else 0 end,
        losses = losses + case when player_record.team = match_record.winning_team then 0 else 1 end,
        games_played = games_played + 1
    where id = player_record.player_id;
  end loop;
end;
$$;

alter table public.players enable row level security;
alter table public.draft_lobbies enable row level security;
alter table public.draft_picks enable row level security;
alter table public.matches enable row level security;
alter table public.match_players enable row level security;
alter table public.match_confirmations enable row level security;

create policy "players are visible to authenticated users" on public.players
for select to authenticated using (true);

create policy "players can update their own profile" on public.players
for update to authenticated using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

create policy "admins can manage players" on public.players
for all to authenticated using (public.is_admin())
with check (public.is_admin());

create policy "drafts visible to authenticated users" on public.draft_lobbies
for select to authenticated using (true);

create policy "admins create drafts" on public.draft_lobbies
for insert to authenticated with check (public.is_admin());

create policy "admins update drafts" on public.draft_lobbies
for update to authenticated using (public.is_admin())
with check (public.is_admin());

create policy "draft picks visible to authenticated users" on public.draft_picks
for select to authenticated using (true);

create policy "admins and captains create picks" on public.draft_picks
for insert to authenticated with check (
  public.is_admin()
  or picked_by = public.current_player_id()
);

create policy "matches visible to authenticated users" on public.matches
for select to authenticated using (true);

create policy "admins create matches" on public.matches
for insert to authenticated with check (public.is_admin());

create policy "admins update matches" on public.matches
for update to authenticated using (public.is_admin())
with check (public.is_admin());

create policy "match players visible to authenticated users" on public.match_players
for select to authenticated using (true);

create policy "admins manage match players" on public.match_players
for all to authenticated using (public.is_admin())
with check (public.is_admin());

create policy "match confirmations visible to authenticated users" on public.match_confirmations
for select to authenticated using (true);

create policy "captains create confirmations" on public.match_confirmations
for insert to authenticated with check (captain_id = public.current_player_id());
