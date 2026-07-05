-- 커넥트유 문의(inquiries) 테이블
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.

create table if not exists public.inquiries (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  org        text,
  email      text not null,
  phone      text,
  type       text,
  message    text not null,
  status     text not null default 'new'
    check (status in ('new', 'in_progress', 'done')),
  privacy_consent boolean not null default false
);

-- 최신순 조회 성능용 인덱스
create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);

-- RLS 활성화. 정책을 만들지 않으므로 anon/authenticated 키로는 접근 불가.
-- 서버에서 service_role 키를 쓰는 경우에만 RLS를 우회하여 읽고/쓴다.
alter table public.inquiries enable row level security;
