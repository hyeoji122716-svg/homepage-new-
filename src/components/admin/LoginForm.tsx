"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "로그인에 실패했습니다.");
        return;
      }
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-gray-800 rounded-2xl p-8 border border-gray-700"
      >
        <div className="text-center mb-8">
          <span className="text-xl font-bold tracking-tight text-white">
            CONNECT<span className="text-[#b1ff57]">U</span>
          </span>
          <p className="text-gray-400 text-sm mt-2">관리자 로그인</p>
        </div>

        <label className="block text-sm text-gray-400 mb-1.5">비밀번호</label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 focus:border-[#b1ff57] rounded-xl px-4 py-3 text-white outline-none transition-colors text-sm"
          placeholder="••••••••"
        />

        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-3 bg-[#b1ff57] hover:bg-[#9ce040] disabled:opacity-50 text-gray-900 font-semibold rounded-xl transition-all"
        >
          {loading ? "확인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
