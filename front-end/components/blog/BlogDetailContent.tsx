"use client";

import Image from "next/image";
import { Blog } from "@/types/blog";

interface BlogDetailContentProps {
  blog: Blog;
  apiUrl: string;
}

export default function BlogDetailContent({
  blog,
  apiUrl,
}: BlogDetailContentProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* ส่วนเนื้อหาหลักบทความ */}
      <div
        className="prose max-w-none text-gray-700 leading-relaxed mb-8"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* ภาพประกอบเพิ่มเติม */}
      {blog.images && blog.images.length > 0 && (
        <div className="mb-12">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
            🖼️ ภาพประกอบเพิ่มเติม
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {blog.images.map((img) => (
              <div
                key={img.id}
                className="relative h-40 bg-gray-100 rounded-lg overflow-hidden border"
              >
                <Image
                  src={
                    img.filePath.startsWith("http")
                      ? img.filePath
                      : `${apiUrl}${img.filePath}`
                  }
                  alt={img.fileName || "sub-image"}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition duration-300"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
