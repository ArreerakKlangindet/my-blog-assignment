"use client";

import Link from "next/link";
import Image from "next/image"; // 💡 นำตัว Image ของ Next.js กลับมาใช้งานให้ถูกกฎ ESLint
import { Blog } from "@/types/blog";
import { useState } from "react";

interface BlogTableProps {
  blogs: Blog[];
  apiUrl: string;
  onDelete: (id: string, title: string) => void;
  onTogglePublish?: (id: string, title: string, status: string) => void;
}

export default function BlogTable({
  blogs,
  apiUrl,
  onDelete,
  onTogglePublish,
}: BlogTableProps) {
  // สเตตเก็บสถานะรูปภาพที่โหลดเสีย (Fallback) เพื่อเลี่ยงปัญหา 404 ในเครื่องที่ไม่มีรูปไฟล์ตัวจริง
  const [fallbackImages, setFallbackImages] = useState<Record<string, boolean>>(
    {},
  );

  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase text-gray-500 tracking-wider">
              <th className="py-4 px-6">รูปปก</th>
              <th className="py-4 px-6">ชื่อบทความ / Slug</th>
              <th className="py-4 px-6">สถานะปัจจุบัน</th>
              <th className="py-4 px-6 text-center">เปิด/ปิด เผยแพร่</th>
              <th className="py-4 px-6">ยอดเข้าชม</th>
              <th className="py-4 px-6 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
            {blogs.map((blog) => {
              const isPublished = blog.status === "PUBLISHED";

              // 1. ตรวจสอบที่มาของ Path รูปภาพปก (🛠️ แก้ไขลอจิกป้องกันความปลอดภัยของ URL)
              let imageSrc = "";
              if (blog.coverImageUrl) {
                if (
                  blog.coverImageUrl.startsWith("data:") ||
                  blog.coverImageUrl.startsWith("http")
                ) {
                  imageSrc = blog.coverImageUrl;
                } else {
                  // 💡 ป้องกันกรณี apiUrl หลุดมาเป็นตัวอักษร "undefined" หรือค่าว่างเปล่า
                  const baseApiUrl =
                    apiUrl && apiUrl !== "undefined"
                      ? apiUrl
                      : "http://localhost:5000";
                  imageSrc = `${baseApiUrl}${blog.coverImageUrl}`;
                }
              }

              // 2. ถ้าหากไม่มีรูปภาพ หรือเคยโหลดแล้วเออร์เรอร์ (404) ให้ใช้ CSS วาดเป็นกล่องสีเทาแทนรูปภาพ (ปลอดภัย 100% ไม่ต้องพึ่งพาไฟล์รูปนอก)
              const isImageFallback = fallbackImages[blog.id] || !imageSrc;

              return (
                <tr key={blog.id} className="hover:bg-gray-50/50 transition">
                  {/* 1. รูปปก */}
                  <td className="py-4 px-6">
                    <div className="relative h-12 w-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                      {isImageFallback ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-[10px] font-medium select-none">
                          🖼️ NO IMAGE
                        </div>
                      ) : (
                        <Image
                          src={imageSrc}
                          alt={blog.title}
                          fill
                          sizes="80px"
                          unoptimized // 💡 ตัวนี้สำคัญมาก: สั่งเปิดช่องทางให้ Next.js ยอมอ่านสตริง Base64 ข้อมูลดิบได้โดยตรงไม่พังค้าง
                          className="object-cover"
                          onError={() => {
                            setFallbackImages((prev) => ({
                              ...prev,
                              [blog.id]: true,
                            }));
                          }}
                        />
                      )}
                    </div>
                  </td>

                  {/* 2. ชื่อบทความ */}
                  <td className="py-4 px-6 max-w-xs md:max-w-md">
                    <div className="font-semibold text-gray-900 truncate">
                      {blog.title}
                    </div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                      🔗 {blog.slug}
                    </div>
                  </td>

                  {/* 3. สถานะ */}
                  <td className="py-4 px-6">
                    {isPublished ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        ● เผยแพร่แล้ว
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        ○ ร่างบทความ
                      </span>
                    )}
                  </td>

                  {/* 4. สลับสถานะ */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          onTogglePublish &&
                          onTogglePublish(
                            blog.id,
                            blog.title,
                            isPublished ? "UNPUBLISHED" : "PUBLISHED", // 💡 🛠️ แก้ไขส่งค่าสลับสวิตช์เป็น UNPUBLISHED ให้ตรงกับคู่ Enum ของ NestJS หลังบ้าน
                          )
                        }
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isPublished ? "bg-indigo-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isPublished ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </td>

                  {/* 5. ยอดวิว */}
                  <td className="py-4 px-6 font-medium text-gray-500 font-mono">
                    👁️ {blog.viewCount.toLocaleString()}
                  </td>

                  {/* 6. ปุ่มจัดการ */}
                  <td className="py-4 px-6 text-right space-x-2">
                    <Link
                      href={`/admin/blogs/${blog.id}/edit`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-semibold rounded-lg bg-white text-gray-700 hover:bg-gray-50 shadow-sm transition"
                    >
                      ✏️ แก้ไข
                    </Link>
                    <button
                      onClick={() => onDelete(blog.id, blog.title)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-200 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                    >
                      🗑️ ลบ
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
