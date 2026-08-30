# 예약 기능 배포 전 테스트 케이스

손으로 따라 하는 체크리스트다. 자동화 없음.
**전부 통과해야 배포한다.** 하나라도 실패하면 그 항목의 "실패 시 볼 곳"부터 확인한다.

- 테스트 날짜: **2026-09-23** (슬롯 9칸 등록되어 있음). 다른 날짜로 해도 되지만 이 문서의 기대값은 이 날짜 기준이다.
- 하루 상한: `DAILY_BOOKING_LIMIT` 미설정 시 **4건**.
- 예약 마감(리드타임): `BOOKING_LEAD_TIME_HOURS` 미설정 시 **24시간**. 컨설팅 시작 24시간 전을 넘기면 예약 불가.
- 예약 화면: `http://localhost:3000/reserve/<BOOKING_ACCESS_TOKEN>`
- 관리자 화면: `http://localhost:3000/connectu-admin/bookings`

---

## 0. 사전 준비

- [ ] `.env.local` 에 `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`(**service_role 키**), `ADMIN_PASSWORD`, `BOOKING_ACCESS_TOKEN` 이 채워져 있다
- [ ] `npm run dev` 가 에러 없이 뜬다
- [ ] 예약 화면에 달력이 뜨고 날짜가 **선택 가능**(파란 테두리)하다

> **기대 결과:** 달력에 2026년 9월이 뜨고, 슬롯이 등록된 날짜가 파란 테두리로 표시된다.
> 날짜가 전부 회색이면 → `SUPABASE_SERVICE_ROLE_KEY` 가 service_role 키가 아니다. 서버 로그에 경고가 찍힌다.

**테스트 시작 전 DB 상태 확인** (Supabase SQL Editor):

```sql
select slot_date, start_time, cancelled_at, email
from public.bookings
where slot_date = date '2026-09-23'
order by start_time;
-- 기대: 0행 (남은 테스트 데이터가 없어야 함)
```

---

## 1. 정상 예약 1건

- [ ] 예약 화면에서 `2026-09-23` 선택 → 시간 목록이 뜬다
- [ ] `10:00 ~ 11:00` 클릭 → 신청 폼으로 넘어간다
- [ ] 사업명 선택 / 기업명 / 담당자명 / 연락처 / 이메일(`test1@example.com`) 입력 후 제출

**기대 결과**
- 완료 화면에 `2026-09-23 (수)` 와 `10:00 ~ 11:00` 이 표시된다
- "예약 확인 주소" 가 **`http://localhost:3000/booking/<64자hex>` 전체 주소**로 보인다 (경로만 보이면 실패)
- **[주소 복사]** 버튼을 누르면 `복사됨 ✓` 로 바뀌고, 붙여넣기 하면 전체 주소가 나온다
- 그 주소를 새 탭에서 열면 예약 확인 페이지가 뜨고 입력한 내용이 그대로 보인다
- 관리자 화면에 이 예약이 보인다
- 예약 화면을 새로고침하면 `10:00 ~ 11:00` 이 **"마감"** 으로 바뀐다

**실패 시 볼 곳:** `src/app/api/booking/reserve/route.ts`, `supabase/functions.sql` 의 `create_booking`

---

## 2. 같은 슬롯 동시 예약 → 한 건만 성공

브라우저 2개(또는 일반 창 + 시크릿 창)를 쓴다.

- [ ] 창 A, 창 B 모두 예약 화면에서 `2026-09-23` `11:00 ~ 12:00` 을 골라 **신청 폼까지** 간다
- [ ] 양쪽 폼을 미리 다 채운다 (이메일은 서로 다르게: `test2a@example.com` / `test2b@example.com`)
- [ ] 두 창의 [예약 신청] 을 **최대한 동시에** 누른다

**기대 결과**
- **정확히 한 건만** 성공한다 (완료 화면)
- 나머지 한 창은 폼 안에 빨간 문구 **"이미 마감된 시간입니다."**
- DB 확인:

