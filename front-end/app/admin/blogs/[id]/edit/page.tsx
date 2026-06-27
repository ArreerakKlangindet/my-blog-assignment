"use client";

import { useEffect, useState, use } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import BlogFormContainer from "@/components/admin/BlogFormContainer";
import { Blog } from "@/types/blog";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const { id: blogId } = use(params);
  const [blogData, setBlogData] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        const res = await fetch(`${API_URL}/blogs/${blogId}`);
        if (res.ok) {
          const data = await res.json();
          setBlogData(data);
        }
      } catch (err) {
        console.error("ดึงข้อมูลเก่าล้มเหลว:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogDetail();
  }, [blogId, API_URL]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-gray-600 animate-pulse text-sm font-medium">
          กำลังดึงข้อมูลบทความฉบับดั้งเดิม... 📝
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <AdminHeader
        title="✏️ แก้ไขบทความ"
        description="อัปเดตข้อมูลรายละเอียดบทความอย่างปลอดภัย"
      />
      {/* ส่งข้อมูลเก่าติดตัวเข้าไปให้ใน container ฟอร์ม */}
      <BlogFormContainer
        isEditMode={true}
        blogId={blogId}
        initialData={blogData}
      />
    </div>
  );
}
