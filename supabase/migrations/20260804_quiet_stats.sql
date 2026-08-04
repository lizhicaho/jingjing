-- “我想静静”真实道场统计。所有写入仅由 Edge Function 使用 service_role 调用。
create table if not exists public.quiet_daily_stats (
  stat_date date primary key,
  merit_total bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiet_daily_visitors (
  stat_date date not null,
  visitor_id text not null check (char_length(visitor_id) between 1 and 128),
  first_seen_at timestamptz not null default now(),
  primary key (stat_date, visitor_id)
);

create table if not exists public.quiet_presence (
  visitor_id text primary key check (char_length(visitor_id) between 1 and 128),
  last_seen_at timestamptz not null default now()
);

create table if not exists public.quiet_knock_guards (
  visitor_id text primary key check (char_length(visitor_id) between 1 and 128),
  last_knock_at timestamptz not null default now()
);

create index if not exists quiet_presence_last_seen_idx on public.quiet_presence (last_seen_at);

create or replace function public.quiet_stats_snapshot()
returns table (online integer, visitors bigint, merits bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := timezone('Asia/Shanghai', now())::date;
begin
  insert into quiet_daily_stats (stat_date) values (today) on conflict (stat_date) do nothing;
  return query
  select
    (select count(*)::integer from quiet_presence where last_seen_at >= now() - interval '60 seconds'),
    (select count(*) from quiet_daily_visitors where stat_date = today),
    (select merit_total from quiet_daily_stats where stat_date = today);
end;
$$;

create or replace function public.quiet_record_visit(p_visitor_id text)
returns table (online integer, visitors bigint, merits bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := timezone('Asia/Shanghai', now())::date;
begin
  insert into quiet_daily_stats (stat_date) values (today) on conflict (stat_date) do nothing;
  insert into quiet_daily_visitors (stat_date, visitor_id) values (today, p_visitor_id) on conflict do nothing;
  insert into quiet_presence (visitor_id, last_seen_at) values (p_visitor_id, now())
  on conflict (visitor_id) do update set last_seen_at = excluded.last_seen_at;
  return query select * from quiet_stats_snapshot();
end;
$$;

create or replace function public.quiet_record_knock(p_visitor_id text)
returns table (online integer, visitors bigint, merits bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  last_knock timestamptz;
  today date := timezone('Asia/Shanghai', now())::date;
begin
  perform quiet_record_visit(p_visitor_id);
  select last_knock_at into last_knock from quiet_knock_guards where visitor_id = p_visitor_id for update;
  -- 单设备每 300ms 最多记 1 次，避免连续脚本刷数；前端仍可正常播放动画。
  if last_knock is null or last_knock <= now() - interval '300 milliseconds' then
    insert into quiet_knock_guards (visitor_id, last_knock_at) values (p_visitor_id, now())
    on conflict (visitor_id) do update set last_knock_at = excluded.last_knock_at;
    update quiet_daily_stats set merit_total = merit_total + 1, updated_at = now() where stat_date = today;
  end if;
  return query select * from quiet_stats_snapshot();
end;
$$;

revoke all on table public.quiet_daily_stats, public.quiet_daily_visitors, public.quiet_presence, public.quiet_knock_guards from anon, authenticated;
revoke all on function public.quiet_stats_snapshot(), public.quiet_record_visit(text), public.quiet_record_knock(text) from public, anon, authenticated;
