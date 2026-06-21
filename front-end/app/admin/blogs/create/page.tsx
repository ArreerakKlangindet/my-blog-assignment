"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import BlogImageUpload from "@/components/admin/BlogImageUpload";
import BlogFormFields from "@/components/admin/BlogFormFields";
import BlogAdditionalImages from "@/components/admin/BlogAdditionalImages";

export default function CreateBlogPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [subFiles, setSubFiles] = useState<File[]>([]);
  const [subPreviews, setSubPreviews] = useState<string[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const autoSlug = value
      .toLowerCase()
      .replace(/[^a-zA-Z0-9ก-๙\s-_]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({ ...prev, title: value, slug: autoSlug }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    if (subFiles.length + fileArray.length > 6) {
      alert(
        "❌ คุณสามารถอัปโหลดรูปภาพประกอบเพิ่มเติมได้สูงสุด 6 รูปเท่านั้นครับ",
      );
      return;
    }
    setSubFiles([...subFiles, ...fileArray]);
    setSubPreviews([
      ...subPreviews,
      ...fileArray.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const handleRemoveSubImage = (index: number) => {
    setSubFiles(subFiles.filter((_, i) => i !== index));
    setSubPreviews(subPreviews.filter((_, i) => i !== index));
  };

  // ฟังก์ชันย่อภาพปกหลักให้อยู่ใน JSON สเต็ปแรก (เบาใจหลังบ้าน)
  const convertCoverToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 500;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.6));
        };
      };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // 1. จัดการภาพปกหลักแปลงเป็น Base64 ขนาดเบา
      let coverImageString = "";
      if (imageFile) {
        coverImageString = await convertCoverToBase64(imageFile);
      }

      // 2. จังหวะแรก: สร้างบทความตัวหลักด้วย JSON วิ่งเข้าหาเร้าต์ POST /blogs ของหลังบ้าน
      const res = await fetch(`${API_URL}/blogs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug.trim().toLowerCase(),
          content: formData.content,
          coverImageUrl: coverImageString || null,
          additionalImages: [], // ส่งเป็นอาร์เรย์ว่างไปก่อน เดี๋ยวเราไปสตรีมรูปภาพย่อยของจริงในรอบสอง
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.message && errorData.message.includes("slug")) {
          throw new Error(
            "❌ มีบทความที่ใช้ URL Slug นี้อยู่ในระบบแล้ว กรุณาเปลี่ยนชื่อหัวข้อสักเล็กน้อยครับ",
          );
        }
        throw new Error(errorData.message || "เกิดข้อผิดพลาดในการสร้างบทความ");
      }

      const createdBlog = await res.json();
      const newBlogId = createdBlog.id; // ดึงค่าไอดีบทความที่ได้มาจากฝั่งหลังบ้านเซฟเสร็จ

      // 3. จังหวะที่สอง: มัดรวมรูปย่อยสตรีมไฟล์ดิบอัปโหลดเข้าเซิร์ฟเวอร์จริงตามใจ NestJS เป๊ะๆ!
      if (newBlogId && subFiles.length > 0) {
        const uploadFormData = new FormData();

        subFiles.forEach((file) => {
          uploadFormData.append("images", file); // 💡 ใช้คีย์ชื่อ 'images' ล็อกตรงกับ FilesInterceptor หลังบ้านหนูเป๊ะๆ
        });

        const uploadRes = await fetch(
          `${API_URL}/blogs/${newBlogId}/upload-images`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }, // ปล่อยเบราว์เซอร์จัด Boundary
            body: uploadFormData,
          },
        );

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          console.error("❌ อัปโหลดรูปภาพประกอบล้มเหลว:", errData);
          throw new Error(
            errData.message ||
              "บันทึกข้อมูลหลักสำเร็จ แต่ระบบอัปโหลดไฟล์รูปภาพประกอบไม่ผ่าน",
          );
        }
      }

      // 🎉 บันทึกเสร็จสมบูรณ์ทั้ง 2 จังหวะ พาวาร์ปกลับทันที
      router.push("/admin/blogs");
      router.refresh();
    } catch (err) {
      console.error("❌ Process failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "ระบบเชื่อมต่อเซิร์ฟเวอร์หลังบ้านขัดข้อง",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <AdminHeader
        title="➕ เขียนบทความใหม่"
        description="ใส่เนื้อหา รูปภาพ และกำหนด URL สำหรับเผยแพร่เนื้อหาลงสู่เว็บไซต์ของคุณ"
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <BlogImageUpload
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
        />
        <BlogAdditionalImages
          previews={subPreviews}
          onImagesChange={handleSubImagesChange}
          onRemoveImage={handleRemoveSubImage}
        />
        <BlogFormFields
          title={formData.title}
          slug={formData.slug}
          content={formData.content}
          onTitleChange={handleTitleChange}
          onSlugChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
            }))
          }
          onContentChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
        />

        <div className="flex justify-end space-x-3">
          <Link
            href="/admin/blogs"
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <span>💾 บันทึกและสร้างบทความ</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
