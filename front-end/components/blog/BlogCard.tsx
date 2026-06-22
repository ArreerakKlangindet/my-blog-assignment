"use client";

import Link from "next/link";
import Image from "next/image";
import { Blog } from "@/types/blog";

interface BlogCardProps {
  blog: Blog;
  apiUrl: string;
}

export default function BlogCard({ blog, apiUrl }: BlogCardProps) {
  const hasValidImage = blog.coverImageUrl && blog.coverImageUrl.trim() !== "";

  const stripHtmlAndTruncate = (html: string, maxLength: number = 70) => {
    if (!html) return "";
    const cleanText = html.replace(/<\/?[^>]+(>|$)/g, "");
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + "...";
  };

  // ฟังก์ชันช่วยจัดรูปแบบ URL ให้ถูกต้อง ป้องกัน Invalid URL พังหน้าเว็บ
  const getImageSrc = () => {
    if (!hasValidImage) {
      return "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=500";
    }

    const imgUrl = blog.coverImageUrl!;

    // 1. ถ้าเป็น URL สมบูรณ์ (http:// หรือ https://) หรือ Base64 ใช้ได้เลย
    if (
      imgUrl.startsWith("http://") ||
      imgUrl.startsWith("https://") ||
      imgUrl.startsWith("data:")
    ) {
      return imgUrl;
    }

    // 2. ล้างสแลชส่วนเกินของ apiUrl และ imgUrl เพื่อนำมาเชื่อมกันอย่างปลอดภัย
    const cleanApiUrl = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
    const cleanImgPath = imgUrl.startsWith("/") ? imgUrl : `/${imgUrl}`;

    return `${cleanApiUrl}${cleanImgPath}`;
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
      {/* ส่วนรูปภาพคัฟเวอร์ */}
      <div className="relative h-48 w-full bg-gray-50 border-b border-gray-100 overflow-hidden">
        <Image
          src={getImageSrc()}
          alt={blog.title || "Blog Cover"}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
        />
      </div>

      {/* ส่วนเนื้อหา */}
      <div className="p-5 flex flex-col flex-grow">
        {/* หัวข้อบทความ */}
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors duration-200 min-h-[3.5rem] leading-snug">
          <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
        </h3>

        {/* เนื้อหาบทความย่อ */}
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow leading-relaxed">
          {stripHtmlAndTruncate(blog.content)}
        </p>

        {/* ข้อมูลเมตาด้านล่าง */}
        <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-50 mt-auto">
          <span className="flex items-center gap-1">
            📅{" "}
            {blog.createdAt
              ? new Date(blog.createdAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "-"}
          </span>
          <span className="font-medium bg-gray-50 text-gray-600 px-2 py-1 rounded-md">
            👁️ {(blog.viewCount || 0).toLocaleString()} views
          </span>
        </div>

        {/* ปุ่มอ่านบทความแบบโมเดิร์น */}
        <Link
          href={`/blogs/${blog.slug}`}
          className="mt-4 block w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-indigo-100 transition-all duration-200"
        >
          อ่านบทความเต็ม →
        </Link>
      </div>
    </div>
  );
}
