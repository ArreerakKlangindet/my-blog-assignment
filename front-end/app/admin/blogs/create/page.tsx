"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import BlogFormContainer from "@/components/admin/BlogFormContainer";

export default function CreateBlogPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <AdminHeader
        title="➕ เขียนบทความใหม่"
        description="ใส่เนื้อหา รูปภาพ และกำหนด URL สำหรับเผยแพร่เนื้อหาลงสู่เว็บไซต์ของคุณ"
      />
      <BlogFormContainer isEditMode={false} />
    </div>
  );
}
