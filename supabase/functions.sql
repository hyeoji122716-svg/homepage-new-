-- ===========================================================================
-- Postgres 함수 모음 (Supabase 대시보드 > SQL Editor 에 붙여넣고 실행)
--
-- ⚠️ 이 파일은 supabase/schema.sql 을 먼저 실행한 뒤에 실행하세요.
--    (bookings / booking_slots 테이블이 있어야 합니다.)
--
-- 여러 번 실행해도 안전합니다(create or replace).
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- create_booking : 예약 1건을 "안전하게" 넣는다.
--
-- 왜 함수인가:
--   하루 예약 상한(DAILY_BOOKING_LIMIT)은 "현재 유효 예약 수"를 세서 판단한다.
--   앱에서 세고 → 앱에서 insert 하면, 동시에 들어온 두 요청이 둘 다
--   "아직 3건이네" 를 보고 둘 다 insert 해서 상한을 넘길 수 있다.
--   그래서 세는 것과 넣는 것을 한 트랜잭션 안에서 하고,
--   그 앞에 pg_advisory_xact_lock 으로 "그 날짜"를 잠근다.
--   같은 날짜에 대한 요청은 한 줄로 세워지고, 트랜잭션이 끝나면 자동 해제된다.
--   (다른 날짜 예약끼리는 서로 막지 않는다.)
--
-- 반환: (id, cancel_token) 한 행
--
-- 에러는 SQLSTATE 로 구분해서 던진다. 앱(reserve/route.ts)이 이 코드를 보고
-- 사용자에게 보여줄 문구를 고른다.
--   BK001 : 열려 있지 않은 슬롯
--   BK002 : 그 슬롯은 이미 예약됨          → "이미 마감된 시간입니다"
--   BK003 : 그 날짜의 하루 상한에 도달     → "해당 날짜는 예약이 마감되었습니다"
--   BK004 : 같은 이메일의 유효 예약이 있음 → "이미 예약된 내역이 있습니다"
-- ---------------------------------------------------------------------------
create or replace function public.create_booking(
  p_slot_date    date,
  p_start_time   time,
  p_project_name text,
  p_company_name text,
  p_contact_name text,
  p_phone        text,
  p_email        text,
  p_consult_type text,
  p_sns_url      text,
  p_pre_question text,
  p_daily_limit  integer
)
returns table (id uuid, cancel_token text)
language plpgsql
as $$
declare
  v_active integer;
  v_id     uuid;
  v_token  text;
begin
  if p_daily_limit is null or p_daily_limit < 1 then
    raise exception 'invalid daily limit: %', p_daily_limit
      using errcode = 'BK000';
  end if;

  -- ① 이 날짜를 잠근다. 같은 날짜 요청은 여기서 순서대로 줄을 선다.
  --    커밋/롤백 시 자동 해제되므로 따로 풀어줄 필요가 없다.
  perform pg_advisory_xact_lock(hashtext('bookings'), hashtext(p_slot_date::text));

  -- ② 관리자가 열어둔 슬롯인지
  if not exists (
    select 1 from public.booking_slots s
    where s.slot_date = p_slot_date
      and s.start_time = p_start_time
  ) then
    raise exception 'slot not open' using errcode = 'BK001';
  end if;

  -- ③ 같은 이메일로 이미 유효한 예약이 있는지 (대소문자 무시)
  if exists (
    select 1 from public.bookings b
    where b.cancelled_at is null
      and lower(b.email) = lower(p_email)
  ) then
    raise exception 'duplicate email' using errcode = 'BK004';
  end if;

  -- ④ 그 슬롯이 이미 찼는지
  if exists (
    select 1 from public.bookings b
    where b.cancelled_at is null
      and b.slot_date = p_slot_date
      and b.start_time = p_start_time
  ) then
    raise exception 'slot taken' using errcode = 'BK002';
  end if;

  -- ⑤ 하루 상한. 취소된 건은 세지 않으므로, 취소하면 자동으로 다시 열린다.
  select count(*) into v_active
  from public.bookings b
  where b.cancelled_at is null
    and b.slot_date = p_slot_date;

  if v_active >= p_daily_limit then
    raise exception 'daily limit reached (% / %)', v_active, p_daily_limit
      using errcode = 'BK003';
  end if;

  begin
    insert into public.bookings (
      slot_date, start_time, project_name, company_name, contact_name,
      phone, email, consult_type, sns_url, pre_question
    ) values (
      p_slot_date, p_start_time, p_project_name, p_company_name, p_contact_name,
      p_phone, p_email, p_consult_type,
      nullif(btrim(coalesce(p_sns_url, '')), ''),
      nullif(btrim(coalesce(p_pre_question, '')), '')
    )
    returning bookings.id, bookings.cancel_token
    into v_id, v_token;
  exception
    -- 최종 방어선인 부분 유니크 인덱스(bookings_active_slot_unique)에 걸린 경우.
    -- ①의 잠금 덕분에 정상적으로는 도달하지 않지만, 코드를 통일해서 던진다.
    when unique_violation then
      raise exception 'slot taken' using errcode = 'BK002';
  end;

  return query select v_id, v_token;
end;
$$;

-- 이 함수는 서버(service_role)에서만 호출한다.
-- anon 키로 rpc 를 때려서 예약을 만들 수 없도록 실행 권한을 회수한다.
revoke all on function public.create_booking(
  date, time, text, text, text, text, text, text, text, text, integer
) from public;
revoke all on function public.create_booking(
  date, time, text, text, text, text, text, text, text, text, integer
) from anon, authenticated;
grant execute on function public.create_booking(
  date, time, text, text, text, text, text, text, text, text, integer
) to service_role;
