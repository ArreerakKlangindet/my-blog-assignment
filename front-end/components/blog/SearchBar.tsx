"use client";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="max-w-xl mx-auto relative px-4 mt-6">
      <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ค้นหาบทความที่คุณสนใจจากชื่อเรื่อง..."
        className="w-full px-5 py-3.5 pl-12 pr-4 rounded-full border border-gray-200 bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none text-base text-gray-800 shadow-sm transition-all duration-300 placeholder:text-gray-400"
      />
    </div>
  );
}
