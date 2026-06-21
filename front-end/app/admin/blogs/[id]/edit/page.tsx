"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Blog, BlogImage } from "@/types/blog";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const { id: blogId } = use(params);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // States เก็บข้อมูลฟอร์ม
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<BlogImage[]>([]);

  // States จัดการ UI
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. ดึงข้อมูลบล็อกดั้งเดิมจาก API
  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_URL}/blogs/${blogId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลบทความนี้ได้");

        const data: Blog = await res.json();
        setTitle(data.title);
        setSlug(data.slug);
        setContent(data.content);
        setCoverImageUrl(data.coverImageUrl || null);
        setAdditionalImages(data.images || []);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [blogId, API_URL, router]);

  // 2. แปลงไฟล์รูปภาพปกเป็น Base64
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 3. อัปเดตไฟล์ภาพย่อยเข้า API เซิร์ฟเวอร์
  const handleAdditionalImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/blogs/${blogId}/upload-images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "อัปโหลดรูปภาพประกอบล้มเหลว");
      }

      const result = await res.json();
      setAdditionalImages(result.images || []);
      alert("✨ อัปเดตเพิ่มรูปภาพประกอบสำเร็จ!");
    } catch (err) {
      alert(
        `❌ อัปโหลดล้มเหลว: ${err instanceof Error ? err.message : "เกิดข้อผิดพลาด"}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 4. ลบไฟล์ภาพย่อยรายชิ้นออกจากเซิร์ฟเวอร์
  const handleDeleteSubImage = async (imageId: string) => {
    if (!confirm("คุณต้องการลบรูปภาพประกอบนี้ใช่หรือไม่?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/blogs/images/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("ไม่สามารถลบรูปภาพได้");
      setAdditionalImages(additionalImages.filter((img) => img.id !== imageId));
    } catch (err) {
      alert(
        `❌ ลบรูปภาพล้มเหลว: ${err instanceof Error ? err.message : "เกิดข้อผิดพลาด"}`,
      );
    }
  };

  // 5. บันทึกข้อมูล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/blogs/${blogId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug: slug.toLowerCase().trim(),
          content,
          coverImageUrl,
        }),
      });

      if (!res.ok) {
        const errResponse = await res.json().catch(() => ({}));
        const serverMessage = errResponse.message || "บันทึกข้อมูลไม่สำเร็จ";
        throw new Error(
          Array.isArray(serverMessage)
            ? serverMessage.join(", ")
            : serverMessage,
        );
      }

      alert("🎉 บันทึกการแก้ไขบทความสำเร็จเรียบร้อย!");
      router.push("/admin/blogs");
      router.refresh();
    } catch (err) {
      console.error("❌ Edit submit error:", err);
      setError(err instanceof Error ? err.message : "ระบบหลังบ้านขัดข้อง");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-gray-600 animate-pulse text-sm font-medium">
          กำลังดึงข้อมูลบทความฉบับดั้งเดิม... 📝
        </p>
      </div>
    );
  }

  const finalCoverSrc = coverImageUrl
    ? coverImageUrl.startsWith("data:") || coverImageUrl.startsWith("http")
      ? coverImageUrl
      : `${API_URL}${coverImageUrl}`
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-xl font-bold text-gray-900">✏️ แก้ไขบทความ</h1>
        <p className="text-xs text-gray-600 mt-1 font-medium">
          อัปเดตข้อมูลรายละเอียดบทความอย่างปลอดภัย
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
          💥 {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6"
      >
        {/* โซนที่ 1: การจัดการรูปภาพทั้งหมด (อยู่ต่อกันตามที่ต้องการ) */}
        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-5">
          {/* รูปภาพปกบทความ */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
              1. รูปภาพปกบทความ
            </label>
            <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative h-28 w-48 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                {finalCoverSrc ? (
                  <Image
                    src={finalCoverSrc}
                    alt="Cover Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <span className="text-[11px] text-gray-500 font-medium">
                    ไม่มีรูปภาพปก
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="block text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer hover:file:bg-indigo-100"
                />
                <p className="text-[11px] text-gray-500 font-medium">
                  รองรับไฟล์ภาพ JPEG, PNG, WEBP หรือ Base64
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200/60 my-2"></div>

          {/* รูปภาพประกอบเพิ่มเติม (ย้ายขึ้นมาต่อกันแล้ว!) */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                2. รูปภาพประกอบเพิ่มเติม (สูงสุด 6 รูป)
              </label>
              <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                อัปโหลดไฟล์ภาพจริงเก็บเข้าฐานข้อมูลหลังบ้าน
              </p>
            </div>

            <input
              type="file"
              multiple
              accept="image/*"
              disabled={additionalImages.length >= 6}
              onChange={handleAdditionalImagesUpload}
              className="block text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 file:cursor-pointer hover:file:bg-emerald-100 disabled:opacity-50"
            />

            {additionalImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-1">
                {additionalImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm"
                  >
                    <Image
                      src={
                        img.filePath.startsWith("http")
                          ? img.filePath
                          : `${API_URL}${img.filePath}`
                      }
                      alt={img.fileName}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSubImage(img.id)}
                      className="absolute inset-0 bg-red-600/90 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-150"
                    >
                      🗑️ ลบรูปนี้
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* โซนที่ 2: กรอกข้อมูลตัวอักษร (ปรับสีเข้มขึ้นชัดเจน) */}
        <div className="space-y-4">
          {/* ชื่อบทความ */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              ชื่อบทความ (Title)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              placeholder="กรอกชื่อบทความ..."
            />
          </div>

          {/* URL Slug */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              URL Slug
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 font-mono rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="example-blog-slug"
            />
          </div>

          {/* เนื้อหาบทความ */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-800">
              เนื้อหาบทความ (Content)
            </label>
            <textarea
              required
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-medium"
              placeholder="เขียนเนื้อหาตรงนี้..."
            />
          </div>
        </div>

        {/* ปุ่มแอ็กชันด้านล่าง (ย้ายปุ่มย้อนกลับมาประกบคู่ข้างซ้ายแล้ว!) */}
        <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/admin/blogs"
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition text-center border border-gray-200"
          >
            ⬅️ ย้อนกลับหน้ารายการบทความ
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer text-center"
          >
            {submitting ? "กำลังบันทึกข้อมูล..." : "💾 บันทึกการแก้ไขบทความ"}
          </button>
        </div>
      </form>
    </div>
  );
}