```sql
select count(*) from public.bookings
where slot_date = date '2026-09-23'
  and start_time = time '11:00'
  and cancelled_at is null;
-- 기대: 1  (2가 나오면 이중 예약 — 즉시 배포 중단)
```

**실패 시 볼 곳:** `create_booking` 의 `pg_advisory_xact_lock`, 부분 유니크 인덱스 `bookings_active_slot_unique`

---

## 3. 하루 4건 채운 뒤 5번째 → 날짜 마감 문구

> ⚠️ 같은 이메일은 중복 예약이 막히므로 **매 건 다른 이메일**을 쓴다.

- [ ] `2026-09-23` 에 4건을 채운다 (1·2번 테스트에서 2건 만들었으면 2건만 더)
  - 예: `13:00`(`t3c@example.com`), `14:00`(`t3d@example.com`)
- [ ] 유효 예약이 4건인지 확인:

```sql
select count(*) from public.bookings
where slot_date = date '2026-09-23' and cancelled_at is null;
-- 기대: 4
```

**5번째를 "제출 시점"에 막는지 보는 방법** (이게 핵심):

- [ ] 창 B에서 4건이 차기 **전에** `2026-09-23` 의 남은 슬롯(`15:00`)을 골라 신청 폼까지 간다
- [ ] 창 A에서 4번째 예약을 완료시킨다
- [ ] 그 다음 창 B의 [예약 신청] 을 누른다

**기대 결과**
- 폼이 닫히고 달력 화면으로 돌아간다
- 화면 위쪽에 빨간 안내: **"해당 날짜가 방금 마감되었습니다. 다른 날짜를 선택해 주세요."**
- **달력 영역으로 자동 스크롤**된다
- 그 예약은 저장되지 않았다 (DB 유효 예약 수는 여전히 4)

**실패 시 볼 곳:** `create_booking` 의 BK003, `BookingCalendar.tsx` 의 `handleDayFull`

---

## 4. 4건 찬 날짜가 달력에서 접히는지

3번에 이어서 진행한다 (`2026-09-23` 유효 예약 4건 상태).

- [ ] 예약 화면 새로고침 → 달력에서 `2026-09-23` 을 클릭

**기대 결과**
- 시간대 버튼이 **하나도 보이지 않는다** (개별 슬롯 회색 처리 아님)
- 대신 회색 카드에 배지 하나: **`9월 23일 · 예약 마감`**
- 달력에서 그 날짜는 회색 + 취소선으로 보인다

**실패 시 볼 곳:** `BookingCalendar.tsx` 의 `selectedDay.full` 분기

---

## 5. 같은 이메일 중복 예약 차단

- [ ] 1번에서 쓴 이메일(`test1@example.com`)로 **다른 날짜·다른 시간**을 예약 시도한다
  - 예: `2026-09-28` `10:00 ~ 11:00`

**기대 결과**
- 폼 안에 빨간 문구 **"이미 예약된 내역이 있습니다."**
- 저장되지 않는다
- 대소문자를 바꿔도(`TEST1@example.com`) 똑같이 막힌다

**실패 시 볼 곳:** `create_booking` 의 BK004 (`lower(b.email)` 비교), 인덱스 `bookings_active_email_idx`

---

## 6. admin 취소 후 슬롯 재오픈

- [ ] 관리자 화면에서 1번 예약(`2026-09-23 10:00`)을 **취소**한다
- [ ] 예약 화면을 새로고침한다

**기대 결과**
- `10:00 ~ 11:00` 이 다시 **"예약"** 가능 상태로 돌아온다
- `2026-09-23` 의 하루 예약 수가 `4/4` → `3/4` 로 줄고, 접혔던 카드가 다시 펼쳐진다
- DB에서 그 행은 **삭제되지 않고** `cancelled_at` 만 채워져 있다:

```sql
select start_time, cancelled_at from public.bookings
where slot_date = date '2026-09-23' and start_time = time '10:00';
-- 기대: 1행, cancelled_at 에 시각이 들어 있음
```

**실패 시 볼 곳:** `src/app/api/admin/bookings/cancel/route.ts`, `loadAvailability()` 의 `.is("cancelled_at", null)`

---

