"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  // 🎯 ใช้ State ควบคุมการ เปิด/ปิด หน้าต่างแจ้งเตือนยืนยัน
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    // 🎯 ล้าง Token ออกเมื่อกดยืนยันสำเร็จ
    localStorage.removeItem("token");
    setIsOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* ปุ่มกดหลักที่อยู่บน Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-600 border border-red-100 hover:border-red-600 rounded-xl hover:text-white shadow-sm hover:shadow transition-all duration-200 cursor-pointer group"
      >
        <span className="transition-transform group-hover:translate-x-0.5">
          🚪
        </span>
        <span>ออกจากระบบ</span>
      </button>

      {/* 🎨 หน้าต่างแจ้งเตือนสไตล์ Tailwind CSS (จะแสดงเมื่อ isOpen === true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* พื้นหลังมืดมัว (Backdrop Backdrop Overlay) */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)} // กดพื้นที่ว่างเพื่อยกเลิกได้
          />

          {/* กล่องข้อความแจ้งเตือน (Modal Card) */}
          <div className="relative transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl transition-all max-w-sm w-full border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl">
              🔒
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-bold text-gray-900">
                ยืนยันการออกจากระบบ
              </h3>
              <p className="mt-2 text-xs text-gray-500 font-medium">
                คุณต้องการออกจากระบบการจัดการหลังบ้านใช่หรือไม่?
                สิทธิ์การเข้าถึงของคุณจะถูกล้างออกทันที
              </p>
            </div>

            {/* ปุ่มควบคุมกลุ่มล่าง */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition border border-gray-200 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
              >
                ใช่, ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
