import ExcelJS from "exceljs";

import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fromDbTime, slotEnd } from "@/lib/booking/config";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * 예약 전체를 엑셀(.xlsx)로 내려준다.
 * - 특정 선택 없이 "무조건 전체" 다운로드
 * - 헤더 행에 자동 필터를 걸어둔다 (사업명 등으로 바로 걸러볼 수 있게)
 */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("bookings")
    .select("*")
    .order("slot_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const bookings = (data as Booking[]) ?? [];

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("예약");

  ws.columns = [
    { header: "예약일자", key: "slot_date", width: 14 },
    { header: "시간", key: "time", width: 16 },
    { header: "사업명", key: "project_name", width: 34 },
    { header: "기업명", key: "company_name", width: 20 },
    { header: "담당자", key: "contact_name", width: 12 },
    { header: "연락처", key: "phone", width: 16 },
    { header: "이메일", key: "email", width: 24 },
    { header: "상담유형", key: "consult_type", width: 10 },
    { header: "SNS", key: "sns_url", width: 24 },
    { header: "사전질문", key: "pre_question", width: 40 },
    { header: "접수일시", key: "created_at", width: 20 },
    { header: "상태", key: "status", width: 8 },
  ];

  for (const b of bookings) {
    const start = fromDbTime(b.start_time);
    ws.addRow({
      slot_date: b.slot_date,
      time: `${start} ~ ${slotEnd(start)}`,
      project_name: b.project_name ?? "",
      company_name: b.company_name,
      contact_name: b.contact_name,
      phone: b.phone,
      email: b.email,
      consult_type: b.consult_type === "30" ? "30분" : "60분",
      sns_url: b.sns_url ?? "",
      pre_question: b.pre_question ?? "",
      created_at: new Date(b.created_at).toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
      }),
      status: b.cancelled_at ? "취소" : "예약",
    });
  }

  // 헤더 스타일 + 자동 필터
  const header = ws.getRow(1);
  header.font = { bold: true };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEAF0FF" },
  };
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: ws.columns.length },
  };
  ws.views = [{ state: "frozen", ySplit: 1 }]; // 헤더 고정

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `bookings_${new Date()
    .toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" })
    .replace(/-/g, "")}.xlsx`;

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