## 7. 취소된 슬롯을 다른 사람이 재예약

6번에 이어서 진행한다.

- [ ] **다른 이메일**(`test7@example.com`)로 `2026-09-23` `10:00 ~ 11:00` 을 예약한다

**기대 결과**
- 정상 완료된다 (취소된 예약이 슬롯을 계속 붙잡고 있으면 안 된다)
- `"이미 마감된 시간입니다."` 가 뜨면 **실패** — 부분 유니크 인덱스가 잘못 걸려 있는 것이다:

```sql
select indexdef from pg_indexes
where schemaname = 'public' and indexname = 'bookings_active_slot_unique';
-- 기대: 정의 끝에 WHERE (cancelled_at IS NULL) 이 붙어 있어야 함
```

- [ ] 1번에서 취소한 사람의 확인 페이지를 열어보면 **"취소된 예약입니다"** 로 보인다

---

## 8. 잘못된 토큰으로 `/reserve` 접근 차단

- [ ] `http://localhost:3000/reserve/aaaa-bbbb-cccc` 로 접근
- [ ] `http://localhost:3000/reserve/` (토큰 없이) 로 접근
- [ ] API 직접 호출:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/booking/availability
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "x-booking-token: wrong-token" http://localhost:3000/api/booking/availability
```

**기대 결과**
- 잘못된 토큰 → **404 페이지** (예약 화면이 절대 보이면 안 됨)
- API 두 건 모두 **401**
- 올바른 토큰일 때만 200 + JSON

**실패 시 볼 곳:** `src/app/reserve/[token]/page.tsx`, `src/lib/booking/access.ts`

- [ ] 예약 확인 페이지도 확인: `http://localhost:3000/booking/1234` → **404** (토큰은 64자 hex만 허용)

---

## 9. 시간대 — 표시 시각이 KST와 일치하는지

DB는 날짜(`date`)와 시각(`time`)을 **KST 벽시계 그대로** 저장한다. UTC 변환을 하지 않는다.
서버 타임존이 UTC인 Vercel에서도 하루/한 시간이 밀리면 안 된다.

- [ ] 관리자 화면에서 슬롯 `2026-09-23 15:00` 을 등록했을 때, 예약 화면에 **`15:00 ~ 16:00`** 으로 보인다
- [ ] 그 슬롯을 예약한 뒤 **완료 화면**, **예약 확인 페이지**, **관리자 목록**, **접수 알림 메일** 네 곳의 날짜·시각이 전부 `2026-09-23` / `15:00 ~ 16:00` 로 같다
- [ ] DB 원본과도 같다:

```sql
select slot_date, start_time from public.bookings
where email = 'test9@example.com';
-- 기대: 2026-09-23 | 15:00:00
```

- [ ] 달력의 **요일**이 맞다: 2026-09-23 은 **수요일**
- [ ] 자정 근처(KST 00:30 등)에 예약해도 `slot_date` 가 하루 밀리지 않는다

**실패 시 볼 곳:** `src/lib/booking/calendar.ts` (`Date.UTC` / `getUTC*` 만 쓰는지), `toDbTime` / `fromDbTime`

> ⚠️ 배포 환경에서도 이 항목은 다시 확인한다. 로컬(KST)에서만 맞고 Vercel(UTC)에서 틀어지는 게 전형적인 실패다.

---

## 10. 24시간 이내 슬롯이 화면에서 마감으로 뜨는지

리드타임 규칙은 "지금"에 따라 결과가 바뀌어서, 미래 날짜만 있는 DB로는 재현이 안 된다.
**리드타임 값을 크게 올려서** 기존 슬롯이 마감 범위에 들어오게 만든다.

- [ ] dev 서버를 리드타임을 크게 준 채로 띄운다 (`.env.local` 은 건드리지 않는다):

```bash
BOOKING_LEAD_TIME_HOURS=72 npm run dev
```

- [ ] 예약 화면을 열고 **가장 이른 날짜**를 선택한다

