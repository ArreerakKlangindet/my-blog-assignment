"use client";

interface BlogStatsProps {
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export default function BlogStats({ totalItems }: BlogStatsProps) {
  return (
    <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
      📰 รายการบทความทั้งหมด ({totalItems}) 
    </h2>
  );
}