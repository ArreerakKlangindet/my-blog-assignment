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
  const hasValidImage = blog.coverImageUrl && blog.coverImageUrl.trim() !== "";

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

      {hasValidImage && (
        <div className="w-full h-64 md:h-96 bg-gray-100 rounded-xl overflow-hidden mb-8 border relative">
          <Image
            src={
              blog.coverImageUrl!.startsWith("http")
                ? blog.coverImageUrl!
                : `${apiUrl}${blog.coverImageUrl}`
            }
            alt={blog.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            unoptimized
            priority
          />
        </div>
      )}
    </div>
  );
}