**기대 결과**
- 그 슬롯 버튼이 회색으로 비활성이고, 오른쪽 문구가 **"예약 마감"** 이다
  (예약이 차서 막힌 슬롯의 **"마감"** 과 문구가 달라야 한다)
- 그날 슬롯이 **전부** 마감 범위면 시간대 목록이 아예 안 나오고,
  하루 상한이 찼을 때와 똑같이 **`9월 2일 · 예약 마감`** 배지 카드로 접힌다
- 달력에서 그 날짜는 회색 + 취소선이다
- 화면 상단 안내에 **"예약은 컨설팅 시작 72시간 전까지 가능합니다"** 가 보인다
  (환경변수 값이 그대로 문구에 반영되는지 확인)
- [ ] 서버를 끄고 기본값(24)으로 다시 띄우면 그 슬롯이 정상으로 돌아온다

**API로도 확인**

```bash
curl -s -H "x-booking-token: <BOOKING_ACCESS_TOKEN>" \
  http://localhost:3000/api/booking/availability | python3 -m json.tool | head -40
```

- `leadTimeHours` 가 설정값과 같고, 마감된 슬롯에 `"closed": true`,
  그날 전체가 마감이면 날짜에도 `"closed": true`

**실패 시 볼 곳:** `src/lib/booking/slots.ts` 의 `bookingLeadTimeHours()`, `src/lib/booking/lead-time.ts`

---

## 11. 화면 열어두고 시간 지난 뒤 제출 시 차단

조회 시점에만 막으면, 폼을 열어둔 채 마감 시각을 넘겨 제출하는 걸 못 막는다.
**저장 시점(`create_booking`)에서도 재검증**하는지 보는 항목이다.

- [ ] 기본값(24시간)으로 dev 서버를 띄운다
- [ ] 예약 화면에서 아무 슬롯이나 골라 **신청 폼까지** 간 뒤, 폼을 채우고 **제출하지 않은 채 둔다**
- [ ] 그 상태에서 **서버만** 리드타임을 크게 올려 재시작한다 (`BOOKING_LEAD_TIME_HOURS=99999 npm run dev`)
  → 브라우저는 새로고침하지 않는다. "화면을 오래 열어둔 사이 마감된" 상황과 같아진다
- [ ] 열어둔 폼에서 [예약 신청] 을 누른다

**기대 결과**
- 폼이 닫히고 달력으로 돌아간다
- 빨간 안내: **"예약은 컨설팅 시작 99999시간 전까지만 가능합니다. 다른 날짜를 선택해 주세요."**
- **달력 영역으로 자동 스크롤**된다
- 그 예약은 **저장되지 않았다**:

```sql
select count(*) from public.bookings where cancelled_at is null;
-- 기대: 시도 전과 같은 수
```

**실패 시 볼 곳:** `supabase/functions.sql` 의 BK005 블록,
`src/app/api/booking/reserve/route.ts` 의 `p_lead_hours` 전달

> ⚠️ 저장 시점 검사가 빠져 있으면 예약이 **성공**한다. 이건 반드시 잡아야 한다.

---

## 12. KST 기준 경계 시각 판정

서버가 UTC(Vercel)여도 한국 시간으로 판단해야 한다. 9시간 밀리면 하루가 통째로 어긋난다.

- [ ] 순수 계산 검증 (서버 타임존을 바꿔가며 결과가 같아야 한다):

```bash
TZ=UTC              node -e "$(cat <<'JS'
const KST=9*3600e3,H=3600e3;
const ep=(d,s)=>{const[y,m,dd]=d.split('-').map(Number);const[hh,mi]=s.split(':').map(Number);
return Date.UTC(y,m-1,dd,hh,mi)-KST;};
const dl=ep('2026-09-01','14:00')-24*H;
console.log('마감(KST):',new Date(dl).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}));
[['1분 전',dl-6e4],['정각',dl],['1분 후',dl+6e4]].forEach(([l,n])=>console.log(' ',l,'예약불가=',n>dl));
JS
)"
```

같은 명령을 `TZ=Asia/Seoul`, `TZ=America/New_York` 로도 실행한다.

