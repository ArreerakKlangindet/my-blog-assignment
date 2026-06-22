"use client";

import NextLink from "next/link";

export default function AdminLoginButton() {
  return (
    <div className="absolute top-4 right-6">
      <NextLink
        href="/login"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-600 border border-indigo-100/80 hover:border-indigo-600 rounded-xl hover:text-white shadow-sm hover:shadow transition-all duration-200 group"
      >
        <span className="transition-transform group-hover:scale-110">🔑</span>
        <span>สำหรับผู้ดูแลระบบ</span>
      </NextLink>
    </div>
  );
}
