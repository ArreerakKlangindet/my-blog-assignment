"use client";

import Image from "next/image";
import { ChangeEvent } from "react";

interface BlogImageUploadProps {
  imagePreview: string | null;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function BlogImageUpload({
  imagePreview,
  onImageChange,
}: BlogImageUploadProps) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
      <label className="block text-sm font-bold text-gray-800">
        รูปภาพปกบทความ
      </label>

      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition relative overflow-hidden group min-h-[200px]">
        {imagePreview ? (
          <div className="w-full h-56 relative rounded-lg overflow-hidden">
            <Image
              src={imagePreview}
              alt="Live Preview Cover"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
              <label
                htmlFor="coverImage"
                className="px-4 py-2 bg-white text-gray-800 text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-gray-50"
              >
                📸 เปลี่ยนรูปปกใหม่
              </label>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2 py-6">
            <div className="text-4xl text-gray-300">🖼️</div>
            <div className="text-sm text-gray-500">
              <label
                htmlFor="coverImage"
                className="text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                คลิกเพื่ออัปโหลดรูปปก
              </label>
              <span> หรือลากไฟล์มาวางตรงนี้</span>
            </div>
            <p className="text-xs text-gray-400">
              รองรับไฟล์ PNG, JPG, WEBP ขนาดไม่เกิน 5MB
            </p>
          </div>
        )}
        <input
          type="file"
          id="coverImage"
          accept="image/*"
          className="hidden"
          onChange={onImageChange}
        />
      </div>
    </div>
  );
}
