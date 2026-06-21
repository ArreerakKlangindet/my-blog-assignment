"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Blog } from "@/types/blog";
import AdminHeader from "@/components/admin/AdminHeader";
import BlogTable from "@/components/admin/BlogTable";

interface BlogConfirmState {
  isOpen: boolean;
  blogId: string;
  blogTitle: string;
  currentStatus: string;
  actionType: "TOGGLE" | "DELETE";
}

export default function AdminBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [confirmModal, setConfirmModal] = useState<BlogConfirmState>({
    isOpen: false,
    blogId: "",
    blogTitle: "",
    currentStatus: "",
    actionType: "TOGGLE",
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchAllBlogsForAdmin = async () => {
      try {
        setLoading(true);
        setError(false);

        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/blogs/admin/all`, {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch admin blogs");

        const result = await res.json();
        const blogData = result.data || [];
        setBlogs(blogData);
      } catch (err) {
        console.error("❌ Admin fetch blogs failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBlogsForAdmin();
  }, [API_URL, router]);

  const handleOpenDeleteModal = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      blogId: id,
      blogTitle: title,
      currentStatus: "",
      actionType: "DELETE",
    });
  };

  const handleOpenToggleModal = (id: string, title: string, status: string) => {
    setConfirmModal({
      isOpen: true,
      blogId: id,
      blogTitle: title,
      currentStatus: status,
      actionType: "TOGGLE",
    });
  };

  const executeAdminAction = async () => {
    const { blogId, actionType } = confirmModal;

    // ปิดตัว Modal บันทึกยืนยันทันทีหลังจากที่เริ่มทำงาน
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (actionType === "DELETE") {
      try {
        const res = await fetch(`${API_URL}/blogs/${blogId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("ไม่สามารถลบบทความนี้ได้");

        // ลบสำเร็จ ให้ตัดบทความชิ้นนี้ออกจาก State เพื่อให้หน้ารายการหายไปด้วยความเร็วแสง
        setBlogs(blogs.filter((blog) => blog.id !== blogId));
      } catch (err) {
        console.error("❌ Delete error:", err);
        alert("❌ เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    } else if (actionType === "TOGGLE") {
      try {
        // 💡 🛠️ แก้ไขจุดที่ 2: เปลี่ยนมาเรียกสวิตช์ผ่าน /publish route ของ NestJS โดยไม่ต้องแนบฟิลด์อื่น
        const res = await fetch(`${API_URL}/blogs/${blogId}/publish`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorResponse = await res.json().catch(() => ({}));
          const serverMessage =
            errorResponse.message || "Failed to toggle publish status";
          throw new Error(
            Array.isArray(serverMessage)
              ? serverMessage.join(", ")
              : serverMessage,
          );
        }

        const responseResult = await res.json();
        const updatedBlog = responseResult.data || responseResult;

        // อัปเดตข้อมูล State บนหน้าจอเฉพาะชิ้นที่แก้ไข เพื่อแสดงผลเปลี่ยนทันที
        setBlogs(
          blogs.map((b) =>
            b.id === blogId ? { ...b, status: updatedBlog.status } : b,
          ),
        );
      } catch (err) {
        console.error("❌ Toggle error:", err);
        alert(
          `❌ ไม่สามารถเปลี่ยนสถานะบทความได้: ${err instanceof Error ? err.message : "ระบบขัดข้อง"}`,
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 animate-pulse text-sm">
          กำลังโหลดรายการบทความทั้งหมดจากฐานข้อมูลหลังบ้าน... ✨
        </p>
      </div>
    );
  }

  // 💡 🛠️ แก้ไขจุดที่ 1: ปรับเปลี่ยนข้อความให้ตรงสเปก Enum (PUBLISHED / UNPUBLISHED) ของหลังบ้าน
  const nextStatusText =
    confirmModal.currentStatus === "PUBLISHED"
      ? "เปลี่ยนเป็นระงับการเผยแพร่ (UNPUBLISHED)"
      : "เปิดเผยแพร่สาธารณะ (PUBLISHED)";

  return (
    <div className="space-y-6 relative">
      <AdminHeader
        title="📝 จัดการบทความทั้งหมด"
        description="สร้าง แก้ไข ปรับสถานะ หรือลบบทความจากหน้าจอนี้ได้ทันที"
        buttonText="➕ เขียนบทความใหม่"
        buttonHref="/admin/blogs/create"
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          💥 ไม่สามารถดึงข้อมูลจากหลังบ้านได้ กรุณาตรวจสอบการรันระบบ NestJS
        </div>
      )}

      {!error && blogs.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center text-gray-400 text-sm shadow-sm">
          📭 ยังไม่มีบทความในฐานข้อมูลหลังบ้าน
        </div>
      ) : (
        !error && (
          <BlogTable
            blogs={blogs}
            apiUrl={API_URL}
            onDelete={handleOpenDeleteModal}
            onTogglePublish={handleOpenToggleModal}
          />
        )
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() =>
              setConfirmModal((prev) => ({ ...prev, isOpen: false }))
            }
          />

          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 transform transition-all z-10 space-y-4">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2.5 rounded-xl text-lg ${
                  confirmModal.actionType === "TOGGLE"
                    ? confirmModal.currentStatus === "PUBLISHED"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {confirmModal.actionType === "TOGGLE"
                  ? confirmModal.currentStatus === "PUBLISHED"
                    ? "🟡"
                    : "🟢"
                  : "⚠️"}
              </div>
              <h3 className="text-base font-bold text-gray-900">
                {confirmModal.actionType === "TOGGLE"
                  ? "ยืนยันการสลับสถานะบทความ"
                  : "ยืนยันการลบข้อมูลถาวร"}
              </h3>
            </div>

            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <div>
                บทความเรื่อง:{" "}
                <span className="font-semibold text-gray-900">
                  {'"'}
                  {confirmModal.blogTitle}
                  {'"'}
                </span>
              </div>
              <div>
                {confirmModal.actionType === "TOGGLE" ? (
                  <>
                    คุณแน่ใจใช่ไหมที่จะปรับสถานะบทความนี้ให้{" "}
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-md text-xs ${
                        confirmModal.currentStatus === "PUBLISHED"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {nextStatusText}
                    </span>
                  </>
                ) : (
                  <span className="text-rose-600 font-medium">
                    คุณต้องการลบบทความนี้ออกจากระบบใช่หรือไม่?
                    ข้อมูลจะถูกทำลายถาวรและไม่สามารถกู้คืนได้ทุกกรณี
                  </span>
                )}
              </div>
            </div>

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
                  confirmModal.actionType === "TOGGLE"
                    ? confirmModal.currentStatus === "PUBLISHED"
                      ? "bg-amber-600 hover:bg-amber-500"
                      : "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-rose-600 hover:bg-rose-500"
                }`}
                onClick={executeAdminAction}
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
