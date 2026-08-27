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


-- 배치(cron) 실행 결과 로그
create table if not exists public.cron_logs (
  id       uuid primary key default gen_random_uuid(),
  ran_at   timestamptz not null default now(),
  job      text not null,
  status   text not null check (status in ('success', 'error')),
  affected integer,
  detail   text
);

create index if not exists cron_logs_ran_at_idx
  on public.cron_logs (ran_at desc);

alter table public.cron_logs enable row level security;


-- ---------------------------------------------------------------------------
-- bookings : 컨설팅 예약 신청 건
--   · 예약 가능 슬롯(날짜/시간)은 코드에 하드코딩되어 있고(별도 slots 테이블 없음),
--     예약된 건만 이 테이블에 저장한다.
--   · 모든 시각은 Asia/Seoul 기준 "벽시계 시간". slot_date(date) + start_time(time)로
--     분리 저장하고 UTC 변환하지 않는다. (created_at 등 감사 컬럼만 timestamptz)
--   · 슬롯은 1시간 단위(정각)만 허용한다.
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id            uuid        primary key default gen_random_uuid(),
  slot_date     date        not null,
  start_time    time        not null,

  -- 사업명 (신청 폼에서 택1). 허용 값은 앱(config.ts PROJECTS)에서 검증한다.
  project_name  text        not null,

  company_name  text        not null,
  contact_name  text        not null,
  phone         text        not null,
  email         text        not null,

  -- '60' = 60분, '30' = 30분 (30분도 1시간 슬롯을 점유한다)
  consult_type  text        not null default '60'
                            check (consult_type in ('60', '30')),

  sns_url       text,
  pre_question  text,

  -- 취소/조회용 랜덤 토큰 (uuid 2개 이어붙인 hex). gen_random_uuid()는 코어 함수.
  cancel_token  text        not null unique
                            default replace(gen_random_uuid()::text, '-', '')
                                 || replace(gen_random_uuid()::text, '-', ''),

  created_at    timestamptz not null default now(),
  -- null 이면 유효 예약, 값이 있으면 취소된 예약
  cancelled_at  timestamptz,

  -- 슬롯은 1시간 단위(정각)만
  constraint bookings_start_time_hourly check (
    extract(minute from start_time) = 0
    and extract(second from start_time) = 0
  )
);

-- 이중 예약 방지: DB 레벨에서 막는 "최종 권위". 절대 제거하지 말 것.
-- 취소되지 않은(cancelled_at is null) 예약만 대상으로 (날짜, 시각) 유니크.
-- 취소하면 해당 슬롯은 자동으로 다시 예약 가능해진다.
create unique index if not exists bookings_active_slot_unique
  on public.bookings (slot_date, start_time)
  where cancelled_at is null;

create index if not exists bookings_cancel_token_idx
  on public.bookings (cancel_token);

create index if not exists bookings_created_at_idx
  on public.bookings (created_at desc);

-- 모든 접근은 서버에서 service_role 키로만. anon 키로는 직접 못 읽게 RLS 켜둔다.
alter table public.bookings enable row level security;

-- 기존 bookings 테이블에 사업명 컬럼 추가 (여러 번 실행해도 안전).
-- 새로 만드는 경우 위 create table 에 이미 포함되어 있다.
alter table public.bookings add column if not exists project_name text;


-- ---------------------------------------------------------------------------
-- booking_slots : 예약 가능 슬롯(열어둔 날짜/시각)
--   · 예전에는 코드(config.ts OPEN_SLOTS)에 하드코딩했지만, 관리자 화면에서
--     텍스트를 붙여넣어 등록하도록 바뀌면서 DB 테이블로 옮겼다.
--   · 시각은 Asia/Seoul 기준 "벽시계 시간", 1시간 단위(정각)만 허용.
--   · (날짜, 시각)이 기본키라 중복 등록은 on conflict do nothing 으로 걸러진다.
-- ---------------------------------------------------------------------------
create table if not exists public.booking_slots (
  slot_date  date        not null,
  start_time time        not null,
  created_at timestamptz not null default now(),

  primary key (slot_date, start_time),

  constraint booking_slots_start_time_hourly check (
    extract(minute from start_time) = 0
    and extract(second from start_time) = 0
  )
);

create index if not exists booking_slots_slot_date_idx
  on public.booking_slots (slot_date);

alter table public.booking_slots enable row level security;


-- 하루 예약 상한(DAILY_BOOKING_LIMIT) 계산용: 날짜별 유효 예약 수 조회
create index if not exists bookings_active_slot_date_idx
  on public.bookings (slot_date)
  where cancelled_at is null;

-- 같은 이메일의 중복 예약 차단용 (대소문자 무시)
create index if not exists bookings_active_email_idx
  on public.bookings (lower(email))
  where cancelled_at is null;
