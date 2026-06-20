"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: React.Dispatch<React.SetStateAction<number>>;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-16 flex justify-center items-center gap-2">
      <button
        onClick={() => onPageChange((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all duration-200 ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
            : "bg-white border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600 shadow-sm"
        }`}
      >
        ← ย้อนกลับ
      </button>

      <span className="text-sm font-bold px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
        หน้า {currentPage} จาก {totalPages}
      </span>

      <button
        onClick={() => onPageChange((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all duration-200 ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
            : "bg-white border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600 shadow-sm"
        }`}
      >
        ถัดไป →
      </button>
    </div>
  );
}
