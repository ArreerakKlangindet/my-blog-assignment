"use client";

import Image from "next/image";
import { ChangeEvent } from "react";

interface AdditionalImagesProps {
  previews: string[];
  onImagesChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}

export default function BlogAdditionalImages({
  previews,
  onImagesChange,
  onRemoveImage,
}: AdditionalImagesProps) {
  const MAX_IMAGES = 6;

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <label className="block text-sm font-bold text-gray-800">
            รูปภาพประกอบเพิ่มเติม (สูงสุด 6 รูป)
          </label>
          <p className="text-xs text-gray-400">
            รูปภาพย่อยสำหรับแสดงแกลเลอรีในเนื้อหาบทความ
          </p>
        </div>
        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
          {previews.length} / {MAX_IMAGES} รูป
        </span>
      </div>

      {/* Grid แสดงรูปภาพย่อยสไตล์ Pinterest มินิมอล */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* วนลูปโชว์รูปภาพที่เลือกมาแล้ว */}
        {previews.map((url, index) => (
          <div
            key={index}
            className="relative aspect-video rounded-xl overflow-hidden border group"
          >
            <Image
              src={url}
              alt={`Additional preview ${index + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
            {/* ปุ่มกากบาท Overlay กดลบรูป */}
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-500 text-white p-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              title="ลบรูปภาพนี้"
            >
              ❌
            </button>
          </div>
        ))}

        {/* ช่องกดอัปโหลดรูปภาพ (จะแสดงก็ต่อเมื่อรูปยังไม่ครบ 6) */}
        {previews.length < MAX_IMAGES && (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer aspect-video space-y-1">
            <span className="text-2xl">📸</span>
            <span className="text-xs font-semibold text-indigo-600">
              เพิ่มรูปภาพย่อย
            </span>
            <input
              type="file"
              accept="image/*"
              multiple // อนุญาตให้กดเลือกทีละหลายรูปพร้อมกันได้
              className="hidden"
              onChange={onImagesChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}
