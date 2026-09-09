-- ===========================================================================
-- 2026-09-28 (월) 예약 슬롯 일부 제거 — 5칸
--
--   13:00, 14:00, 15:00, 16:00, 17:00 만 지운다.
--   10:00, 11:00, 18:00, 20:00 은 그대로 둔다.
--
-- ⚠️ 지우려는 슬롯에 유효 예약(cancelled_at is null)이 하나라도 있으면
--    아무것도 지우지 않고 에러를 내며 전체 롤백한다.
--    예약이 살아있는 슬롯을 지우면 그 예약은 "열려 있지 않은 슬롯"에 붙는다.
--
-- 여러 번 실행해도 안전하다(이미 지워졌으면 0행 삭제).
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 실행 "전" 확인용 (아래 begin 앞에서 따로 돌려보세요)
-- ---------------------------------------------------------------------------
-- select start_time
-- from public.booking_slots
-- where slot_date = date '2026-09-28'
-- order by start_time;
-- -- 기대: 10:00, 11:00, 13:00, 14:00, 15:00, 16:00, 17:00, 18:00, 20:00 (9행)
--
-- select start_time, cancelled_at, company_name, email
-- from public.bookings
-- where slot_date = date '2026-09-28'
-- order by start_time;
-- -- 13:00~17:00 에 유효 예약이 있으면 아래 스크립트는 실패한다.


begin;

-- ① 지우려는 슬롯에 유효 예약이 있으면 중단(전체 롤백)
do $$
declare
  v_active integer;
begin
  select count(*) into v_active
  from public.bookings
  where slot_date = date '2026-09-28'
    and cancelled_at is null
    and start_time in (time '13:00', time '14:00', time '15:00',
                       time '16:00', time '17:00');

  if v_active > 0 then
    raise exception
      '2026-09-28 의 삭제 대상 시간대에 유효 예약이 %건 있습니다. '
      '슬롯을 지우지 않고 중단합니다. 먼저 관리자 화면에서 해당 예약을 취소하세요.',
      v_active;
  end if;
end $$;

-- ② 슬롯 삭제
delete from public.booking_slots
where slot_date = date '2026-09-28'
  and start_time in (time '13:00', time '14:00', time '15:00',
                     time '16:00', time '17:00');

commit;


-- ---------------------------------------------------------------------------
-- 실행 "후" 확인용 (commit 뒤에 따로 돌려보세요)
-- ---------------------------------------------------------------------------
-- select start_time
-- from public.booking_slots
-- where slot_date = date '2026-09-28'
-- order by start_time;
-- -- 기대: 10:00, 11:00, 18:00, 20:00 (4행)
--
-- select count(*) as total_slots from public.booking_slots;
-- -- 기대: 68  (제거 전 73 - 5)


-- ---------------------------------------------------------------------------
-- 되돌리기 (지운 5칸을 다시 넣는다)
-- ---------------------------------------------------------------------------
-- insert into public.booking_slots (slot_date, start_time) values
--   ('2026-09-28', '13:00:00'),
--   ('2026-09-28', '14:00:00'),
--   ('2026-09-28', '15:00:00'),
--   ('2026-09-28', '16:00:00'),
--   ('2026-09-28', '17:00:00')
-- on conflict (slot_date, start_time) do nothing;
