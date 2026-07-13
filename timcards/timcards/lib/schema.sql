-- =============================================
-- SCHEMA TIMCARDS - À coller dans Supabase SQL Editor
-- =============================================

-- Table des profils utilisateurs
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  twitch_id text unique,
  twitch_username text,
  twitch_avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table de la collection (quelle carte possède qui)
create table if not exists public.collection (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  card_id integer not null,
  obtained_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table de l'historique des paquets ouverts
create table if not exists public.pack_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  cards_obtained jsonb not null,
  timcash_spent integer not null default 500,
  opened_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- SÉCURITÉ (Row Level Security)
-- =============================================

alter table public.profiles enable row level security;
alter table public.collection enable row level security;
alter table public.pack_history enable row level security;

-- Profiles : chacun voit son propre profil
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Collection : chacun voit sa propre collection
create policy "Users can view own collection"
  on public.collection for select
  using (auth.uid() = user_id);

create policy "Users can insert into own collection"
  on public.collection for insert
  with check (auth.uid() = user_id);

-- Classement : tout le monde peut voir le nombre de cartes de chacun
create policy "Anyone can view collection counts"
  on public.collection for select
  using (true);

-- Pack history : chacun voit son propre historique
create policy "Users can view own pack history"
  on public.pack_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own pack history"
  on public.pack_history for insert
  with check (auth.uid() = user_id);

-- =============================================
-- FONCTION : créer le profil automatiquement à l'inscription
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, twitch_id, twitch_username, twitch_avatar)
  values (
    new.id,
    new.raw_user_meta_data->>'provider_id',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger qui appelle la fonction à chaque nouvel utilisateur
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
