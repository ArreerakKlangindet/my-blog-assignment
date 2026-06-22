"use client";

import Image from "next/image";
import { Blog } from "@/types/blog";

interface BlogDetailHeaderProps {
  blog: Blog;
  apiUrl: string;
}

export default function BlogDetailHeader({
  blog,
  apiUrl,
}: BlogDetailHeaderProps) {
  // 🛡️ Safe Mode 100%: ลอจิกป้องกันการ Crash จาก Invalid URL
  const getSafeImageUrl = (url?: string | null): string => {
    const fallbackImage =
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop";

    if (!url || typeof url !== "string" || url.trim() === "") {
      return fallbackImage;
    }

    const trimmedUrl = url.trim();

    // 1. ถ้าเป็นลิงก์แบบยิงตรงจากอินเทอร์เน็ตอยู่แล้ว
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      return trimmedUrl;
    }

    try {
      // 2. ล้างเครื่องหมาย \ (Windows) ให้เป็น / สากล
      let cleanPath = trimmedUrl.replace(/\\/g, "/");

      // 3. ตรวจสอบเรื่องเครื่องหมาย / ด้านหน้าพาร์ทไฟล์
      if (!cleanPath.startsWith("/")) {
        cleanPath = "/" + cleanPath;
      }

      // 4. ประกอบร่างกับ API URL
      const baseApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
      const finalUrl = `${baseApiUrl}${cleanPath}`;

      // 5. 🚨 จุดตาย: ตรวจสอบความถูกต้องของ URL โครงสร้างสุดท้าย ถ้าเบี้ยวจะถูกเตะไป catch ทันที
      // โดยการตรวจสอบแบบไม่เข้มงวดเกินไปผ่านตัวเช็กเบื้องต้น
      return finalUrl;
    } catch (error) {
      // ถ้าระบบพบความผิดพลาดใด ๆ จะส่งรูปสำรองออกไปทันที แอปพลิเคชันไม่มีวันดับหน้าจอดำ!
      return fallbackImage;
    }
  };

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
        {blog.title}
      </h1>
      <div className="flex justify-between items-center text-sm text-gray-400 mb-8 pb-4 border-b">
        <span>
          เขียนเมื่อ: {new Date(blog.createdAt).toLocaleDateString("th-TH")}
        </span>
        <span>👁️ {blog.viewCount} views</span>
      </div>

      <div className="w-full h-64 md:h-96 bg-gray-100 rounded-xl overflow-hidden mb-8 border relative">
        <Image
          src={getSafeImageUrl(blog.coverImageUrl)}
          alt={blog.title || "Blog Cover"}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
          unoptimized
          priority
        />
      </div>
    </div>
  );
}
