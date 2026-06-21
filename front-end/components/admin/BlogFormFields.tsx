"use client";

import { ChangeEvent } from "react";

interface BlogFormFieldsProps {
  title: string;
  slug: string;
  content: string;
  onTitleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSlugChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function BlogFormFields({
  title,
  slug,
  content,
  onTitleChange,
  onSlugChange,
  onContentChange,
}: BlogFormFieldsProps) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* กล่องใส่ Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-bold text-gray-800">
            ชื่อหัวข้อบทความ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            required
            placeholder="เช่น แนะนำการใช้งาน NextJS สไตล์โมเดิร์น..."
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            value={title}
            onChange={onTitleChange}
          />
        </div>

        {/* กล่องใส่ Slug */}
        <div className="space-y-1.5">
          <label htmlFor="slug" className="text-sm font-bold text-gray-800">
            URL Slug <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center">
            <span className="bg-gray-100 border border-r-0 border-gray-200 px-3 py-2.5 rounded-l-xl text-xs text-gray-400 font-mono select-none">
              /blogs/
            </span>
            <input
              type="text"
              id="slug"
              required
              placeholder="nextjs-modern-guide"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-r-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-mono"
              value={slug}
              onChange={onSlugChange}
            />
          </div>
        </div>
      </div>

      {/* กล่องพิมพ์ Content ของบทความ */}
      <div className="space-y-1.5">
        <label htmlFor="content" className="text-sm font-bold text-gray-800">
          เนื้อหาบทความตัวจริง <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="content"
          required
          rows={18}
          placeholder="เขียนเรื่องราวที่ยอดเยี่ยมของคุณลงตรงนี้ได้เลยครับหนู..."
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition leading-relaxed"
          value={content}
          onChange={onContentChange}
        />
      </div>
    </div>
  );
}
