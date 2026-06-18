# iT's In-House League

Production-ready starter for a Discord-first in-house league app built with Next.js 15, TypeScript, Tailwind CSS, Supabase, Discord OAuth, and Vercel.

## Features

- Discord login through Supabase OAuth.
- Player profiles with Discord ID, username, avatar, join date, ELO, wins, losses, and games played.
- League roster, leaderboard, match history, admin dashboard, and draft lobby screens.
- Draft lobby workflow with captains, alternating picks, and team locking.
- Match workflow with captain confirmations and admin override.
- Supabase schema with row level security and typed TypeScript models.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Create a Supabase project and run the SQL in `supabase/schema.sql`.

4. Enable Discord as an auth provider in Supabase:

   - Supabase Dashboard > Authentication > Providers > Discord.
   - Add the Discord client ID and secret.
   - Add `http://localhost:3000/auth/callback` and your Vercel callback URL to allowed redirect URLs.

5. Start the app:

   ```bash
   npm run dev
   ```

6. Visit `http://localhost:3000` and log in with Discord.

## Vercel Deployment

Add these environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Set `NEXT_PUBLIC_SITE_URL` to your production URL, for example `https://its-inhouse-league.vercel.app`.

## Admins

The `players.role` column supports `player` and `admin`. Promote admins directly in Supabase:

```sql
update public.players
set role = 'admin'
where discord_id = 'DISCORD_USER_ID';
```

## Database

The complete schema is in `supabase/schema.sql`. It creates:

- `players`
- `draft_lobbies`
- `draft_picks`
- `matches`
- `match_players`
- `match_confirmations`

It also includes helper functions for player profile creation, ELO updates, and draft pick validation.
