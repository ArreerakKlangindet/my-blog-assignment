"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import CommentTable from "@/components/admin/CommentTable";

interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  blog?: { title: string };
}

// 🎨 ไทป์โครงสร้างสำหรับควบคุม Custom Modal
interface ConfirmState {
  isOpen: boolean;
  commentId: string;
  nextStatus: "APPROVED" | "REJECTED";
}

export default function AdminCommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🌟 เพิ่ม State สำหรับเปิด/ปิด และเก็บข้อมูลที่แอดมินกำลังจะสับสวิตช์ Toggle
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    isOpen: false,
    commentId: "",
    nextStatus: "APPROVED",
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 1. ดึงข้อมูลคอมเมนต์จริงจากแผง Admin หลังบ้าน (ต้องใช้ Token)
  useEffect(() => {
    const fetchAllComments = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("admin_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/admin/comments`, {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("admin_token");
          router.push("/login");
          return;
        }

        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลความคิดเห็นจากระบบได้");

        const data = await res.json();
        setComments(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("💥 เกิดข้อผิดพลาดในการเชื่อมต่อระบบความคิดเห็นกับ NestJS");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllComments();
  }, [API_URL, router]);

  // 2. เมื่อแอดมินกดสับสวิตช์ ให้แวะมา "เปิดกล่อง Custom Modal สวย ๆ" ก่อนยิงจริง
  const handleUpdateStatus = async (
    id: string,
    newStatus: "APPROVED" | "REJECTED",
  ) => {
    setConfirmModal({
      isOpen: true,
      commentId: id,
      nextStatus: newStatus,
    });
  };

  // 🚀 3. ฟังก์ชันลับที่จะทำงานก็ต่อเมื่อแอดมินกดปุ่ม "ยืนยันทำรายการ" ในกล่องสวย ๆ ของเราเท่านั้น
  const executeUpdateStatus = async () => {
    const { commentId, nextStatus } = confirmModal;

    // ปิดกล่องทันทีเพื่อความสมูทในการแสดงผล
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/login");
        return;
      }

      // ยิง PATCH ไปหา Endpoint หลังบ้านจริง ๆ พร้อมแนบ Token
      const res = await fetch(`${API_URL}/admin/comments/${commentId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || "ไม่สามารถอัปเดตสถานะลงฐานข้อมูลได้",
        );
      }

      // อัปเดต State หน้าบ้าน สวิตช์เลื่อนปุ๊บป้ายไฟเปลี่ยนสีล็อกค่าทันที
      setComments((prev) =>
        prev.map((item) =>
          item.id === commentId ? { ...item, status: nextStatus } : item,
        ),
      );
    } catch (err) {
      if (err instanceof Error) {
        alert(`❌ เกิดข้อผิดพลาด: ${err.message}`);
      } else {
        alert("❌ ไม่สามารถเปลี่ยนสถานะได้เนื่องจากระบบขัดข้อง");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 animate-pulse text-sm">
          กำลังโหลดข้อมูลความคิดเห็นทั้งหมดจากฐานข้อมูล... 💬
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <AdminHeader
        title="💬 จัดการความคิดเห็นทั้งหมด"
        description="ตรวจสอบ อนุมัติ หรือปฏิเสธความคิดเห็นจากผู้ใช้งานก่อนนำไปแสดงบนหน้าเว็บหลัก"
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ⚠️ {error} (กรุณาตรวจสอบว่าเซิร์ฟเวอร์หลังบ้านเปิดอยู่
          และเข้าสู่ระบบเรียบร้อยแล้วน้า)
        </div>
      )}

      {!error && comments.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center text-gray-400 text-sm shadow-sm">
          📭 ยังไม่มีความคิดเห็นส่งเข้ามาในระบบ ณ ตอนนี้
        </div>
      ) : (
        !error && (
          <CommentTable
            comments={comments}
            onUpdateStatus={handleUpdateStatus}
          />
        )
      )}

      {/* 🌟 หน้าต่างยืนยันความปลอดภัยดีไซน์ใหม่ (Custom Confirmation Modal) แบบคุมโทนพรีเมียม */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* ฉากหลังกระจกฝ้า เบลอนุ่มละมุนตา (Backdrop Blur) คลิกพื้นที่ว่างเพื่อปิดได้ */}
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() =>
              setConfirmModal((prev) => ({ ...prev, isOpen: false }))
            }
          />

          {/* กล่องเนื้อหาป๊อปอัปสไตล์โมเดิร์นมินิมอล */}
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 transform transition-all z-10 space-y-4">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2.5 rounded-xl text-lg ${
                  confirmModal.nextStatus === "APPROVED"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {confirmModal.nextStatus === "APPROVED" ? "🔔" : "⚠️"}
              </div>
              <h3 className="text-base font-bold text-gray-900">
                ยืนยันการเปลี่ยนแปลงข้อมูล
              </h3>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              คุณแน่ใจใช่ไหมที่จะเปลี่ยนสถานะความคิดเห็นนี้เป็น{" "}
              <span
                className={`font-semibold px-2 py-0.5 rounded-md text-xs ${
                  confirmModal.nextStatus === "APPROVED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {confirmModal.nextStatus === "APPROVED"
                  ? "อนุมัติ (APPROVED)"
                  : "ปฏิเสธ (REJECTED)"}
              </span>{" "}
              ระบบจะทำการบันทึกข้อมูลและอัปเดตผลลัพธ์ไปยังเซิร์ฟเวอร์ทันที
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
                onClick={() =>
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-white text-sm font-medium rounded-xl transition-colors shadow-sm cursor-pointer ${
                  confirmModal.nextStatus === "APPROVED"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-rose-600 hover:bg-rose-500"
                }`}
                onClick={executeUpdateStatus}
              >
                ยืนยันทำรายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
