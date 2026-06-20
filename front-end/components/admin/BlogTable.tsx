"use client";

import Image from "next/image";
import Link from "next/link";
import { Blog } from "@/types/blog";

interface BlogTableProps {
  blogs: Blog[];
  apiUrl: string;
  onDelete: (id: string, title: string) => void;
}

export default function BlogTable({ blogs, apiUrl, onDelete }: BlogTableProps) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase text-gray-500 tracking-wider">
              <th className="py-4 px-6">รูปปก</th>
              <th className="py-4 px-6">ชื่อบทความ / Slug</th>
              <th className="py-4 px-6">สถานะ</th>
              <th className="py-4 px-6">ยอดเข้าชม</th>
              <th className="py-4 px-6 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {blogs.map((blog) => {
              const hasValidImage =
                blog.coverImageUrl && blog.coverImageUrl.trim() !== "";

              return (
                <tr key={blog.id} className="hover:bg-gray-50/70 transition">
                  {/* รูปปกภาพย่อ */}
                  <td className="py-4 px-6">
                    <div className="relative h-12 w-20 rounded-lg overflow-hidden bg-gray-100 border">
                      <Image
                        src={
                          hasValidImage
                            ? blog.coverImageUrl!.startsWith("http")
                              ? blog.coverImageUrl!
                              : `${apiUrl}${blog.coverImageUrl}`
                            : "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=200"
                        }
                        alt={blog.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </td>

                  {/* ชื่อเรื่อง & Slug */}
                  <td className="py-4 px-6 max-w-xs md:max-w-md">
                    <div className="font-semibold text-gray-900 truncate">
                      {blog.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 font-mono truncate">
                      /{blog.slug}
                    </div>
                  </td>

                  {/* สถานะบทความ */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        blog.status === "PUBLISHED"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : blog.status === "DRAFT"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {blog.status === "PUBLISHED"
                        ? "🟢 เผยแพร่แล้ว"
                        : blog.status === "DRAFT"
                          ? "🟡 แบบร่าง"
                          : "⚫ ปิดปรับปรุง"}
                    </span>
                  </td>

                  {/* ยอดวิว */}
                  <td className="py-4 px-6 font-medium text-gray-500 font-mono">
                    👁️ {blog.viewCount.toLocaleString()}
                  </td>

                  {/* ปุ่มจัดการ */}
                  <td className="py-4 px-6 text-right space-x-2">
                    <Link
                      href={`/admin/blogs/${blog.id}/edit`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-semibold rounded-lg bg-white text-gray-700 hover:bg-gray-50 shadow-sm transition"
                    >
                      ✏️ แก้ไข
                    </Link>
                    <button
                      onClick={() => onDelete(blog.id, blog.title)}
                      className="inline-flex items-center px-3 py-1.5 border border-red-200 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
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
