import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 🧭 แถบเมนูด้านข้าง (Admin Sidebar) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold tracking-wider text-indigo-400">
            📊 Admin Panel
          </h2>
          <p className="text-xs text-slate-400 mt-1">ระบบจัดการหลังบ้าน</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin/blogs"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition text-slate-300 hover:text-white"
          >
            📝 จัดการบทความ
          </Link>
          <Link
            href="/admin/comments"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 transition text-slate-300 hover:text-white"
          >
            💬 จัดการความคิดเห็น
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium transition text-slate-300"
          >
            🏠 กลับหน้าเว็บหลัก
          </Link>
        </div>
      </aside>

      {/* 📦 พื้นที่แสดงเนื้อหาของแต่ละหน้า (Main Content Area) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white h-16 border-b flex items-center justify-between px-8 shadow-sm">
          <div className="text-sm font-medium text-gray-500">
            ยินดีต้อนรับผู้ดูแลระบบ 👤
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