**기대 결과 (세 타임존 전부 동일)**
- 마감 시각이 **`2026. 8. 31. 오후 2:00:00`** 로 찍힌다 (규칙의 예시와 일치)
- 마감 **1분 전 → 예약 가능**, **정각 → 예약 가능**, **1분 후 → 예약 불가**
  (경계 정각은 아직 되는 쪽으로 본다)

- [ ] DB 쪽도 같은 기준인지 확인 (Supabase SQL Editor):

```sql
select (date '2026-09-01' + time '14:00') at time zone 'Asia/Seoul' as slot_start_utc,
       ((date '2026-09-01' + time '14:00') at time zone 'Asia/Seoul')
         - make_interval(hours => 24) as deadline_utc;
-- 기대: slot_start_utc = 2026-09-01 05:00:00+00, deadline_utc = 2026-08-31 05:00:00+00
--       (= KST 2026-09-01 14:00 / 2026-08-31 14:00)
```

**실패 시 볼 곳:** `src/lib/booking/lead-time.ts` (KST_OFFSET_MS), `functions.sql` 의 `at time zone 'Asia/Seoul'`

---

## 13. 관리자는 24시간 이내도 등록 가능

전화로 들어온 임박 요청을 담당자가 대신 넣을 수 있어야 한다.

- [ ] `/connectu-admin` 에 로그인한다 (세션 쿠키가 있어야 한다)
- [ ] 10번에서 마감으로 확인한 그 슬롯을, 리드타임을 크게 준 서버에서 관리자 경로로 등록한다:

```bash
curl -s -X POST http://localhost:3000/api/admin/bookings/create \
  -H "Content-Type: application/json" \
  -b "<관리자 세션 쿠키>" \
  -d '{"slot_date":"2026-09-02","start_time":"10:00",
       "project_name":"[광주기업]무역협회 큐텐쇼츠사업",
       "company_name":"전화문의 테스트","contact_name":"홍길동",
       "phone":"010-1111-2222","email":"admin-test@example.com"}'
```

**기대 결과**
- **201** 과 함께 `{"ok":true, ...}` — 리드타임을 넘긴 슬롯인데도 등록된다
- 같은 요청을 고객 경로(`/api/booking/reserve`)로 보내면 **409 + `"code":"BK005"`** 로 막힌다
  (같은 조건에서 결과가 갈려야 우회가 제대로 동작하는 것)
- 관리자 목록에 그 예약이 보인다

- [ ] **우회하는 건 리드타임뿐인지** 확인한다. 관리자 경로로도 아래는 여전히 막혀야 한다:
  - 이미 예약된 슬롯 → **409 `BK002`**
  - 하루 상한을 넘긴 날짜 → **409 `BK003`**
  - 같은 이메일 중복 → **409 `BK004`**
  - 로그인 없이 호출 → **401**

**실패 시 볼 곳:** `src/app/api/admin/bookings/create/route.ts` (`p_lead_hours: null`)

> ⚠️ 관리자 화면에는 아직 이 등록을 위한 **입력 폼이 없다.** 현재는 API 경로로만 호출할 수 있다.

---

## 14. 마무리 — 테스트 데이터 정리

- [ ] 테스트로 만든 예약을 전부 지운다:

```sql
-- 먼저 지울 대상 확인
select id, slot_date, start_time, email from public.bookings
where email like 'test%@example.com' or email like 't3%@example.com'
   or email like 'admin-test@example.com';

-- 확인했으면 삭제
delete from public.bookings
where email like 'test%@example.com' or email like 't3%@example.com'
   or email like 'admin-test@example.com';
```

- [ ] 삭제 후 실제 예약이 남아 있지 않은지 확인:

```sql
select count(*) from public.bookings where cancelled_at is null;
```

- [ ] 🔑 배포 환경(Vercel)에 환경변수가 전부 들어가 있는지: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `BOOKING_ACCESS_TOKEN`, `NEXT_PUBLIC_SITE_URL`, `BOOKING_LEAD_TIME_HOURS`, `GMAIL_*`
- [ ] 🚀 배포 후 **1번과 9번을 운영 환경에서 한 번 더** 돌린다
