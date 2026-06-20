"use client";

export default function ErrorState() {
  return (
    <div className="bg-white rounded-2xl border p-8 text-center shadow-sm max-w-xl mx-auto">
      <h3 className="text-xl font-bold text-red-600 mb-2">
        💥 เชื่อมต่อหลังบ้านไม่สำเร็จ
      </h3>
      <p className="text-sm text-gray-500">
        กรุณาตรวจสอบ Backend พอร์ต 5000
      </p>
    </div>
  );
}