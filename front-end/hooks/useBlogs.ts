"use client";

import { useState, useEffect } from "react";
// 🛠️ แก้ไขจุดที่ 1: เปลี่ยนชื่อ Type ให้ตรงกับอินเตอร์เฟสใน types/blog.ts (ใช้ PaginationMeta)
import { Blog, PaginationMeta } from "@/types/blog";
import { blogService } from "@/services/blogService";

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  // 🛠️ แก้ไขจุดที่ 2: เปลี่ยนไทป์ของ State ให้เป็น PaginationMeta ตามไฟล์ types/blog.ts
  const [meta, setMeta] = useState<PaginationMeta>({
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  });

  const limitPerPage = 10;
  // ดึงค่า URL หรือ fallback ไปหา NestJS
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // จัดการ Debounce ค้นหาข้อมูล
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // เมื่อเสิร์ชคำใหม่ ให้เด้งกลับไปหน้า 1 เสมอ
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ยิงดึงข้อมูลบทความ
  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        setFetchError(false);

        // 🛠️ แก้ไขจุดที่ 3: เปลี่ยนชื่อฟังก์ชันเรียกใช้ให้ตรงกับ blogService.ts คือ getPublishedBlogs
        const result = await blogService.getPublishedBlogs(
          currentPage,
          limitPerPage,
          debouncedSearch,
        );

        setBlogs(result.data || []);
        setMeta(
          result.meta || {
            totalItems: 0,
            currentPage: 1,
            itemsPerPage: 10,
            totalPages: 1,
          },
        );
      } catch (err) {
        console.error("❌ ดึงรายการบทความล้มเหลว:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, [debouncedSearch, currentPage]);

  return {
    blogs,
    loading,
    fetchError,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    meta,
    API_URL,
  };
}
