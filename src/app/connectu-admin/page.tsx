import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Inquiry } from "@/lib/types";
import LoginForm from "@/components/admin/LoginForm";
import AdminTable from "@/components/admin/AdminTable";

export const metadata: Metadata = {
  title: "관리자 | 문의 관리",
  robots: { index: false, follow: false },
};

// 쿠키/실시간 데이터를 읽으므로 항상 동적 렌더링
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return <LoginForm />;
  }

  let inquiries: Inquiry[] = [];
  let loadError: string | null = null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) loadError = error.message;
    else inquiries = (data as Inquiry[]) ?? [];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
  }

  return <AdminTable initialInquiries={inquiries} loadError={loadError} />;
}
