alter table public.user_profiles
  add column if not exists nickname text;

create unique index if not exists user_profiles_nickname_unique_idx
  on public.user_profiles (nickname)
  where nickname is not null and btrim(nickname) <> '';
