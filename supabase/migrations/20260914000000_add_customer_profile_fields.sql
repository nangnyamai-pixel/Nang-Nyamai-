alter table public.profiles
  add column if not exists phone_number text,
  add column if not exists member_number text,
  add column if not exists card_number text,
  add column if not exists point_before integer,
  add column if not exists point_earned integer,
  add column if not exists point_redeem integer,
  add column if not exists latest_point integer;
