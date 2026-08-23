import type { Metadata } from "next";

import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Booking } from "@/lib/types";
import LoginForm from "@/components/admin/LoginForm";
import BookingAdmin from "@/components/booking/BookingAdmin";

export const metadata: Metadata = {
  title: "관리자 | 예약 관리",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BookingAdminPage() {
  if (!(await isAdminAuthenticated())) {
    return <LoginForm />;
  }

  let bookings: Booking[] = [];
  let loadError: string | null = null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("slot_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) loadError = error.message;
    else bookings = (data as Booking[]) ?? [];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
  }

  return <BookingAdmin initialBookings={bookings} loadError={loadError} />;
}
