/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import BlogFormFields from "./BlogFormFields";
import BlogImageUpload from "./BlogImageUpload";
import BlogAdditionalImages from "./BlogAdditionalImages";
import Link from "next/link";
import { Blog, BlogImage, UpdateBlogPayload } from "@/types/blog";

interface BlogFormContainerProps {
  isEditMode?: boolean;
  blogId?: string;
  initialData?: Blog | null;
}

export default function BlogFormContainer({
  isEditMode = false,
  blogId,
  initialData,
}: BlogFormContainerProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // States คุม Form
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<BlogImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  // โหมดสร้างใหม่ (Create) และรูปแอดเพิ่มโหมดแก้ไข
  const [subFiles, setSubFiles] = useState<File[]>([]);
  const [subPreviews, setSubPreviews] = useState<string[]>([]);

  // 🎯 ดึงข้อมูลเก่ามาใส่ State ทันทีหากอยู่ในโหมด Edit
  useEffect(() => {
    if (isEditMode && initialData) {
      setTitle(initialData.title || "");
      setSlug(initialData.slug || "");
      setContent(initialData.content || "");
      setCoverImageUrl(initialData.coverImageUrl || null);
      setAdditionalImages(initialData.images || []);
      setDeletedImageIds([]);
    }
  }, [isEditMode, initialData]);

  const cleanSlugValue = (val: string): string => {
    return val
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_-]/g, "")
      .replace(/-+/g, "-");
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditMode) {
      // เมื่อพิมพ์ชื่อเรื่อง จะแปลงคีย์เป็น Slug อัตโนมัติ โดยตัดภาษาไทยออกทันทีตามเงื่อนไขดักจับ
      setSlug(cleanSlugValue(val));
    }
  };

  const handleSlugInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // ดักจับฝั่ง User พิมพ์ในช่อง URL Slug ตรง ๆ: พิมพ์ภาษาไทยไม่ได้
    setSlug(cleanSlugValue(e.target.value));
  };

  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverImageUrl(URL.createObjectURL(file));
  };

  const handleAdditionalImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const totalImages =
      additionalImages.length + subFiles.length + fileArray.length;

    if (totalImages > 6) {
      alert("❌ อัปโหลดภาพประกอบย่อยรวมกันได้สูงสุด 6 รูป");
      return;
    }

    setSubFiles((prev) => [...prev, ...fileArray]);
    setSubPreviews((prev) => [
      ...prev,
      ...fileArray.map((file) => URL.createObjectURL(file)),
    ]);
    e.target.value = "";
  };

  const handleRemoveSubImage = (index: number, imageId?: string) => {
    // รูปเก่าที่มีอยู่ใน Backend
    if (isEditMode && imageId && index < additionalImages.length) {
      const isConfirmed = window.confirm(
        "⚠️ ต้องการนำรูปภาพประกอบนี้ออกหรือไม่? รูปจะถูกลบจริงเมื่อกดบันทึกการแก้ไข",
      );

      if (!isConfirmed) return;

      setDeletedImageIds((prev) =>
        prev.includes(imageId) ? prev : [...prev, imageId],
      );

      setAdditionalImages((prev) =>
        prev.filter((_, imageIndex) => imageIndex !== index),
      );

      return;
    }

    // รูปใหม่ที่เพิ่งเลือก แต่ยังไม่ได้อัปโหลด
    const isNewConfirmed = window.confirm(
      "⚠️ ต้องการยกเลิกการเลือกรูปภาพนี้หรือไม่?",
    );

    if (!isNewConfirmed) return;

    const newIndex = index - additionalImages.length;

    setSubFiles((prev) =>
      prev.filter((_, fileIndex) => fileIndex !== newIndex),
    );

    setSubPreviews((prev) =>
      prev.filter((_, previewIndex) => previewIndex !== newIndex),
    );
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
      // คลีนซิ่งค่า Slug อีกรอบก่อนส่งข้อมูลไปบันทึก
      const formattedSlug = cleanSlugValue(slug).trim();

      if (!formattedSlug) {
        throw new Error(
          "กรุณาระบุ URL Slug เป็นภาษาอังกฤษ ตัวเลข หรือเครื่องหมาย - _ ให้ถูกต้อง",
        );
      }

      // =========================
      // EDIT MODE
      // =========================
      if (isEditMode) {
        const targetBlogId = initialData?.id ?? blogId;

        if (!targetBlogId) {
          throw new Error("ไม่พบรหัสบทความที่ต้องการแก้ไข");
        }
        const updatePayload: UpdateBlogPayload = {};

        if (title !== initialData?.title) updatePayload.title = title;
        if (formattedSlug !== initialData?.slug)
          updatePayload.slug = formattedSlug;
        if (content !== initialData?.content) updatePayload.content = content;

        const hasTextChanged = Object.keys(updatePayload).length > 0;
        const hasImageChanged =
          coverFile !== null ||
          subFiles.length > 0 ||
          deletedImageIds.length > 0;

        if (!hasTextChanged && !hasImageChanged) {
          alert("ℹ️ [INFO] ไม่พบข้อมูลที่มีการเปลี่ยนแปลงในระบบฟอร์ม");
          setSubmitting(false);
          return;
        }

        // แก้ไขข้อมูลบทความหลัก
        if (hasTextChanged) {
          const res = await fetch(`${API_URL}/blogs/${targetBlogId}`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatePayload),
          });

          if (!res.ok) throw new Error("บันทึกการแก้ไขข้อมูลบทความไม่สำเร็จ");
        }

        // ลบรูปภาพย่อยที่ผู้ใช้เลือกนำออก
        if (deletedImageIds.length > 0) {
          for (const imageId of deletedImageIds) {
            const deleteRes = await fetch(
              `${API_URL}/blogs/images/${imageId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            const deleteData = await deleteRes.json().catch(() => null);

            if (!deleteRes.ok) {
              throw new Error(deleteData?.message || "ลบรูปภาพประกอบไม่สำเร็จ");
            }
          }
        }

        // อัปโหลดรูปปกใหม่
        if (coverFile) {
          const coverFormData = new FormData();
          coverFormData.append("coverImage", coverFile);

          const coverRes = await fetch(
            `${API_URL}/blogs/${targetBlogId}/upload-cover`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: coverFormData,
            },
          );

          if (!coverRes.ok) throw new Error("อัปโหลดรูปปกบทความใหม่ไม่สำเร็จ");
        }

        // อัปโหลดรูปย่อยเพิ่มเติม
        if (subFiles.length > 0) {
          const formData = new FormData();
          subFiles.forEach((file) => {
            formData.append("images", file);
          });

          const imageRes = await fetch(
            `${API_URL}/blogs/${targetBlogId}/upload-images`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            },
          );

          if (!imageRes.ok) {
            const errData = await imageRes.json();
            throw new Error(
              errData.message || "อัปโหลดรูปภาพเพิ่มเติมไม่สำเร็จ",
            );
          }
        }

        alert("🎉 บันทึกการแก้ไขข้อมูลสำเร็จเรียบร้อย!");
        setSubFiles([]);
        setSubPreviews([]);
        setDeletedImageIds([]);
      }

      // =========================
      // CREATE MODE
      // =========================
      else {
        // แก้ไข: เอาฟิลด์ additionalImages ออกเพื่อให้สร้างบทความใหม่ผ่านฉลุยสอดคล้องกับ DTO หลังบ้าน
        const res = await fetch(`${API_URL}/blogs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            slug: formattedSlug,
            content,
          }),
        });

        const responseData = await res.json().catch(() => null);

        if (!res.ok) {
          const message = Array.isArray(responseData?.message)
            ? responseData.message.join(", ")
            : responseData?.message;

          throw new Error(message || `สร้างบทความไม่สำเร็จ (${res.status})`);
        }

        const createdBlog = responseData;

        if (createdBlog.id && coverFile) {
          const coverFormData = new FormData();
          coverFormData.append("coverImage", coverFile);

          const coverRes = await fetch(
            `${API_URL}/blogs/${createdBlog.id}/upload-cover`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: coverFormData,
            },
          );

          if (!coverRes.ok) throw new Error("อัปโหลดรูปปกไม่สำเร็จ");
        }

        if (createdBlog.id && subFiles.length > 0) {
          const formData = new FormData();
          subFiles.forEach((file) => {
            formData.append("images", file);
          });

          const imageRes = await fetch(
            `${API_URL}/blogs/${createdBlog.id}/upload-images`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            },
          );

          if (!imageRes.ok) throw new Error("อัปโหลดรูปภาพเพิ่มเติมไม่สำเร็จ");
        }

        alert("🎉 สร้างบทความสำเร็จ");
      }

      router.push("/admin/blogs");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ระบบหลังบ้านขัดข้อง");
    } finally {
      setSubmitting(false);
    }
  };

  const finalCoverSrc =
    coverImageUrl && typeof coverImageUrl === "string"
      ? coverImageUrl.startsWith("blob:") || coverImageUrl.startsWith("http")
        ? coverImageUrl
        : `${API_URL}${coverImageUrl.startsWith("/") ? coverImageUrl : `/${coverImageUrl}`}`
      : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
    >
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
          💥 {error}
        </div>
      )}

      <BlogImageUpload
        imagePreview={finalCoverSrc}
        onImageChange={handleCoverImageChange}
      />

      <BlogAdditionalImages
        previews={[
          ...additionalImages.map((img) =>
            img.filePath.startsWith("http")
              ? img.filePath
              : `${API_URL}${img.filePath.startsWith("/") ? img.filePath : `/${img.filePath}`}`,
          ),
          ...subPreviews,
        ]}
        onImagesChange={handleAdditionalImagesChange}
        onRemoveImage={(idx) => {
          const targetImageId =
            idx < additionalImages.length
              ? additionalImages[idx]?.id
              : undefined;
          handleRemoveSubImage(idx, targetImageId);
        }}
      />

      <BlogFormFields
        title={title}
        slug={slug}
        content={content}
        onTitleChange={handleTitleChange}
        onSlugChange={handleSlugInputChange}
        onContentChange={(e) => setContent(e.target.value)}
      />

      <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link
          href="/admin/blogs"
          className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl text-center border"
        >
          ⬅️ ย้อนกลับหน้ารายการบทความ
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer text-center"
        >
          {submitting
            ? "กำลังบันทึกข้อมูล..."
            : isEditMode
              ? "💾 บันทึกการแก้ไขบทความ"
              : "💾 สร้างบทความใหม่"}
        </button>
      </div>
    </form>
  );
}
