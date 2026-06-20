"use client";

import { useEffect, useState } from "react";
import { Blog } from "@/types/blog";
import AdminHeader from "@/components/admin/AdminHeader";
import BlogTable from "@/components/admin/BlogTable";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 🔄 ดึงบทความทั้งหมดสำหรับ Admin (ย้ายฟังก์ชันเข้ามาไว้ใน useEffect เพื่อป้องกัน Cascading Renders ตามกฎ ESLint)
  useEffect(() => {
    const fetchAllBlogsForAdmin = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`${API_URL}/blogs`, { cache: "no-store" });

        if (!res.ok) throw new Error("Failed to fetch admin blogs");

        const result = await res.json();
        const blogData = Array.isArray(result) ? result : result.data || [];
        setBlogs(blogData);
      } catch (err) {
        console.error("❌ Admin fetch blogs failed:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBlogsForAdmin();
  }, [API_URL]); // ทำซ้ำเมื่อ API_URL เปลี่ยนแปลงเท่านั้น

  const handleDeleteBlog = async (id: string, title: string) => {
    if (confirm(`คุณแน่ใจใช่ไหมที่จะลบบทความเรื่อง: "${title}"?`)) {
      try {
        alert(
          "🗑️ จำลองการลบสำเร็จ! (เดี๋ยวรอต่อ API Delete ฝั่ง NestJS รอบหน้านะครับ)",
        );
        setBlogs(blogs.filter((blog) => blog.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 animate-pulse text-sm">
          กำลังโหลดรายการบทความทั้งหมด... ✨
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. ส่วนหัวหัวข้อของหน้า Admin */}
      <AdminHeader
        title="📝 จัดการบทความทั้งหมด"
        description="สร้าง แก้ไข ปรับสถานะ หรือลบบทความจากหน้าจอนี้ได้ทันที"
        buttonText="➕ เขียนบทความใหม่"
        buttonHref="/admin/blogs/create"
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          💥 ไม่สามารถดึงข้อมูลจากหลังบ้านได้ กรุณาตรวจสอบการรันระบบ NestJS
          (Port 5000) นะครับหนู
        </div>
      )}

      {/* 2. ส่วนแสดงตารางบทความ */}
      {!error && blogs.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center text-gray-400 text-sm shadow-sm">
          📭 ยังไม่มีบทความในระบบแต่อย่างใด
          พิมพ์เพิ่มที่ฝั่งหลังบ้านหรือกดสร้างใหม่ได้เลยจ้า!
        </div>
      ) : (
        !error && (
          <BlogTable
            blogs={blogs}
            apiUrl={API_URL}
            onDelete={handleDeleteBlog}
          />
        )
      )}
    </div>
  );
}
