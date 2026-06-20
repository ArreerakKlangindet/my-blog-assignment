"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Blog } from "@/types/blog";
import LoadingState from "@/components/blog/LoadingState";
import ErrorState from "@/components/blog/ErrorState";
import BlogDetailHeader from "@/components/blog/BlogDetailHeader";
import BlogDetailContent from "@/components/blog/BlogDetailContent";
import BlogComments from "@/components/blog/BlogComments";

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = use(params);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // เอาไว้รีเฟรชคอมเมนต์เวลาส่งสำเร็จ

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    async function fetchBlogAndIncrementView() {
      try {
        setFetchError(false);
        const res = await fetch(`${API_URL}/blogs/public/${slug}`);

        if (!res.ok) {
          throw new Error(`เซิร์ฟเวอร์ตอบกลับด้วยสเตตัส: ${res.status}`);
        }

        const data = await res.json();
        setBlog(data);
      } catch (err) {
        console.error("❌ ดึงข้อมูลรายละเอียดล้มเหลว:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchBlogAndIncrementView();
    }
  }, [slug, API_URL, refreshTrigger]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <LoadingState />
      </div>
    );
  }

  if (fetchError || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* 🛠️ เรียกใช้ตัวแปร ErrorState เพื่อเคลียร์ Warning ของ ESLint */}
        <ErrorState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* ปุ่มกลับหน้าแรก */}
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <Link
          href="/"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          ← กลับหน้าแรก
        </Link>
      </div>

      {/* กล่องเนื้อหาบทความหลัก */}
      <main className="max-w-3xl mx-auto px-4 mt-6 bg-white p-6 md:p-10 rounded-2xl shadow-sm border">
        {/* 1. ส่วนหัวข้อและภาพ Cover */}
        <BlogDetailHeader blog={blog} apiUrl={API_URL} />

        {/* 2. ส่วนเนื้อหาบทความและภาพประกอบเพิ่มเติม */}
        <BlogDetailContent blog={blog} apiUrl={API_URL} />

        {/* 3. ส่วนระบบจัดการความคิดเห็น (Comments) */}
        <BlogComments
          blog={blog}
          apiUrl={API_URL}
          onCommentSubmitted={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </main>
    </div>
  );
}
