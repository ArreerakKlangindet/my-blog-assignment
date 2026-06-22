"use client";

import { useBlogs } from "@/hooks/useBlogs";
import HeroSection from "@/components/blog/HeroSection";
import SearchBar from "@/components/blog/SearchBar";
import BlogStats from "@/components/blog/BlogStats";
import LoadingState from "@/components/blog/LoadingState";
import ErrorState from "@/components/blog/ErrorState";
import EmptyState from "@/components/blog/EmptyState";
import BlogGrid from "@/components/blog/BlogGrid";
import Pagination from "@/components/blog/Pagination";
import AdminLoginButton from "@/components/blog/AdminLoginButton";

export default function BlogListPage() {
  const {
    blogs,
    loading,
    fetchError,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    meta,
    API_URL,
  } = useBlogs();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20 w-full">
      {/* ส่วนบนหัวเว็บไซต์ (Header) */}
      <header className="bg-white border-b py-12 text-center shadow-sm">
        <AdminLoginButton />

        <HeroSection />
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </header>

      {/* ส่วนเนื้อหาหลักบทความ */}
      <main className="max-w-[96%] mx-auto px-4 mt-12">
        <BlogStats
          totalItems={meta.totalItems}
          currentPage={currentPage}
          totalPages={meta.totalPages}
        />

        {/* ตรวจเช็คสถานะต่าง ๆ ในการเรนเดอร์ UI */}
        {loading ? (
          <LoadingState />
        ) : fetchError ? (
          <ErrorState />
        ) : blogs.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* ตารางแสดงผลรายการบทความ */}
            <BlogGrid blogs={blogs} apiUrl={API_URL} />

            {/* ส่วนควบคุมแถบหน้าการนำทาง */}
            <Pagination
              currentPage={currentPage}
              totalPages={meta.totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </main>
    </div>
  );
}
