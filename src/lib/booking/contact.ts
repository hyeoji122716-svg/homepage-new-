import "server-only";

/**
 * 예약 조회 페이지(/booking/[token])에 노출할 담당자 연락처.
 * 고객사가 스스로 취소할 수 없으므로, 변경·취소는 이 연락처로 받는다.
 *
 * 환경변수로 바꾼다. 메일 주소는 따로 지정하지 않으면 문의 알림 수신 주소를 쓴다.
 */
export interface BookingContact {
  name: string;
  phone: string | null;
  email: string | null;
  hours: string;
}

export function bookingContact(): BookingContact {
  return {
    name: process.env.BOOKING_CONTACT_NAME || "커넥트유 담당자",
    phone: process.env.BOOKING_CONTACT_PHONE || null,
    email:
      process.env.BOOKING_CONTACT_EMAIL || process.env.INQUIRY_NOTIFY_TO || null,
    hours: process.env.BOOKING_CONTACT_HOURS || "평일 10:00 ~ 18:00",
  };
}
